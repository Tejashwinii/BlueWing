# BlueWing Airlines - Backend Integration Prompts

## Project Status Overview

### ✅ COMPLETED (Phase 0 - Authentication)

**Backend Created:**
- `config/database.js` - MongoDB connection
- `models/User.js` - User schema with bcrypt password hashing
- `models/Admin.js` - Admin schema with permissions
- `middleware/auth.js` - JWT token generation & protect middleware
- `middleware/validation.js` - Joi validation schemas
- `controllers/authController.js` - Register, login, getProfile, updateProfile
- `routes/authRoutes.js` - Auth API endpoints
- `server.js` - Express server with CORS, JSON parsing

**Frontend Integrated:**
- `utils/api.js` - Axios client with interceptors
- `context/AuthContext.jsx` - Auth state management
- `pages/BluewingLogin.jsx` - Login with API
- `pages/RegistrationPage.jsx` - Register with API

**Database:** MongoDB `bluewing` → Collection: `users`

**Working API Endpoints:**
| Method | Endpoint | Status |
|--------|----------|--------|
| GET | /api/health | ✅ |
| POST | /api/auth/register | ✅ |
| POST | /api/auth/login | ✅ |
| GET | /api/auth/profile | ✅ |
| PUT | /api/auth/profile | ✅ |

---

## PHASE 1: HOME PAGE & FLIGHT SEARCH

### Prompt 1.1 - Flight Model

```
Create the Flight Model for BlueWing Airlines.

File: models/Flight.js

Schema fields:
- flightNumber: String, required, unique, uppercase (e.g., "BW101")
- airline: String, default "BlueWing Airlines"
- aircraft: String (e.g., "Boeing 737", "Airbus A320")

Departure object:
- city: String, required
- airport: String, required
- code: String, required, 3 letters uppercase (e.g., "DEL")
- terminal: String
- time: String, required (e.g., "06:30")

Arrival object:
- city: String, required  
- airport: String, required
- code: String, required, 3 letters uppercase
- terminal: String
- time: String, required

Schedule:
- departureDate: Date, required
- arrivalDate: Date
- duration: String (e.g., "2h 30m")

Pricing (all Numbers):
- economy: required
- business: required
- firstClass: required

Seats available (all Numbers):
- economyAvailable: default 150
- businessAvailable: default 30
- firstClassAvailable: default 10

Total seats:
- economyTotal: default 150
- businessTotal: default 30
- firstClassTotal: default 10

Status:
- status: enum ['scheduled', 'boarding', 'departed', 'arrived', 'delayed', 'cancelled'], default 'scheduled'

Additional:
- stops: Number, default 0
- amenities: [String] array
- baggageAllowance: { cabin: String, checkIn: String }

Add timestamps: true
Add index on: flightNumber, departure.code, arrival.code, departureDate

Export the model.
```

---

### Prompt 1.2 - Flight Seeder

```
Create a seeder to populate sample flights.

File: seeders/flightSeeder.js

Create 25+ flights between these Indian cities:
- Delhi (DEL) - Indira Gandhi International Airport
- Mumbai (BOM) - Chhatrapati Shivaji International Airport
- Bangalore (BLR) - Kempegowda International Airport
- Chennai (MAA) - Chennai International Airport
- Kolkata (CCU) - Netaji Subhas Chandra Bose International Airport
- Hyderabad (HYD) - Rajiv Gandhi International Airport
- Pune (PNQ) - Pune Airport
- Jaipur (JAI) - Jaipur International Airport
- Goa (GOI) - Goa International Airport
- Ahmedabad (AMD) - Sardar Vallabhbhai Patel International Airport
- Kochi (COK) - Cochin International Airport
- Lucknow (LKO) - Chaudhary Charan Singh International Airport

Requirements:
1. Mix of morning, afternoon, evening flights
2. Prices range: Economy ₹2500-8000, Business ₹8000-20000, First ₹20000-45000
3. Duration: 1h to 3h 30m based on distance
4. Various aircraft: Boeing 737, Airbus A320, Airbus A321
5. Flights for next 30 days from today
6. Some flights with stops (1 stop)

Create function seedFlights() that:
- Clears existing flights
- Inserts all sample flights
- Logs success count

Export: seedFlights function

Add script in package.json:
"seed:flights": "node seeders/flightSeeder.js"
```

---

### Prompt 1.3 - Flight Controller

