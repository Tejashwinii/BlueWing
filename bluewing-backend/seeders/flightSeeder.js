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
  const columns = ['A', 'B', 'C', 'D', 'E', 'F'];
  
  // First Class seats (rows 1-2)
  for (let i = 0; i < firstClassSeats; i++) {
    const row = Math.floor(i / 4) + 1; // 4 seats per row in first class
    const column = ['A', 'C', 'D', 'F'][i % 4];
    seats.push({
      seatId: `${row}${column}`,
      row: row,
      column: column,
      cabin: 'firstClass',
      isBooked: false,
      bookedBy: null,
      bookingId: null,
    });
  }
  
  // Business Class seats (rows 3-7)
  const businessStartRow = 3;
  for (let i = 0; i < businessSeats; i++) {
    const row = Math.floor(i / 4) + businessStartRow;
    const column = ['A', 'C', 'D', 'F'][i % 4];
    seats.push({
      seatId: `${row}${column}`,
      row: row,
      column: column,
      cabin: 'business',
      isBooked: false,
      bookedBy: null,
      bookingId: null,
    });
  }
  
  // Economy Class seats
  const economyStartRow = businessStartRow + Math.ceil(businessSeats / 4) + 1;
  for (let i = 0; i < economySeats; i++) {
    const row = Math.floor(i / 6) + economyStartRow;
    const column = columns[i % 6];
    seats.push({
      seatId: `${row}${column}`,
      row: row,
      column: column,
      cabin: 'economy',
      isBooked: false,
      bookedBy: null,
      bookingId: null,
    });
  }

  return seats;
};


/**
 * Create flights from frontend dummyFlights data - EXACT SAME DATA
 * This ensures frontend and backend are in sync
 * ALL DATES SET TO JULY 1ST, 2026
 */
