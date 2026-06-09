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

const generateBookingReference = () => {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let ref = 'BW';
	for (let i = 0; i < 4; i++) {
		ref += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return ref;
};

const generateTicketNumber = () => {
	return `BW-TK-${Math.floor(Math.random() * 1000000)}`;
};

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

		const flight = await Flight.findById(flightId);
		if (!flight) {
			return res.status(404).json({
				success: false,
				message: 'Flight not found',
			});
		}

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			});
		}

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
		await lockSeatsAtomic(flightId, selectedSeats, bookingId.toString());

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

export const getBookingById = async (req, res) => {
	try {
		const { bookingId } = req.params;
		const userId = req.userId;

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

		const bookings = await Booking.find(query)
			.populate('flightId', 'flightNumber from to departureDate departureTime')
			.limit(parseInt(limit))
			.skip(parseInt(skip))
			.sort({ bookedAt: -1 });

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

export const confirmBooking = async (req, res) => {
	try {
		const { bookingId } = req.params;
		const userId = req.userId;
		const { paymentGatewayId, transactionId } = req.body;

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

export const cancelBooking = async (req, res) => {
	try {
		const { bookingId } = req.params;
		const userId = req.userId;

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

		await releaseSeats(booking.flightId, booking.selectedSeats);
		const refundAmount = calculateRefund(booking.pricing.totalAmount, booking.fareType.name);

		await Payment.findByIdAndUpdate(booking.paymentId, {
			status: 'refunded',
			refundAmount,
			refundId: `REF-${Date.now()}`,
			refundStatus: 'success',
			refundDate: new Date(),
		});

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

export const getFlightSeats = async (req, res) => {
	try {
		const { flightId } = req.params;
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
