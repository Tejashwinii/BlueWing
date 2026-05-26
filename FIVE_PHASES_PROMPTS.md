# BlueWing Project - AI Prompts for Each Phase (20% Each)

Use these prompts with GitHub Copilot or Claude to generate code for each phase.

---

# PHASE 1: 0% → 20% (Backend Infrastructure)

## Prompt 1: Create Express Server Structure
```
Create an Express.js server file for an airline booking application with the following:
- Import express, cors, dotenv
- Initialize Express app
- Setup CORS middleware
- Setup JSON parser middleware
- Create a health check endpoint GET /api/health that returns { status: "success", message: "Server running" }
- Setup error handling middleware
- Export app and start server on PORT 5000 from .env
- Add console.log messages for debugging
- Use ES6 module syntax (import/export)
```

## Prompt 2: Create MongoDB Connection File
```
Create a database configuration file for MongoDB with:
- Import mongoose
- Create async function connectDB() that:
  - Connects to MongoDB using process.env.MONGODB_URI
  - Handles successful connection with console.log "✅ MongoDB Connected"
  - Handles connection errors with try-catch and console.error
  - Returns the mongoose connection
- Add helpful comments about getting MongoDB URI from MongoDB Atlas
- Export connectDB function
- Use ES6 module syntax
```

## Prompt 3: Create .env File Template
```
Create a .env file template for backend configuration with:
- PORT=5000
- MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bluewing?retryWrites=true&w=majority
- NODE_ENV=development
- JWT_SECRET=your_jwt_secret_key_here
- RAZORPAY_KEY_ID=your_razorpay_key_id
- RAZORPAY_KEY_SECRET=your_razorpay_secret_key
- Add comments explaining what each variable is for
```

## Prompt 4: Create package.json Scripts
```
Update package.json with the following:
- Add "type": "module" for ES6 modules
- Add scripts:
  - "dev": "nodemon server.js" (for development)
  - "start": "node server.js" (for production)
- Keep all dependencies from npm install
- Add nodemon as dev dependency
- Ensure version is 1.0.0 and description is "BlueWing Airlines Backend API"
```

## Prompt 5: Create .gitignore
```
Create a .gitignore file for Node.js project with:
- node_modules/
- .env
- .env.local
- .env.*.local
- *.log
- npm-debug.log*
- .DS_Store
- dist/
- build/
```

---

# PHASE 2: 20% → 40% (User Authentication)

## Prompt 6: Create User Model
```
Create a Mongoose User model for airline booking app with:
- firstName: String (required)
- lastName: String (required)
- email: String (required, unique, lowercase)
- password: String (required, minimum 6 characters)
- phone: String (required)
- role: String (enum: ['customer', 'admin'], default: 'customer')
- isEmailVerified: Boolean (default: false)
- createdAt: Date (default: Date.now)

Add pre-save hook that:
- Hashes password with bcryptjs if modified
- Uses salt rounds: 10
- Doesn't hash if password not modified

Add instance methods:
- comparePassword(enteredPassword): compares entered password with hashed password using bcryptjs
- Returns boolean

Setup indexes on email for faster queries

Export default the User model
Use ES6 module syntax
```

## Prompt 7: Create JWT Auth Middleware
```
Create middleware for JWT authentication with:
- Import jsonwebtoken, dotenv
- Create protect middleware function that:
  - Extracts token from Authorization header (format: "Bearer token")
  - Verifies token using JWT_SECRET from .env
  - If no token: return 401 { message: "Not authorized" }
  - If invalid token: return 401 { message: "Token invalid or expired" }
  - On success: sets req.userId to decoded token userId
  - Calls next()
  - Uses try-catch for error handling

- Create generateToken function that:
  - Takes userId as parameter
  - Returns JWT token signed with JWT_SECRET
  - Sets expiration to 7 days
  - Uses HS256 algorithm

Export both functions as ES6 modules
```

## Prompt 8: Create Input Validation Middleware
```
Create validation schemas using Joi for:

1. Register validation:
   - firstName: string required min 2 max 50
   - lastName: string required min 2 max 50
   - email: string required email
   - password: string required min 6 strong (must have uppercase, lowercase, number)
   - phone: string required pattern for phone numbers

2. Login validation:
   - email: string required email
   - password: string required

3. Create middleware function validateRequest that:
   - Takes Joi schema as parameter
   - Returns middleware that validates req.body against schema
   - Returns 400 error if validation fails with error message
   - Calls next() if validation passes

Export all validations as ES6 modules
```

## Prompt 9: Create Auth Controller
```
Create authentication controller with functions:

register(req, res):
- Extract firstName, lastName, email, password, phone from req.body
- Check if user already exists by email
- If exists: return 400 { message: "Email already registered" }
- Create new User with encrypted password
- Generate JWT token
- Return 201 with user data and token
- Don't return password in response
- Use try-catch

login(req, res):
- Extract email, password from req.body
- Find user by email
- If not found: return 401 { message: "Invalid credentials" }
- Compare passwords using User.comparePassword()
- If wrong: return 401 { message: "Invalid credentials" }
- Generate JWT token
- Return 200 with user data and token
- Use try-catch

getProfile(req, res):
- Use req.userId from JWT middleware
- Find user by ID
- Return 200 with user data without password
- Use try-catch

Export all as ES6 modules
```

## Prompt 10: Create Auth Routes
```
Create Express routes for authentication endpoints:

POST /api/auth/register:
- Use validateRequest with register schema
- Call register controller function
- Return response

POST /api/auth/login:
- Use validateRequest with login schema
- Call login controller function
- Return response

GET /api/auth/profile:
- Use protect middleware (JWT verification)
- Call getProfile controller function
- Return response

Setup proper error handling for all routes

Export router as ES6 module
```

## Prompt 11: Create Admin Model
```
Create a Mongoose Admin model (separate from User) with:
- userId: ObjectId (reference to User model who created this admin)
- firstName: String (required)
- lastName: String (required)
- email: String (required, unique, lowercase)
- phone: String (required)
- adminRole: String (enum: ['flight_manager', 'payment_manager', 'support_admin', 'super_admin'])
- permissions: Array of strings (manage_flights, manage_bookings, manage_users, view_reports)
- status: String (enum: ['active', 'inactive', 'suspended'], default: 'active')
- department: String (e.g., "Flight Operations", "Finance", "Customer Support")
- createdBy: ObjectId (reference to User who created this admin)
- lastLogin: Date
- loginAttempts: Number (default: 0)
- isLocked: Boolean (default: false)
- lockedUntil: Date
- activityLog: Array of objects tracking admin actions
- createdAt: Date (default: Date.now)
- updatedAt: Date (default: Date.now)

Add methods:
- hasPermission(permission): checks if admin has specific permission
- lockAccount(): locks account after failed login attempts
- unlockAccount(): unlocks account
- recordActivity(action, details): logs admin actions

Add indexes on email, adminRole, userId

Export default the Admin model
Use ES6 module syntax
```