```
Create the Flight Controller.

File: controllers/flightController.js

Functions to create:

1. getFeaturedFlights
   - Get 6 flights for homepage display
   - Only scheduled flights
   - Sort by departureDate
   - Return limited fields: flightNumber, departure, arrival, price.economy, duration

2. searchFlights
   - Query params: from, to, date, passengers (optional, default 1)
   - Find flights matching:
     - departure.code = from (case insensitive)
     - arrival.code = to (case insensitive)
     - departureDate = date (same day)
     - status = 'scheduled'
     - economyAvailable >= passengers
   - Sort by price.economy ascending
   - Return all matching flights

3. getFlightById
   - Param: flightId
   - Find flight by _id
   - Return full flight details
   - Return 404 if not found

4. getAllFlights
   - Optional query filters: from, to, minPrice, maxPrice, date
   - Pagination: page, limit (default 10)
   - Sort options: price, duration, departureTime
   - Return flights with total count

Export all functions.
```

---

### Prompt 1.4 - Flight Routes

```
Create Flight Routes.

File: routes/flightRoutes.js

Import:
- express Router
- All flight controller functions

Routes (all public, no auth required):

GET /featured
- Controller: getFeaturedFlights
- Purpose: Homepage featured flights

GET /search
- Controller: searchFlights
- Query: from, to, date, passengers
- Purpose: Search flights

GET /
- Controller: getAllFlights
- Query: filters, pagination, sort
- Purpose: List all flights with filters

GET /:id
- Controller: getFlightById
- Purpose: Single flight details

Export router.
```

---

### Prompt 1.5 - Update Server & Test

```
Update server.js to include flight routes.

Add:
1. Import flightRoutes from './routes/flightRoutes.js'
2. Add route: app.use('/api/flights', flightRoutes)
3. Update console log to show flight endpoints

After updating:
1. Run the flight seeder: npm run seed:flights
2. Test endpoints:
   - GET /api/flights/featured
   - GET /api/flights/search?from=DEL&to=BOM&date=2026-05-26
   - GET /api/flights
   - GET /api/flights/:id
```

---

### Prompt 1.6 - Frontend API Functions

```
Update frontend utils/api.js to add flight API functions.

Add flightAPI object with:

1. getFeaturedFlights()
   - GET /flights/featured
   - Returns featured flights array

2. searchFlights(from, to, date, passengers)
   - GET /flights/search with query params
   - Returns matching flights array

3. getFlightById(id)
   - GET /flights/:id
   - Returns single flight object

4. getAllFlights(filters)
   - GET /flights with query params
   - filters: { from, to, minPrice, maxPrice, date, page, limit, sort }
   - Returns { flights, total, page, pages }

Export flightAPI.
```

---

### Prompt 1.7 - HomePage Integration

```
Update HomePage.jsx to fetch and display real flights.

Changes:

1. Import:
   - useState, useEffect from React
   - flightAPI from utils/api
   - useNavigate from react-router-dom

2. Add state:
   - featuredFlights: []
   - loading: boolean
   - error: string
   - searchForm: { from, to, date, passengers }

3. On component mount (useEffect):
   - Call flightAPI.getFeaturedFlights()
   - Store in featuredFlights state
   - Handle loading and error states

4. Search form handler:
   - Validate: from, to, date required
   - Navigate to /flights with search params:
     /flights?from=DEL&to=BOM&date=2026-05-26&passengers=1

5. Display:
   - Loading spinner while fetching
   - Error message if fetch fails
   - Featured flights in cards (use existing FlightCard component)
   - "View All Flights" button → /flights

6. Console.log for debugging:
   - Log fetched flights
   - Log search params on submit
```

---

## PHASE 2: FLIGHT SELECTION PAGE

### Prompt 2.1 - FlightSelection Integration

```
Update FlightSelection.jsx to fetch flights from API.

Changes:

1. Import:
   - useState, useEffect from React
   - useSearchParams from react-router-dom
   - flightAPI from utils/api

2. Get search params on load:
   - from, to, date, passengers from URL

3. Add state:
   - flights: []
   - loading: boolean
   - error: string
   - filters: { priceRange, departureTime, stops }
   - sortBy: 'price' | 'duration' | 'departure'

4. Fetch flights on mount:
   - If search params exist: call searchFlights(from, to, date, passengers)
   - Else: call getAllFlights() with default filters
   - Store results in flights state

5. Filter functionality (frontend filtering):
   - Price range slider
   - Departure time: Morning (6-12), Afternoon (12-18), Evening (18-24)
   - Stops: Non-stop, 1 Stop

6. Sort functionality:
   - Price: Low to High
   - Duration: Shortest First
   - Departure: Earliest First

7. On flight select:
   - Store selected flight in localStorage or context
   - Navigate to /passenger-details

8. Show:
   - Search summary bar (DEL → BOM, 26 May, 1 Passenger)
   - Filter sidebar
   - Flight cards with Select button
   - Loading and empty states
```

