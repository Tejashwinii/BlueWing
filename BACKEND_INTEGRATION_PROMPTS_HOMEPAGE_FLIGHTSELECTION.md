# Backend Integration Prompts - HomePage & FlightSelection
## Maintain Existing UI + Connect to Database

---

## 📋 OVERVIEW

**Current State:**
- ✅ Frontend: HomePage and FlightSelection pages with UI fully built (using dummyFlights)
- ✅ Database: MongoDB Atlas ready with Cluster0
- ❌ Backend: Flight model, controller, and routes need to be created
- ❌ Connection: Frontend still pulling from dummy data, needs API integration

**Objective:** Keep the exact same UI/UX and replace dummyFlights with real database calls

**Key Constraint:** 
- Do NOT modify HomePage.jsx or FlightSelection.jsx logic
- Only replace `dummyFlights` calls with API endpoints
- Maintain all existing state management, filtering, sorting
- Keep exact same user experience

---

## PHASE 1: BACKEND SETUP

### Prompt 1.1: Create Flight Model with Embedded Seats

**File:** `bluewing-backend/models/Flight.js` (CREATE NEW)

**Context:**
Your HomePage and FlightSelection expect flight objects with this structure:
```
{
  _id: ObjectId,
  flightNumber: "BW201",
  from: "Hyderabad",           // City name (not code)
  to: "Mumbai",                // City name (not code)
  departureDate: "2024-05-25",
  departureTime: "06:00 AM",
  arrivalTime: "08:30 AM",
  duration: "2h 30m",
  economyPrice: 4500,
  businessPrice: 7200,
  firstClassPrice: 11000,
  stops: 0,
  airline: "BlueWing",
  rating: 4.5,
  amenities: ["WiFi", "Meals", "USB Charging"]
}
```

**Detailed Instructions:**

1. **Import Mongoose**
   - Create Mongoose schema with strict mode enabled

2. **Define Seat schema (embedded):**
   - seatId: String (e.g., "1A", "2B")
   - row: Number
   - column: String (e.g., "A", "B", "C")
   - cabin: String ("economy", "business", "firstClass")
   - isBooked: Boolean (default false)
   - bookedBy: ObjectId (reference to User, optional)
   - bookingId: String (optional)

3. **Define Flight schema with these fields (in order):**
   - flightNumber: String (required, unique)
   - from: String (required) - City name like "Hyderabad"
   - to: String (required) - City name like "Mumbai"
   - departureDate: Date (required) - Format: "2024-05-25"
   - departureTime: String (required) - Format: "06:00 AM"
   - arrivalTime: String (required) - Format: "08:30 AM"
   - duration: String (required) - Format: "2h 30m"
   - economyPrice: Number (required)
   - businessPrice: Number (required)
   - firstClassPrice: Number (required)
   - stops: Number (required, default 0)
   - airline: String (required)
   - rating: Number (required) - 0-5
   - amenities: [String] - Array like ["WiFi", "Meals"]
   - seats: [Seat schema] - Embedded seat objects (180-210 seats)
   - createdAt: Date (auto)
   - updatedAt: Date (auto)

4. **Add indexes:**
   - Index on flightNumber (unique)
   - Index on { from, to, departureDate } (for search queries)

5. **Add helper methods (no business logic, just utilities):**
   - getAvailableSeats(cabin) - Returns seats array where isBooked === false for that cabin
   - getTotalSeats(cabin) - Returns count of seats in that cabin
   - getBookedSeats(cabin) - Returns count of booked seats in that cabin
   - getSeatPrice(cabin) - Returns price for that cabin (economyPrice, businessPrice, etc.)

6. **Export:** Export the Flight model

**Why This Structure:**
- Seats embedded = No separate queries needed
- City names = Frontend expects city names, not codes
- All prices included = FlightSelection filters by class dynamically
- Helper methods = Easy to use in controller

---

### Prompt 1.2: Create Flight Controller with 4 Functions

**File:** `bluewing-backend/controllers/flightController.js` (CREATE NEW)