## Prompt 12: Update Server.js with Auth Routes
```
Update server.js to:
- Import authRoutes from routes/authRoutes.js
- Import connectDB from config/database.js
- Add app.use('/api/auth', authRoutes) before error handling
- Call connectDB() on server startup
- Add startup console.log message
- Ensure all middleware is in correct order:
  1. CORS
  2. JSON parser
  3. Routes
  4. Error handler
```

---

# PHASE 3: 40% → 60% (Flights & Bookings)

## Prompt 13: Create Flight Model
```
Create Mongoose Flight model with:

Basic info:
- flightNumber: String (required, unique) e.g., "BW001"
- airlineName: String (required) default: "BlueWing Airlines"

Route info:
- departureCity: String (required)
- arrivalCity: String (required)
- departureTime: String (required) format: "HH:MM"
- arrivalTime: String (required) format: "HH:MM"
- flightDuration: String computed from departure/arrival times

Pricing tiers:
- economyPrice: Number (required)
- businessPrice: Number (required)
- firstClassPrice: Number (required)

Availability:
- economyAvailable: Number (required)
- businessAvailable: Number (required)
- firstClassAvailable: Number (required)

Metadata:
- aircraft: String (e.g., "Boeing 737")
- createdAt: Date (default: Date.now)

Add text index on departureCity and arrivalCity for search
Add compound index on departureCity, arrivalCity, departureTime

Export default the Flight model
Use ES6 module syntax
```

## Prompt 14: Create Booking Model
```
Create Mongoose Booking model with:

Reference fields:
- userId: ObjectId (required, reference to User model)
- flightId: ObjectId (required, reference to Flight model)

Passenger details:
- passengers: Array of objects, each containing:
  - firstName: String
  - lastName: String
  - gender: String (Male/Female/Other)
  - dateOfBirth: String
  - cabinClass: String (Economy/Business/FirstClass)
  - seatNumber: String
  - passportNumber: String

Booking info:
- bookingReference: String (unique, auto-generated like "BW-20260525-001")
- totalFare: Number
- paymentStatus: String (enum: ['Pending', 'Completed', 'Failed'], default: 'Pending')
- bookingStatus: String (enum: ['Active', 'Cancelled'], default: 'Active')
- createdAt: Date (default: Date.now)

Add indexes on userId, flightId, bookingReference

Export default the Booking model
Use ES6 module syntax
```

## Prompt 15: Create Flight Controller
```
Create flight controller with functions:

getAllFlights(req, res):
- Find all flights from database
- Return 200 with array of flights
- Add pagination (skip, limit)
- Use try-catch

searchFlights(req, res):
- Extract query params: from, to, date (format: YYYY-MM-DD)
- If any missing: return 400 with message
- Find flights matching:
  - departureCity matches 'from' (case-insensitive)
  - arrivalCity matches 'to' (case-insensitive)
  - Departure date matches 'date' query (use $regex for date matching)
- Return 200 with matching flights
- Use try-catch

getFlightById(req, res):
- Extract flightId from params
- Find flight by ID
- If not found: return 404
- Return 200 with flight details
- Use try-catch

Export all as ES6 modules
```

## Prompt 16: Create Booking Controller
```
Create booking controller with functions:

createBooking(req, res):
- Use req.userId from JWT middleware
- Extract: flightId, passengers[], totalFare, cabinClass
- Validate flight exists and has availability
- Generate unique bookingReference (format: "BW-YYYYMMDD-001")
- Create new Booking with userId, flightId, passengers
- Update Flight availability (decrease count based on cabin class)
- Return 201 with booking confirmation and booking ID
- Use try-catch

getUserBookings(req, res):
- Use req.userId
- Find all bookings for user (populate flight details)
- Sort by createdAt descending
- Return 200 with array of bookings
- Use try-catch

getBookingById(req, res):
- Extract bookingId from params
- Use req.userId to verify ownership
- Find booking and populate flight details
- If not found or not owner: return 403
- Return 200 with booking details
- Use try-catch

cancelBooking(req, res):
- Extract bookingId from params
- Use req.userId to verify ownership
- Update booking status to 'Cancelled'
- Restore flight availability
- Return 200 with success message
- Use try-catch

Export all as ES6 modules
```

## Prompt 17: Create Flight Routes
```
Create Express routes for flight endpoints:

GET /api/flights:
- No authentication required
- Call getAllFlights controller
- Return response

GET /api/flights/search:
- No authentication required
- Accept query params: from, to, date
- Call searchFlights controller
- Return response

GET /api/flights/:id:
- No authentication required
- Call getFlightById controller
- Return response

Setup proper error handling

Export router as ES6 module
```

## Prompt 18: Create Booking Routes
```
Create Express routes for booking endpoints:

POST /api/bookings:
- Use protect middleware (JWT verification)
- Call createBooking controller
- Return response with 201 status

GET /api/bookings/my-bookings:
- Use protect middleware
- Call getUserBookings controller
- Return response

GET /api/bookings/:id:
- Use protect middleware
- Call getBookingById controller
- Return response

PUT /api/bookings/:id/cancel:
- Use protect middleware
- Call cancelBooking controller
- Return response

Setup proper error handling

Export router as ES6 module
```

## Prompt 19: Create Flight Seeder Script
```
Create a seeder script to populate sample flight data with:

Connect to MongoDB using existing config
Create 8-10 sample flights with:
- Different routes (Delhi-Mumbai, Mumbai-Bangalore, etc.)
- Various departure times throughout the day
- Realistic pricing (economy < business < first class)
- Good seat availability (150+ economy, 40+ business, 8+ first class)

Example structure for each flight:
{
  flightNumber: "BW001",
  departureCity: "Delhi",
  arrivalCity: "Mumbai",
  departureTime: "09:30",
  arrivalTime: "11:45",
  economyPrice: 5000,
  businessPrice: 12000,
  firstClassPrice: 25000,
  economyAvailable: 180,
  businessAvailable: 40,
  firstClassAvailable: 8
}

Include error handling
Use try-catch
Add console.log for progress
Export or make executable

Create command: node seeders/seedFlights.js
```