---

### Prompt 2.2 - Flight Context (Optional)

```
Create a BookingContext to manage booking flow.

File: context/BookingContext.jsx

State to manage:
- selectedFlight: null | Flight object
- fareType: 'economy' | 'business' | 'firstClass'
- passengers: [] array of passenger objects
- selectedSeats: [] array of seat numbers
- totalAmount: number
- bookingStep: number (1-5)

Functions:
- setSelectedFlight(flight)
- setFareType(type)
- addPassenger(passenger)
- updatePassenger(index, data)
- removePassenger(index)
- setSelectedSeats(seats)
- calculateTotal()
- resetBooking()

Wrap App with BookingProvider.

Use this context across:
- FlightSelection
- FareTypeCard
- PassengerDetails
- SeatSelection
- Payment
```

---

## PHASE 3: PASSENGER DETAILS PAGE

### Prompt 3.1 - PassengerDetails Integration

```
Update PassengerDetails.jsx for booking flow.

Requirements:

1. Get from context/localStorage:
   - Selected flight
   - Fare type
   - Number of passengers

2. If no flight selected:
   - Redirect to /flights

3. Form for each passenger:
   - Title (Mr/Mrs/Ms)
   - First Name (required)
   - Last Name (required)
   - Date of Birth (required, must be valid)
   - Gender (Male/Female/Other)
   - Email (required for primary passenger)
   - Phone (required for primary passenger)
   - Passport Number (optional)
   - Nationality (optional, default India)

4. For logged-in users:
   - Pre-fill first passenger from user profile

5. Validation:
   - All required fields
   - Valid email format
   - Valid phone (10 digits)
   - DOB not in future

6. On submit:
   - Store passenger data in context
   - Navigate to /seat-selection

7. Show:
   - Flight summary card
   - Fare type selected
   - Total price so far
   - Passenger forms (accordion or tabs for multiple)
```

---

## PHASE 4: SEAT SELECTION PAGE

### Prompt 4.1 - Seat Map Model (Optional)

```
Add seat information to Flight model or create separate.

Option A: Add to Flight model
- seatMap: { rows: Number, seatsPerRow: Number, layout: String }
- bookedSeats: [String] array of booked seat numbers

Option B: Create Seat model
File: models/Seat.js

Schema:
- flight: ref to Flight
- seatNumber: String (e.g., "1A", "12F")
- row: Number
- column: String
- class: enum ['economy', 'business', 'firstClass']
- status: enum ['available', 'booked', 'blocked']
- price: Number (extra charge for premium seats)
- passenger: ref to User (if booked)

For now, use Option A (simpler).
```

---

### Prompt 4.2 - Seat Controller

```
Add seat functions to flightController.js

Functions:

1. getFlightSeats(flightId)
   - Get flight by ID
   - Generate seat map based on aircraft type:
     - Boeing 737: 30 rows, 6 seats (A-F), 3-3 layout
     - Airbus A320: 30 rows, 6 seats (A-F), 3-3 layout
     - Airbus A321: 35 rows, 6 seats (A-F), 3-3 layout
   - Mark booked seats from bookedSeats array
   - Return seat map with availability

2. holdSeats(flightId, seats, sessionId)
   - Temporarily hold seats for 10 minutes
   - Store in Redis or memory (for simplicity, use in-memory Map)
   - Return hold confirmation

3. releaseHold(flightId, sessionId)
   - Release held seats

Add routes:
- GET /api/flights/:id/seats
- POST /api/flights/:id/seats/hold
- DELETE /api/flights/:id/seats/hold
```

---

### Prompt 4.3 - SeatSelection Integration

```
Update SeatSelection.jsx to use API.

Requirements:

1. Get from context:
   - Selected flight
   - Passengers array
   - Fare type

2. On mount:
   - Fetch seat map: GET /api/flights/:id/seats
   - Store in state

3. Seat map display:
   - Visual grid layout
   - Color coding:
     - Green: Available
     - Red: Booked
     - Blue: Selected by user
     - Yellow: Held by others
   - First Class: Rows 1-2 (wider seats)
   - Business: Rows 3-7
   - Economy: Rows 8-30

4. Selection logic:
   - User must select seats equal to passenger count
   - Can only select seats in chosen fare class
   - Show seat price (extra for exit row, front)

5. Seat pricing:
   - Exit row: +₹500
   - Extra legroom: +₹300
   - Front rows: +₹200
   - Regular: included

6. On confirm:
   - Hold selected seats
   - Store in context
   - Navigate to /payment

7. Show:
   - Flight info header
   - Seat legend
   - Seat map grid
   - Selected seats summary
   - Total with seat charges
   - Continue button
```

---