**Context:**
FlightSelection filters flights by:
- from + to + departureDate
- cabinClass (to get correct price)
- stops, sortBy

**Detailed Instructions:**

1. **Import Flight model**

2. **Function 1: getAllFlights()**
   - Method: GET /api/flights
   - Query params: limit (default 100), skip (default 0)
   - Logic:
     - Fetch all flights with limit and skip
     - Sort by departureDate ascending
     - Return array of flights
   - Response: 
     ```
     { 
       success: true, 
       count: number,
       data: [flights array]
     }
     ```
   - Error handling: Catch error, return { success: false, message: error.message }

3. **Function 2: searchFlights()**
   - Method: POST /api/flights/search
   - Body: 
     ```
     {
       from: "Hyderabad",
       to: "Mumbai",
       departureDate: "2024-05-25",
       cabinClass: "economy"  // optional
     }
     ```
   - Logic:
     - Check if from, to, departureDate provided
     - Build query object: { from: from, to: to, departureDate: new Date(departureDate) }
     - Query Flight collection with this filter
     - Sort by departureTime ascending
     - Return filtered flights
   - Response:
     ```
     {
       success: true,
       count: number,
       data: [flights array]
     }
     ```
   - Important: Date comparison should work correctly (compare dates not times)
   - Error handling: If missing required fields, return { success: false, message: "Missing required fields" }

4. **Function 3: getFlightById()**
   - Method: GET /api/flights/:id
   - URL param: id (flight _id)
   - Logic:
     - Find flight by _id
     - Return single flight object
   - Response:
     ```
     {
       success: true,
       data: flight object
     }
     ```
   - Error handling: If not found, return { success: false, message: "Flight not found" }

5. **Function 4: getFeaturedFlights()**
   - Method: GET /api/flights/featured
   - Query params: limit (default 6)
   - Logic:
     - Find flights with rating >= 4.0
     - Limit to specified count
     - Sort by rating descending
     - Return featured flights
   - Response:
     ```
     {
       success: true,
       count: number,
       data: [flights array]
     }
     ```
   - Error handling: Standard error handling

**Important Notes:**
- Each function should validate input before querying
- Use try-catch for all database operations
- Don't add business logic - keep controllers simple
- Return consistent response format

---

### Prompt 1.3: Create Flight Routes (4 Endpoints)

**File:** `bluewing-backend/routes/flightRoutes.js` (CREATE NEW)

**Detailed Instructions:**

1. **Import Express Router and flight controller**

2. **Create 4 routes:**

   a) **GET /flights**
      - Handler: flightController.getAllFlights
      - No auth required
      - Query params: limit, skip

   b) **POST /flights/search**
      - Handler: flightController.searchFlights
      - No auth required
      - Body: from, to, departureDate, cabinClass

   c) **GET /flights/:id**
      - Handler: flightController.getFlightById
      - No auth required
      - URL param: id

   d) **GET /flights/featured**
      - Handler: flightController.getFeaturedFlights
      - No auth required
      - Query param: limit

3. **Error handling:**
   - No middleware needed
   - Controllers handle all errors

4. **Export:** Export router

**Important:**
- Order matters: /featured route MUST come before /:id route (otherwise "featured" treated as ID)
- No authentication needed for flight endpoints (public data)

---

### Prompt 1.4: Register Flight Routes in Server.js

**File:** `bluewing-backend/server.js` (UPDATE EXISTING)

**Detailed Instructions:**

1. **Import flight routes**
   - Add: `const flightRoutes = require('./routes/flightRoutes');`

2. **Register routes**
   - After all other routes, add: `app.use('/api/flights', flightRoutes);`
   - Should be AFTER auth routes but order doesn't matter

3. **Verify server structure:**
   - Port 5000 running
   - CORS enabled for localhost
   - JSON parser configured
   - MongoDB connection works

4. **Test:**
   - Start server: `npm run dev`
   - Should see "Server running on port 5000"
   - No errors in console

---