## Prompt 20: Create Admin Controller - Flight Management
```
Create admin flight controller with functions:

addFlight(req, res):
- Use req.userId from JWT middleware
- Verify user is admin with 'manage_flights' permission
- Extract: flightNumber, departureCity, arrivalCity, departureTime, arrivalTime, prices, availability
- Check if flightNumber already exists (return 400)
- Create new Flight in database
- Log admin activity: "Created flight BW001"
- Return 201 with flight details
- Use try-catch

updateFlight(req, res):
- Use req.userId to verify admin permission
- Extract flightId from params
- Update only: prices, availability, departureTime, arrivalTime (not core route info)
- Log activity: "Updated flight BW001"
- Return 200 with updated flight
- Use try-catch

deleteFlight(req, res):
- Use req.userId to verify admin permission
- Extract flightId from params
- Check if flight has active bookings (return 400 if yes)
- Delete flight from database
- Log activity: "Deleted flight BW001"
- Return 200 with success message
- Use try-catch

getAllFlightsForAdmin(req, res):
- Use req.userId to verify admin
- Return all flights (including inactive ones)
- Add filters: flightNumber, departureCity, status
- Include booking count for each flight
- Return 200
- Use try-catch

Export all as ES6 modules
```

## Prompt 21: Create Admin Controller - Booking Management
```
Create admin booking controller with functions:

getAllBookingsForAdmin(req, res):
- Use req.userId to verify admin
- Return all bookings (all users)
- Add filters: bookingStatus, paymentStatus, dateRange
- Populate user and flight details
- Include summary: totalBookings, completedBookings, cancelledBookings
- Sort by createdAt descending
- Return 200
- Use try-catch

cancelBookingByAdmin(req, res):
- Use req.userId to verify admin
- Extract bookingId from params
- Extract reason from body
- Update booking status to 'Cancelled'
- Send refund request to payment processor
- Log activity: "Cancelled booking ref-123 - Reason: overbooking"
- Notify user via email
- Return 200 with cancellation details
- Use try-catch

getBookingDetails(req, res):
- Use req.userId to verify admin
- Extract bookingId from params
- Return complete booking with user details, flight details, passengers
- Return 200
- Use try-catch

Export all as ES6 modules
```

## Prompt 22: Create Admin Controller - User Management
```
Create admin user controller with functions:

getAllUsers(req, res):
- Use req.userId to verify admin
- Return all users with filters: status, role, dateRange
- Hide passwords
- Include: totalUsers, activeUsers, suspendedUsers
- Sort by createdAt descending
- Return 200
- Use try-catch

suspendUser(req, res):
- Use req.userId to verify admin
- Extract userId from params
- Extract reason from body
- Update user status to 'suspended'
- Log activity: "Suspended user - Reason: fraudulent booking"
- Notify user via email
- Return 200
- Use try-catch

reactivateUser(req, res):
- Use req.userId to verify admin
- Extract userId from params
- Update user status to 'active'
- Log activity: "Reactivated user"
- Notify user via email
- Return 200
- Use try-catch

getUserDetails(req, res):
- Use req.userId to verify admin
- Extract userId from params
- Return user with all bookings, payments, activity history
- Return 200
- Use try-catch

Export all as ES6 modules
```

## Prompt 23: Create Admin Controller - Reports
```
Create admin reports controller with functions:

getRevenueReport(req, res):
- Use req.userId to verify admin
- Extract dateRange from query params
- Calculate: totalRevenue, completedPayments, failedPayments
- Breakdown by paymentMethod, cabinClass
- Return 200 with detailed report
- Use try-catch

getBookingReport(req, res):
- Use req.userId to verify admin
- Extract dateRange from query
- Calculate: totalBookings, cancelledBookings, activeBookings
- Breakdown by route, cabinClass, status
- Return 200
- Use try-catch

getFlightOccupancyReport(req, res):
- Use req.userId to verify admin
- Return occupancy percentage for each flight
- Show empty seats by class
- Return 200
- Use try-catch

getAdminActivityLog(req, res):
- Use req.userId to verify admin
- Return activity log of all admin actions
- Filter by admin, action type, dateRange
- Return 200
- Use try-catch

Export all as ES6 modules
```

## Prompt 24: Update Server.js with Flight & Booking Routes
```
Update server.js to:
- Import flightRoutes from routes/flightRoutes.js
- Import bookingRoutes from routes/bookingRoutes.js
- Add app.use('/api/flights', flightRoutes) after auth routes
- Add app.use('/api/bookings', bookingRoutes) after flight routes
- Maintain existing error handling
- Test server starts without errors
```

---

# PHASE 4: 60% → 80% (Payments & Frontend Integration)

## Prompt 25: Create Payment Model
```
Create Mongoose Payment model with:

Reference fields:
- bookingId: ObjectId (required, reference to Booking)
- userId: ObjectId (required, reference to User)

Payment info:
- amount: Number (required)
- currency: String (default: "INR")
- transactionId: String (unique, from Razorpay)
- razorpayOrderId: String (unique)
- razorpayPaymentId: String

Status tracking:
- paymentStatus: String (enum: ['Pending', 'Completed', 'Failed'], default: 'Pending')
- paymentMethod: String (enum: ['Card', 'UPI', 'NetBanking', 'Wallet'])
- paymentDate: Date
- failureReason: String (optional)

Metadata:
- createdAt: Date (default: Date.now)
- updatedAt: Date (default: Date.now)

Add indexes on bookingId, userId, transactionId, razorpayPaymentId

Export default the Payment model
Use ES6 module syntax
```

## Prompt 26: Create Payment Controller
```
Create payment controller with functions:

createPaymentOrder(req, res):
- Use req.userId from JWT
- Extract: bookingId, amount
- Verify booking exists and belongs to user
- Create Razorpay order using Razorpay API
- Create Payment record in database with status 'Pending'
- Return 201 with:
  {
    orderId: razorpay_order_id,
    amount: amount,
    currency: "INR",
    key: RAZORPAY_KEY_ID
  }
- Use try-catch

verifyPayment(req, res):
- Use req.userId
- Extract: razorpayOrderId, razorpayPaymentId, bookingId, signature
- Verify signature using Razorpay library
- If signature invalid: return 400 { message: "Payment verification failed" }
- If valid:
  - Update Payment record: status = 'Completed', transactionId = razorpayPaymentId
  - Update Booking: paymentStatus = 'Completed'
  - Return 200 with transaction details
- Use try-catch

getPaymentHistory(req, res):
- Use req.userId
- Find all payments for user
- Sort by createdAt descending
- Return 200 with payment history
- Use try-catch

Export all as ES6 modules
```

## Prompt 27: Create Payment Routes
```
Create Express routes for payment endpoints:

POST /api/payments/create-order:
- Use protect middleware
- Call createPaymentOrder controller
- Return response with 201 status

POST /api/payments/verify:
- Use protect middleware
- Call verifyPayment controller
- Return response

GET /api/payments/history:
- Use protect middleware
- Call getPaymentHistory controller
- Return response

Setup proper error handling

Export router as ES6 module
```

