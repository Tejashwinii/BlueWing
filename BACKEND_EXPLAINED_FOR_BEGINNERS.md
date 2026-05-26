# 🛫 BlueWing Backend - Complete Beginner's Guide

## Welcome! 

If you're reading this, you probably know React (frontend) but have NO IDEA about backend. That's perfectly fine! This guide will explain **EVERYTHING** in simple terms with real examples from our BlueWing Airlines project.

---

## 📌 Table of Contents

1. [What is Backend?](#1-what-is-backend)
2. [Frontend vs Backend - A Real Example](#2-frontend-vs-backend---a-real-example)
3. [Backend Folder Structure Explained](#3-backend-folder-structure-explained)
4. [The Journey of a Request](#4-the-journey-of-a-request)
5. [Each Folder Explained in Detail](#5-each-folder-explained-in-detail)
6. [What We Built for HomePage](#6-what-we-built-for-homepage)
7. [What We Built for FlightSelection](#7-what-we-built-for-flightselection)
8. [How Frontend Calls Backend](#8-how-frontend-calls-backend)
9. [The Complete Flow - Step by Step](#9-the-complete-flow---step-by-step)
10. [Common Terms Dictionary](#10-common-terms-dictionary)

---

## 1. What is Backend?

### Simple Analogy: The Restaurant 🍽️

Think of a restaurant:

| Restaurant        | Web Application |
|-------------------|-----------------|
| Customer (You)    | User / Browser  |
| Menu (what you see) | Frontend (React) |
| Waiter            | API (Backend Routes) |
| Kitchen           | Backend (Controllers) |
| Recipe Book       | Database Schema (Models) |
| Refrigerator      | Database (MongoDB) |

**Frontend** = What you see (the menu, the tables, the decor)
**Backend** = What happens behind the scenes (kitchen, cooking, storage)

### What Does Backend Do?

```
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND DOES:                             │
├─────────────────────────────────────────────────────────────────┤
│ 1. STORES DATA        → Saves user info, flight info, bookings  │
│ 2. RETRIEVES DATA     → Gets flights from database              │
│ 3. PROCESSES DATA     → Searches, filters, calculates prices    │
│ 4. PROTECTS DATA      → Checks if user is logged in             │
│ 5. SENDS RESPONSES    → Returns data to frontend                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend vs Backend - A Real Example

### When You Search for Flights on BlueWing:

```
YOU (Browser)                    FRONTEND (React)                    BACKEND (Node.js)                    DATABASE (MongoDB)
    │                                │                                      │                                    │
    │  1. Select Hyderabad→Chennai   │                                      │                                    │
    │  ──────────────────────────►   │                                      │                                    │
    │                                │                                      │                                    │
    │                                │  2. "Hey Backend, find flights       │                                    │
    │                                │     from Hyderabad to Chennai"       │                                    │
    │                                │  ────────────────────────────────►   │                                    │
    │                                │                                      │                                    │
    │                                │                                      │  3. "MongoDB, give me all          │
    │                                │                                      │     flights matching this"         │
    │                                │                                      │  ────────────────────────────────► │
    │                                │                                      │                                    │
    │                                │                                      │  4. "Here are 3 flights"           │
    │                                │                                      │  ◄──────────────────────────────── │
    │                                │                                      │                                    │
    │                                │  5. "Here are the 3 flights"         │                                    │
    │                                │  ◄────────────────────────────────   │                                    │
    │                                │                                      │                                    │
    │  6. Shows flight cards         │                                      │                                    │
    │  ◄──────────────────────────   │                                      │                                    │
    │                                │                                      │                                    │
```

### What Each Part Does:

| Part | Technology | What It Does |
|------|------------|--------------|
| **Frontend** | React + Vite | Shows the search form, displays flight cards, handles button clicks |
| **Backend** | Node.js + Express | Receives the search request, queries database, sends back results |
| **Database** | MongoDB | Stores all flight data (times, prices, seats, etc.) |

---

## 3. Backend Folder Structure Explained

Here's our backend folder structure with plain English explanations:

```
bluewing-backend/
│
├── 📁 config/                  # SETTINGS / CONFIGURATION
│   └── database.js             # How to connect to MongoDB
│
├── 📁 controllers/             # THE BRAIN - Where logic lives
│   ├── flightController.js     # Logic for handling flight requests
│   └── authController.js       # Logic for login/register
│
├── 📁 models/                  # THE SHAPE OF DATA
│   ├── Flight.js               # What a flight looks like
│   └── User.js                 # What a user looks like
│
├── 📁 routes/                  # THE TRAFFIC CONTROLLER
│   ├── flightRoutes.js         # URL paths for flight operations
│   └── authRoutes.js           # URL paths for auth operations
│
├── 📁 middleware/              # SECURITY GUARDS
│   └── authMiddleware.js       # Checks if user is logged in
│
├── 📁 seeders/                 # SAMPLE DATA CREATORS
│   └── flightSeeder.js         # Fills database with flight data
│
├── 📁 utils/                   # HELPER TOOLS
│   ├── email/                  # Email sending helpers
│   └── payment/                # Payment processing helpers
│
├── server.js                   # THE MAIN FILE - Starts everything
├── package.json                # Project dependencies
└── .env                        # Secret settings (passwords, keys)
```

### Visual Representation:

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                               BACKEND FOLDER ROLES                                   │
├──────────────┬──────────────────────────────────────────────────────────────────────┤
│  server.js   │  🏠 The Main House - Everything starts here                          │
├──────────────┼──────────────────────────────────────────────────────────────────────┤
│  config/     │  ⚙️  Settings - Database connection details                          │
├──────────────┼──────────────────────────────────────────────────────────────────────┤
│  models/     │  📋 Blueprints - What data looks like (schemas)                      │
├──────────────┼──────────────────────────────────────────────────────────────────────┤
│  routes/     │  🚦 Traffic Signs - Which URL goes where                             │
├──────────────┼──────────────────────────────────────────────────────────────────────┤
│  controllers/│  🧠 Brain - Actual logic and processing                              │
├──────────────┼──────────────────────────────────────────────────────────────────────┤
│  middleware/ │  🛡️  Security Guard - Checks before allowing access                  │
├──────────────┼──────────────────────────────────────────────────────────────────────┤
│  seeders/    │  🌱 Planters - Creates initial/sample data                           │
├──────────────┼──────────────────────────────────────────────────────────────────────┤
│  utils/      │  🔧 Tools - Helper functions (email, payment, etc.)                  │
└──────────────┴──────────────────────────────────────────────────────────────────────┘
```

---

## 4. The Journey of a Request

When you click "Search Flights" button, here's what happens:

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│  STEP 1: Frontend sends request                                                       │
│  ───────────────────────────────                                                      │
│                                                                                       │
│  User clicks "Search" → React calls:                                                  │
│  POST http://localhost:5000/api/flights/search                                        │
│  Body: { from: "Hyderabad", to: "Chennai", departureDate: "2026-07-01" }             │
│                                                                                       │
└──────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│  STEP 2: server.js receives it                                                        │
│  ────────────────────────────                                                         │
│                                                                                       │
│  server.js sees "/api/flights/..." and says:                                          │
│  "Oh! This is a flight request. Let me send it to flightRoutes.js"                   │
│                                                                                       │
│  Code: app.use('/api/flights', flightRoutes);                                        │
│                                                                                       │
└──────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│  STEP 3: routes/flightRoutes.js directs traffic                                       │
│  ─────────────────────────────────────────────                                        │
│                                                                                       │
│  flightRoutes.js sees "POST /search" and says:                                        │
│  "This is a search request. Let me call searchFlights function!"                      │
│                                                                                       │
│  Code: router.post('/search', searchFlights);                                         │
│                                                                                       │
└──────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│  STEP 4: controllers/flightController.js does the work                                │
│  ─────────────────────────────────────────────────────                                │
│                                                                                       │
│  searchFlights function:                                                              │
│  1. Reads the search parameters (from, to, date)                                      │
│  2. Asks MongoDB: "Find all flights matching this"                                    │
│  3. Gets results from MongoDB                                                         │
│  4. Sends results back                                                                │
│                                                                                       │
│  Code: const flights = await Flight.find({ from, to, departureDate });               │
│                                                                                       │
└──────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│  STEP 5: models/Flight.js defines the data shape                                      │
│  ───────────────────────────────────────────────                                      │
│                                                                                       │
│  Flight.js tells MongoDB: "A flight has these fields:                                 │
│  - flightNumber (String)                                                              │
│  - from (String)                                                                      │
│  - to (String)                                                                        │
│  - departureDate (Date)                                                               │
│  - economyPrice (Number)                                                              │
│  - etc..."                                                                            │
│                                                                                       │
└──────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌──────────────────────────────────────────────────────────────────────────────────────┐
│  STEP 6: Response goes back to Frontend                                               │
│  ─────────────────────────────────────────                                            │
│                                                                                       │
│  Backend sends JSON response:                                                         │
│  {                                                                                    │
│    "success": true,                                                                   │
│    "count": 3,                                                                        │
│    "data": [ {flight1}, {flight2}, {flight3} ]                                       │
│  }                                                                                    │
│                                                                                       │
│  Frontend receives this and displays the flight cards!                                │
│                                                                                       │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Each Folder Explained in Detail

### 📁 `config/` - Configuration Settings

**What goes here:** Database connection, environment settings, third-party service configs

**Our file - `database.js`:**
```javascript
// This file connects to MongoDB Atlas (cloud database)
import mongoose from 'mongoose';

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB!');
};

export default connectDB;
```

**Think of it as:** The address book - where to find things (database, email server, etc.)

---

### 📁 `models/` - Data Blueprints (Schemas)

**What goes here:** The SHAPE of your data. What fields exist? What type? Required or optional?

**Our file - `Flight.js`:**
```javascript
// This defines what a "Flight" looks like in the database
const flightSchema = new mongoose.Schema({
  flightNumber: {
    type: String,         // "BW201"
    required: true,       // Must have this
    unique: true,         // No duplicates
  },
  from: {
    type: String,         // "Hyderabad"
    required: true,
  },
  to: {
    type: String,         // "Chennai"
    required: true,
  },
  departureDate: {
    type: Date,           // 2026-07-01
    required: true,
  },
  economyPrice: {
    type: Number,         // 4500
    required: true,
  },
  // ... more fields
});
```

**Real-world analogy:** 
- Schema = Job application form template
- Each field = A blank to fill (Name: ___, Email: ___, Phone: ___)
- `required: true` = Mandatory field (marked with *)
- `type: String` = What kind of answer (text, number, date)

**Visual:**
```
┌─────────────────────────────────────────────────────────────────┐
│                    FLIGHT SCHEMA (Blueprint)                     │
├─────────────────────────────────────────────────────────────────┤
│  flightNumber  │ String   │ Required │ Unique │ "BW201"         │
│  from          │ String   │ Required │        │ "Hyderabad"     │
│  to            │ String   │ Required │        │ "Chennai"       │
│  departureDate │ Date     │ Required │        │ 2026-07-01      │
│  departureTime │ String   │ Required │        │ "06:30"         │
│  arrivalTime   │ String   │ Required │        │ "08:15"         │
│  duration      │ String   │ Required │        │ "1h 45m"        │
│  economyPrice  │ Number   │ Required │        │ 4500            │
│  businessPrice │ Number   │ Required │        │ 9500            │
│  stops         │ Number   │ Required │        │ 0               │
│  airline       │ String   │ Required │        │ "BlueWing"      │
│  rating        │ Number   │ Required │        │ 4.5             │
│  seats         │ Array    │ Required │        │ [{...}, {...}]  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 📁 `routes/` - URL Traffic Controller

**What goes here:** Which URL goes to which function

**Our file - `flightRoutes.js`:**
```javascript
import express from 'express';
import {
  getAllFlights,
  searchFlights,
  getFlightById,
  getFeaturedFlights,
} from '../controllers/flightController.js';

const router = express.Router();

// GET /api/flights → Show all flights
router.get('/', getAllFlights);

// GET /api/flights/featured → Show top-rated flights
router.get('/featured', getFeaturedFlights);

// POST /api/flights/search → Search flights
router.post('/search', searchFlights);

// GET /api/flights/abc123 → Show one specific flight
router.get('/:id', getFlightById);

export default router;
```

**Think of it as:** A phone operator's switchboard

```
┌─────────────────────────────────────────────────────────────────┐
│                    ROUTES = SWITCHBOARD                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   INCOMING CALL                    TRANSFER TO                   │
│   ─────────────                    ───────────                   │
│   GET /api/flights         →       getAllFlights()               │
│   GET /api/flights/featured →      getFeaturedFlights()          │
│   POST /api/flights/search  →      searchFlights()               │
│   GET /api/flights/:id      →      getFlightById()               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**HTTP Methods Explained:**
| Method | Purpose | Example |
|--------|---------|---------|
| **GET** | Read/Fetch data | Get all flights, Get one flight |
| **POST** | Create new OR Send data | Search flights, Create booking |
| **PUT** | Update entire record | Update entire user profile |
| **PATCH** | Update partial record | Change just the email |
| **DELETE** | Remove data | Cancel booking |

---

### 📁 `controllers/` - The Brain (Business Logic)

**What goes here:** The actual code that DOES things

**Our file - `flightController.js`:**
```javascript
import Flight from '../models/Flight.js';

// Function 1: Get ALL flights
const getAllFlights = async (req, res) => {
  try {
    // Ask database for flights
    const flights = await Flight.find();
    
    // Send success response
    return res.status(200).json({
      success: true,
      count: flights.length,
      data: flights,
    });
  } catch (error) {
    // Send error response
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Function 2: Search flights by route and date
const searchFlights = async (req, res) => {
  try {
    // Get search parameters from request body
    const { from, to, departureDate } = req.body;
    
    // Validate - make sure all fields are provided
    if (!from || !to || !departureDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: from, to, departureDate',
      });
    }
    
    // Search database
    const flights = await Flight.find({
      from: from,
      to: to,
      departureDate: new Date(departureDate),
    });
    
    // Send results
    return res.status(200).json({
      success: true,
      count: flights.length,
      data: flights,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
```

**Visual breakdown of a controller function:**

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                         ANATOMY OF A CONTROLLER FUNCTION                             │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│   const searchFlights = async (req, res) => {                                       │
│         ▲              ▲        ▲    ▲                                              │
│         │              │        │    └── res = Response object (to send back)       │
│         │              │        └─────── req = Request object (data from frontend)  │
│         │              └──────────────── async = Can wait for database              │
│         └─────────────────────────────── Function name                              │
│                                                                                      │
│     const { from, to, departureDate } = req.body;                                   │
│            ▲                              ▲                                          │
│            │                              └── req.body = Data sent by frontend      │
│            └──────────────────────────────── Destructuring (extracting values)      │
│                                                                                      │
│     const flights = await Flight.find({ from, to });                                │
│           ▲               ▲                                                          │
│           │               └── Flight.find() = Ask MongoDB for data                  │
│           └───────────────── await = Wait until database responds                   │
│                                                                                      │
│     return res.status(200).json({ success: true, data: flights });                  │
│                   ▲          ▲                                                       │
│                   │          └── json() = Send JSON response                        │
│                   └──────────── status(200) = HTTP 200 OK                           │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

**HTTP Status Codes:**
| Code | Meaning | When to Use |
|------|---------|-------------|
| **200** | OK | Everything worked! |
| **201** | Created | New item created successfully |
| **400** | Bad Request | User sent wrong/missing data |
| **401** | Unauthorized | User not logged in |
| **403** | Forbidden | Logged in but not allowed |
| **404** | Not Found | Item doesn't exist |
| **500** | Server Error | Something broke on server |

---

### 📁 `middleware/` - Security Guards

**What goes here:** Code that runs BEFORE your controller

**Example - `authMiddleware.js`:**
```javascript
// This checks if user is logged in before allowing access
const protect = async (req, res, next) => {
  // 1. Check if token exists
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ message: 'Not logged in!' });
  }
  
  // 2. Verify token is valid
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
  // 3. Add user to request
  req.user = decoded;
  
  // 4. Continue to controller
  next();
};
```

**Visual:**
```
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                              MIDDLEWARE = SECURITY CHECKPOINT                          │
├───────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│   Request comes in                                                                     │
│        │                                                                               │
│        ▼                                                                               │
│   ┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐         │
│   │   Middleware 1   │   →    │   Middleware 2   │   →    │   Controller     │         │
│   │   (Check Login)  │        │   (Check Admin)  │        │   (Do the work)  │         │
│   └─────────────────┘         └─────────────────┘         └─────────────────┘         │
│          │                           │                                                 │
│          ▼                           ▼                                                 │
│   If fails: STOP!             If fails: STOP!                                          │
│   Return 401 error            Return 403 error                                         │
│                                                                                        │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 📁 `seeders/` - Database Planters

**What goes here:** Scripts to fill database with initial/test data

**Our file - `flightSeeder.js`:**
```javascript
// This creates sample flights in the database
const seedFlights = async () => {
  // 1. Clear existing flights
  await Flight.deleteMany({});
  
  // 2. Create new flights
  const flights = [
    {
      flightNumber: 'BW201',
      from: 'Hyderabad',
      to: 'Chennai',
      departureDate: new Date('2026-07-01'),
      economyPrice: 4500,
      // ... more data
    },
    // ... more flights
  ];
  
  // 3. Insert into database
  await Flight.insertMany(flights);
  
  console.log('32 flights seeded!');
};
```

**When to use seeders:**
- Starting fresh with a new database
- Testing with consistent data
- Demo/presentation purposes

---

### 📄 `server.js` - The Main File

**What it does:** Starts everything, connects all pieces

```javascript
import express from 'express';
import connectDB from './config/database.js';
import flightRoutes from './routes/flightRoutes.js';

// Create the app
const app = express();

// Enable JSON parsing
app.use(express.json());

// Connect routes to URLs
app.use('/api/flights', flightRoutes);  // All /api/flights/* go to flightRoutes

// Start server
app.listen(5000, () => {
  console.log('Server running on port 5000');
});
```

**Visual:**
```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              server.js = ASSEMBLY POINT                              │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│                              server.js                                               │
│                                  │                                                   │
│         ┌────────────────────────┼────────────────────────┐                         │
│         │                        │                        │                         │
│         ▼                        ▼                        ▼                         │
│   ┌───────────┐           ┌───────────┐           ┌───────────┐                     │
│   │  config/  │           │  routes/  │           │middleware/│                     │
│   │ database  │           │  flight   │           │   auth    │                     │
│   └───────────┘           │   auth    │           └───────────┘                     │
│                           └───────────┘                                              │
│                                 │                                                    │
│                                 ▼                                                    │
│                           ┌───────────┐                                              │
│                           │controllers│                                              │
│                           └───────────┘                                              │
│                                 │                                                    │
│                                 ▼                                                    │
│                           ┌───────────┐                                              │
│                           │  models/  │                                              │
│                           └───────────┘                                              │
│                                 │                                                    │
│                                 ▼                                                    │
│                           ┌───────────┐                                              │
│                           │  MongoDB  │                                              │
│                           └───────────┘                                              │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. What We Built for HomePage

### Page Purpose:
The HomePage shows a search form with city dropdowns. Cities should come from the database (not hardcoded).

### What Happens:

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           HOMEPAGE FLOW                                              │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  1. User opens HomePage                                                              │
│         │                                                                            │
│         ▼                                                                            │
│  2. React component mounts (useEffect runs)                                          │
│         │                                                                            │
│         ▼                                                                            │
│  3. Frontend calls: GET http://localhost:5000/api/flights                           │
│         │                                                                            │
│         ▼                                                                            │
│  4. Backend returns ALL flights (32 flights)                                         │
│         │                                                                            │
│         ▼                                                                            │
│  5. Frontend extracts unique cities from "from" and "to" fields                      │
│         │                                                                            │
│         ▼                                                                            │
│  6. Dropdown shows: Hyderabad, Chennai, Mumbai, Delhi, Bangalore...                 │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Backend Files Used:

| File | What It Does |
|------|--------------|
| `routes/flightRoutes.js` | Maps `GET /api/flights` → `getAllFlights` |
| `controllers/flightController.js` | `getAllFlights()` fetches all flights from DB |
| `models/Flight.js` | Defines what a flight looks like |

### Frontend Code (HomePage.jsx):

```jsx
// When component loads, fetch flights
useEffect(() => {
  const fetchFlights = async () => {
    try {
      // Call backend API
      const response = await flightAPI.getAllFlights(1000, 0);
      
      if (response.success && response.data) {
        setFlights(response.data);  // Store flights in state
      }
    } catch (error) {
      // If API fails, use dummy data
      setFlights(dummyFlights);
    }
  };

  fetchFlights();
}, []);

// Extract unique cities for dropdowns
const departureOptions = useMemo(() => {
  return [...new Set(flights.map(f => f.from))].sort();
}, [flights]);
```

---

## 7. What We Built for FlightSelection

### Page Purpose:
When user searches, show matching flights from the database.

### What Happens:

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        FLIGHT SELECTION FLOW                                         │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  1. User selects: Hyderabad → Chennai, July 1, 2026                                 │
│         │                                                                            │
│         ▼                                                                            │
│  2. User clicks "Search Flights"                                                     │
│         │                                                                            │
│         ▼                                                                            │
│  3. Navigate to FlightSelection page                                                 │
│         │                                                                            │
│         ▼                                                                            │
│  4. FlightSelection component mounts                                                 │
│         │                                                                            │
│         ▼                                                                            │
│  5. Frontend calls: POST http://localhost:5000/api/flights/search                   │
│     Body: { from: "Hyderabad", to: "Chennai", departureDate: "2026-07-01" }         │
│         │                                                                            │
│         ▼                                                                            │
│  6. Backend searches MongoDB for matching flights                                    │
│         │                                                                            │
│         ▼                                                                            │
│  7. Backend returns 3 matching flights                                               │
│         │                                                                            │
│         ▼                                                                            │
│  8. Frontend displays 3 flight cards                                                 │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Backend Files Used:

| File | What It Does |
|------|--------------|
| `routes/flightRoutes.js` | Maps `POST /api/flights/search` → `searchFlights` |
| `controllers/flightController.js` | `searchFlights()` queries DB with filters |
| `models/Flight.js` | Flight schema for MongoDB query |

### Controller Logic (searchFlights):

```javascript
const searchFlights = async (req, res) => {
  try {
    // 1. Get search params from request body
    const { from, to, departureDate } = req.body;

    // 2. Validate - all fields required
    if (!from || !to || !departureDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    // 3. Create date range (entire day)
    const searchDate = new Date(departureDate);
    const nextDate = new Date(searchDate);
    nextDate.setDate(nextDate.getDate() + 1);

    // 4. Query MongoDB
    const flights = await Flight.find({
      from: from,                           // Match departure city
      to: to,                               // Match arrival city
      departureDate: {
        $gte: searchDate,                   // >= start of day
        $lt: nextDate,                      // < next day
      },
    });

    // 5. Return results
    return res.status(200).json({
      success: true,
      count: flights.length,
      data: flights,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
```

### Frontend Code (FlightSelection.jsx):

```jsx
useEffect(() => {
  const fetchFlights = async () => {
    try {
      setLoading(true);
      
      // Prepare search parameters
      const searchParams = {
        from: departure,
        to: arrival,
        departureDate: date,
      };
      
      // Call backend API
      const response = await flightAPI.searchFlights(searchParams);
      
      if (response.success) {
        setFlights(response.data);
      }
    } catch (error) {
      setError('Failed to fetch flights');
    } finally {
      setLoading(false);
    }
  };

  fetchFlights();
}, [departure, arrival, date]);
```

---

## 8. How Frontend Calls Backend

### The API Client (frontend/src/utils/api.js):

```javascript
import axios from 'axios';

// Where the backend lives
const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flight-related API calls
export const flightAPI = {
  // Search flights
  searchFlights: async (searchParams) => {
    const response = await apiClient.post('/flights/search', searchParams);
    return response.data;
  },

  // Get all flights
  getAllFlights: async (limit, skip) => {
    const response = await apiClient.get(`/flights?limit=${limit}&skip=${skip}`);
    return response.data;
  },

  // Get single flight
  getFlightById: async (flightId) => {
    const response = await apiClient.get(`/flights/${flightId}`);
    return response.data;
  },

  // Get featured flights
  getFeaturedFlights: async (limit) => {
    const response = await apiClient.get(`/flights/featured?limit=${limit}`);
    return response.data;
  },
};
```

### Visual: API Client as Translator

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        api.js = TRANSLATOR / MESSENGER                               │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│   REACT COMPONENT                    api.js                       BACKEND            │
│   ─────────────                      ──────                       ───────            │
│                                                                                      │
│   "I need flights from             "Let me translate             POST /api/flights/  │
│    Hyderabad to Chennai"    →       that to HTTP"         →      search              │
│                                                                   { from, to, date } │
│                                                                                      │
│   flightAPI.searchFlights({        axios.post(url, body)         HTTP Request       │
│     from: "Hyderabad",       →                              →                        │
│     to: "Chennai",                                                                   │
│     departureDate: "2026-07-01"                                                      │
│   })                                                                                 │
│                                                                                      │
│   "Here are 3 flights"       ←     "Got response, here"    ←     { success: true,   │
│                                                                    data: [...] }     │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. The Complete Flow - Step by Step

### End-to-End Journey: Searching for Flights

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        COMPLETE FLOW: SEARCH FLIGHTS                                 │
├─────────────────────────────────────────────────────────────────────────────────────┤

STEP 1: USER ACTION
═══════════════════
User on HomePage:
- Selects "Hyderabad" in From dropdown
- Selects "Chennai" in To dropdown  
- Selects "July 1, 2026" as date
- Clicks "Search Flights" button

STEP 2: REACT (FRONTEND)
════════════════════════
HomePage.jsx:
  - onClick handler runs
  - Calls navigate('/flights', { state: { formData } })
  - User redirected to FlightSelection page

FlightSelection.jsx:
  - Component mounts
  - useEffect runs
  - Calls: flightAPI.searchFlights({ from, to, departureDate })

STEP 3: API CLIENT (FRONTEND)
═════════════════════════════
api.js:
  - searchFlights function runs
  - Creates HTTP request: POST http://localhost:5000/api/flights/search
  - Body: { from: "Hyderabad", to: "Chennai", departureDate: "2026-07-01" }
  - Sends request via axios

STEP 4: EXPRESS SERVER (BACKEND)
════════════════════════════════
server.js:
  - Receives POST /api/flights/search
  - Checks: Does /api/flights/* match any route?
  - Yes! Forwards to flightRoutes

STEP 5: ROUTER (BACKEND)
════════════════════════
routes/flightRoutes.js:
  - Receives POST /search
  - Checks: Does POST /search match any route?
  - Yes! router.post('/search', searchFlights)
  - Calls searchFlights function

STEP 6: CONTROLLER (BACKEND)
════════════════════════════
controllers/flightController.js:
  - searchFlights function runs
  - Extracts from req.body: { from, to, departureDate }
  - Validates: Are all fields present? ✓
  - Builds MongoDB query

STEP 7: MODEL & DATABASE
════════════════════════
models/Flight.js + MongoDB:
  - Flight.find({ from, to, departureDate }) executes
  - MongoDB searches "flights" collection
  - Finds 3 matching documents
  - Returns array of 3 flight objects

STEP 8: RESPONSE JOURNEY BACK
═════════════════════════════
Controller → Router → Server → API Client → React:
  - Controller: res.json({ success: true, count: 3, data: [flight1, flight2, flight3] })
  - Express sends HTTP response
  - Axios receives response
  - api.js returns response.data
  - FlightSelection receives data
  - setFlights(data) updates state
  - React re-renders with 3 FlightCards

STEP 9: USER SEES RESULT
════════════════════════
3 flight cards appear:
  - BW201: 6:30 AM - 8:15 AM, ₹4500
  - BW216: 12:00 PM - 1:45 PM, ₹4800
  - BW217: 6:00 PM - 7:45 PM, ₹5200

└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Common Terms Dictionary

| Term | Simple Meaning | Example |
|------|---------------|---------|
| **API** | A way for programs to talk to each other | Frontend asks Backend for data via API |
| **Endpoint** | A specific URL that does something | `/api/flights/search` is an endpoint |
| **Route** | URL path + HTTP method | `POST /api/flights/search` |
| **Controller** | Function that handles a request | `searchFlights()` |
| **Model** | Definition of data structure | Flight schema |
| **Schema** | Blueprint for data | What fields a flight has |
| **MongoDB** | Database that stores data as documents | Like a filing cabinet |
| **Mongoose** | Library to talk to MongoDB from Node.js | Translator between Node & Mongo |
| **Express** | Framework to build APIs in Node.js | Makes creating routes easy |
| **Middleware** | Code that runs between request & response | Auth check before accessing data |
| **req** | Request object (data coming in) | `req.body`, `req.params` |
| **res** | Response object (data going out) | `res.json()`, `res.status()` |
| **async/await** | Way to handle operations that take time | Waiting for database response |
| **JSON** | Data format (JavaScript Object Notation) | `{ "name": "John" }` |
| **HTTP Methods** | Types of requests | GET, POST, PUT, DELETE |
| **Status Code** | Number indicating result | 200 = OK, 404 = Not Found |
| **Token** | Proof that user is logged in | JWT token |
| **CORS** | Security feature for cross-origin requests | Frontend on 5173 calling Backend on 5000 |

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                           QUICK REFERENCE CARD                                       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  TO ADD A NEW FEATURE:                                                               │
│  ═══════════════════                                                                 │
│  1. Create MODEL    → models/YourModel.js    (Define data shape)                    │
│  2. Create CONTROLLER → controllers/yourController.js (Write logic)                  │
│  3. Create ROUTES   → routes/yourRoutes.js   (Map URLs to functions)                │
│  4. Register in server.js → app.use('/api/your', yourRoutes)                        │
│                                                                                      │
│  FILE RESPONSIBILITIES:                                                              │
│  ═════════════════════                                                               │
│  models/      → WHAT data looks like                                                 │
│  controllers/ → WHAT TO DO with data                                                 │
│  routes/      → WHERE requests go                                                    │
│  middleware/  → CHECKS before processing                                             │
│  config/      → SETTINGS and connections                                             │
│  server.js    → STARTS everything                                                    │
│                                                                                      │
│  COMMON PATTERNS:                                                                    │
│  ═══════════════                                                                     │
│  Get all:     GET /api/items           → Model.find()                               │
│  Get one:     GET /api/items/:id       → Model.findById(id)                         │
│  Create:      POST /api/items          → Model.create(data)                         │
│  Update:      PUT /api/items/:id       → Model.findByIdAndUpdate(id, data)          │
│  Delete:      DELETE /api/items/:id    → Model.findByIdAndDelete(id)                │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Summary

For the first two pages (HomePage and FlightSelection), we created:

| What | File | Purpose |
|------|------|---------|
| **Flight Model** | `models/Flight.js` | Defines what a flight looks like |
| **Flight Controller** | `controllers/flightController.js` | 4 functions to handle flight requests |
| **Flight Routes** | `routes/flightRoutes.js` | 4 URL endpoints mapped to controller |
| **API Client** | `frontend/src/utils/api.js` | Frontend functions to call backend |
| **Seeder** | `seeders/flightSeeder.js` | Script to add 32 flights to database |

**Endpoints Created:**
| Method | URL | Purpose |
|--------|-----|---------|
| GET | `/api/flights` | Get all flights (for city dropdowns) |
| GET | `/api/flights/featured` | Get top-rated flights |
| POST | `/api/flights/search` | Search flights by route + date |
| GET | `/api/flights/:id` | Get single flight details |

---

**🎉 You now understand how backend works for the first two pages!**

When you're ready, we can continue with the next pages (PassengerDetails, SeatSelection, Payment, TicketSummary) which will use the `user/` folder for authenticated user operations.
