# BlueWing Complete Project - 5 Phases (20% Each)

## Overview: From 0% to 100%

```
Phase 1: 0% → 20%  (Days 1-2)   Backend Infrastructure
Phase 2: 20% → 40% (Days 3-5)   User Authentication
Phase 3: 40% → 60% (Days 6-8)   Flights & Bookings
Phase 4: 60% → 80% (Days 9-11)  Payments & Integration
Phase 5: 80% → 100% (Days 12-15) Testing & Deployment
```

---

# PHASE 1: 0% → 20% (Backend Infrastructure)
**Timeline: Days 1-2 | Time: 10 hours**

## What You're Building:
- Express server running
- MongoDB connected
- Basic folder structure
- Test endpoints working

## Daily Breakdown:

### Day 1 (5-6 hours):
- Create `bluewing-backend` folder
- `npm init -y`
- Install 8 packages
- Create `.env` file
- Create 8 folders
- Create `server.js`
- Create `config/database.js`
- Test with `npm run dev`

### Day 2 (4-5 hours):
- Create `.env.example`
- Create `.gitignore`
- Git setup
- Team member onboarding
- Verify MongoDB connection

## Files to Create:
```
bluewing-backend/
├── server.js
├── config/database.js
├── .env
├── .gitignore
├── package.json (updated)
└── (7 empty folders)
```

## Success Criteria:
✅ Server runs on http://localhost:5000  
✅ `GET /api/health` returns success  
✅ MongoDB connection configured  
✅ All team members can run `npm run dev`  

## Tools Needed:
- Node.js v18+
- Git
- VS Code
- MongoDB Atlas account

## End Result: **20% Complete**
```
Backend Infrastructure ready
Next: Build Authentication
```

---

# PHASE 2: 20% → 40% (User Authentication)
**Timeline: Days 3-5 | Time: 12 hours**

## What You're Building:
- User registration API
- User login API
- JWT token generation
- Password hashing
- Protected routes
- Authentication middleware

## Daily Breakdown:

### Day 3 (4 hours):
**User Model & Middleware**

Files to create:
1. `models/User.js` - Database schema for users
2. `middleware/auth.js` - JWT generation & verification
3. `middleware/validation.js` - Input validation with Joi

### Day 4 (4 hours):
**Authentication Controller**

Files to create:
1. `controllers/authController.js` - Register, login, getProfile functions

Code to write:
```javascript
// Register endpoint
POST /api/auth/register
Body: { firstName, lastName, email, password, phone }
Returns: { token, user }

// Login endpoint
POST /api/auth/login
Body: { email, password }
Returns: { token, user }

// Get profile endpoint (protected)
GET /api/auth/profile
Header: Authorization: Bearer {token}
Returns: { user }
```

### Day 5 (4 hours):
**Auth Routes & Testing**

Files to create:
1. `routes/authRoutes.js` - Register all auth endpoints
2. Update `server.js` to include auth routes

Test with Postman:
```
✅ Register new user
✅ Login with credentials
✅ Get profile with token
✅ Reject invalid token
```

## Files to Create:
```
bluewing-backend/
├── models/User.js (NEW)
├── controllers/authController.js (NEW)
├── routes/authRoutes.js (NEW)
├── middleware/
│   ├── auth.js (NEW)
│   └── validation.js (NEW)
└── server.js (UPDATED)
```

## Success Criteria:
✅ User can register with email/password  
✅ User can login and get JWT token  
✅ Token is required for protected routes  
✅ Password is hashed (not stored as plain text)  
✅ All endpoints tested in Postman  

## Expected API Responses:

**Register Success:**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "firstName": "Raj",
      "lastName": "Kumar",
      "email": "raj@example.com"
    }
  }
}
```

**Login Success:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { ... }
  }
}
```

## End Result: **40% Complete**
```
✅ User Management working
✅ Authentication secured
Next: Build Flight Management
```

---

# PHASE 3: 40% → 60% (Flights & Bookings)
**Timeline: Days 6-8 | Time: 12 hours**

## What You're Building:
- Flight search API
- Flight listing API
- Booking creation API
- Booking retrieval API
- Seat management basics

## Daily Breakdown:

### Day 6 (4 hours):
**Flight Model & Controller**

Files to create:
1. `models/Flight.js` - Flight schema with pricing tiers
2. `controllers/flightController.js` - Search & list functions