## Prompt 28: Create API Client for React
```
Create utils/api.js file in React project with:

Import axios

Create apiClient with:
- baseURL: "http://localhost:5000/api"
- Content-Type: "application/json"

Add request interceptor that:
- Gets authToken from localStorage
- Adds Authorization header if token exists
- Format: "Bearer {token}"

Add response interceptor that:
- Handles 401 errors (redirect to login)
- Handles 500 errors (show error message)

Create API object with methods:

authAPI:
- register(data): POST /auth/register
- login(data): POST /auth/login
- getProfile(): GET /auth/profile

flightAPI:
- getAll(): GET /flights
- search(from, to, date): GET /flights/search?from=&to=&date=
- getById(id): GET /flights/:id

bookingAPI:
- create(data): POST /bookings
- getMyBookings(): GET /bookings/my-bookings
- getById(id): GET /bookings/:id
- cancel(id): PUT /bookings/:id/cancel

paymentAPI:
- createOrder(bookingId, amount): POST /payments/create-order
- verifyPayment(data): POST /payments/verify
- getHistory(): GET /payments/history

Export all as ES6 modules
```

## Prompt 29: Update React Login Component
```
Update BluewingLogin.jsx to:
- Import authAPI from utils/api.js
- Remove dummy login logic
- Add form validation
- On submit:
  - Call authAPI.login(email, password)
  - Store token in localStorage
  - Store user data in Context
  - Redirect to FlightSelection
- Handle error messages
- Add loading state during API call
- Show spinner while loading
```

## Prompt 30: Update React Flight Search Component
```
Update FlightSelection.jsx to:
- Import flightAPI from utils/api.js
- Remove dummy flight data
- On page load:
  - Get user from AuthContext
  - If not logged in: redirect to login
- On search submit:
  - Call flightAPI.search(from, to, date)
  - Display results from API
  - Handle no flights found message
- Add loading spinner
- Handle API errors
- Display real flight data in FlightCard component
```

## Prompt 31: Update React Booking Component
```
Update PassengerDetails.jsx to:
- Keep passenger form logic (unchanged)
- On submit:
  - Call bookingAPI.create({flightId, passengers, totalFare, cabinClass})
  - Store booking ID
  - Redirect to Payment page
- Add loading state
- Handle booking creation errors
```

## Prompt 32: Update React Payment Component
```
Update Payment.jsx to:
- Import paymentAPI from utils/api.js
- Import Razorpay script
- Get booking data from navigation state
- On payment method selection:
  - Call paymentAPI.createOrder(bookingId, amount)
  - Get orderId, key from response
- On payment button click:
  - Initialize Razorpay with options
  - Include handler for success/failure
- On success:
  - Call paymentAPI.verifyPayment({orderId, paymentId, bookingId})
  - Store transaction ID
  - Redirect to TicketSummary
- On failure:
  - Show error message
  - Allow user to retry
```

## Prompt 33: Update React Ticket Summary Component
```
Update TicketSummary.jsx to:
- On page load:
  - Get bookingId from navigation/URL params
  - Call bookingAPI.getById(bookingId) to get real booking data
- Display real data:
  - Passenger names (already mapped correctly)
  - Flight details (flightNumber, route, times)
  - Booking reference
  - Transaction ID
- Add PDF download button:
  - Use html2pdf.js to generate ticket PDF
  - Include QR code (booking reference)
- Add print button
- Add email option to send confirmation
```

## Prompt 34: Create Admin Routes - Flight Management
```
Create Express routes for admin flight management:

POST /api/admin/flights:
- Use protect middleware
- Verify user is admin with 'manage_flights' permission
- Call addFlight controller
- Return 201 with flight details

GET /api/admin/flights:
- Use protect middleware
- Verify admin permission
- Call getAllFlightsForAdmin controller
- Return 200 with all flights

PUT /api/admin/flights/:id:
- Use protect middleware
- Verify admin permission
- Call updateFlight controller
- Return 200

DELETE /api/admin/flights/:id:
- Use protect middleware
- Verify admin permission
- Call deleteFlight controller
- Return 200

Setup proper error handling

Export router as ES6 module
```

## Prompt 35: Create Admin Routes - Booking Management
```
Create Express routes for admin booking management:

GET /api/admin/bookings:
- Use protect middleware
- Verify admin permission
- Call getAllBookingsForAdmin controller
- Return 200 with all bookings

GET /api/admin/bookings/:id:
- Use protect middleware
- Verify admin permission
- Call getBookingDetails controller
- Return 200

DELETE /api/admin/bookings/:id:
- Use protect middleware
- Verify admin permission
- Call cancelBookingByAdmin controller
- Return 200

Setup proper error handling

Export router as ES6 module
```

## Prompt 36: Create Admin Routes - User Management
```
Create Express routes for admin user management:

GET /api/admin/users:
- Use protect middleware
- Verify admin permission
- Call getAllUsers controller
- Return 200

GET /api/admin/users/:id:
- Use protect middleware
- Verify admin permission
- Call getUserDetails controller
- Return 200

PUT /api/admin/users/:id/suspend:
- Use protect middleware
- Verify admin permission
- Call suspendUser controller
- Return 200

PUT /api/admin/users/:id/reactivate:
- Use protect middleware
- Verify admin permission
- Call reactivateUser controller
- Return 200

Setup proper error handling

Export router as ES6 module
```

## Prompt 37: Create Admin Routes - Reports
```
Create Express routes for admin reports:

GET /api/admin/reports/revenue:
- Use protect middleware
- Verify admin permission
- Call getRevenueReport controller
- Return 200

GET /api/admin/reports/bookings:
- Use protect middleware
- Verify admin permission
- Call getBookingReport controller
- Return 200

GET /api/admin/reports/occupancy:
- Use protect middleware
- Verify admin permission
- Call getFlightOccupancyReport controller
- Return 200

GET /api/admin/reports/activity:
- Use protect middleware
- Verify admin permission
- Call getAdminActivityLog controller
- Return 200

Setup proper error handling

Export router as ES6 module
```

## Prompt 38: Update Server.js with Payment Routes & Admin Routes
```
Update server.js to:
- Import paymentRoutes from routes/paymentRoutes.js
- Import adminFlightRoutes from routes/admin/flightRoutes.js
- Import adminBookingRoutes from routes/admin/bookingRoutes.js
- Import adminUserRoutes from routes/admin/userRoutes.js
- Import adminReportRoutes from routes/admin/reportRoutes.js
- Add app.use('/api/payments', paymentRoutes)
- Add app.use('/api/admin/flights', adminFlightRoutes)
- Add app.use('/api/admin/bookings', adminBookingRoutes)
- Add app.use('/api/admin/users', adminUserRoutes)
- Add app.use('/api/admin/reports', adminReportRoutes)
- Ensure Razorpay initialization is setup
- Test all route groups load correctly
```

