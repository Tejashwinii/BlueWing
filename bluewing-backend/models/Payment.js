/**
 * Payment Model
 *
 * Purpose:
 * Tracks payment state for each booking, including gateway identifiers, paid status, and refunds.
 *
 * Workflow:
 * Booking Controller -> Payment model -> payments collection -> Booking confirmation/cancellation
 *
 * Used By:
 * controllers/bookingController.js and controllers/otpController.js.
 *
 * Dependencies:
 * mongoose for schema, Booking references, and status indexes.
 *
 * Request Lifecycle:
 * Created as pending when a booking is made, marked success when booking is confirmed,
 * and marked refunded when cancellation succeeds.
 */
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
	{
		bookingId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Booking',
			required: true,
			index: true,
		},
		paymentGatewayId: { type: String, default: null },
		transactionId: { type: String, default: null },
		amount: { type: Number, required: true, min: 0 },
		currency: { type: String, default: 'INR' },
		status: { type: String, enum: ['pending', 'success', 'failed', 'refunded'], default: 'pending' },
		failureReason: { type: String, default: null },
		refundAmount: { type: Number, default: 0 },
		refundId: { type: String, default: null },
		refundStatus: { type: String, default: null },
		refundDate: { type: Date, default: null },
		paidAt: { type: Date, default: null },
	},
	{ timestamps: true }
);

paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ status: 1 });

export default mongoose.model('Payment', paymentSchema);