## PHASE 5: BOOKING & PAYMENT

### Prompt 5.1 - Booking Model

```
Create Booking Model.

File: models/Booking.js

Schema:

bookingReference:
- Type: String
- Required, unique
- Auto-generate: "BW" + 6 random alphanumeric

user:
- Type: ObjectId, ref: 'User'
- Required

flight:
- Type: ObjectId, ref: 'Flight'
- Required

passengers: [
  {
    title: String,
    firstName: String,
    lastName: String,
    dateOfBirth: Date,
    gender: String,
    email: String,
    phone: String,
    seatNumber: String,
    passportNumber: String,
    nationality: String
  }
]

fareType:
- Type: String
- Enum: ['economy', 'business', 'firstClass']

pricing:
- baseFare: Number
- taxes: Number
- seatCharges: Number
- totalAmount: Number

payment:
- status: enum ['pending', 'completed', 'failed', 'refunded']
- method: String
- transactionId: String
- paidAt: Date

bookingStatus:
- Type: String
- Enum: ['confirmed', 'cancelled', 'completed', 'no-show']
- Default: 'confirmed'

cancellation:
- cancelledAt: Date
- reason: String
- refundAmount: Number
- refundStatus: enum ['pending', 'processed', 'rejected']

timestamps: true

Indexes: bookingReference, user, flight, createdAt

Methods:
- generateBookingReference() - static method

Export model.
```

---

### Prompt 5.2 - Payment Model

```
Create Payment Model.

File: models/Payment.js

Schema:

booking:
- Type: ObjectId, ref: 'Booking'
- Required

user:
- Type: ObjectId, ref: 'User'
- Required

amount:
- Type: Number
- Required

currency:
- Type: String
- Default: 'INR'

method:
- Type: String
- Enum: ['card', 'upi', 'netbanking', 'wallet']
- Required

status:
- Type: String
- Enum: ['initiated', 'pending', 'success', 'failed', 'refunded']
- Default: 'initiated'

transactionId:
- Type: String
- Unique, sparse

cardDetails (for card payments):
- lastFourDigits: String
- cardType: String (visa/mastercard/rupay)
- cardHolderName: String

upiDetails (for UPI):
- upiId: String

bankDetails (for netbanking):
- bankName: String
- accountLastFour: String

failureReason:
- Type: String

refund:
- refundId: String
- refundAmount: Number
- refundedAt: Date
- refundStatus: String

timestamps: true

Export model.
```

---

### Prompt 5.3 - Booking Controller

```
Create Booking Controller.

File: controllers/bookingController.js

Functions:

1. createBooking
   - Requires auth (user must be logged in)
   - Body: { flightId, passengers, fareType, seats, pricing }
   - Validate flight exists and seats available
   - Generate booking reference
   - Create booking with status 'pending'
   - Update flight's bookedSeats array
   - Decrease available seat count
   - Return booking with reference

2. getBookingById
   - Param: bookingId or bookingReference
   - Requires auth
   - User can only view their own bookings (unless admin)
   - Populate flight details
   - Return booking

3. getUserBookings
   - Requires auth
   - Get all bookings for logged-in user
   - Sort by createdAt descending
   - Populate flight details
   - Pagination: page, limit

4. cancelBooking
   - Param: bookingId
   - Requires auth (owner or admin)
   - Check if cancellation allowed (not departed)
   - Calculate refund based on policy:
     - > 24h before: 90% refund
     - 12-24h: 75% refund
     - 6-12h: 50% refund
     - < 6h: No refund
   - Update booking status to 'cancelled'
   - Release seats back to flight
   - Return cancellation details

5. getBookingByReference
   - Query: reference (booking reference)
   - Public endpoint for check-in lookup
   - Return basic booking info

Export all functions.
```

---

### Prompt 5.4 - Payment Controller

```
Create Payment Controller.

File: controllers/paymentController.js

Functions:

1. initiatePayment
   - Requires auth
   - Body: { bookingId, method, amount }
   - Validate booking exists and belongs to user
   - Create payment record with status 'initiated'
   - Generate mock transaction ID
   - Return payment ID and redirect info

2. processPayment (Mock)
   - Body: { paymentId, cardDetails/upiId/bankDetails }
   - Simulate payment processing (always success for now)
   - Wait 2 seconds (simulate processing)
   - Update payment status to 'success'
   - Update booking payment status to 'completed'
   - Return success with transaction details

3. verifyPayment
   - Query: paymentId or transactionId
   - Check payment status
   - Return current status

4. getPaymentHistory
   - Requires auth
   - Get all payments for user
   - Sort by createdAt descending
   - Populate booking details

5. processRefund
   - Requires auth (admin or system)
   - Param: paymentId
   - Body: { amount, reason }
   - Create refund record
   - Update payment status
   - Return refund details

Export all functions.
```

