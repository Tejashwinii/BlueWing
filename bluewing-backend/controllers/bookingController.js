/**
 * Booking Controller
 *
 * Purpose:
 * Coordinates reservations, seat allocation, ticket confirmation, cancellation, and seat-map data.
 *
 * Workflow:
 * Booking Routes -> Booking Controller -> Seat utilities/Fare helpers -> Flight, Booking, Payment, User, Review collections
 *
 * Used By:
 * routes/bookingRoutes.js.
 *
 * Dependencies:
 * models/Booking.js stores reservations; models/Payment.js tracks payment/refund state;
 * models/Flight.js stores schedules and embedded seats; models/User.js verifies passengers;
 * models/Review.js provides review status; controllers/seatLockingUtil.js changes seat state;
 * config/fareTypes.js calculates prices and refunds.
 *
 * Request Lifecycle:
 * Runs after JWT protection for booking ownership operations. It validates payloads, checks
 * MongoDB state, updates seat/payment/booking documents, and returns ticket or seat data.
 */
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import Flight from '../models/Flight.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import { ObjectId } from 'mongodb';
import {
	lockSeatsAtomic,
	releaseSeats,
	checkSeatsAvailability,
	getSeatStatistics,
} from './seatLockingUtil.js';
import { FARE_TYPES, calculatePrice, calculateRefund, canCancelBooking } from '../config/fareTypes.js';

/**
 * Generate a short booking reference for passenger-facing reservation lookup.
 *
 * Workflow:
 * Create Booking -> generate reference -> Booking document -> ticket/history displays
 *
 * Inputs:
 * - None.
 *
 * Returns:
 * Reference string prefixed with BW.
 *
 * Collections:
 * - None directly. Booking.create persists the generated value in bookings.
 *
 * Why:
 * Gives passengers a readable reservation identifier separate from MongoDB ids.
 */