---

# PHASE 5: 80% → 100% (Testing & Deployment)

## Prompt 39: Create Admin API Client for React
```
Create utils/adminApi.js file in React project (AdminDashboard) with:

Import axios

Create adminApiClient with:
- baseURL: "http://localhost:5000/api/admin"
- Content-Type: "application/json"
- Request interceptor with JWT token from localStorage

Create adminAPI object with methods:

Flights:
- addFlight(data): POST /flights
- updateFlight(id, data): PUT /flights/:id
- deleteFlight(id): DELETE /flights/:id
- getAllFlights(filters): GET /flights?filters

Bookings:
- getAllBookings(filters): GET /bookings?filters
- getBookingById(id): GET /bookings/:id
- cancelBooking(id, reason): DELETE /bookings/:id

Users:
- getAllUsers(filters): GET /users?filters
- getUserById(id): GET /users/:id
- suspendUser(id, reason): PUT /users/:id/suspend
- reactivateUser(id): PUT /users/:id/reactivate

Reports:
- getRevenueReport(dateRange): GET /reports/revenue?dateRange
- getBookingReport(dateRange): GET /reports/bookings?dateRange
- getOccupancyReport(): GET /reports/occupancy
- getActivityLog(filters): GET /reports/activity?filters

Export all as ES6 modules
```

## Prompt 40: Update React AdminDashboard Component
```
Update AdminDashboard.jsx to:
- Import adminAPI from utils/adminApi.js
- Add role-based access control (check if user.role === 'admin')
- Redirect to login if not admin

Implement Dashboard Tabs:

1. Flight Management Tab:
   - Display all flights in table
   - Add "Add Flight" button with form
   - Call adminAPI.addFlight(formData)
   - Show edit/delete buttons for each flight
   - Call adminAPI.updateFlight(id, data) on edit
   - Call adminAPI.deleteFlight(id) on delete
   - Show confirmation dialogs

2. Booking Management Tab:
   - Display all bookings in table
   - Show filters: status, date range, user
   - Call adminAPI.getAllBookings(filters)
   - Click booking to view details
   - Call adminAPI.getBookingById(id)
   - Add "Cancel Booking" button
   - Call adminAPI.cancelBooking(id, reason) with reason input

3. User Management Tab:
   - Display all users in table
   - Show filters: status, role
   - Call adminAPI.getAllUsers(filters)
   - Click user to view details
   - Call adminAPI.getUserById(id)
   - Add suspend/reactivate buttons
   - Call adminAPI.suspendUser(id, reason)
   - Call adminAPI.reactivateUser(id)

4. Reports Tab:
   - Display revenue report chart
   - Call adminAPI.getRevenueReport(dateRange)
   - Display booking statistics
   - Call adminAPI.getBookingReport(dateRange)
   - Display flight occupancy chart
   - Call adminAPI.getOccupancyReport()
   - Display admin activity log
   - Call adminAPI.getActivityLog(filters)

- Add loading spinners
- Handle error messages
- Show success notifications on actions
- Refresh data automatically
```

## Prompt 41: Create Postman Collection Export (Updated)
```
Create a Postman collection JSON file with all API endpoints including admin:

Auth endpoints:
- POST /api/auth/register (with sample body)
- POST /api/auth/login (with sample body)
- GET /api/auth/profile (with auth header)

Flight endpoints:
- GET /api/flights
- GET /api/flights/search?from=Delhi&to=Mumbai&date=2026-05-30
- GET /api/flights/:id

Booking endpoints:
- POST /api/bookings (with auth header)
- GET /api/bookings/my-bookings (with auth header)
- GET /api/bookings/:id (with auth header)
- PUT /api/bookings/:id/cancel (with auth header)

Payment endpoints:
- POST /api/payments/create-order (with auth header)
- POST /api/payments/verify (with auth header)
- GET /api/payments/history (with auth header)

ADMIN endpoints:
- POST /api/admin/flights (add flight)
- GET /api/admin/flights (all flights)
- PUT /api/admin/flights/:id (update flight)
- DELETE /api/admin/flights/:id (delete flight)
- GET /api/admin/bookings (all bookings)
- GET /api/admin/bookings/:id (booking details)
- DELETE /api/admin/bookings/:id (cancel booking)
- GET /api/admin/users (all users)
- GET /api/admin/users/:id (user details)
- PUT /api/admin/users/:id/suspend (suspend user)
- PUT /api/admin/users/:id/reactivate (reactivate user)
- GET /api/admin/reports/revenue (revenue report)
- GET /api/admin/reports/bookings (booking report)
- GET /api/admin/reports/occupancy (occupancy report)
- GET /api/admin/reports/activity (activity log)

Include sample responses for each
Add descriptions and notes
Format as valid JSON
```

## Prompt 42: Create Backend Testing Checklist (Updated)
```
Create test_checklist.md with:

Manual Testing Checklist:

Authentication:
- [ ] Register new user with valid email
- [ ] Try register with existing email (should fail)
- [ ] Login with correct credentials
- [ ] Login with wrong password (should fail)
- [ ] Access /api/auth/profile with valid token
- [ ] Access /api/auth/profile without token (should fail)

Flights:
- [ ] GET /api/flights returns all flights
- [ ] Search with valid parameters returns matching flights
- [ ] Search with invalid parameters returns empty array
- [ ] Invalid flight ID returns 404
- [ ] Valid flight ID returns flight details

Bookings:
- [ ] Create booking with valid data
- [ ] Create booking with invalid flightId (should fail)
- [ ] Get user's bookings returns only their bookings
- [ ] Get other user's booking returns 403
- [ ] Cancel booking updates status

Payments:
- [ ] Create payment order returns orderId and key
- [ ] Verify payment with valid signature
- [ ] Verify payment with invalid signature (should fail)
- [ ] Get payment history returns user's payments

Admin Flights:
- [ ] Add flight by admin returns 201
- [ ] Try add flight by non-admin returns 403
- [ ] Get all flights by admin shows all flights
- [ ] Update flight changes prices/availability
- [ ] Delete inactive flight succeeds
- [ ] Try delete flight with bookings returns 400

Admin Bookings:
- [ ] Get all bookings shows all user bookings
- [ ] Admin can see all bookings with filters
- [ ] Cancel booking by admin returns 200
- [ ] User gets email on cancellation

Admin Users:
- [ ] Get all users shows all users (no passwords)
- [ ] Suspend user changes status
- [ ] Reactivate user restores status
- [ ] Suspended user cannot book

Error Handling:
- [ ] All endpoints return proper error messages
- [ ] No 500 errors on valid requests
- [ ] All validation errors return 400
- [ ] Authentication errors return 401
- [ ] Authorization errors return 403
```

