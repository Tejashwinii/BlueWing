import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		flightId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
		bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
		rating: { type: Number, required: true, min: 1, max: 5 },
		title: { type: String, required: true, trim: true },
		comment: { type: String, trim: true },
		isApproved: { type: Boolean, default: false },
		approvedAt: { type: Date, default: null },
	},
	{ timestamps: true }
);

reviewSchema.index({ bookingId: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);