---

### Prompt 5.5 - Booking & Payment Routes

```
Create route files.

File: routes/bookingRoutes.js

Routes (all protected):
- POST / - createBooking
- GET / - getUserBookings
- GET /reference/:ref - getBookingByReference (public)
- GET /:id - getBookingById
- PUT /:id/cancel - cancelBooking

File: routes/paymentRoutes.js

Routes (all protected except verify):
- POST /initiate - initiatePayment
- POST /process - processPayment
- GET /verify/:id - verifyPayment (public)
- GET /history - getPaymentHistory

Update server.js:
- Import both route files
- Add: app.use('/api/bookings', bookingRoutes)
- Add: app.use('/api/payments', paymentRoutes)
```

---

### Prompt 5.6 - Frontend API Functions

```
Update utils/api.js with booking and payment functions.

Add bookingAPI:

1. createBooking(data)
   - POST /bookings
   - data: { flightId, passengers, fareType, seats, pricing }

2. getMyBookings(page, limit)
   - GET /bookings

3. getBookingById(id)
   - GET /bookings/:id

4. getBookingByReference(ref)
   - GET /bookings/reference/:ref

5. cancelBooking(id, reason)
   - PUT /bookings/:id/cancel

Add paymentAPI:

1. initiatePayment(bookingId, method, amount)
   - POST /payments/initiate

2. processPayment(paymentId, paymentDetails)
   - POST /payments/process

3. verifyPayment(paymentId)
   - GET /payments/verify/:id

4. getPaymentHistory()
   - GET /payments/history

Export both.
```

---

### Prompt 5.7 - Payment Page Integration

```
Update Payment.jsx to use API.

Requirements:

1. Get from context:
   - Selected flight
   - Passengers
   - Selected seats
   - Fare type
   - Total amount

2. If missing data, redirect to /flights

3. Display:
   - Booking summary card
   - Flight details
   - Passenger list
   - Seat numbers
   - Price breakdown

4. Payment methods:
   - Card (mock form: card number, expiry, CVV, name)
   - UPI (mock: UPI ID input)
   - Net Banking (mock: bank selection dropdown)

5. On pay:
   - Show loading overlay
   - Call initiatePayment API
   - Call processPayment API
   - On success:
     - Call createBooking API
     - Clear booking context
     - Navigate to /payment-success with bookingReference
   - On failure:
     - Show error message
     - Allow retry

6. Add validation:
   - Card: 16 digits, valid expiry, 3 digit CVV
   - UPI: valid format (name@bank)

7. Show total prominently with Pay button
```

---

### Prompt 5.8 - Payment Success Page

```
Update PaymentSuccess.jsx

Requirements:

1. Get bookingReference from:
   - URL params, or
   - Location state

2. Fetch booking details:
   - Call getBookingByReference API

3. Display:
   - Success animation/icon
   - "Booking Confirmed!" message
   - Booking Reference (large, prominent)
   - Flight details summary
   - Passenger names
   - Total paid

4. Action buttons:
   - "View Ticket" → /ticket-summary/:bookingRef
   - "Download E-Ticket" (PDF generation - optional)
   - "Book Another Flight" → /
   - "View My Bookings" → /my-bookings (create this page)

5. Send confirmation (mock):
   - Show message: "Confirmation sent to email@example.com"
```

---

## PHASE 6: TICKET & BOOKING MANAGEMENT

### Prompt 6.1 - Ticket Summary Page

```
Update TicketSummary.jsx to display e-ticket.

Requirements:

1. Get bookingReference from URL params

2. Fetch booking:
   - Call getBookingByReference API
   - Handle loading and error

3. E-Ticket display:
   - BlueWing logo header
   - Booking Reference (large)
   - QR Code (use a library like qrcode.react)
   
   Flight Section:
   - Flight number
   - Route: City → City
   - Date and times
   - Terminal info
   
   Passenger Section (for each):
   - Name
   - Seat number
   - Fare class
   - Baggage allowance
   
   Booking Info:
   - Booked on date
   - Status
   - Total paid

4. Actions:
   - Print button (window.print())
   - Download PDF (optional - use html2pdf or similar)
   - Share (copy booking reference)

5. Style like a real airline ticket
```

---

### Prompt 6.2 - My Bookings Page (New)