## Prompt 43: Create Frontend Testing Checklist (Updated)
```
Create react_test_checklist.md with:

Manual Testing Checklist:

Registration:
- [ ] Form validates all fields
- [ ] Error message shows for duplicate email
- [ ] Success shows login page redirect
- [ ] Token stored in localStorage

Login:
- [ ] Form validates fields
- [ ] Error message for invalid credentials
- [ ] Successful login redirects to FlightSelection
- [ ] User data stored in Context
- [ ] Admin user redirected to AdminDashboard

Flight Search:
- [ ] Page loads with search form
- [ ] Search returns matching flights
- [ ] No results message when appropriate
- [ ] Can click flight to select

Booking:
- [ ] Passenger form displays
- [ ] Can enter passenger details
- [ ] Submit creates booking
- [ ] Redirects to payment

Payment:
- [ ] Payment page loads
- [ ] Can select payment method
- [ ] Razorpay popup opens
- [ ] Payment success redirects

Ticket Summary:
- [ ] Displays booking confirmation
- [ ] Shows passenger names correctly
- [ ] Shows flight details
- [ ] Can download PDF ticket
- [ ] PDF includes QR code

Mobile:
- [ ] All pages responsive
- [ ] Touch interactions work
- [ ] No horizontal scroll

Performance:
- [ ] No console errors
- [ ] API calls complete in <2s
- [ ] Images load quickly
- [ ] No memory leaks
```

## Prompt 44: Create Admin Dashboard Testing Checklist
```
Create admin_dashboard_test_checklist.md with:

Manual Testing Checklist for Admin Dashboard:

Flight Management:
- [ ] Add new flight with all details
- [ ] Verify flight appears in table
- [ ] Edit flight prices and availability
- [ ] Verify changes reflected
- [ ] Try delete flight with active bookings (should fail)
- [ ] Delete inactive flight (should succeed)
- [ ] Filter flights by route
- [ ] Search flights by number

Booking Management:
- [ ] View all bookings
- [ ] Filter by status (Pending/Completed/Cancelled)
- [ ] Filter by date range
- [ ] Click booking to view full details
- [ ] Cancel booking with reason
- [ ] Verify user gets email notification
- [ ] Verify refund initiated
- [ ] View cancelled booking status

User Management:
- [ ] View all users
- [ ] Filter by status (active/suspended)
- [ ] Click user to view profile
- [ ] Suspend user with reason
- [ ] Verify user cannot book after suspension
- [ ] Reactivate user
- [ ] Verify user can book again
- [ ] View user booking history

Reports:
- [ ] Revenue report shows correct totals
- [ ] Revenue breakdown by payment method works
- [ ] Booking report shows statistics
- [ ] Occupancy report shows seat availability
- [ ] Activity log shows all admin actions
- [ ] Activity log filters work correctly

Access Control:
- [ ] Non-admin user cannot access /admin
- [ ] Admin redirects to dashboard
- [ ] Session expires after 24 hours
- [ ] Login attempt counter works
- [ ] Account locks after 5 failed attempts
- [ ] Locked account shows error message

UI/UX:
- [ ] All tables load quickly
- [ ] Pagination works on large datasets
- [ ] Charts render properly
- [ ] Export buttons work
- [ ] Print functionality works
- [ ] Responsive on different screen sizes
- [ ] Dark mode works (if implemented)
```

## Prompt 45: Create Admin Permission Middleware
```
Create middleware/adminPermission.js for role-based access control with:

Create checkAdminPermission middleware that:
- Takes required permission as parameter
- Extracts token from Authorization header
- Verifies JWT token
- Gets user from req.userId
- Find admin record from userId
- Check if admin status is 'active'
- Check if admin has required permission
- If not admin: return 403 { message: "Admin access required" }
- If suspended: return 403 { message: "Admin account suspended" }
- If missing permission: return 403 { message: "Permission denied" }
- On success: set req.adminId and req.adminRole
- Call next()

Create logAdminAction middleware that:
- Logs all admin actions to activityLog
- Records: admin, action, resource, timestamp, IP address, userAgent
- Saves to Admin model
- Calls next()

Example usage:
router.post('/flights', checkAdminPermission('manage_flights'), logAdminAction, addFlight)

Export both functions as ES6 modules
```

## Prompt 46: Create Seeder for Admin Users
```
Create a seeder script to add initial admin users with:

Connect to MongoDB using existing config

Create 3-4 sample admin users:

1. Super Admin:
{
  userId: createdNewUser,
  firstName: "Admin",
  lastName: "Master",
  email: "admin@bluewing.com",
  phone: "9876543210",
  adminRole: "super_admin",
  permissions: ["manage_flights", "manage_bookings", "manage_users", "view_reports"],
  department: "Management",
  status: "active"
}

2. Flight Manager:
{
  adminRole: "flight_manager",
  permissions: ["manage_flights"],
  department: "Flight Operations"
}

3. Payment Manager:
{
  adminRole: "payment_manager",
  permissions: ["manage_bookings"],
  department: "Finance"
}

4. Support Admin:
{
  adminRole: "support_admin",
  permissions: ["manage_users"],
  department: "Customer Support"
}

Include error handling
Use try-catch
Add console.log for progress

Create command: node seeders/seedAdmins.js
```

## Prompt 47: Create Audit Logging System
```
Create utils/auditLog.js for comprehensive action logging with:

Create recordAuditLog function that:
- Takes: action, resource, resourceId, adminId, details, ipAddress, userAgent
- Creates audit entry with:
  - timestamp (Date.now())
  - action (create, update, delete, suspend, etc.)
  - resource (Flight, User, Booking, Payment)
  - resourceId (ID of affected resource)
  - admin: { adminId, adminEmail, adminName }
  - changes: { before, after } for updates
  - ipAddress: IP address of admin
  - userAgent: Browser info
  - status: 'success' or 'failed'

Create queries:
- getAuditsByAdmin(adminId, dateRange): Get actions by specific admin
- getAuditsByResource(resource, resourceId): Get all changes to resource
- getAuditsByAction(action, dateRange): Get all actions of type
- searchAudits(filters): Advanced search

Integrate with all admin controllers

Export all functions as ES6 modules
```

## Prompt 48: Create Environment Variables for Production
```
Create .env.production file with:
- NODE_ENV=production
- PORT=5000
- MONGODB_URI=mongodb+srv://production-user:password@cluster.mongodb.net/bluewing-prod
- JWT_SECRET=strong_production_jwt_secret_key
- RAZORPAY_KEY_ID=production_key_id
- RAZORPAY_KEY_SECRET=production_secret_key
- FRONTEND_URL=https://bluewing-airlines.vercel.app
- Add comments explaining each variable

Create instructions for:
- How to set environment variables on Render
- How to set environment variables on Railway
- How to update MongoDB Atlas IP whitelist
- How to verify production setup
```

