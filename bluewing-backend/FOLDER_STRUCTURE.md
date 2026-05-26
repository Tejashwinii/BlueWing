# BlueWing Backend - Folder Structure

```
bluewing-backend/
│
├── config/                          # Configuration files
│   ├── database.js                  # MongoDB connection
│   └── environment.js               # Environment variables
│
├── models/                          # Database schemas
│   ├── User.js                      # User model
│   ├── Admin.js                     # Admin model
│   ├── Flight.js                    # Flight model
│   ├── Booking.js                   # Booking model
│   ├── Payment.js                   # Payment model
│   ├── Seat.js                      # Seat model (optional)
│   └── AuditLog.js                  # Audit logging model
│
├── controllers/                     # Business logic
│   ├── authController.js            # Auth logic (register, login, profile)
│   ├── flightController.js          # Flight logic (search, list, details)
│   ├── bookingController.js         # Booking logic (create, cancel, view)
│   ├── paymentController.js         # Payment logic (create order, verify)
│   ├── user/
│   │   └── userController.js        # User management (profile, update)
│   └── admin/
│       ├── flightAdminController.js # Admin flight management
│       ├── bookingAdminController.js# Admin booking management
│       ├── userAdminController.js   # Admin user management
│       └── reportController.js      # Reports and analytics
│
├── routes/                          # API endpoints
│   ├── authRoutes.js                # /api/auth/*
│   ├── flightRoutes.js              # /api/flights/*
│   ├── bookingRoutes.js             # /api/bookings/*
│   ├── paymentRoutes.js             # /api/payments/*
│   ├── user/
│   │   └── userRoutes.js            # /api/users/*
│   └── admin/
│       ├── flightRoutes.js          # /api/admin/flights/*
│       ├── bookingRoutes.js         # /api/admin/bookings/*
│       ├── userRoutes.js            # /api/admin/users/*
│       └── reportRoutes.js          # /api/admin/reports/*
│
├── middleware/                      # Express middleware
│   ├── auth.js                      # JWT verification, token generation
│   ├── adminPermission.js           # Admin role/permission checking
│   ├── validation.js                # Input validation schemas (Joi)
│   ├── errorHandler.js              # Global error handling
│   ├── logger.js                    # Request logging
│   └── cors.js                      # CORS configuration
│
├── utils/                           # Utility functions
│   ├── validators.js                # Data validation helpers
│   ├── formatters.js                # Response formatting
│   ├── constants.js                 # App constants, enums
│   ├── helpers.js                   # General helper functions
│   ├── email/
│   │   ├── emailService.js          # Email sending logic
│   │   └── templates/
│   │       ├── bookingConfirmation.html
│   │       ├── paymentReceipt.html
│   │       └── adminNotification.html
│   └── payment/
│       ├── razorpayService.js       # Razorpay integration
│       └── paymentHelper.js         # Payment processing logic
│
├── seeders/                         # Database seeders
│   ├── seedFlights.js               # Seed sample flights
│   ├── seedAdmins.js                # Seed admin users
│   └── seedUsers.js                 # Seed test users (optional)
│
├── logs/                            # Log files (git ignored)
│   ├── error.log
│   ├── access.log
│   └── debug.log
│
├── .env                             # Environment variables (git ignored)
├── .env.example                     # Environment template
├── .gitignore                       # Git ignore rules
├── package.json                     # Dependencies and scripts
├── server.js                        # Main server entry point
└── README.md                        # Backend documentation
```

---

## Folder Purposes

### `config/`
- Database connection setup
- Environment configuration
- Any other global configuration

### `models/`
- Mongoose schemas
- Database validation rules
- Model methods and hooks

### `controllers/`
- Business logic for each feature
- Request handling
- Database queries
- Response formatting

### `routes/`
- API endpoint definitions
- Route grouping by feature
- Middleware application per route

### `middleware/`
- JWT authentication
- Admin permission checking
- Input validation
- Error handling
- Request logging

### `utils/`
- Reusable helper functions
- Email service
- Payment processing (Razorpay)
- Data formatting
- Constants and enums

### `seeders/`
- Initial data population
- Test data generation
- Development helpers

### `logs/`
- Application logs
- Error logs
- Access logs

---

## API Routes Structure

```
POST   /api/auth/register          # User registration
POST   /api/auth/login             # User login
GET    /api/auth/profile           # Get user profile (protected)

GET    /api/flights                # Get all flights
GET    /api/flights/search         # Search flights
GET    /api/flights/:id            # Get flight details

POST   /api/bookings               # Create booking (protected)
GET    /api/bookings/my-bookings   # Get user bookings (protected)
GET    /api/bookings/:id           # Get booking details (protected)
PUT    /api/bookings/:id/cancel    # Cancel booking (protected)

POST   /api/payments/create-order  # Create payment order (protected)
POST   /api/payments/verify        # Verify payment (protected)
GET    /api/payments/history       # Payment history (protected)

ADMIN ROUTES (all protected + admin permission required):
POST   /api/admin/flights          # Add flight
GET    /api/admin/flights          # Get all flights
PUT    /api/admin/flights/:id      # Update flight
DELETE /api/admin/flights/:id      # Delete flight

GET    /api/admin/bookings         # Get all bookings
GET    /api/admin/bookings/:id     # Booking details
DELETE /api/admin/bookings/:id     # Cancel booking by admin

GET    /api/admin/users            # Get all users
GET    /api/admin/users/:id        # User details
PUT    /api/admin/users/:id/suspend    # Suspend user
PUT    /api/admin/users/:id/reactivate # Reactivate user

GET    /api/admin/reports/revenue  # Revenue report
GET    /api/admin/reports/bookings # Booking report
GET    /api/admin/reports/occupancy # Flight occupancy
GET    /api/admin/reports/activity # Admin activity log
```

---

## Dependencies to Install

```bash
npm install express cors dotenv mongoose bcryptjs jsonwebtoken joi express-async-errors
npm install razorpay nodemailer
npm install --save-dev nodemon
```

---

## Next Steps

1. Initialize npm: `npm init -y`
2. Create `.env` file from `.env.example`
3. Create `server.js` entry point
4. Create `config/database.js`
5. Create models one by one
6. Create controllers
7. Create routes
8. Test with Postman

---

## File Creation Order (Recommended)

**Phase 1 (Setup):**
- server.js
- config/database.js
- .env file

**Phase 2 (Auth):**
- models/User.js
- models/Admin.js
- middleware/auth.js
- middleware/validation.js
- controllers/authController.js
- routes/authRoutes.js

**Phase 3 (Flights & Bookings):**
- models/Flight.js
- models/Booking.js
- controllers/flightController.js
- controllers/bookingController.js
- routes/flightRoutes.js
- routes/bookingRoutes.js
- seeders/seedFlights.js

**Phase 4 (Payments):**
- models/Payment.js
- controllers/paymentController.js
- routes/paymentRoutes.js

**Phase 5 (Admin):**
- models/AuditLog.js
- controllers/admin/*
- routes/admin/*
- seeders/seedAdmins.js