```
Create new page: MyBookings.jsx

File: pages/MyBookings.jsx

Requirements:

1. Requires authentication
   - If not logged in, redirect to /login

2. Fetch user's bookings:
   - Call getMyBookings API
   - Handle loading, error, empty states

3. Display bookings in cards/table:
   - Booking Reference
   - Flight: DEL → BOM
   - Date
   - Passengers count
   - Status (Confirmed/Cancelled/Completed)
   - Amount paid

4. For each booking, actions:
   - View Details → /ticket-summary/:ref
   - Cancel (if eligible) → show confirmation modal

5. Filters:
   - All / Upcoming / Past / Cancelled

6. Empty state:
   - "No bookings yet"
   - "Book your first flight" button

Add route in AppRoutes.jsx:
- /my-bookings → MyBookings (protected)
```

---

### Prompt 6.3 - Payment History Page

```
Update PaymentHistory.jsx to use API.

Requirements:

1. Requires authentication

2. Fetch payment history:
   - Call getPaymentHistory API

3. Display in table:
   - Date
   - Transaction ID
   - Booking Reference
   - Amount
   - Method (Card/UPI/NetBanking)
   - Status (Success/Failed/Refunded)

4. For each row:
   - Click to expand details
   - View booking link

5. Filters:
   - All / Success / Failed / Refunded
   - Date range picker

6. Summary stats at top:
   - Total spent
   - Number of transactions
```

---

## PHASE 7: ADMIN DASHBOARD

### Prompt 7.1 - Admin Middleware

```
Create admin authorization middleware.

File: middleware/adminAuth.js

Functions:

1. isAdmin
   - Check if req.user exists (from protect middleware)
   - Check if user.role === 'admin'
   - If not admin, return 403 Forbidden
   - If admin, call next()

2. hasPermission(permission)
   - Returns middleware function
   - Check if admin has specific permission
   - Permissions: 'manage_flights', 'manage_users', 'manage_bookings', 'view_reports'

Usage:
router.get('/admin/users', protect, isAdmin, getUsers)
router.post('/admin/flights', protect, isAdmin, hasPermission('manage_flights'), addFlight)

Export: isAdmin, hasPermission
```

---

### Prompt 7.2 - Admin Controller

```
Create Admin Controller.

File: controllers/adminController.js

Functions:

1. getDashboardStats
   - Total users count
   - Total bookings count
   - Total revenue (sum of all successful payments)
   - Total flights count
   - Bookings today
   - Revenue today
   - Return all stats

2. getAllUsers
   - Pagination: page, limit
   - Search by name or email
   - Filter by status (active/suspended)
   - Return users (exclude passwords)

3. getUserById
   - Get single user details
   - Include booking history

4. updateUserStatus
   - Param: userId
   - Body: { status: 'active' | 'suspended' }
   - Update user status

5. getAllBookings
   - Pagination: page, limit
   - Filters: status, date range, flight
   - Sort by date
   - Populate user and flight

6. getAllFlights
   - Pagination: page, limit
   - Filters: status, date range, route
   - Include booking count for each

7. addFlight
   - Body: all flight fields
   - Validate required fields
   - Create new flight

8. updateFlight
   - Param: flightId
   - Body: fields to update
   - Cannot update if flight has bookings (for critical fields)

9. deleteFlight
   - Param: flightId
   - Soft delete (set status to 'cancelled')
   - Cannot delete if has confirmed bookings

10. getRevenueReport
    - Query: startDate, endDate
    - Group by day/week/month
    - Return revenue data for charts

Export all functions.
```

---

### Prompt 7.3 - Admin Routes

```
Create Admin Routes.

File: routes/adminRoutes.js

All routes require: protect, isAdmin

Dashboard:
- GET /stats - getDashboardStats

Users:
- GET /users - getAllUsers
- GET /users/:id - getUserById
- PUT /users/:id/status - updateUserStatus

Bookings:
- GET /bookings - getAllBookings

Flights:
- GET /flights - getAllFlights
- POST /flights - addFlight
- PUT /flights/:id - updateFlight
- DELETE /flights/:id - deleteFlight

Reports:
- GET /reports/revenue - getRevenueReport

Update server.js:
- Import adminRoutes
- Add: app.use('/api/admin', adminRoutes)
```

---

### Prompt 7.4 - Frontend Admin API

```
Update utils/api.js with admin functions.

Add adminAPI:

1. getDashboardStats()
2. getAllUsers(page, limit, search, status)
3. getUserById(id)
4. updateUserStatus(id, status)
5. getAllBookings(page, limit, filters)
6. getAllFlights(page, limit, filters)
7. addFlight(flightData)
8. updateFlight(id, data)
9. deleteFlight(id)
10. getRevenueReport(startDate, endDate)

Export adminAPI.
```

---

### Prompt 7.5 - Admin Dashboard Integration

