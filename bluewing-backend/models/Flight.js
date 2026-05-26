import mongoose from 'mongoose';

// Seat schema (embedded)
const seatSchema = new mongoose.Schema(
  {
    seatId: {
      type: String,
      required: true,
    },
    row: {
      type: Number,
      required: true,
    },
    column: {
      type: String,
      required: true,
    },
    cabin: {
      type: String,
      enum: ['economy', 'business', 'firstClass'],
      required: true,
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    bookingId: {
      type: String,
      default: null,
    },
  },
  { _id: false }
);

// Flight schema
const flightSchema = new mongoose.Schema(
  {
    flightNumber: {
      type: String,
      required: true,
      unique: true,
    },
    from: {
      type: String,
      required: true,
    },
    to: {
      type: String,
      required: true,
    },
    departureDate: {
      type: Date,
      required: true,
    },
    departureTime: {
      type: String,
      required: true,
    },
    arrivalTime: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    economyPrice: {
      type: Number,
      required: true,
    },
    businessPrice: {
      type: Number,
      required: true,
    },
    firstClassPrice: {
      type: Number,
      required: true,
    },
    stops: {
      type: Number,
      required: true,
      default: 0,
    },
    airline: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    amenities: [
      {
        type: String,
      },
    ],
    seats: [seatSchema],
  },
  {
    timestamps: true,
    strict: true,
  }
);

// Indexes
flightSchema.index({ flightNumber: 1 });
flightSchema.index({ from: 1, to: 1, departureDate: 1 });

// Helper methods
flightSchema.methods.getAvailableSeats = function (cabin) {
  return this.seats.filter((seat) => seat.cabin === cabin && !seat.isBooked);
};

flightSchema.methods.getTotalSeats = function (cabin) {
  return this.seats.filter((seat) => seat.cabin === cabin).length;
};

flightSchema.methods.getBookedSeats = function (cabin) {
  return this.seats.filter((seat) => seat.cabin === cabin && seat.isBooked).length;
};

flightSchema.methods.getSeatPrice = function (cabin) {
  if (cabin === 'business') {
    return this.businessPrice;
  }
  if (cabin === 'firstClass') {
    return this.firstClassPrice;
  }
  return this.economyPrice;
};

export default mongoose.model('Flight', flightSchema);