## Prompt 49: Create Deployment Configuration for Render
```
Create Render deployment configuration with:

1. Create render.yaml file:
   - Services section with:
     - name: bluewing-backend
     - runtime: node
     - buildCommand: npm install
     - startCommand: npm start
     - envVars section with:
       - MONGODB_URI
       - JWT_SECRET
       - RAZORPAY_KEY_ID
       - RAZORPAY_KEY_SECRET

2. Create Procfile:
   - web: node server.js

3. Update package.json:
   - Ensure "start" script exists
   - Ensure all dependencies specified

4. Instructions for:
   - Connect GitHub repository to Render
   - Configure environment variables
   - Deploy on push to main branch
   - Monitor build logs
```

## Prompt 50: Create Deployment Configuration for Vercel
```
Create Vercel deployment configuration with:

1. Create vercel.json:
   - buildCommand: npm run build (if needed)
   - outputDirectory: dist
   - Environment variables section:
     - VITE_API_URL=https://bluewing-backend-production.onrender.com/api

2. Update vite.config.js:
   - Configure for production build
   - Set API proxy for development

3. Create .env.production for React:
   - VITE_API_URL=https://your-deployed-backend.onrender.com/api

4. Instructions for:
   - Connect GitHub to Vercel
   - Configure environment variables
   - Deploy on push to main
   - Monitor deployment
```

## Prompt 51: Create Backend README.md
```
Create comprehensive README.md with sections:

Title: BlueWing Airlines Backend API

Quick Start:
```bash
npm install
npm run dev
```

Prerequisites:
- Node.js v18+
- MongoDB Atlas account
- Razorpay account
- npm or yarn

Environment Setup:
- Copy .env.example to .env
- Update with your credentials
- Explain each variable

Installation:
- Clone repository
- npm install command
- npm run dev command

API Endpoints:
- List all endpoints by category
- Show example requests/responses

Project Structure:
- Explain each folder
- What files do

Deployment:
- How to deploy to Render
- How to deploy to Railway
- Environment setup on hosting

Troubleshooting:
- Common errors and solutions
- MongoDB connection issues
- Port already in use

Team Contributions:
- How to contribute
- Code style guidelines
```

## Prompt 52: Create Frontend README.md Update
```
Update BlueWing/README.md with sections:

Title: BlueWing Airlines Frontend

Quick Start:
```bash
npm install
npm run dev
```

Prerequisites:
- Node.js v18+
- npm or yarn

Development:
- npm install
- Create .env.local with VITE_API_URL=http://localhost:5000/api
- npm run dev
- Open http://localhost:5173

Production Build:
- npm run build
- Generates dist/ folder
- Ready for deployment

Deployment to Vercel:
- Connect GitHub
- Set environment variable
- Auto deploy on push

Project Structure:
- Explain components/
- Explain pages/
- Explain utils/

Features:
- List all features
- User flow diagram

API Integration:
- How frontend connects to backend
- API client location
- How to add new API calls

Troubleshooting:
- Common issues
- CORS errors solutions
```

## Prompt 53: Create Team Onboarding Guide
```
Create TEAM_ONBOARDING.md with:

Getting Started as New Team Member:

1. Repository Setup:
   - Clone both repositories (frontend & backend)
   - Create branches with naming: feature/feature-name
   - Pull latest before starting work

2. Local Development Setup:
   - Install Node.js v18+
   - Install dependencies (npm install in both folders)
   - Setup .env files from .env.example
   - Get MongoDB URI and Razorpay keys from tech lead
   - Run backend: npm run dev
   - Run frontend: npm run dev

3. Database Setup:
   - Create MongoDB Atlas account
   - Get connection string
   - Add your IP to whitelist
   - Run seeders: node seeders/seedFlights.js
   - Run admin seeder: node seeders/seedAdmins.js

4. Testing APIs:
   - Import Postman collection
   - Test registration endpoint
   - Test login endpoint
   - Test flight search
   - Test booking creation
   - Test admin endpoints (with admin account)

5. Code Standards:
   - Use ES6 module syntax
   - Use meaningful variable names
   - Add comments for complex logic
   - Use try-catch for error handling

6. Deployment:
   - Production URLs
   - How to check deployment status
   - How to rollback if needed

7. Admin Access:
   - Admin credentials provided separately
   - How to access AdminDashboard
   - Admin permissions explained
   - How to create new admin users

8. Communication:
   - Daily standup time
   - Issue tracking system
   - Code review process
```

## Prompt 54: Create Production Deployment Checklist
```
Create DEPLOYMENT_CHECKLIST.md with:

Pre-Deployment Checks:

Backend:
- [ ] All tests passing
- [ ] No console errors
- [ ] .env.production configured
- [ ] MongoDB Atlas production database ready
- [ ] Razorpay production keys ready
- [ ] Code committed and pushed to main
- [ ] Latest code reviewed
- [ ] Admin seeders executed

Frontend:
- [ ] All tests passing
- [ ] No console errors
- [ ] .env.production with correct API URL
- [ ] Production build successful (npm run build)
- [ ] All pages load without errors
- [ ] API calls use production URL
- [ ] Admin dashboard loads correctly

Deployment Steps:

Backend to Render:
1. Verify code on GitHub main branch
2. Connect repository to Render (if not done)
3. Set environment variables on Render dashboard
4. Click "Deploy" or "Redeployment"
5. Wait for build to complete
6. Test health endpoint at https://your-backend-url/api/health
7. Verify database connection
8. Test admin endpoints

Frontend to Vercel:
1. Verify code on GitHub main branch
2. Connect repository to Vercel (if not done)
3. Set VITE_API_URL environment variable
4. Vercel auto-deploys on push
5. Wait for deployment to complete
6. Test at https://your-frontend-url
7. Run full user flow (register → book → pay)
8. Test admin login and dashboard

Post-Deployment:
- [ ] Both URLs accessible
- [ ] Login works
- [ ] Flight search works
- [ ] Booking creation works
- [ ] Payment processing works
- [ ] Ticket PDF downloads
- [ ] Email confirmations send
- [ ] Database updates correctly
- [ ] No errors in browser console
- [ ] Response times acceptable
- [ ] Admin dashboard functional
- [ ] Admin can add/edit flights
- [ ] Admin can view all bookings
- [ ] Admin can manage users
- [ ] Activity logs recording
- [ ] Team trained on production
```