```
Update AdminDashboard.jsx to use API.

Requirements:

1. Check admin access:
   - Get user from AuthContext
   - If not admin, redirect to /

2. Fetch dashboard stats on mount:
   - Call getDashboardStats API

3. Stats cards:
   - Total Users (with trend)
   - Total Bookings
   - Total Revenue (₹)
   - Active Flights

4. Recent Bookings table:
   - Last 10 bookings
   - Columns: Reference, User, Flight, Date, Amount, Status

5. Quick actions:
   - Add New Flight → /admin/flights/add
   - View All Users → /admin/users
   - View All Bookings → /admin/bookings
   - View Reports → /admin/reports

6. Navigation sidebar:
   - Dashboard
   - Flights
   - Bookings
   - Users
   - Reports
   - Settings
```

---

### Prompt 7.6 - Admin Flight Management

```
Update AddFlight.jsx for admin.

Requirements:

1. Form fields:
   - Flight Number (auto-suggest: BW + 3 digits)
   - Aircraft type (dropdown)
   - Departure: City, Airport, Code, Terminal, Time
   - Arrival: City, Airport, Code, Terminal, Time
   - Date
   - Duration (auto-calculate if possible)
   - Prices: Economy, Business, First Class
   - Seats: Economy, Business, First Class
   - Status
   - Amenities (multi-select)
   - Baggage allowance

2. Validation:
   - All required fields
   - Flight number unique
   - Departure time before arrival
   - Positive prices and seats

3. On submit:
   - Call addFlight API
   - Show success message
   - Redirect to flight list

4. Edit mode:
   - If flightId in URL, fetch flight
   - Pre-fill form
   - Submit calls updateFlight API

5. Create admin pages:
   - /admin/flights - List all flights
   - /admin/flights/add - Add flight form
   - /admin/flights/:id/edit - Edit flight
```

---

## PHASE 8: NAVBAR & AUTHENTICATION STATE

### Prompt 8.1 - Navbar Update

```
Update Navbar.jsx for authentication state.

Requirements:

1. Import useContext, AuthContext

2. Get from context:
   - user
   - isAuthenticated (or check if user exists)
   - logout function

3. Conditional rendering:

   When NOT logged in:
   - Home
   - Flights
   - Help
   - Login (button style)
   - Register (outline button)

   When logged in (customer):
   - Home
   - Flights
   - My Bookings
   - Help
   - User dropdown:
     - Profile icon + user.firstName
     - Dropdown menu:
       - My Profile → /profile
       - My Bookings → /my-bookings
       - Payment History → /payment-history
       - Logout

   When logged in (admin):
   - All customer items
   - + Admin Dashboard link

4. Logout handler:
   - Call logout() from context
   - Navigate to /
   - Show toast: "Logged out successfully"

5. Mobile responsive:
   - Hamburger menu
   - Same items in mobile drawer

6. Active link highlighting
```

---

### Prompt 8.2 - Profile Page (New)

```
Create Profile page.

File: pages/Profile.jsx

Requirements:

1. Requires authentication

2. Fetch profile on mount:
   - Call authAPI.getProfile()

3. Display user info:
   - Avatar (initials or placeholder)
   - Name
   - Email
   - Phone
   - Member since date
   - Role badge (Customer/Admin)

4. Edit profile form:
   - First Name
   - Last Name
   - Phone
   - (Email not editable)

5. On save:
   - Call authAPI.updateProfile()
   - Update context
   - Show success message

6. Change password section:
   - Current password
   - New password
   - Confirm new password
   - Submit → API (create if not exists)

7. Account actions:
   - Delete account (with confirmation)

Add route: /profile → Profile (protected)
```

---

## PHASE 9: ADDITIONAL PAGES

### Prompt 9.1 - Forgot Password Flow

```
Backend additions:

1. Add to User model:
   - resetPasswordToken: String
   - resetPasswordExpire: Date

2. Add to authController:
   
   forgotPassword:
   - Find user by email
   - Generate reset token (crypto.randomBytes)
   - Hash and save to user
   - Set expiry (10 minutes)
   - Return success (in real app, send email)
   
   resetPassword:
   - Get token from params
   - Find user with valid token (not expired)
   - Hash new password
   - Clear reset token
   - Return success

3. Add routes:
   - POST /api/auth/forgot-password
   - POST /api/auth/reset-password/:token

Frontend (ForgotPassword.jsx):

1. Email form:
   - Enter email
   - Submit → forgotPassword API
   - Show: "Reset link sent to email"

2. For demo, show the token in console

3. Reset form (if token in URL):
   - New password
   - Confirm password
   - Submit → resetPassword API
   - On success → redirect to /login
```

---

### Prompt 9.2 - Help Page