Endpoints:
```javascript
// Get all flights
GET /api/flights
Returns: [{ flightId, flightNumber, prices, availability }]

// Search flights
GET /api/flights/search?from=Delhi&to=Mumbai&date=2026-05-30
Returns: [{ matching flights }]

// Get single flight
GET /api/flights/:id
Returns: { flight details }
```

### Day 7 (4 hours):
**Booking Model & Controller**

Files to create:
1. `models/Booking.js` - Booking schema with passenger details
2. `controllers/bookingController.js` - Create & retrieve bookings

Endpoints:
```javascript
// Create booking (protected)
POST /api/bookings
Header: Authorization: Bearer {token}
Body: { flightId, passengers, totalFare, cabinClass }
Returns: { bookingId, booking }

// Get user's bookings (protected)
GET /api/bookings/my-bookings
Header: Authorization: Bearer {token}
Returns: [{ user's bookings }]
```

### Day 8 (4 hours):
**Flight & Booking Routes + Seeding Data**

Files to create:
1. `routes/flightRoutes.js` - Flight endpoints
2. `routes/bookingRoutes.js` - Booking endpoints
3. `seeders/seedFlights.js` - Add sample flight data
4. Update `server.js` to include routes

Test with Postman:
```
✅ Search flights by route & date
✅ Create new booking
✅ Retrieve user's bookings
✅ Verify seat availability updates
```

## Files to Create:
```
bluewing-backend/
├── models/
│   ├── Flight.js (NEW)
│   └── Booking.js (NEW)
├── controllers/
│   ├── flightController.js (NEW)
│   └── bookingController.js (NEW)
├── routes/
│   ├── flightRoutes.js (NEW)
│   └── bookingRoutes.js (NEW)
├── seeders/
│   └── seedFlights.js (NEW)
└── server.js (UPDATED)
```

## Sample Flight Data to Seed:
```javascript
[
  {
    flightNumber: 'BW001',
    airlineName: 'BlueWing Airlines',
    departureCity: 'Delhi',
    arrivalCity: 'Mumbai',
    departureTime: '09:30',
    arrivalTime: '11:45',
    economyPrice: 5000,
    businessPrice: 12000,
    firstClassPrice: 25000,
    economyAvailable: 180,
    businessAvailable: 40,
    firstClassAvailable: 8
  },
  // ... more flights
]
```

## Success Criteria:
✅ Search returns flights by route & date  
✅ Can create booking for user  
✅ Seat availability decreases after booking  
✅ User can retrieve their bookings  
✅ Database contains sample flight data  

## End Result: **60% Complete**
```
✅ Users can search & book flights
✅ Data persists in database
Next: Build Payment Processing
```

---

# PHASE 4: 60% → 80% (Payments & Frontend Integration)
**Timeline: Days 9-11 | Time: 12 hours**

## What You're Building:
- Payment API endpoints
- Razorpay integration
- Payment verification
- Remove dummy data from React
- Connect React to backend APIs

## Daily Breakdown:

### Day 9 (4 hours):
**Payment Model & Integration**

Files to create:
1. `models/Payment.js` - Payment schema
2. `controllers/paymentController.js` - Razorpay integration

Endpoints:
```javascript
// Create payment order (protected)
POST /api/payments/create-order
Body: { bookingId, amount }
Returns: { orderId, amount, currency }

// Verify payment (protected)
POST /api/payments/verify
Body: { razorpayOrderId, razorpayPaymentId, bookingId }
Returns: { message, transactionId }
```

Setup Razorpay:
1. Create account at razorpay.com
2. Get API keys from dashboard
3. Add to .env file:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxxxx
   RAZORPAY_KEY_SECRET=your_secret_key
   ```

### Day 10 (4 hours):
**Frontend API Integration - Auth & Flights**

In React (`src/utils/api.js`):
```javascript
// Create API client
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Export API functions
export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
};

export const flightsAPI = {
  search: (params) => apiClient.get('/flights/search', { params }),
  getAll: () => apiClient.get('/flights'),
};
```

Update React components:
1. `BluewingLogin.jsx` - Use real login API
2. `FlightSelection.jsx` - Use real flight search
3. `PassengerDetails.jsx` - No changes needed
4. `SeatSelection.jsx` - No changes needed

### Day 11 (4 hours):
**Frontend Booking & Payment Integration**

Update React components:
1. `PaymentSuccess.jsx` - Redirect to real ticket summary
2. `TicketSummary.jsx` - Display real booking data

Connect:
```javascript
// In Payment.jsx
POST /api/payments/create-order
Then call Razorpay checkout