### Prompt 1.5: Seed Database with 12 Flights

**File:** `bluewing-backend/seeders/flightSeeder.js` (CREATE NEW)

**Context:**
HomePage displays 12 dummy flights. These need to be in MongoDB as real documents with embedded seats.

**12 Flights to Seed:**
```
Flight 1: Hyderabad → Mumbai (BW201, BW202)
Flight 3: Mumbai → Hyderabad (return options)
Flight 4: Hyderabad → Delhi (BW205, BW206)
Flight 5: Delhi → Hyderabad (return options)
Flight 6: Bangalore → Delhi (BW209, BW210)
Flight 7: Chennai → Kochi (BW211, BW212)
(Plus rotation schedules for different dates)
```

**Detailed Instructions:**

1. **Connect to MongoDB**
   - Use existing MongoDB URI from .env
   - Connect before seeding

2. **Create utility function: generateSeats()**
   - Input: cabinClass, seatCount
   - Output: Array of seat objects
   - Format seats like: 1A, 1B, 1C, 1D, 1E, 1F, ..., 30D
   - Each seat should have:
     - seatId: Generated ID
     - row: Calculated row number
     - column: Calculated column letter
     - cabin: cabinClass passed
     - isBooked: false
     - bookedBy: null
     - bookingId: null

3. **Create utility function: convertTo24Hour(timeStr)**
   - Input: "6:00 AM" or "2:30 PM"
   - Output: "06:00" or "14:30"
   - Used for internal storage if needed

4. **Create flight seeding data (12 flights):**
   - Each flight has:
     - All required fields (flightNumber, from, to, etc.)
     - 180-210 embedded seat objects (split: 120 economy, 40 business, 20 firstClass)
     - Varied times: 6:00 AM, 9:00 AM, 12:00 PM, 3:00 PM, 6:00 PM, 9:00 PM
     - Different dates: 2024-05-25, 2024-05-26, 2024-05-27
     - Price variations
     - Rating variations

5. **Seeding logic:**
   - Drop existing flights collection
   - Insert all 12 flights at once
   - Log success message with count
   - Close MongoDB connection

6. **Add npm script:**
   - In package.json: `"seed:flights": "node seeders/flightSeeder.js"`
   - User can run: `npm run seed:flights`

7. **Run seeder:**
   - Execute: `npm run seed:flights`
   - Verify 12 flights in MongoDB
   - Check one flight has seats array with 180+ objects

**Sample Flight Object:**
```javascript
{
  flightNumber: "BW201",
  from: "Hyderabad",
  to: "Mumbai",
  departureDate: new Date("2024-05-25"),
  departureTime: "06:00 AM",
  arrivalTime: "08:30 AM",
  duration: "2h 30m",
  economyPrice: 4500,
  businessPrice: 7200,
  firstClassPrice: 11000,
  stops: 0,
  airline: "BlueWing",
  rating: 4.5,
  amenities: ["WiFi", "Meals", "USB Charging"],
  seats: [
    { seatId: "1A", row: 1, column: "A", cabin: "economy", isBooked: false },
    { seatId: "1B", row: 1, column: "B", cabin: "economy", isBooked: false },
    // ... more seats
  ]
}
```

---

## PHASE 2: FRONTEND API INTEGRATION

### Prompt 2.1: Create API Client Methods for Flights

**File:** `frontend/src/utils/api.js` (UPDATE EXISTING)

**Context:**
Your frontend already has axios instance with auth interceptors. Just add flight methods.

**Detailed Instructions:**

1. **Verify existing structure:**
   - Should have: `const apiClient = axios.create({ baseURL: 'http://localhost:5000/api' })`
   - Should have: Request interceptor that adds JWT token
   - Should have: Response interceptor that handles 401 errors