const generateBookingReference = () => {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let ref = 'BW';
	for (let i = 0; i < 4; i++) {
		ref += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return ref;
};

/**
 * Generate a ticket number after successful payment confirmation.
 *
 * Workflow:
 * Confirm Booking -> generate ticket numbers -> update Booking passengers
 *
 * Inputs:
 * - None.
 *
 * Returns:
 * Ticket number string prefixed with BW-TK.
 *
 * Collections:
 * - None directly. confirmBooking writes the value into bookings.passengers.
 *
 * Why:
 * Represents the issued ticket after a pending reservation becomes confirmed.
 */
const generateTicketNumber = () => {
	return `BW-TK-${Math.floor(Math.random() * 1000000)}`;
};

/**
 * Create a pending booking and reserve selected seats.
 *
 * Workflow:
 * Seat Selection -> POST /api/bookings -> validate payload -> Flight/User lookup -> seat lock -> Payment create -> Booking create
 *
 * Inputs:
 * - req.userId from JWT.
 * - flightId, fareType, passengers, selectedSeats, contactDetails from request body.
 *
 * Returns:
 * Created Booking populated with user, flight, and payment plus payment summary.
 *
 * Collections:
 * - flights: reads flight/prices and updates embedded selected seats as booked.
 * - users: verifies the authenticated user still exists.
 * - payments: creates a pending payment record.
 * - bookings: creates the reservation document with passenger and fare snapshots.
 *
 * Why:
 * This is the core reservation workflow: it binds a passenger, flight, seats, fare, and pending payment.
 */
export const createBooking = async (req, res) => {
	try {
		const userId = req.userId;
		const { flightId, fareType, passengers, selectedSeats, contactDetails } = req.body;

		if (!flightId || !fareType || !passengers || !selectedSeats || !contactDetails) {
			return res.status(400).json({
				success: false,
				message: 'Missing required fields: flightId, fareType, passengers, selectedSeats, contactDetails',
			});
		}

		if (passengers.length === 0 || passengers.length > 5) {
			return res.status(400).json({
				success: false,
				message: 'Booking must have between 1 and 5 passengers',
			});
		}

		if (passengers.length !== selectedSeats.length) {
			return res.status(400).json({
				success: false,
				message: 'Number of passengers must match number of selected seats',
			});
		}

		const fareTypeConfig = Object.values(FARE_TYPES).find(
			(ft) => ft.type.toLowerCase() === String(fareType).toLowerCase()
		);

		if (!fareTypeConfig) {
			return res.status(400).json({
				success: false,
				message: `Invalid fare type: ${fareType}`,
			});
		}

		// Read the Flight document from flights to validate the schedule and determine cabin pricing.
		const flight = await Flight.findById(flightId);
		if (!flight) {
			return res.status(404).json({
				success: false,
				message: 'Flight not found',
			});
		}

		// Read the User document from users to ensure the authenticated passenger account exists.
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			});
		}

		// Check embedded Flight seats before locking them for this booking attempt.
		const availabilityCheck = await checkSeatsAvailability(flightId, selectedSeats);
		if (!availabilityCheck.available) {
			return res.status(409).json({
				success: false,
				message: availabilityCheck.message,
				unavailableSeats: availabilityCheck.unavailableSeats,
			});
		}

		let baseFare = 0;
		selectedSeats.forEach((seatId) => {
			const seat = flight.seats.find((s) => s.seatId === seatId);
			if (seat && seat.cabin === 'firstClass') {
				baseFare = flight.firstClassPrice;
			} else if (seat && seat.cabin === 'business') {
				baseFare = flight.businessPrice;
			} else {
				baseFare = flight.economyPrice;
			}
		});

		const priceBreakdown = calculatePrice(baseFare, fareType, passengers.length);

		let bookingReference;
		let isUnique = false;
		let attempts = 0;
		while (!isUnique && attempts < 10) {
			bookingReference = generateBookingReference();
			// Check bookings to keep the passenger-facing booking reference unique.
			const existing = await Booking.findOne({ bookingReference });
			if (!existing) {
				isUnique = true;
			}
			attempts++;
		}

		if (!isUnique) {
			return res.status(500).json({
				success: false,
				message: 'Failed to generate unique booking reference',
			});
		}

		const bookingId = new ObjectId();
		// Mark selected embedded Flight seats as booked before creating the Booking document.
		// This protects the seat allocation workflow from duplicate reservations.
		await lockSeatsAtomic(flightId, selectedSeats, bookingId.toString());

		// Create a pending Payment document tied to this booking.
		// Payment status later drives confirmation, ticket generation, and cancellation refund state.
		const payment = await Payment.create({
			bookingId: bookingId,
			amount: priceBreakdown.totalAmount,
			currency: 'INR',
			status: 'pending',
			paymentGatewayId: `pending-${Date.now()}`,
			transactionId: `txn-pending-${Date.now()}`,
		});

		const passengersWithSeats = passengers.map((passenger, index) => ({
			passengerId: new ObjectId(),
			type: passenger.type || 'adult',
			firstName: passenger.firstName,
			lastName: passenger.lastName,
			gender: passenger.gender,
			age: Number(passenger.age),
			seatNumber: selectedSeats[index],
			ticketNumber: null,
		}));

		// Create the Booking document with passenger details, seats, fare snapshot, and pricing.
		// This reservation is used by ticket display, payment confirmation, reviews, and cancellation workflows.
		const booking = await Booking.create({
			_id: bookingId,
			bookingReference,
			userId,
			flightId,
			fareType: {
				name: fareTypeConfig.type,
				multiplier: fareTypeConfig.priceMultiplier,
				cancellation: fareTypeConfig.cancellation,
				meals: fareTypeConfig.meals,
				priorityBoarding: fareTypeConfig.priorityBoarding,
				baggage: fareTypeConfig.baggage,
			},
			passengers: passengersWithSeats,
			selectedSeats,
			contactDetails: {
				phone: contactDetails.phone || contactDetails.mobileNumber,
				email: contactDetails.email,
				country: contactDetails.country || 'India',
				contactPassengerId: passengersWithSeats[contactDetails.contactPassengerIndex || 0]?.passengerId,
			},
			pricing: {
				baseFare: priceBreakdown.baseFare,
				taxes: priceBreakdown.taxes,
				seatCharges: 0,
				totalAmount: priceBreakdown.totalAmount,
			},
			bookingStatus: 'pending',
			paymentId: payment._id,
		});

		const populatedBooking = await booking.populate('userId flightId paymentId');

		return res.status(201).json({
			success: true,
			message: 'Booking created successfully. Please proceed to payment.',
			data: {
				booking: populatedBooking,
				paymentDetails: {
					paymentId: payment._id,
					amount: payment.amount,
					currency: payment.currency,
				},
			},
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: 'Error creating booking: ' + error.message,
		});
	}
};

/**
 * Fetch one booking for the authenticated owner.
 *
 * Workflow:
 * Ticket Summary -> GET /api/bookings/:bookingId -> ownership check -> booking details/review status
 *
 * Inputs:
 * - req.params.bookingId.
 * - req.userId from JWT.
 *
 * Returns:
 * Populated Booking with hasReviewed and firstPassengerName helpers.
 *
 * Collections:
 * - bookings: reads reservation and populated user/flight/payment data.
 * - reviews: checks whether the passenger already reviewed this booking.
 *
 * Why:
 * Supports ticket summary and post-booking screens while enforcing booking ownership.
 */