## Prompt 55: Create Production Monitoring Setup (Updated)
```
Create MONITORING.md with:

Setup Error Monitoring:

Option 1: Sentry (Free tier):
- Create account at sentry.io
- Create project
- Get DSN key
- Add to .env (backend & frontend)
- Errors automatically tracked

Option 2: LogRocket (Free tier):
- Create account
- Add SDK to frontend
- Track user sessions
- Monitor frontend errors

Monitoring Checklist:
- [ ] Error tracking setup
- [ ] Performance monitoring
- [ ] Database connection alerts
- [ ] Uptime monitoring (pingdom.com)
- [ ] API response time tracking
- [ ] Daily error review schedule
- [ ] Weekly performance review
- [ ] Admin activity log review

Daily Monitoring Tasks:
- Check for new errors
- Review API response times
- Check database performance
- Verify payment processing
- Monitor server resources
- Review admin activity logs

Weekly Review:
- Analyze error trends
- Review user feedback
- Performance metrics
- Database usage
- Plan optimizations
- Review admin actions

Alert Setup:
- Email alerts for critical errors
- Slack notifications
- Database connection failures
- Payment processing errors
- High server resource usage
- Admin suspicious activities

Backup Strategy:
- MongoDB automatic backups (enabled)
- Daily backup verification
- Disaster recovery plan
- Data restoration testing
- Audit log backups
```

---

# Quick Reference: Prompt Usage

## How to Use These Prompts:

1. **Copy the prompt** from above
2. **Paste into GitHub Copilot** (in VS Code) or Claude Chat
3. **Provide filename** if creating new file
4. **Ask for modifications** if needed
5. **Copy generated code** to your project
6. **Test** before moving to next phase

## Best Practices:

- Use one prompt at a time
- Wait for code generation to complete
- Review generated code before implementing
- Adjust prompts based on your needs
- Keep prompts specific and detailed
- Test each phase before moving to next

## Example Usage Flow:

```
Day 1:
- Use Prompt 1 (server.js)
- Use Prompt 2 (database.js)
- Use Prompt 3 (.env)
- Test server runs

Day 2:
- Use Prompt 4 (package.json updates)
- Use Prompt 5 (.gitignore)
- Setup Git
- Team testing

Day 3:
- Use Prompt 6 (User Model)
- Use Prompt 7 (Auth Middleware)
- Use Prompt 8 (Validation)

... continue for all 40 prompts
```

## Total Prompts: 55
- Phase 1: 5 prompts (Backend Infrastructure)
- Phase 2: 7 prompts (Authentication + Admin Model)
- Phase 3: 12 prompts (Flights & Bookings + Admin Controllers)
- Phase 4: 14 prompts (Payments & Integration + Admin Routes)
- Phase 5: 17 prompts (Admin Dashboard, Testing & Deployment)

## Estimated Time per Prompt: 5-15 minutes
**Total Implementation Time: 62 hours (as per main guide)**

---

# Phase-by-Phase Prompt Execution Path

## PHASE 1 (Day 1-2):
1. Prompt 1 → server.js
2. Prompt 2 → database.js
3. Prompt 3 → .env file
4. Prompt 4 → package.json updates
5. Prompt 5 → .gitignore

**Test: npm run dev → health check passes**

---

## PHASE 2 (Day 3-5):
6. Prompt 6 → User Model
7. Prompt 7 → Auth Middleware
8. Prompt 8 → Validation Middleware
9. Prompt 9 → Auth Controller
10. Prompt 10 → Auth Routes
11. Prompt 11 → Admin Model
12. Prompt 12 → Server.js update

**Test: Register & Login working in Postman, Admin Model created**

---

## PHASE 3 (Day 6-9):
13. Prompt 13 → Flight Model
14. Prompt 14 → Booking Model
15. Prompt 15 → Flight Controller
16. Prompt 16 → Booking Controller
17. Prompt 17 → Flight Routes
18. Prompt 18 → Booking Routes
19. Prompt 19 → Flight Seeder
20. Prompt 20 → Admin Flight Controller
21. Prompt 21 → Admin Booking Controller
22. Prompt 22 → Admin User Controller
23. Prompt 23 → Admin Reports Controller
24. Prompt 24 → Server.js update

**Test: Flight search, booking creation, and admin controllers working**

---

## PHASE 4 (Day 10-12):
25. Prompt 25 → Payment Model
26. Prompt 26 → Payment Controller
27. Prompt 27 → Payment Routes
28. Prompt 28 → React API Client
29. Prompt 29 → Update Login Component
30. Prompt 30 → Update Flight Search
31. Prompt 31 → Update Booking Form
32. Prompt 32 → Update Payment Component
33. Prompt 33 → Update Ticket Summary
34. Prompt 34 → Admin Flight Routes
35. Prompt 35 → Admin Booking Routes
36. Prompt 36 → Admin User Routes
37. Prompt 37 → Admin Reports Routes
38. Prompt 38 → Server.js update with all routes

**Test: End-to-end flow working, Admin routes responding**

---

## PHASE 5 (Day 13-17):
39. Prompt 39 → Admin API Client for React
40. Prompt 40 → Update AdminDashboard Component
41. Prompt 41 → Postman Collection (with Admin endpoints)
42. Prompt 42 → Backend Testing Checklist (with Admin tests)
43. Prompt 43 → Frontend Testing Checklist (with Admin Dashboard tests)
44. Prompt 44 → Admin Dashboard Testing Checklist
45. Prompt 45 → Admin Permission Middleware
46. Prompt 46 → Seeder for Admin Users
47. Prompt 47 → Audit Logging System
48. Prompt 48 → Production .env setup
49. Prompt 49 → Render Deployment
50. Prompt 50 → Vercel Deployment
51. Prompt 51 → Backend README
52. Prompt 52 → Frontend README
53. Prompt 53 → Team Onboarding (with Admin guide)
54. Prompt 54 → Deployment Checklist (with Admin verification)
55. Prompt 55 → Monitoring Setup (with Admin audit logging)

**Test: Production deployment complete, Admin dashboard fully functional, All audits logged**

---

# Final Summary

**55 Prompts = Complete Project (Including Admin Dashboard)**
- Copy-paste ready
- AI-generated code
- ~85 hours of work (extended from 62 hours for admin features)
- 17 days timeline (extended from 15 days)
- 3-person team (distributed workload)
- 100% complete project with full admin capabilities
- Admin Dashboard fully functional and integrated
- All admin actions logged and audited

**Additional Admin Features:**
- Flight management (add/edit/delete)
- Booking management (view/cancel)
- User management (suspend/reactivate)
- Revenue & occupancy reports
- Admin activity logging
- Permission-based access control
- Admin user seeding
- Audit trail system

**Start with Prompt 1 today!**

