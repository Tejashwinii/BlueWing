import mongoose from 'mongoose';

/**
 * Seat Schema - Embedded within Flight document
 * Not a separate collection, embedded for atomic operations
 */
const seatSchema = new mongoose.Schema(
  {
    seatId: {
      type: String,
      required: true, // e.g., "1A", "12F"
    },
    row: {
      type: Number,
      required: true,
    },
    column: {
      type: String,
      required: true, // A-F
      enum: ['A', 'B', 'C', 'D', 'E', 'F'],
    },
    cabinClass: {
      type: String,
      required: true,
      enum: ['first-class', 'business', 'economy'],
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
    passengerName: String, // Optional: name of passenger if booked
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking', // Reference to booking when seat is reserved
    },
    price: {
      type: Number,
      default: 0, // Extra charge for premium seats (exit row, extra legroom, etc.)
    },
    isExitRow: {
      type: Boolean,
      default: false,
    },
    hasExtraLegroom: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false } // Don't create separate IDs for embedded docs
);

export default seatSchema;