2. **Create flightAPI object with 4 methods:**

   a) **searchFlights(searchParams)**
      - Method: POST
      - Endpoint: `/flights/search`
      - Body: searchParams object (from, to, departureDate, cabinClass)
      - Return: response.data
      - Error: throw error if occurs

   b) **getAllFlights(limit, skip)**
      - Method: GET
      - Endpoint: `/flights?limit=${limit}&skip=${skip}`
      - Return: response.data
      - Used for pagination

   c) **getFlightById(flightId)**
      - Method: GET
      - Endpoint: `/flights/${flightId}`
      - Return: response.data
      - Used in Phase 3 for seat details

   d) **getFeaturedFlights(limit)**
      - Method: GET
      - Endpoint: `/flights/featured?limit=${limit}`
      - Return: response.data
      - For HomePage featured section

3. **Standard error handling:**
   - Try-catch wrapper
   - Throw error.response?.data or error message
   - No modifications to response data

4. **Export flightAPI object**

**Important:**
- Do NOT modify auth API methods
- Keep same structure as existing code
- No response transformation

---

### Prompt 2.2: Replace dummyFlights in HomePage

**File:** `frontend/src/pages/HomePage.jsx` (UPDATE EXISTING)

**Current Usage of dummyFlights:**
- Line ~10: `import dummyFlights from '../data/dummyFlights';`
- Line ~40-50: Extracts departureOptions (from values)
- Line ~50-60: Extracts arrivalOptions (to values)

**Detailed Instructions:**

1. **Import flightAPI**
   - Add: `import { flightAPI } from '../utils/api';`

2. **Add useEffect hook:**
   - On component mount
   - Fetch flights using: `flightAPI.getAllFlights(1000, 0)`
   - Extract unique departure cities from response
   - Extract unique arrival cities from response
   - Sort both lists alphabetically
   - Store in state

3. **Create state variables:**
   - `const [flights, setFlights] = useState([]);`
   - `const [loading, setLoading] = useState(true);`

4. **Modify useMemo blocks:**
   - departureOptions: Use `flights` instead of `dummyFlights`
   - arrivalOptions: Use `flights` instead of `dummyFlights`

5. **Error handling:**
   - If API fails, keep using dummyFlights as fallback
   - Log error to console

6. **DO NOT modify:**
   - Form submission logic
   - State management (formData, etc.)
   - Search validation
   - Navigation logic
   - Styling

---

### Prompt 2.3: Replace dummyFlights in FlightSelection

**File:** `frontend/src/pages/FlightSelection.jsx` (UPDATE EXISTING)

**Current Usage of dummyFlights:**
- Line ~1-5: Import dummyFlights
- Line ~30-33: `const flights = Array.isArray(dummyFlightsData) ? ...`
- Line ~80-90: Filter flights by departure, arrival, date

**Detailed Instructions:**

1. **Import flightAPI**
   - Add: `import { flightAPI } from '../utils/api';`

2. **Add useEffect hook:**
   - Check if searchCriteria has departure and arrival
   - If yes: Call `flightAPI.searchFlights(searchCriteria)`
   - Store response.data in state
   - Set loading = false
   - Handle errors gracefully

3. **Create state variables:**
   - `const [flights, setFlights] = useState([]);`
   - `const [apiLoading, setApiLoading] = useState(true);`
   - `const [apiError, setApiError] = useState(null);`

4. **Replace dummyFlights usage:**
   - Use `flights` from state instead of `dummyFlightsData`
   - All filtering logic remains the same
   - Sorting logic remains the same
   - Pagination logic remains the same

5. **Update matchingRouteFlights useMemo:**
   - Remove manual filtering by departure, arrival, date
   - Use flights from API (already filtered)
   - Only apply cabin class filter if needed

6. **Add loading state UI:**
   - Show "Loading flights..." while apiLoading = true
   - Show error message if apiError exists

7. **DO NOT modify:**
   - Filter logic (stops, cabin class)
   - Sort logic
   - Pagination
   - Flight card component usage
   - handleFareSubmit function
   - Navigation logic

---

### Prompt 2.4: Test End-to-End Integration

**Instructions:**