// After payment
POST /api/payments/verify
Then redirect to /ticket-summary with bookingId
```

Test:
```
✅ Register new user from React
✅ Search actual flights from database
✅ Create real booking
✅ Process payment with Razorpay
✅ See booking in ticket summary
```

## Files to Create/Update:

### New Backend Files:
```
bluewing-backend/
├── models/Payment.js (NEW)
├── controllers/paymentController.js (NEW)
├── routes/paymentRoutes.js (NEW)
└── server.js (UPDATED)
```

### Updated React Files:
```
BlueWing/src/
├── utils/api.js (NEW)
├── pages/BluewingLogin.jsx (UPDATED)
├── pages/FlightSelection.jsx (UPDATED)
├── pages/Payment.jsx (UPDATED)
└── pages/TicketSummary.jsx (UPDATED)
```

## Success Criteria:
✅ Payment API working  
✅ Razorpay integration complete  
✅ React calls real backend APIs  
✅ No more dummy data in React  
✅ End-to-end booking flow works  

## End Result: **80% Complete**
```
✅ Full system functional
✅ Backend ↔ Frontend connected
✅ Payments working
Next: Testing & Deployment
```

---

# PHASE 5: 80% → 100% (Testing & Deployment)
**Timeline: Days 12-15 | Time: 16 hours**

## What You're Building:
- Complete testing
- Bug fixes
- Documentation
- Backend deployment
- Frontend deployment
- Production setup

## Daily Breakdown:

### Day 12 (4 hours):
**Complete Backend Testing**

Manual testing:
1. Test all 15+ API endpoints
2. Test error scenarios
3. Test edge cases
4. Test database operations

Create Postman collection:
```
BlueWing Airlines API Collection
├── Auth (3 endpoints)
│   ├── Register
│   ├── Login
│   └── Get Profile
├── Flights (3 endpoints)
│   ├── Get All
│   ├── Search
│   └── Get By ID
├── Bookings (3 endpoints)
│   ├── Create
│   ├── Get User Bookings
│   └── Cancel (optional)
└── Payments (2 endpoints)
    ├── Create Order
    └── Verify Payment
```

Checklist:
```
✅ All endpoints return correct status codes
✅ Validation working
✅ Authentication secured
✅ Database operations correct
✅ Error messages helpful
```

### Day 13 (4 hours):
**Frontend Testing & Bug Fixes**

Test complete user flows:
1. Register → Login → Search → Book → Pay → Ticket
2. Test on different browsers
3. Test mobile responsiveness
4. Check for console errors

Fix any issues:
- Missing error handling
- Loading states
- Data binding
- Navigation flows

Checklist:
```
✅ All pages load correctly
✅ Forms validate input
✅ Error messages display
✅ Loading spinners show
✅ Mobile layout works
✅ No console errors
```

### Day 14 (4 hours):
**Deployment Setup**

Backend deployment (Choose one):
```
Option 1: Render.com (Recommended)
1. Push backend to GitHub
2. Connect Render to GitHub
3. Deploy with one click

Option 2: Railway.app
1. Push backend to GitHub
2. Connect Railway to GitHub
3. Deploy

Option 3: Heroku
1. Create Procfile
2. Set environment variables
3. Deploy with Git push
```

Frontend deployment:
```
Option 1: Vercel (Recommended)
1. Push frontend to GitHub
2. Connect Vercel to GitHub
3. Deploy with one click

Option 2: Netlify
1. Push frontend to GitHub
2. Connect Netlify to GitHub
3. Deploy
```

Database:
```
MongoDB Atlas (Already set up)
✅ Connection string in .env
✅ IP whitelist configured
✅ Backups enabled
```

### Day 15 (4 hours):
**Final Testing & Production Handoff**

Final verification:
```
✅ Backend deployed & responding
✅ Frontend deployed & responsive
✅ Database connected in production
✅ All APIs working from live URL
✅ Payments processing real transactions
✅ Registration/Login working
✅ Booking flow complete
✅ Performance acceptable
```

Documentation:
```
Create README.md with:
- How to run locally
- How to deploy
- API documentation
- Team member instructions
- Troubleshooting guide
```

Team training:
```
- Show all team members live URL
- Explain production architecture
- Document passwords/keys
- Setup monitoring
- Plan maintenance schedule
```

## Files to Update:

### Backend:
```
bluewing-backend/
├── Procfile (NEW)
├── README.md (NEW)
├── server.js (minor updates)
└── .env (production settings)
```

### Frontend:
```
BlueWing/
├── .env.production (NEW)
├── vite.config.js (updated)
└── README.md (updated)
```

## Success Criteria:
✅ Backend live on production URL  
✅ Frontend live on production URL  
✅ All features working end-to-end  
✅ No console errors  
✅ Database persisting data  
✅ Payments processing correctly  
✅ Team can access and use system  

## End Result: **100% Complete**
```
✅ BlueWing Airlines fully functional
✅ Deployed to production
✅ Ready for users
✅ Team trained and ready
```

---

# Complete Timeline Overview

```
Phase 1: Backend Infrastructure
├─ Day 1: Setup & Server (5-6 hrs)
└─ Day 2: Git & Verification (4-5 hrs)
Total: 10 hours → 20% Complete