export const getBookingById = async (req, res) => {
	try {
		const { bookingId } = req.params;
		const userId = req.userId;

		// Read the Booking document and populate related User, Flight, and Payment records for ticket display.
		const booking = await Booking.findById(bookingId)
			.populate('userId', 'firstName lastName email phone')
			.populate('flightId')
			.populate('paymentId');

		if (!booking) {
			return res.status(404).json({ success: false, message: 'Booking not found' });
		}

		if (booking.userId._id.toString() !== userId) {
			return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
		}

		// Check if user has already reviewed this booking
		// Read reviews to determine whether the frontend should show review actions for this booking.
		const existingReview = await Review.findOne({ 
			bookingId: bookingId,
			userId: userId 
		});
		const hasReviewed = !!existingReview;

		// Get the first passenger's name for review display
		const firstPassengerName = booking.passengers && booking.passengers.length > 0 
			? `${booking.passengers[0].firstName} ${booking.passengers[0].lastName}`
			: '';

		return res.status(200).json({ 
			success: true, 
			data: {
				...booking.toObject(),
				hasReviewed,
				firstPassengerName
			}
		});
	} catch (error) {
		return res.status(500).json({ success: false, message: 'Error fetching booking: ' + error.message });
	}
};

/**
 * List bookings for the authenticated user.
 *
 * Workflow:
 * User Profile/Payment History -> GET /api/bookings/user/:userId -> Booking list -> Review status
 *
 * Inputs:
 * - req.params.userId, req.userId.
 * - Optional status, limit, and skip query parameters.
 *
 * Returns:
 * Paginated Booking list with total count and hasReviewed flag.
 *
 * Collections:
 * - bookings: reads the user's reservations.
 * - reviews: checks review status for each booking.
 *
 * Why:
 * Powers booking history, payment history, cancellation entry points, and review prompts.
 */
export const getUserBookings = async (req, res) => {
	try {
		const { userId } = req.params;
		const authUserId = req.userId;
		const { status, limit = 10, skip = 0 } = req.query;

		if (userId !== authUserId) {
			return res.status(403).json({ success: false, message: 'Not authorized to view these bookings' });
		}

		const query = { userId };
		if (status) query.bookingStatus = status;

		// Read the user's Booking documents from bookings, optionally filtered by status.
		const bookings = await Booking.find(query)
			.populate('flightId', 'flightNumber from to departureDate departureTime')
			.limit(parseInt(limit))
			.skip(parseInt(skip))
			.sort({ bookedAt: -1 });

		// Count bookings for pagination metadata in history views.
		const total = await Booking.countDocuments(query);

		// Add hasReviewed flag to each booking
		const bookingsWithReviewStatus = await Promise.all(
			bookings.map(async (booking) => {
				const existingReview = await Review.findOne({
					bookingId: booking._id,
					userId: authUserId
				});
				return {
					...booking.toObject(),
					hasReviewed: !!existingReview
				};
			})
		);

		return res.status(200).json({ success: true, count: bookings.length, total, data: bookingsWithReviewStatus });
	} catch (error) {
		return res.status(500).json({ success: false, message: 'Error fetching bookings: ' + error.message });
	}
};

/**
 * Confirm a pending booking after payment succeeds.
 *
 * Workflow:
 * Payment Success -> PATCH /api/bookings/:bookingId/confirm -> Payment success update -> Booking confirmed -> tickets generated
 *
 * Inputs:
 * - req.params.bookingId.
 * - req.userId from JWT.
 * - Optional paymentGatewayId and transactionId.
 *
 * Returns:
 * Confirmed Booking populated with user, flight, and payment data.
 *
 * Collections:
 * - bookings: reads pending reservation and updates status/passenger ticket numbers.
 * - payments: marks linked payment as success with gateway/transaction ids.
 *
 * Why:
 * Converts a reserved seat hold into an issued ticket after payment.
 */
