/**
 * Flight Model
 *
 * Purpose:
 * Stores scheduled flights, fares, amenities, ratings, and embedded seat inventory.
 *
 * Workflow:
 * Flight Search/Admin/Booking -> Flight model -> flights collection
 *
 * Used By:
 * controllers/flightController.js, controllers/bookingController.js, controllers/seatLockingUtil.js,
 * seeders/flightSeeder.js.
 *
 * Dependencies:
 * mongoose for the Flight schema, embedded seat schema, indexes, and model methods.
 *
 * Request Lifecycle:
 * Read during flight search/details and seat-map requests; updated during booking seat locks,
 * cancellations, and admin flight management.
 */
import mongoose from 'mongoose';

// Embedded seat documents live inside each Flight document, allowing seat-lock updates to modify inventory with the flight schedule.
// Seat schema (embedded)
// Format: seatId = "1a", "2a", "3a" where number is column, letter is row
// First Class: rows a, b, c (3 seats per row)
// Business: rows d-i (5 seats per row)
// Economy: rows j-z (9 seats per row)
const seatSchema = new mongoose.Schema(
  {
    seatId: {
      type: String,
      required: true,
    },
    row: {
      type: String,  // Changed to String: "a", "b", "c", etc.
      required: true,
    },
    column: {
      type: Number,  // Changed to Number: 1, 2, 3, etc.
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

// Flight collection documents are the source of truth for searchable schedules and seat availability.
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
/**
 * Return unbooked seats for a cabin.
 *
 * Inputs: cabin name stored on embedded seats.
 * Returns: array of available embedded seat documents.
 * Collections: flights, via the already-loaded Flight document.
 * Why: supports seat-map and availability workflows without duplicating filtering logic.
 */
flightSchema.methods.getAvailableSeats = function (cabin) {
  return this.seats.filter((seat) => seat.cabin === cabin && !seat.isBooked);
};

/**
 * Count total seats for a cabin in this flight document.
 *
 * Inputs: cabin name.
 * Returns: number of matching embedded seats.
 * Collections: flights, using embedded seats on this document.
 * Why: supports capacity reporting by cabin class.
 */
flightSchema.methods.getTotalSeats = function (cabin) {
  return this.seats.filter((seat) => seat.cabin === cabin).length;
};

/**
 * Count booked seats for a cabin in this flight document.
 *
 * Inputs: cabin name.
 * Returns: number of booked embedded seats.
 * Collections: flights, using embedded seats on this document.
 * Why: supports availability and admin reporting workflows.
 */
flightSchema.methods.getBookedSeats = function (cabin) {
  return this.seats.filter((seat) => seat.cabin === cabin && seat.isBooked).length;
};

/**
 * Resolve the base fare for a selected cabin.
 *
 * Inputs: cabin name from a selected seat.
 * Returns: economy, business, or first-class base price.
 * Collections: flights, using fare fields on this document.
 * Why: booking price calculation needs the cabin's base fare before fare-type multipliers.
 */
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
