/**
 * Seat Locking Utilities
 *
 * Purpose:
 * Provides helper functions for checking, locking, releasing, and summarizing embedded Flight seats.
 *
 * Workflow:
 * Booking/OTP Controller -> Seat utility -> Flight model -> flights collection embedded seats
 *
 * Used By:
 * controllers/bookingController.js and controllers/otpController.js.
 *
 * Dependencies:
 * models/Flight.js stores the embedded seat inventory that these utilities mutate/read.
 *
 * Request Lifecycle:
 * Called during booking creation before Booking is persisted, during cancellation after ownership
 * checks, and when the frontend requests seat availability for a flight.
 */
import Flight from '../models/Flight.js';

/**
 * Atomically mark selected embedded seats as booked for a booking.
 *
 * Workflow:
 * Create Booking -> Seat availability check -> lockSeatsAtomic -> Booking/Payment creation
 *
 * Inputs:
 * - flightId: Flight document id.
 * - seatIds: selected embedded seat ids.
 * - bookingId: Booking id to store on each locked seat.
 *
 * Returns:
 * Updated Flight document.
 *
 * Collections:
 * - flights: updates embedded seats so concurrent booking attempts cannot reuse them.
 *
 * Why:
 * Seat allocation is central to airline reservations; this helper reduces double-booking risk.
 */
export const lockSeatsAtomic = async (flightId, seatIds, bookingId) => {
	if (!flightId || !seatIds?.length || !bookingId) {
		throw new Error('Invalid parameters for seat locking');
	}

	// Update the Flight document's embedded seats in the flights collection.
	// Only seats that are currently unbooked match the array filter.
	const result = await Flight.findByIdAndUpdate(
		flightId,
		{
			$set: {
				'seats.$[seat].isBooked': true,
				'seats.$[seat].bookingId': bookingId,
			},
		},
		{
			arrayFilters: [
				{
					$and: [{ 'seat.seatId': { $in: seatIds } }, { 'seat.isBooked': false }],
				},
			],
			new: true,
		}
	);

	if (!result) {
		throw new Error('Flight not found');
	}

	const updatedSeats = result.seats.filter(
		(s) => seatIds.includes(s.seatId) && s.isBooked && s.bookingId === bookingId
	);

	if (updatedSeats.length !== seatIds.length) {
		const conflictSeats = seatIds.filter(
			(seatId) => !updatedSeats.find((s) => s.seatId === seatId && s.bookingId === bookingId)
		);
		throw new Error(`Seats already booked: ${conflictSeats.join(', ')}`);
	}

	return result;
};

/**
 * Release selected embedded seats after cancellation/refund.
 *
 * Workflow:
 * Cancel Booking / Verify OTP -> releaseSeats -> Payment refund -> Booking cancellation state
 *
 * Inputs:
 * - flightId: Flight document id.
 * - seatIds: seats to make available again.
 *
 * Returns:
 * Updated Flight document.
 *
 * Collections:
 * - flights: clears booking state from embedded seat documents.
 *
 * Why:
 * Returns cancelled seats to inventory so they can be booked by another passenger.
 */
export const releaseSeats = async (flightId, seatIds) => {
	if (!flightId || !seatIds?.length) {
		throw new Error('Invalid parameters for seat release');
	}

	// Update the Flight document's embedded seats in the flights collection.
	// Only seats that are currently unbooked match the array filter.
	const result = await Flight.findByIdAndUpdate(
		flightId,
		{
			$set: {
				'seats.$[seat].isBooked': false,
				'seats.$[seat].bookingId': null,
			},
		},
		{
			arrayFilters: [{ 'seat.seatId': { $in: seatIds } }],
			new: true,
		}
	);

	if (!result) {
		throw new Error('Flight not found');
	}

	return result;
};

/**
 * Check whether requested seats exist and are unbooked.
 *
 * Workflow:
 * Create Booking -> checkSeatsAvailability -> lockSeatsAtomic -> Booking creation
 *
 * Inputs:
 * - flightId: Flight document id.
 * - seatIds: selected seats from the frontend.
 *
 * Returns:
 * Availability result with optional unavailable seat ids.
 *
 * Collections:
 * - flights: reads embedded seats for the selected flight.
 *
 * Why:
 * Gives the API a clear conflict response before attempting to reserve seats.
 */
export const checkSeatsAvailability = async (flightId, seatIds) => {
	if (!flightId || !seatIds?.length) {
		throw new Error('Invalid parameters for availability check');
	}

	// Read the Flight document from the flights collection to inspect embedded seat state.
	const flight = await Flight.findById(flightId);
	if (!flight) {
		throw new Error('Flight not found');
	}

	const unavailableSeats = seatIds.filter((seatId) => {
		const seat = flight.seats.find((s) => s.seatId === seatId);
		return !seat || seat.isBooked;
	});

	if (unavailableSeats.length > 0) {
		return {
			available: false,
			message: `Seats not available: ${unavailableSeats.join(', ')}`,
			unavailableSeats,
		};
	}

	return { available: true, message: 'All seats available' };
};

/**
 * Summarize total, booked, and available seats by cabin.
 *
 * Workflow:
 * Seat Selection UI -> getFlightSeats -> getSeatStatistics -> flights collection
 *
 * Inputs:
 * - flightId: Flight document id.
 *
 * Returns:
 * Seat counts overall and by cabin class.
 *
 * Collections:
 * - flights: reads embedded seats only.
 *
 * Why:
 * Lets the frontend display seat-map availability without recalculating every count itself.
 */
export const getSeatStatistics = async (flightId) => {
	const flight = await Flight.findById(flightId).select('seats');
	if (!flight) {
		throw new Error('Flight not found');
	}

	const stats = {
		total: flight.seats.length,
		booked: 0,
		available: 0,
		byClass: {
			firstClass: { total: 0, booked: 0, available: 0 },
			business: { total: 0, booked: 0, available: 0 },
			economy: { total: 0, booked: 0, available: 0 },
		},
	};

	flight.seats.forEach((seat) => {
		const classStats = stats.byClass[seat.cabin];
		classStats.total++;

		if (seat.isBooked) {
			stats.booked++;
			classStats.booked++;
		} else {
			stats.available++;
			classStats.available++;
		}
	});

	return stats;
};