const createFlights = () => {
  // All flights on July 1st, 2026
  const FLIGHT_DATE = "2026-07-01";
  
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
      departureDate: FLIGHT_DATE,
      price: 1300,
      duration: "1h 15m",
      stops: 0,
      economySeats: 90,
      businessSeats: 18,
      firstClassSeats: 8,
      economyPrice: 1300,
      businessPrice: 2800,
      firstClassPrice: 4500,
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
      departureDate: FLIGHT_DATE,
      price: 1400,
      duration: "1h 15m",
      stops: 0,
      economySeats: 90,
      businessSeats: 18,
      firstClassSeats: 8,
      economyPrice: 1400,
      businessPrice: 2900,
      firstClassPrice: 4600,
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
      departureDate: FLIGHT_DATE,
      price: 1500,
      duration: "1h 15m",
      stops: 0,
      economySeats: 90,
      businessSeats: 18,
      firstClassSeats: 8,
      economyPrice: 1500,
      businessPrice: 3000,
      firstClassPrice: 4700,
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
      departureDate: FLIGHT_DATE,
      price: 1350,
      duration: "1h 15m",
      stops: 0,
      economySeats: 90,
      businessSeats: 18,
      firstClassSeats: 8,
      economyPrice: 1350,
      businessPrice: 2850,
      firstClassPrice: 4550,
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
      departureDate: FLIGHT_DATE,
      price: 1400,
      duration: "1h 15m",
      stops: 0,
      economySeats: 90,
      businessSeats: 18,
      firstClassSeats: 8,
      economyPrice: 1400,
      businessPrice: 2900,
      firstClassPrice: 4600,
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
      departureDate: FLIGHT_DATE,
      price: 1450,
      duration: "1h 15m",
      stops: 0,
      economySeats: 90,
      businessSeats: 18,
      firstClassSeats: 8,
      economyPrice: 1450,
      businessPrice: 2950,
      firstClassPrice: 4650,
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
      departureDate: FLIGHT_DATE,
      price: 2200,
      duration: "1h 45m",
      stops: 0,
      economySeats: 120,
      businessSeats: 25,
      firstClassSeats: 12,
      economyPrice: 2200,
      businessPrice: 4200,
      firstClassPrice: 6500,
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
      departureDate: FLIGHT_DATE,
      price: 2400,
      duration: "1h 45m",
      stops: 0,
      economySeats: 120,
      businessSeats: 25,
      firstClassSeats: 12,
      economyPrice: 2400,
      businessPrice: 4400,
      firstClassPrice: 6700,
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
      departureDate: FLIGHT_DATE,
      price: 2300,
      duration: "1h 45m",
      stops: 0,
      economySeats: 120,
      businessSeats: 25,
      firstClassSeats: 12,
      economyPrice: 2300,
      businessPrice: 4300,
      firstClassPrice: 6600,
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
      departureDate: FLIGHT_DATE,
      price: 2500,
      duration: "1h 45m",
      stops: 0,
      economySeats: 120,
      businessSeats: 25,
      firstClassSeats: 12,
      economyPrice: 2500,
      businessPrice: 4500,
      firstClassPrice: 6800,
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
      departureDate: FLIGHT_DATE,
      price: 4500,
      duration: "2h 55m",
      stops: 0,
      economySeats: 110,
      businessSeats: 22,
      firstClassSeats: 10,
      economyPrice: 4500,
      businessPrice: 7000,
      firstClassPrice: 10000,
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
      departureDate: FLIGHT_DATE,
      price: 4800,
      duration: "2h 55m",
      stops: 0,
      economySeats: 110,
      businessSeats: 22,
      firstClassSeats: 10,
      economyPrice: 4800,
      businessPrice: 7300,
      firstClassPrice: 10300,
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
      departureDate: FLIGHT_DATE,
      price: 4600,
      duration: "2h 55m",
      stops: 0,
      economySeats: 110,
      businessSeats: 22,
      firstClassSeats: 10,
      economyPrice: 4600,
      businessPrice: 7100,
      firstClassPrice: 10100,
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
      departureDate: FLIGHT_DATE,
      price: 4900,
      duration: "2h 55m",
      stops: 0,
      economySeats: 110,
      businessSeats: 22,
      firstClassSeats: 10,
      economyPrice: 4900,
      businessPrice: 7400,
      firstClassPrice: 10400,
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
      departureDate: FLIGHT_DATE,
      price: 1700,
      duration: "1h 20m",
      stops: 0,
      economySeats: 85,
      businessSeats: 15,
      firstClassSeats: 6,
      economyPrice: 1700,
      businessPrice: 3200,
      firstClassPrice: 5200,
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
      departureDate: FLIGHT_DATE,
      price: 1750,
      duration: "1h 20m",
      stops: 0,
      economySeats: 85,
      businessSeats: 15,
      firstClassSeats: 6,
      economyPrice: 1750,
      businessPrice: 3250,
      firstClassPrice: 5250,
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
      departureDate: FLIGHT_DATE,
      price: 1900,
      duration: "1h 15m",
      stops: 0,
      economySeats: 100,
      businessSeats: 20,
      firstClassSeats: 8,
      economyPrice: 1900,
      businessPrice: 3500,
      firstClassPrice: 5800,
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
      departureDate: FLIGHT_DATE,
      price: 1950,
      duration: "1h 15m",
      stops: 0,
      economySeats: 100,
      businessSeats: 20,
      firstClassSeats: 8,
      economyPrice: 1950,
      businessPrice: 3550,
      firstClassPrice: 5850,
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
      departureDate: FLIGHT_DATE,
      price: 1200,
      duration: "55m",
      stops: 0,
      economySeats: 95,
      businessSeats: 16,
      firstClassSeats: 6,
      economyPrice: 1200,
      businessPrice: 2500,
      firstClassPrice: 4000,
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
      departureDate: FLIGHT_DATE,
      price: 1250,
      duration: "55m",
      stops: 0,
      economySeats: 95,
      businessSeats: 16,
      firstClassSeats: 6,
      economyPrice: 1250,
      businessPrice: 2550,
      firstClassPrice: 4050,
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
      departureDate: FLIGHT_DATE,
      price: 2100,
      duration: "1h 30m",
      stops: 0,
      economySeats: 105,
      businessSeats: 18,
      firstClassSeats: 9,
      economyPrice: 2100,
      businessPrice: 3900,
      firstClassPrice: 6200,
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
      departureDate: FLIGHT_DATE,
      price: 2150,
      duration: "1h 30m",
      stops: 0,
      economySeats: 105,
      businessSeats: 18,
      firstClassSeats: 9,
      economyPrice: 2150,
      businessPrice: 3950,
      firstClassPrice: 6250,
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
      departureDate: FLIGHT_DATE,
      price: 1800,
      duration: "1h 20m",
      stops: 0,
      economySeats: 98,
      businessSeats: 17,
      firstClassSeats: 7,
      economyPrice: 1800,
      businessPrice: 3400,
      firstClassPrice: 5600,
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
      departureDate: FLIGHT_DATE,
      price: 1850,
      duration: "1h 20m",
      stops: 0,
      economySeats: 98,
      businessSeats: 17,
      firstClassSeats: 7,
      economyPrice: 1850,
      businessPrice: 3450,
      firstClassPrice: 5650,
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
      departureDate: FLIGHT_DATE,
      price: 4800,
      duration: "2h 30m",
      stops: 0,
      economySeats: 115,
      businessSeats: 24,
      firstClassSeats: 11,
      economyPrice: 4800,
      businessPrice: 7200,
      firstClassPrice: 10500,
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
      departureDate: FLIGHT_DATE,
      price: 4900,
      duration: "2h 30m",
      stops: 0,
      economySeats: 115,
      businessSeats: 24,
      firstClassSeats: 11,
      economyPrice: 4900,
      businessPrice: 7300,
      firstClassPrice: 10600,
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
      departureDate: FLIGHT_DATE,
      price: 1600,
      duration: "1h 5m",
      stops: 0,
      economySeats: 90,
      businessSeats: 15,
      firstClassSeats: 6,
      economyPrice: 1600,
      businessPrice: 3000,
      firstClassPrice: 4800,
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
      departureDate: FLIGHT_DATE,
      price: 1650,
      duration: "1h 5m",
      stops: 0,
      economySeats: 90,
      businessSeats: 15,
      firstClassSeats: 6,
      economyPrice: 1650,
      businessPrice: 3050,
      firstClassPrice: 4850,
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
      departureDate: FLIGHT_DATE,
      price: 2050,
      duration: "1h 20m",
      stops: 0,
      economySeats: 97,
      businessSeats: 18,
      firstClassSeats: 8,
      economyPrice: 2050,
      businessPrice: 3850,
      firstClassPrice: 6250,
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
      departureDate: FLIGHT_DATE,
      price: 2000,
      duration: "1h 20m",
      stops: 0,
      economySeats: 97,
      businessSeats: 18,
      firstClassSeats: 8,
      economyPrice: 2000,
      businessPrice: 3800,
      firstClassPrice: 6200,
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
      departureDate: FLIGHT_DATE,
      price: 4200,
      duration: "2h 30m",
      stops: 0,
      economySeats: 110,
      businessSeats: 22,
      firstClassSeats: 10,
      economyPrice: 4200,
      businessPrice: 6700,
      firstClassPrice: 9700,
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
      departureDate: FLIGHT_DATE,
      price: 4300,
      duration: "2h 30m",
      stops: 0,
      economySeats: 110,
      businessSeats: 22,
      firstClassSeats: 10,
      economyPrice: 4300,
      businessPrice: 6800,
      firstClassPrice: 9800,
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
 * Seed database with flights - ALL ON JULY 1ST, 2026
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
    console.log('   All flights on: July 1st, 2026');
    
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
