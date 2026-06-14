# BlueWing Backend Architecture Guide

## Overall Architecture

BlueWing is an Express + MongoDB backend for an Airline Reservation System. The request path is intentionally simple:

```text
Frontend page/component
  -> Express route in routes/*
  -> Controller in controllers/*
  -> Mongoose model in models/*
  -> MongoDB collection
  -> JSON response to frontend
```

The app starts in `server.js`, loads environment variables, connects to MongoDB through `config/database.js`, installs global middleware, mounts route modules, and then listens for API requests.

## Folder-by-Folder Explanation

`config/`
- `database.js`: Opens the Mongoose connection to the `bluewing` database before requests are served.
- `fareTypes.js`: Defines fare products, fare multipliers, cancellation eligibility, refund percentages, and pricing helpers.

`routes/`
- `authRoutes.js`: Registration, login, profile, and password-reset OTP endpoints.
- `flightRoutes.js`: Public flight browsing/search plus admin-only flight create/delete.
- `bookingRoutes.js`: Booking creation, ticket retrieval, user booking history, confirmation, cancellation, and seat maps.
- `otpRoutes.js`: Protected OTP endpoints for booking cancellation.
- `reviewRoutes.js`: Public reviews, flight reviews, user reviews, and duplicate-review checks.

`controllers/`
- `authController.js`: User registration, login, profile read, and profile update.
- `flightController.js`: Flight search/list/detail and admin schedule operations.
- `bookingController.js`: Seat locking, pending booking creation, payment record creation, booking confirmation, ticket generation, cancellation, refunds, and seat-map responses.
- `otpController.js`: OTP delivery/verification for password reset and booking cancellation.
- `reviewController.js`: Review creation and review lookup flows.
- `seatLockingUtil.js`: Atomic embedded-seat updates inside Flight documents.
- `paymentController.js`: Placeholder; payment state is currently handled in booking/OTP controllers.

`models/`
- `User.js`: Passenger/admin login accounts and password hashing.
- `Admin.js`: Admin metadata, permissions, lockout state, and audit logs for future/admin workflows.
- `Flight.js`: Flight schedules, prices, amenities, ratings, and embedded seat inventory.
- `Booking.js`: Reservations, passengers, selected seats, fare snapshots, pricing, ticket numbers, payment linkage, and cancellation state.
- `Payment.js`: Pending/success/failed/refunded payment records.
- `Review.js`: Public, flight-linked, and booking-linked reviews.
- `Seat.js`: Reusable embedded seat schema module; current active seat inventory is embedded by `Flight.js`.

`middleware/`
- `auth.js`: JWT generation, protected-route authentication, admin-only authorization, optional auth.
- `validation.js`: Joi schemas and reusable request body validation middleware.

`seeders/`
- `adminSeeder.js`: Creates or updates the local default admin user.
- `flightSeeder.js`: Replaces demo flight schedules and embedded seat inventory.

## Route Flow Diagrams

Authentication:

```text
POST /api/auth/register
  -> validateRequest(registerSchema)
  -> authController.register
  -> User.findOne(email)
  -> User.create(...)
  -> generateToken(user._id)
  -> response { user, token }
```

Flight search:

```text
POST /api/flights/search
  -> flightController.searchFlights
  -> validate from/to/departureDate
  -> Flight.find({ from, to, departureDate range })
  -> response { count, data }
```

Booking:

```text
POST /api/bookings
  -> protect
  -> bookingController.createBooking
  -> Flight.findById(flightId)
  -> User.findById(req.userId)
  -> checkSeatsAvailability(flightId, selectedSeats)
  -> lockSeatsAtomic(flightId, selectedSeats, bookingId)
  -> Payment.create({ status: 'pending' })
  -> Booking.create({ bookingStatus: 'pending' })
  -> response { booking, paymentDetails }
```

Payment confirmation:

```text
PATCH /api/bookings/:bookingId/confirm
  -> protect
  -> Booking.findById(bookingId)
  -> ownership/status checks
  -> Payment.findByIdAndUpdate(... success ...)
  -> Booking.findByIdAndUpdate(... confirmed, ticketNumbers ...)
  -> response confirmed booking
```

Cancellation:

```text
PATCH /api/bookings/:bookingId/cancel
  -> protect
  -> Booking.findById(bookingId)
  -> ownership/status/fare policy checks
  -> releaseSeats(booking.flightId, booking.selectedSeats)
  -> Payment.findByIdAndUpdate(... refunded ...)
  -> Booking.findByIdAndUpdate(... cancelled ...)
  -> response cancelled booking
```

OTP cancellation:

```text
POST /api/send-otp
  -> protect
  -> otpController.sendOtp
  -> Booking.findById(bookingId).populate(userId)
  -> store OTP in memory
  -> send email

POST /api/verify-otp
  -> protect
  -> otpController.verifyOtp
  -> validate OTP from memory
  -> Booking.findById(bookingId)
  -> releaseSeats
  -> Payment refund update
  -> Booking cancellation update
```

## Authentication Flow

JWTs are created by `generateToken(user._id)` after registration or login. Protected routes use `protect`, which reads the `Authorization` header, verifies the token with `JWT_SECRET`, and attaches `req.userId`. Controllers then use `req.userId` to load the current user or enforce booking/review ownership.

Admin-only endpoints use `protect` first and then `adminOnly`. `adminOnly` loads the `User` document and requires `role === 'admin'`. In the current API, admin protection is used for flight creation and deletion.

## Flight Management Flow

Public users can list, search, view details, and view featured flights. Admin users can create and delete flights.

