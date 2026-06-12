import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Flight from '../models/Flight.js';

dotenv.config();

/**
 * Generate seat objects for a flight based on seat counts
 * @param {number} economySeats - Number of economy seats
 * @param {number} businessSeats - Number of business seats
 * @param {number} firstClassSeats - Number of first class seats
 * @returns {array} Array of seat objects
 */
const generateSeats = (economySeats, businessSeats, firstClassSeats) => {
  const seats = [];
  
  // FIXED SEAT LAYOUT:
  // First Class: rows a, b, c (3 rows × 3 seats = 9 seats)
  // Business: rows d, e, f, g, h, i (6 rows × 5 seats = 30 seats)
  // Economy: rows j to z (17 rows × 9 seats = 153 seats)
  
  // First Class: rows a, b, c with 3 seats each (1, 2, 3)
  const firstClassRows = ['a', 'b', 'c'];
  const firstClassSeatsPerRow = 3;
  
  for (const row of firstClassRows) {
    for (let col = 1; col <= firstClassSeatsPerRow; col++) {
      seats.push({
        seatId: `${col}${row}`,
        row: row,
        column: col,
        cabin: 'firstClass',
        isBooked: false,
        bookedBy: null,
        bookingId: null,
      });
    }
  }
  
  // Business Class: rows d, e, f, g, h, i with 5 seats each (1, 2, 3, 4, 5)
  const businessRows = ['d', 'e', 'f', 'g', 'h', 'i'];
  const businessSeatsPerRow = 5;
  
  for (const row of businessRows) {
    for (let col = 1; col <= businessSeatsPerRow; col++) {
      seats.push({
        seatId: `${col}${row}`,
        row: row,
        column: col,
        cabin: 'business',
        isBooked: false,
        bookedBy: null,
        bookingId: null,
      });
    }
  }
  
  // Economy Class: rows j to z with 9 seats each (1, 2, 3, 4, 5, 6, 7, 8, 9)
  const economyRows = ['j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
  const economySeatsPerRow = 9;
  
  for (const row of economyRows) {
    for (let col = 1; col <= economySeatsPerRow; col++) {
      seats.push({
        seatId: `${col}${row}`,
        row: row,
        column: col,
        cabin: 'economy',
        isBooked: false,
        bookedBy: null,
        bookingId: null,
      });
    }
  }
  
  return seats;
  // Total seats: 9 (first) + 30 (business) + 153 (economy) = 192 seats per flight
};

/**
 * Create flights from frontend dummyFlights data
 */
const createFlights = () => {
  const rawDummyFlights = [
    // === HYDERABAD → CHENNAI (3 flights) ===
    {
      id: 1,
      airline: "BlueWing Airlines",
      flightNumber: "BW201",
      from: "Hyderabad",
      to: "Chennai",
      departureTime: "06:30 AM",
      arrivalTime: "07:45 AM",
      departureDate: "2026-06-19",
      price: 2500,
      duration: "1h 15m",
      stops: 0,
      economySeats: 90,
      businessSeats: 18,
      firstClassSeats: 8,
      economyPrice: 2500,
      businessPrice: 4200,
      firstClassPrice: 6500,
      rating: 4.5,
      amenities: ['WiFi', 'Meals', 'USB Charging'],
    },
    {
      id: 2,
      airline: "BlueWing Airlines",
      flightNumber: "BW216",
      from: "Hyderabad",
      to: "Chennai",
      departureTime: "12:00 PM",
      arrivalTime: "01:15 PM",
      departureDate: "2026-06-19",
      price: 2700,
      duration: "1h 15m",
      stops: 0,
      economySeats: 90,
      businessSeats: 18,
      firstClassSeats: 8,
      economyPrice: 2700,
      businessPrice: 4400,
      firstClassPrice: 6700,
      rating: 4.6,
      amenities: ['WiFi', 'Entertainment System', 'Meals'],
    },
    {
      id: 3,
      airline: "BlueWing Airlines",
      flightNumber: "BW217",
      from: "Hyderabad",
      to: "Chennai",
      departureTime: "06:00 PM",
      arrivalTime: "07:15 PM",
      departureDate: "2026-06-19",
      price: 2900,
      duration: "1h 15m",
      stops: 0,
      economySeats: 90,
      businessSeats: 18,
      firstClassSeats: 8,
      economyPrice: 2900,
      businessPrice: 4600,
      firstClassPrice: 6900,
      rating: 4.7,
      amenities: ['WiFi', 'Meals', 'Power Outlet'],
    },
    // === CHENNAI → HYDERABAD (3 flights) ===
    {
      id: 4,
      airline: "BlueWing Airlines",
      flightNumber: "BW218",
      from: "Chennai",
      to: "Hyderabad",
      departureTime: "08:00 AM",
      arrivalTime: "09:15 AM",
      departureDate: "2026-06-19",
      price: 2600,
      duration: "1h 15m",
      stops: 0,
      economySeats: 90,
      businessSeats: 18,
      firstClassSeats: 8,
      economyPrice: 2600,
      businessPrice: 4300,
      firstClassPrice: 6600,
      rating: 4.4,
      amenities: ['WiFi', 'Meals', 'USB Charging'],
    },
    {
      id: 5,
      airline: "BlueWing Airlines",
      flightNumber: "BW219",
      from: "Chennai",
      to: "Hyderabad",
      departureTime: "02:00 PM",
      arrivalTime: "03:15 PM",
      departureDate: "2026-06-19",
      price: 2800,
      duration: "1h 15m",
      stops: 0,
      economySeats: 90,
      businessSeats: 18,
      firstClassSeats: 8,
      economyPrice: 2800,
      businessPrice: 4500,
      firstClassPrice: 6800,
      rating: 4.5,
      amenities: ['WiFi', 'Entertainment System', 'Meals'],
    },
    {
      id: 6,
      airline: "BlueWing Airlines",
      flightNumber: "BW220",
      from: "Chennai",
      to: "Hyderabad",
      departureTime: "08:00 PM",
      arrivalTime: "09:15 PM",
      departureDate: "2026-06-19",
      price: 3000,
      duration: "1h 15m",
      stops: 0,
      economySeats: 90,
      businessSeats: 18,
      firstClassSeats: 8,
      economyPrice: 3000,
      businessPrice: 4700,
      firstClassPrice: 7000,
      rating: 4.6,
      amenities: ['WiFi', 'Meals', 'Power Outlet'],
    },
    // === HYDERABAD → MUMBAI ===
    {
      id: 7,
      airline: "BlueWing Airlines",
      flightNumber: "BW202",
      from: "Hyderabad",
      to: "Mumbai",
      departureTime: "08:00 AM",
      arrivalTime: "09:45 AM",
      departureDate: "2026-06-20",
      price: 3200,
      duration: "1h 45m",
      stops: 0,
      economySeats: 120,
      businessSeats: 25,
      firstClassSeats: 12,
      economyPrice: 3200,
      businessPrice: 5800,
      firstClassPrice: 8200,
      rating: 4.3,
      amenities: ['WiFi', 'Entertainment System', 'Power Outlet'],
    },
    {
      id: 8,
      airline: "BlueWing Airlines",
      flightNumber: "BW221",
      from: "Hyderabad",
      to: "Mumbai",
      departureTime: "04:00 PM",
      arrivalTime: "05:45 PM",
      departureDate: "2026-06-20",
      price: 3500,
      duration: "1h 45m",
      stops: 0,
      economySeats: 120,
      businessSeats: 25,
      firstClassSeats: 12,
      economyPrice: 3500,
      businessPrice: 6100,
      firstClassPrice: 8500,
      rating: 4.5,
      amenities: ['WiFi', 'Meals', 'USB Charging'],
    },
    // === MUMBAI → HYDERABAD ===
    {
      id: 9,
      airline: "BlueWing Airlines",
      flightNumber: "BW222",
      from: "Mumbai",
      to: "Hyderabad",
      departureTime: "10:00 AM",
      arrivalTime: "11:45 AM",
      departureDate: "2026-06-20",
      price: 3300,
      duration: "1h 45m",
      stops: 0,
      economySeats: 120,
      businessSeats: 25,
      firstClassSeats: 12,
      economyPrice: 3300,
      businessPrice: 5900,
      firstClassPrice: 8300,
      rating: 4.5,
      amenities: ['WiFi', 'Entertainment System', 'Power Outlet'],
    },
    {
      id: 10,
      airline: "BlueWing Airlines",
      flightNumber: "BW223",
      from: "Mumbai",
      to: "Hyderabad",
      departureTime: "06:00 PM",
      arrivalTime: "07:45 PM",
      departureDate: "2026-06-20",
      price: 3600,
      duration: "1h 45m",
      stops: 0,
      economySeats: 120,
      businessSeats: 25,
      firstClassSeats: 12,
      economyPrice: 3600,
      businessPrice: 6200,
      firstClassPrice: 8600,
      rating: 4.4,
      amenities: ['WiFi', 'Meals', 'Blanket & Pillow'],
    },
    // === BANGALORE → DELHI ===
    {
      id: 11,
      airline: "BlueWing Airlines",
      flightNumber: "BW203",
      from: "Bangalore",
      to: "Delhi",
      departureTime: "09:15 AM",
      arrivalTime: "12:10 PM",
      departureDate: "2026-06-20",
      price: 5200,
      duration: "2h 55m",
      stops: 0,
      economySeats: 110,
      businessSeats: 22,
      firstClassSeats: 10,
      economyPrice: 5200,
      businessPrice: 7800,
      firstClassPrice: 10500,
      rating: 4.6,
      amenities: ['WiFi', 'Meals', 'Blanket & Pillow'],
    },
    {
      id: 12,
      airline: "BlueWing Airlines",
      flightNumber: "BW224",
      from: "Bangalore",
      to: "Delhi",
      departureTime: "03:00 PM",
      arrivalTime: "05:55 PM",
      departureDate: "2026-06-20",
      price: 5500,
      duration: "2h 55m",
      stops: 0,
      economySeats: 110,
      businessSeats: 22,
      firstClassSeats: 10,
      economyPrice: 5500,
      businessPrice: 8100,
      firstClassPrice: 10800,
      rating: 4.7,
      amenities: ['WiFi', 'Entertainment System', 'Power Outlet'],
    },
    // === DELHI → BANGALORE ===
    {
      id: 13,
      airline: "BlueWing Airlines",
      flightNumber: "BW225",
      from: "Delhi",
      to: "Bangalore",
      departureTime: "07:00 AM",
      arrivalTime: "09:55 AM",
      departureDate: "2026-06-21",
      price: 5300,
      duration: "2h 55m",
      stops: 0,
      economySeats: 110,
      businessSeats: 22,
      firstClassSeats: 10,
      economyPrice: 5300,
      businessPrice: 7900,
      firstClassPrice: 10600,
      rating: 4.7,
      amenities: ['WiFi', 'Meals', 'Blanket & Pillow'],
    },
    {
      id: 14,
      airline: "BlueWing Airlines",
      flightNumber: "BW226",
      from: "Delhi",
      to: "Bangalore",
      departureTime: "05:00 PM",
      arrivalTime: "07:55 PM",
      departureDate: "2026-06-21",
      price: 5600,
      duration: "2h 55m",
      stops: 0,
      economySeats: 110,
      businessSeats: 22,
      firstClassSeats: 10,
      economyPrice: 5600,
      businessPrice: 8200,
      firstClassPrice: 10900,
      rating: 4.8,
      amenities: ['WiFi', 'Entertainment System', 'Meals'],
    },
    // === CHENNAI → KOCHI ===
    {
      id: 15,
      airline: "BlueWing Airlines",
      flightNumber: "BW204",
      from: "Chennai",
      to: "Kochi",
      departureTime: "11:00 AM",
      arrivalTime: "12:20 PM",
      departureDate: "2026-06-21",
      price: 2600,
      duration: "1h 20m",
      stops: 0,
      economySeats: 85,
      businessSeats: 15,
      firstClassSeats: 6,
      economyPrice: 2600,
      businessPrice: 4200,
      firstClassPrice: 6400,
      rating: 4.4,
      amenities: ['WiFi', 'Meals', 'USB Charging'],
    },
    // === KOCHI → CHENNAI ===
    {
      id: 16,
      airline: "BlueWing Airlines",
      flightNumber: "BW227",
      from: "Kochi",
      to: "Chennai",
      departureTime: "01:00 PM",
      arrivalTime: "02:20 PM",
      departureDate: "2026-06-21",
      price: 2800,
      duration: "1h 20m",
      stops: 0,
      economySeats: 85,
      businessSeats: 15,
      firstClassSeats: 6,
      economyPrice: 2800,
      businessPrice: 4400,
      firstClassPrice: 6600,
      rating: 4.3,
      amenities: ['WiFi', 'Meals', 'USB Charging'],
    },
    // === MUMBAI → GOA ===
    {
      id: 17,
      airline: "BlueWing Airlines",
      flightNumber: "BW205",
      from: "Mumbai",
      to: "Goa",
      departureTime: "01:30 PM",
      arrivalTime: "02:45 PM",
      departureDate: "2026-06-21",
      price: 2700,
      duration: "1h 15m",
      stops: 0,
      economySeats: 100,
      businessSeats: 20,
      firstClassSeats: 8,
      economyPrice: 2700,
      businessPrice: 4500,
      firstClassPrice: 6800,
      rating: 4.5,
      amenities: ['WiFi', 'Entertainment System', 'Meals'],
    },
    // === GOA → MUMBAI ===
    {
      id: 18,
      airline: "BlueWing Airlines",
      flightNumber: "BW228",
      from: "Goa",
      to: "Mumbai",
      departureTime: "04:00 PM",
      arrivalTime: "05:15 PM",
      departureDate: "2026-06-21",
      price: 2900,
      duration: "1h 15m",
      stops: 0,
      economySeats: 100,
      businessSeats: 20,
      firstClassSeats: 8,
      economyPrice: 2900,
      businessPrice: 4700,
      firstClassPrice: 7000,
      rating: 4.4,
      amenities: ['WiFi', 'Entertainment System', 'Meals'],
    },
    // === DELHI → JAIPUR ===
    {
      id: 19,
      airline: "BlueWing Airlines",
      flightNumber: "BW206",
      from: "Delhi",
      to: "Jaipur",
      departureTime: "03:00 PM",
      arrivalTime: "03:55 PM",
      departureDate: "2026-06-22",
      price: 2500,
      duration: "55m",
      stops: 0,
      economySeats: 95,
      businessSeats: 16,
      firstClassSeats: 6,
      economyPrice: 2500,
      businessPrice: 4100,
      firstClassPrice: 6200,
      rating: 4.2,
      amenities: ['WiFi', 'Snacks', 'USB Charging'],
    },
    // === JAIPUR → DELHI ===
    {
      id: 20,
      airline: "BlueWing Airlines",
      flightNumber: "BW229",
      from: "Jaipur",
      to: "Delhi",
      departureTime: "05:00 PM",
      arrivalTime: "05:55 PM",
      departureDate: "2026-06-22",
      price: 2600,
      duration: "55m",
      stops: 0,
      economySeats: 95,
      businessSeats: 16,
      firstClassSeats: 6,
      economyPrice: 2600,
      businessPrice: 4200,
      firstClassPrice: 6300,
      rating: 4.3,
      amenities: ['WiFi', 'Snacks', 'USB Charging'],
    },
    // === PUNE → BANGALORE ===
    {
      id: 21,
      airline: "BlueWing Airlines",
      flightNumber: "BW207",
      from: "Pune",
      to: "Bangalore",
      departureTime: "04:20 PM",
      arrivalTime: "05:50 PM",
      departureDate: "2026-06-22",
      price: 3100,
      duration: "1h 30m",
      stops: 0,
      economySeats: 105,
      businessSeats: 18,
      firstClassSeats: 9,
      economyPrice: 3100,
      businessPrice: 5600,
      firstClassPrice: 8100,
      rating: 4.7,
      amenities: ['WiFi', 'Meals', 'Power Outlet'],
    },
    // === BANGALORE → PUNE ===
    {
      id: 22,
      airline: "BlueWing Airlines",
      flightNumber: "BW230",
      from: "Bangalore",
      to: "Pune",
      departureTime: "06:00 PM",
      arrivalTime: "07:30 PM",
      departureDate: "2026-06-22",
      price: 3400,
      duration: "1h 30m",
      stops: 0,
      economySeats: 105,
      businessSeats: 18,
      firstClassSeats: 9,
      economyPrice: 3400,
      businessPrice: 5900,
      firstClassPrice: 8400,
      rating: 4.6,
      amenities: ['WiFi', 'Meals', 'Power Outlet'],
    },
    // === HYDERABAD → PUNE ===
    {
      id: 23,
      airline: "BlueWing Airlines",
      flightNumber: "BW208",
      from: "Hyderabad",
      to: "Pune",
      departureTime: "06:00 PM",
      arrivalTime: "07:20 PM",
      departureDate: "2026-06-22",
      price: 3200,
      duration: "1h 20m",
      stops: 0,
      economySeats: 98,
      businessSeats: 17,
      firstClassSeats: 7,
      economyPrice: 3200,
      businessPrice: 5700,
      firstClassPrice: 8200,
      rating: 4.4,
      amenities: ['WiFi', 'Entertainment System', 'USB Charging'],
    },
    // === PUNE → HYDERABAD ===
    {
      id: 24,
      airline: "BlueWing Airlines",
      flightNumber: "BW231",
      from: "Pune",
      to: "Hyderabad",
      departureTime: "08:00 PM",
      arrivalTime: "09:20 PM",
      departureDate: "2026-06-22",
      price: 3500,
      duration: "1h 20m",
      stops: 0,
      economySeats: 98,
      businessSeats: 17,
      firstClassSeats: 7,
      economyPrice: 3500,
      businessPrice: 6000,
      firstClassPrice: 8500,
      rating: 4.5,
      amenities: ['WiFi', 'Entertainment System', 'USB Charging'],
    },
    // === KOLKATA → DELHI ===
    {
      id: 25,
      airline: "BlueWing Airlines",
      flightNumber: "BW209",
      from: "Kolkata",
      to: "Delhi",
      departureTime: "07:45 PM",
      arrivalTime: "10:15 PM",
      departureDate: "2026-06-23",
      price: 5100,
      duration: "2h 30m",
      stops: 0,
      economySeats: 115,
      businessSeats: 24,
      firstClassSeats: 11,
      economyPrice: 5100,
      businessPrice: 7600,
      firstClassPrice: 10200,
      rating: 4.8,
      amenities: ['WiFi', 'Meals', 'Blanket & Pillow'],
    },
    // === DELHI → KOLKATA ===
    {
      id: 26,
      airline: "BlueWing Airlines",
      flightNumber: "BW232",
      from: "Delhi",
      to: "Kolkata",
      departureTime: "06:00 AM",
      arrivalTime: "08:30 AM",
      departureDate: "2026-06-23",
      price: 5400,
      duration: "2h 30m",
      stops: 0,
      economySeats: 115,
      businessSeats: 24,
      firstClassSeats: 11,
      economyPrice: 5400,
      businessPrice: 7900,
      firstClassPrice: 10500,
      rating: 4.7,
      amenities: ['WiFi', 'Meals', 'Blanket & Pillow'],
    },
    // === AHMEDABAD → MUMBAI ===
    {
      id: 27,
      airline: "BlueWing Airlines",
      flightNumber: "BW210",
      from: "Ahmedabad",
      to: "Mumbai",
      departureTime: "09:00 PM",
      arrivalTime: "10:05 PM",
      departureDate: "2026-06-23",
      price: 2600,
      duration: "1h 5m",
      stops: 0,
      economySeats: 90,
      businessSeats: 15,
      firstClassSeats: 6,
      economyPrice: 2600,
      businessPrice: 4300,
      firstClassPrice: 6500,
      rating: 4.3,
      amenities: ['WiFi', 'Snacks', 'USB Charging'],
    },
    // === MUMBAI → AHMEDABAD ===
    {
      id: 28,
      airline: "BlueWing Airlines",
      flightNumber: "BW233",
      from: "Mumbai",
      to: "Ahmedabad",
      departureTime: "07:00 AM",
      arrivalTime: "08:05 AM",
      departureDate: "2026-06-23",
      price: 2800,
      duration: "1h 5m",
      stops: 0,
      economySeats: 90,
      businessSeats: 15,
      firstClassSeats: 6,
      economyPrice: 2800,
      businessPrice: 4500,
      firstClassPrice: 6700,
      rating: 4.4,
      amenities: ['WiFi', 'Snacks', 'USB Charging'],
    },
    // === HYDERABAD → GOA ===
    {
      id: 29,
      airline: "BlueWing Airlines",
      flightNumber: "BW214",
      from: "Hyderabad",
      to: "Goa",
      departureTime: "11:00 AM",
      arrivalTime: "12:20 PM",
      departureDate: "2026-06-23",
      price: 2700,
      duration: "1h 20m",
      stops: 0,
      economySeats: 97,
      businessSeats: 18,
      firstClassSeats: 8,
      economyPrice: 2700,
      businessPrice: 4400,
      firstClassPrice: 6600,
      rating: 4.5,
      amenities: ['WiFi', 'Meals', 'Entertainment System'],
    },
    // === GOA → HYDERABAD ===
    {
      id: 30,
      airline: "BlueWing Airlines",
      flightNumber: "BW234",
      from: "Goa",
      to: "Hyderabad",
      departureTime: "02:30 PM",
      arrivalTime: "03:50 PM",
      departureDate: "2026-06-23",
      price: 2900,
      duration: "1h 20m",
      stops: 0,
      economySeats: 97,
      businessSeats: 18,
      firstClassSeats: 8,
      economyPrice: 2900,
      businessPrice: 4600,
      firstClassPrice: 6800,
      rating: 4.6,
      amenities: ['WiFi', 'Meals', 'Entertainment System'],
    },
    // === HYDERABAD → DELHI ===
    {
      id: 31,
      airline: "BlueWing Airlines",
      flightNumber: "BW235",
      from: "Hyderabad",
      to: "Delhi",
      departureTime: "07:00 AM",
      arrivalTime: "09:30 AM",
      departureDate: "2026-06-23",
      price: 5300,
      duration: "2h 30m",
      stops: 0,
      economySeats: 110,
      businessSeats: 22,
      firstClassSeats: 10,
      economyPrice: 5300,
      businessPrice: 7800,
      firstClassPrice: 10400,
      rating: 4.5,
      amenities: ['WiFi', 'Meals', 'Power Outlet'],
    },
    // === DELHI → HYDERABAD ===
    {
      id: 32,
      airline: "BlueWing Airlines",
      flightNumber: "BW236",
      from: "Delhi",
      to: "Hyderabad",
      departureTime: "10:00 AM",
      arrivalTime: "12:30 PM",
      departureDate: "2026-06-23",
      price: 5600,
      duration: "2h 30m",
      stops: 0,
      economySeats: 110,
      businessSeats: 22,
      firstClassSeats: 10,
      economyPrice: 5600,
      businessPrice: 8100,
      firstClassPrice: 10700,
      rating: 4.6,
      amenities: ['WiFi', 'Entertainment System', 'Meals'],
    },
  ];

  // Convert to database format with seats
  return rawDummyFlights.map(flight => ({
    flightNumber: flight.flightNumber,
    from: flight.from,
    to: flight.to,
    departureDate: new Date(flight.departureDate),
    departureTime: flight.departureTime,
    arrivalTime: flight.arrivalTime,
    duration: flight.duration,
    economyPrice: flight.economyPrice,
    businessPrice: flight.businessPrice,
    firstClassPrice: flight.firstClassPrice,
    stops: flight.stops,
    airline: flight.airline,
    rating: flight.rating,
    amenities: flight.amenities,
    seats: generateSeats(flight.economySeats, flight.businessSeats, flight.firstClassSeats),
  }));
};

/**
 * Seed database with flights
 */
const seedFlights = async () => {
  try {
    // Connect to MongoDB
    console.log('\n📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bluewing');
    console.log('✅ MongoDB connected');

    // Drop existing flights collection
    console.log('\n🗑️  Clearing existing flights...');
    await Flight.deleteMany({});
    console.log('✅ Flights cleared');

    // Create flights with embedded seats
    const flights = createFlights();

    // Insert flights into database
    console.log('\n✈️  Seeding flights...');
    const seededFlights = await Flight.insertMany(flights);
    console.log(`✅ Successfully seeded ${seededFlights.length} flights`);

    // Show routes summary
    console.log('\n📊 Seeding Statistics:');
    console.log(`   Total flights: ${seededFlights.length}`);
    
    // Group by route
    const routes = {};
    seededFlights.forEach((flight) => {
      const route = `${flight.from} → ${flight.to}`;
      if (!routes[route]) routes[route] = [];
      routes[route].push(flight.flightNumber);
    });
    
    console.log('\n🛫 Available Routes:');
    Object.keys(routes).sort().forEach(route => {
      console.log(`   ${route}: ${routes[route].join(', ')}`);
    });

    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Seeding completed successfully!');
    console.log('📌 You can now run: npm run dev');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

// Run seeder
seedFlights();
