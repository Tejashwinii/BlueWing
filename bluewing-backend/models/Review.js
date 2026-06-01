import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
	{
		// For public reviews and booking reviews
		userName: { type: String, trim: true },
		
		// For booking reviews (legacy support)
		userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		flightId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight' },
		bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
		
		rating: { type: Number, required: true, min: 1, max: 5 },
		comment: { type: String, required: true, trim: true },
		title: { type: String, trim: true, default: '' },
		isApproved: { type: Boolean, default: true },
		createdAt: { type: Date, default: Date.now },
	},
	{ timestamps: false }
);

// Index for sorting by latest first
reviewSchema.index({ createdAt: -1 });

// Compound unique index for booking reviews: ensures userName + bookingId is unique
// This allows different users to review the same booking, but prevents same user from reviewing same booking twice
// Using sparse: true to allow null bookingId for public reviews
reviewSchema.index({ userName: 1, bookingId: 1 }, { unique: true, sparse: true });

export default mongoose.model('Review', reviewSchema);