1. **Backend Setup:**
   - [ ] Navigate to `bluewing-backend`
   - [ ] Start server: `npm run dev`
   - [ ] Run seeder: `npm run seed:flights`
   - [ ] Verify "Seeded 12 flights" message
   - [ ] Check MongoDB for flights collection with 12 documents

2. **Test Backend Endpoints (Postman or curl):**
   - [ ] GET http://localhost:5000/api/flights
     - Should return array with 12 flights
     - Each flight has all required fields
   - [ ] POST http://localhost:5000/api/flights/search
     - Body: { "from": "Hyderabad", "to": "Mumbai", "departureDate": "2024-05-25" }
     - Should return filtered flights
   - [ ] GET http://localhost:5000/api/flights/featured
     - Should return 6 flights with rating >= 4.0

3. **Frontend Setup:**
   - [ ] Navigate to `frontend`
   - [ ] Install dependencies: `npm install`
   - [ ] Start dev server: `npm run dev`
   - [ ] Browser opens to http://localhost:5174 (or 5173)

4. **Test HomePage:**
   - [ ] Page loads without errors
   - [ ] Departure dropdown shows cities from database
   - [ ] Arrival dropdown shows cities from database
   - [ ] All existing form functionality works
   - [ ] Search button navigates to FlightSelection

5. **Test FlightSelection:**
   - [ ] Page loads with search results from database
   - [ ] Flight count matches database query
   - [ ] All filters work (stops, cabin class)
   - [ ] Sorting works (price, time, duration)
   - [ ] Pagination works
   - [ ] Select flight button works

6. **Check Console:**
   - [ ] No errors in browser console
   - [ ] No CORS errors
   - [ ] No undefined variable errors

7. **Verify Data:**
   - [ ] Prices match what's in database
   - [ ] Flight numbers match (BW201, BW202, etc.)
   - [ ] Times display correctly
   - [ ] Amenities show correctly

---

## 📊 SUMMARY

**Files to Create:**
- ✅ `bluewing-backend/models/Flight.js`
- ✅ `bluewing-backend/controllers/flightController.js`
- ✅ `bluewing-backend/routes/flightRoutes.js`
- ✅ `bluewing-backend/seeders/flightSeeder.js`

**Files to Update:**
- ✅ `bluewing-backend/server.js`
- ✅ `bluewing-backend/package.json` (add seed script)
- ✅ `frontend/src/utils/api.js`
- ✅ `frontend/src/pages/HomePage.jsx`
- ✅ `frontend/src/pages/FlightSelection.jsx`

**What Stays the Same:**
- ✅ HomePage UI and styling
- ✅ FlightSelection UI and styling
- ✅ Form validation logic
- ✅ Filter and sort functionality
- ✅ Navigation between pages
- ✅ Passenger counter logic

**Data Flow:**
```
HomePage Form Submit
    ↓
searchFlights(from, to, date)
    ↓
POST /api/flights/search
    ↓
MongoDB Query
    ↓
Return filtered flights
    ↓
Navigate to FlightSelection with results
    ↓
Display flights with all filters/sorting intact
```

---

## 🎯 EXECUTION ORDER

1. **Prompt 1.1** → Create Flight Model
2. **Prompt 1.2** → Create Flight Controller
3. **Prompt 1.3** → Create Flight Routes
4. **Prompt 1.4** → Register Routes in Server
5. **Prompt 1.5** → Seed Database
6. **Prompt 2.1** → Create API Client Methods
7. **Prompt 2.2** → Update HomePage
8. **Prompt 2.3** → Update FlightSelection
9. **Prompt 2.4** → Test Everything

---

## ✅ SUCCESS CRITERIA

- [x] Backend and frontend communicate via REST API
- [x] HomePage city dropdowns pull from database
- [x] FlightSelection displays database flights
- [x] All filters and sorting work with real data
- [x] No console errors
- [x] No breaking of existing UI/UX
- [x] Pagination works
- [x] Prices calculated correctly
- [x] 12 flights seeded and accessible
- [x] Ready for Phase 3 (Passenger Details)