Phase 2: Authentication
├─ Day 3: User Model & Middleware (4 hrs)
├─ Day 4: Auth Controller (4 hrs)
└─ Day 5: Routes & Testing (4 hrs)
Total: 12 hours → 40% Complete

Phase 3: Flights & Bookings
├─ Day 6: Flight Model & APIs (4 hrs)
├─ Day 7: Booking Model & APIs (4 hrs)
└─ Day 8: Routes & Data Seeding (4 hrs)
Total: 12 hours → 60% Complete

Phase 4: Payments & Integration
├─ Day 9: Payment Model & Razorpay (4 hrs)
├─ Day 10: Frontend Auth & Flight APIs (4 hrs)
└─ Day 11: Booking & Payment Frontend (4 hrs)
Total: 12 hours → 80% Complete

Phase 5: Testing & Deployment
├─ Day 12: Backend Testing (4 hrs)
├─ Day 13: Frontend Testing (4 hrs)
├─ Day 14: Deployment Setup (4 hrs)
└─ Day 15: Final Testing & Handoff (4 hrs)
Total: 16 hours → 100% Complete

GRAND TOTAL: 62 hours
Per person (team of 3): ~20 hours each
Timeline: 15 days at 4 hours/day per person
```

---

# Team Workload Distribution

## Member 1: Backend Lead
```
Phase 1: Setup, MongoDB, Auth APIs
Phase 2: User model, Auth controller, Routes
Phase 3: Flight & Booking models, Controllers
Phase 4: Payment integration
Phase 5: Backend testing, Deployment setup
Total: ~22 hours
```

## Member 2: Full Stack Developer
```
Phase 1: Folder structure, Dependencies
Phase 2: Validation, Middleware
Phase 3: Data seeding, Sample data
Phase 4: Payment controller, Razorpay setup
Phase 5: Documentation, Team training
Total: ~20 hours
```

## Member 3: Frontend Lead
```
Phase 1: Support backend setup
Phase 2: Prepare API integration layer
Phase 3: Track Phase 2 progress
Phase 4: React component updates, API calls
Phase 5: Frontend testing, Vercel deployment
Total: ~20 hours
```

---

# Success Checklist by Phase

## Phase 1 (20%):
- [ ] Server running
- [ ] MongoDB connected
- [ ] Git initialized
- [ ] Team can clone & run

## Phase 2 (40%):
- [ ] User registration working
- [ ] User login working
- [ ] JWT tokens generated
- [ ] Protected routes secured

## Phase 3 (60%):
- [ ] Flight search API working
- [ ] Booking creation API working
- [ ] Database has sample data
- [ ] All CRUD operations tested

## Phase 4 (80%):
- [ ] React connected to backend
- [ ] Dummy data removed
- [ ] Payments integrated
- [ ] End-to-end flow working

## Phase 5 (100%):
- [ ] All APIs tested
- [ ] Frontend fully tested
- [ ] Backend deployed
- [ ] Frontend deployed
- [ ] Team trained
- [ ] Documentation complete
- [ ] Live on production

---

# Key Takeaways

1. **Phase 1-3 are backend foundation** (40 hours)
2. **Phase 4 is integration** (12 hours)
3. **Phase 5 is testing & deployment** (16 hours)
4. **Total project: 62 hours** across 15 days
5. **3-person team can complete in 3 weeks**
6. **Each person focuses on different areas**
7. **Parallel work speeds up completion**

---

# Start Now!

**Today:** Begin Phase 1
**Command to start:**
```bash
cd c:\Users\2488236\OneDrive - Cognizant\Desktop\project-bluewing
mkdir bluewing-backend
cd bluewing-backend
npm init -y
npm install express dotenv cors mongoose bcryptjs jsonwebtoken joi express-async-errors
npm install --save-dev nodemon
npm run dev
```

**You'll be done in 15 days! 🚀**