Flights are stored in the `flights` collection. Each Flight document includes route, date/time, prices by cabin, rating, amenities, and embedded seats. Embedded seats allow booking operations to update seat state directly on the flight schedule.

## Flight Instance Workflow

This project models each scheduled flight as a `Flight` document. There is no separate `flightInstances` collection. A date-specific flight like `BW201` on `2026-06-19` is stored directly in `flights` with its own embedded seat inventory.

## Seat Management Workflow

Seats are embedded in Flight documents. During booking creation:

```text
selectedSeats from frontend
  -> checkSeatsAvailability reads Flight.seats
  -> lockSeatsAtomic updates matching embedded seats where isBooked is false
  -> Booking stores selectedSeats and passenger-seat mapping
```

During cancellation, `releaseSeats` clears `isBooked` and `bookingId` on those embedded seats. This makes the seats available for future bookings.

## Booking Workflow

A booking starts as `pending`. The backend validates the passenger count, selected seats, fare type, flight, and user. It calculates pricing from the selected cabin base fare and fare type multiplier. Then it locks seats, creates a pending Payment document, and creates a Booking document.

A confirmed booking is created by the confirmation endpoint after payment success. The controller marks the Payment as `success`, assigns ticket numbers to passengers, and updates `bookingStatus` to `confirmed`.

A cancelled booking releases seats, calculates refund based on fare type, updates the Payment refund fields, and stores cancellation metadata on the Booking document.

## Payment Workflow

There is no separate payment route module in the current backend. Payment state is managed by booking and OTP controllers:

- `Payment.create(...)` happens during booking creation with `status: 'pending'`.
- `Payment.findByIdAndUpdate(...)` marks payment `success` during booking confirmation.
- `Payment.findByIdAndUpdate(...)` marks payment `refunded` during cancellation.

The `payments` collection is linked back to `bookings` by `bookingId`, and Booking documents store `paymentId`.

## Admin Workflow

Admin access currently depends on `User.role === 'admin'`. The default admin can be created with `seeders/adminSeeder.js`. Protected admin flight routes are:

```text
POST /api/flights
DELETE /api/flights/:id
```

The `Admin` model contains richer admin metadata, permission helpers, lockout state, and audit logging methods, but the current route layer uses the simpler User role check.

## MongoDB Collections

`users`
- Stores registered passenger and admin login accounts.
- Used for auth, profile, booking ownership, password reset, and admin authorization.

`flights`
- Stores scheduled flights and embedded seats.
- Used for search, details, featured flights, admin operations, seat availability, seat locking, and seat release.

`bookings`
- Stores reservations, passenger details, selected seats, fare snapshot, pricing, status, tickets, payment linkage, and cancellation details.
- Used for ticket summary, booking history, confirmation, cancellation, and review prompts.

`payments`
- Stores payment/refund state linked to bookings.
- Used for pending payment display, confirmation, payment history, and refunds.

`reviews`
- Stores public, flight-linked, and booking-linked feedback.
- Used for testimonials, flight review displays, and duplicate-review checks.

`admins`
- Stores extended admin metadata and audit logs when admin-specific workflows use the `Admin` model.

## Collection Relationships

```text
User 1 -> many Booking
Flight 1 -> many Booking
Booking 1 -> 1 Payment
Booking 1 -> many passenger subdocuments
Booking 1 -> optional Review
Flight 1 -> many Review
User 1 -> many Review
Flight 1 -> many embedded Seat documents
Admin -> User via userId reference
```

## Request Lifecycle Examples

Profile request:

```text
GET /api/auth/profile
  -> CORS/body middleware
  -> authRoutes
  -> protect verifies JWT and sets req.userId
  -> getProfile reads User.findById(req.userId)
  -> JSON profile response
```

Seat map request:

```text
GET /api/bookings/flight/:flightId/seats
  -> bookingRoutes
  -> getFlightSeats reads Flight.findById(flightId).select('seats')
  -> getSeatStatistics reads Flight seats
  -> JSON seats/statistics response
```

Review check:

```text
GET /api/reviews/check/:bookingId
  -> protect
  -> checkReviewExists reads Review.findOne({ bookingId, userId: req.userId })
  -> JSON hasReviewed response
```

## End-to-End Example

User searches flight -> selects seat -> books -> pays -> ticket generated:

```text
1. User searches Hyderabad to Chennai for a date.
   POST /api/flights/search
   Flight.find(...) returns matching Flight documents.

2. User opens seat selection for a selected flight.
   GET /api/bookings/flight/:flightId/seats
   Flight embedded seats and statistics are returned.

3. User submits passenger details, fare type, and selected seats.
   POST /api/bookings with JWT
   Booking controller validates payload, reads Flight/User, checks seats, locks seats,
   creates pending Payment, and creates pending Booking.

4. User completes payment.
   PATCH /api/bookings/:bookingId/confirm with JWT
   Payment is marked success, Booking is marked confirmed, and ticket numbers are assigned.

5. User views ticket.
   GET /api/bookings/:bookingId with JWT
   Booking is populated with User, Flight, and Payment details, and returned for ticket display.
```

## Key Assumptions and TODOs

- OTP storage is in memory, so OTPs disappear on server restart and are not shared across scaled server instances. Use Redis or MongoDB TTL indexes for production.
- Flight deletion currently deletes the Flight document directly. Production admin workflows should check active bookings before deletion.
- Payment gateway verification is represented by controller state updates. A real production gateway integration should verify gateway signatures/webhooks before marking payments successful.
- The current app treats each scheduled flight document as the flight instance; there is no separate recurring-flight master schedule.