import Flight from '../models/Flight.js';

export const lockSeatsAtomic = async (flightId, seatIds, bookingId) => {
	if (!flightId || !seatIds?.length || !bookingId) {
		throw new Error('Invalid parameters for seat locking');
	}

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

export const releaseSeats = async (flightId, seatIds) => {
	if (!flightId || !seatIds?.length) {
		throw new Error('Invalid parameters for seat release');
	}

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

export const checkSeatsAvailability = async (flightId, seatIds) => {
	if (!flightId || !seatIds?.length) {
		throw new Error('Invalid parameters for availability check');
	}

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