export const confirmBooking = async (req, res) => {
	try {
		const { bookingId } = req.params;
		const userId = req.userId;
		const { paymentGatewayId, transactionId } = req.body;

		// Read the Booking document and populate related User, Flight, and Payment records for ticket display.
		const booking = await Booking.findById(bookingId);
		if (!booking) {
			return res.status(404).json({ success: false, message: 'Booking not found' });
		}

		if (booking.userId.toString() !== userId) {
			return res.status(403).json({ success: false, message: 'Not authorized to confirm this booking' });
		}

		if (booking.bookingStatus !== 'pending') {
			return res.status(400).json({ success: false, message: `Cannot confirm booking with status: ${booking.bookingStatus}` });
		}

		// Update the Payment document to success so financial state matches ticket issuance.
		await Payment.findByIdAndUpdate(booking.paymentId, {
			status: 'success',
			paymentGatewayId: paymentGatewayId || `gateway-${Date.now()}`,
			transactionId: transactionId || `txn-${Date.now()}`,
			paidAt: new Date(),
		});

		const updatedPassengers = booking.passengers.map((passenger) => ({
			...passenger.toObject(),
			ticketNumber: generateTicketNumber(),
		}));

		// Update the Booking document to confirmed and persist generated ticket numbers.
		const confirmedBooking = await Booking.findByIdAndUpdate(
			bookingId,
			{ bookingStatus: 'confirmed', passengers: updatedPassengers },
			{ new: true }
		)
			.populate('userId', 'firstName lastName email phone')
			.populate('flightId')
			.populate('paymentId');

		return res.status(200).json({
			success: true,
			message: 'Booking confirmed successfully',
			data: confirmedBooking,
		});
	} catch (error) {
		return res.status(500).json({ success: false, message: 'Error confirming booking: ' + error.message });
	}
};

/**
 * Cancel a booking and apply refund/seat-release state.
 *
 * Workflow:
 * Booking History -> PATCH /api/bookings/:bookingId/cancel -> fare policy -> release seats -> refund Payment -> cancel Booking
 *
 * Inputs:
 * - req.params.bookingId.
 * - req.userId from JWT.
 *
 * Returns:
 * Cancelled Booking populated with payment data.
 *
 * Collections:
 * - bookings: reads reservation, updates cancellation fields.
 * - flights: releases embedded seats via seat utility.
 * - payments: records refund status and amount.
 *
 * Why:
 * Reverses an active reservation while returning seats to inventory and preserving audit-friendly refund state.
 */
export const cancelBooking = async (req, res) => {
	try {
		const { bookingId } = req.params;
		const userId = req.userId;

		// Read the Booking document and populate related User, Flight, and Payment records for ticket display.
		const booking = await Booking.findById(bookingId);
		if (!booking) {
			return res.status(404).json({ success: false, message: 'Booking not found' });
		}

		if (booking.userId.toString() !== userId) {
			return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
		}

		if (booking.bookingStatus === 'cancelled') {
			return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
		}

		const canCancel = canCancelBooking(booking.fareType.name);
		if (!canCancel) {
			return res.status(400).json({ success: false, message: `Cancellation not allowed for ${booking.fareType.name} fare type` });
		}

		// Release embedded Flight seats so cancelled inventory can be booked again.
		await releaseSeats(booking.flightId, booking.selectedSeats);
		const refundAmount = calculateRefund(booking.pricing.totalAmount, booking.fareType.name);

		// Update the Payment document to success so financial state matches ticket issuance.
		// Update the Payment document with refund state used by payment history and support workflows.
		await Payment.findByIdAndUpdate(booking.paymentId, {
			status: 'refunded',
			refundAmount,
			refundId: `REF-${Date.now()}`,
			refundStatus: 'success',
			refundDate: new Date(),
		});

		// Update the Booking document with cancelled status and refund details.
		const cancelledBooking = await Booking.findByIdAndUpdate(
			bookingId,
			{
				bookingStatus: 'cancelled',
				'cancellationDetails.isCancelled': true,
				'cancellationDetails.cancelledAt': new Date(),
				'cancellationDetails.refundAmount': refundAmount,
			},
			{ new: true }
		).populate('paymentId');

		return res.status(200).json({
			success: true,
			message: 'Booking cancelled successfully',
			data: cancelledBooking,
		});
	} catch (error) {
		return res.status(500).json({ success: false, message: 'Error cancelling booking: ' + error.message });
	}
};

/**
 * Return seat inventory and statistics for a flight.
 *
 * Workflow:
 * Seat Selection Page -> GET /api/bookings/flight/:flightId/seats -> Flight seats + statistics
 *
 * Inputs:
 * - req.params.flightId.
 *
 * Returns:
 * Embedded seat list and aggregate statistics.
 *
 * Collections:
 * - flights: reads embedded seats for the selected schedule.
 *
 * Why:
 * Lets the frontend render the seat map before a passenger submits a booking.
 */
export const getFlightSeats = async (req, res) => {
	try {
		const { flightId } = req.params;
		// Read only embedded seats from the flights collection to minimize payload for the seat map.
		const flight = await Flight.findById(flightId).select('seats');
		if (!flight) {
			return res.status(404).json({ success: false, message: 'Flight not found' });
		}

		const stats = await getSeatStatistics(flightId);
		return res.status(200).json({ success: true, data: { seats: flight.seats, statistics: stats } });
	} catch (error) {
		return res.status(500).json({ success: false, message: 'Error fetching seats: ' + error.message });
	}
};