```
Update Help.jsx

Requirements:

1. FAQ Section (accordion):
   - How do I book a flight?
   - How can I cancel my booking?
   - What is the baggage allowance?
   - How do I check-in online?
   - What payment methods are accepted?
   - How do I contact customer support?

2. Contact Section:
   - Email: support@bluewing.com
   - Phone: 1800-XXX-XXXX
   - Hours: 24/7

3. Contact Form (optional backend):
   - Name
   - Email
   - Subject
   - Message
   - Submit → store in database or just show success

4. Quick Links:
   - Terms & Conditions
   - Privacy Policy
   - Refund Policy

This is mostly static, minimal backend needed.
```

---

## PHASE 10: FINAL POLISH & TESTING

### Prompt 10.1 - Protected Routes Setup

```
Update AppRoutes.jsx with proper route protection.

Create ProtectedRoute component:
- Check if user is authenticated
- If not, redirect to /login with return URL
- If yes, render children

Create AdminRoute component:
- Check if user is admin
- If not, redirect to /
- If yes, render children

Apply to routes:
Public routes:
- / (Home)
- /flights
- /login
- /registration
- /forgot-password
- /help

Protected routes (require login):
- /passenger-details
- /seat-selection
- /payment
- /payment-success
- /ticket-summary/:ref
- /my-bookings
- /payment-history
- /profile

Admin routes (require admin role):
- /admin-dashboard
- /admin/flights
- /admin/flights/add
- /admin/flights/:id/edit
- /admin/users
- /admin/bookings
- /admin/reports
```

---

### Prompt 10.2 - Error Handling & Loading States

```
Add consistent error handling across the app.

1. Create ErrorBoundary component:
   - Catch React errors
   - Show friendly error page
   - Option to retry

2. Create Loading component:
   - Spinner with optional message
   - Full page or inline variants

3. Create Toast/Notification system:
   - Success, Error, Warning, Info variants
   - Auto-dismiss after 5 seconds
   - Use for all API responses

4. Update all pages:
   - Add try-catch around API calls
   - Show loading while fetching
   - Show error messages on failure
   - Show success toasts on actions

5. API interceptor updates:
   - Global error handling
   - Show toast for network errors
   - Handle token expiry gracefully
```

---

### Prompt 10.3 - Final Testing Checklist

```
Test all user flows:

1. Registration Flow:
   - [ ] Register new user
   - [ ] Validation errors shown
   - [ ] Redirect to login
   - [ ] User in database

2. Login Flow:
   - [ ] Login with valid credentials
   - [ ] Invalid credentials error
   - [ ] Token stored in localStorage
   - [ ] Redirect to home/dashboard

3. Flight Search Flow:
   - [ ] Home page loads featured flights
   - [ ] Search form works
   - [ ] Results page shows flights
   - [ ] Filters work
   - [ ] Sorting works

4. Booking Flow:
   - [ ] Select flight
   - [ ] Select fare type
   - [ ] Enter passenger details
   - [ ] Select seats
   - [ ] Make payment
   - [ ] See confirmation
   - [ ] View ticket
   - [ ] Booking in database

5. My Bookings:
   - [ ] View all bookings
   - [ ] Cancel booking
   - [ ] View ticket

6. Admin Flow:
   - [ ] Login as admin
   - [ ] View dashboard stats
   - [ ] Add new flight
   - [ ] Edit flight
   - [ ] View all bookings
   - [ ] View all users

7. Profile:
   - [ ] View profile
   - [ ] Update profile
   - [ ] Change password
   - [ ] Logout

Create test users:
- Admin: admin@bluewing.com / Admin@123
- Customer: test@example.com / Test@123
```

---

## Summary - All Phases

| Phase | Description | Prompts |
|-------|-------------|---------|
| 0 | Authentication (DONE) | - |
| 1 | Home Page & Flight Search | 1.1 - 1.7 |
| 2 | Flight Selection | 2.1 - 2.2 |
| 3 | Passenger Details | 3.1 |
| 4 | Seat Selection | 4.1 - 4.3 |
| 5 | Booking & Payment | 5.1 - 5.8 |
| 6 | Ticket & Bookings | 6.1 - 6.3 |
| 7 | Admin Dashboard | 7.1 - 7.6 |
| 8 | Navbar & Auth State | 8.1 - 8.2 |
| 9 | Additional Pages | 9.1 - 9.2 |
| 10 | Final Polish | 10.1 - 10.3 |

**Total: 28 Prompts**

---

## How to Use These Prompts

1. Copy one prompt at a time
2. Paste to the AI assistant
3. Wait for implementation
4. Test the changes
5. Move to next prompt

Start with: **Prompt 1.1 - Flight Model**
