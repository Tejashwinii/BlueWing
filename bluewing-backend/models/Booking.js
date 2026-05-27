import mongoose from 'mongoose';

const passengerSchema = new mongoose.Schema(
	{
		passengerId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			auto: true,
		},
		firstName: {
			type: String,
			required: true,
			trim: true,
		},
		lastName: {
			type: String,
			required: true,
			trim: true,
		},
		gender: {
			type: String,
			required: true,
		},
		age: {
			type: Number,
			required: true,
			min: 0,
		},
		seatNumber: {
			type: String,
			required: true,
		},
		ticketNumber: {
			type: String,
			default: null,
		},
	},
	{ _id: false }
);

const fareTypeSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		multiplier: { type: Number, required: true },
		cancellation: { type: Boolean, default: false },
		meals: { type: Boolean, default: false },
		priorityBoarding: { type: Boolean, default: false },
		baggage: { type: String },
	},
	{ _id: false }
);

const contactDetailsSchema = new mongoose.Schema(
	{
		phone: { type: String, required: true },
		email: { type: String, required: true },
		country: { type: String, required: true },
		contactPassengerId: { type: mongoose.Schema.Types.ObjectId },
	},
	{ _id: false }
);

const pricingSchema = new mongoose.Schema(
	{
		baseFare: { type: Number, required: true },
		taxes: { type: Number, required: true },
		seatCharges: { type: Number, default: 0 },
		totalAmount: { type: Number, required: true },
	},
	{ _id: false }
);

const cancellationDetailsSchema = new mongoose.Schema(
	{
		isCancelled: { type: Boolean, default: false },
		cancelledAt: { type: Date, default: null },
		refundAmount: { type: Number, default: 0 },
	},
	{ _id: false }
);

const bookingSchema = new mongoose.Schema(
	{
		bookingReference: { type: String, required: true, unique: true, index: true },
		userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
		flightId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true, index: true },
		fareType: { type: fareTypeSchema, required: true },
		passengers: { type: [passengerSchema], required: true },
		selectedSeats: { type: [String], required: true },
		contactDetails: { type: contactDetailsSchema, required: true },
		pricing: { type: pricingSchema, required: true },
		bookingStatus: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
		cancellationDetails: { type: cancellationDetailsSchema, default: () => ({}) },
		paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', default: null },
		bookedAt: { type: Date, default: Date.now },
	},
	{ timestamps: true }
);

bookingSchema.index({ bookingReference: 1 });
bookingSchema.index({ userId: 1, bookingStatus: 1 });

export default mongoose.model('Booking', bookingSchema);
