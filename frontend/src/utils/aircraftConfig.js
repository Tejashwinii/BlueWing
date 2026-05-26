/**
 * Aircraft Configuration
 * Defines cabin layouts, seat matrices, walkways, and washroom positions
 * for flexible aircraft rendering.
 */

const CABIN_TYPES = {
  FIRST_CLASS: "first-class",
  BUSINESS: "business",
  ECONOMY: "economy",
};

const SEAT_COLUMNS = {
  FIRST_CLASS: 3,
  BUSINESS: 4,
  ECONOMY: 9,
};

/**
 * Cabin configuration defining seat layout, rows, and structure
 */
const CABIN_CONFIG = {
  [CABIN_TYPES.FIRST_CLASS]: {
    id: CABIN_TYPES.FIRST_CLASS,
    label: "First Class",
    rows: ["a", "b", "c"],
    seatsPerRow: SEAT_COLUMNS.FIRST_CLASS,
    layout: {
      sections: [
        {
          columns: [1],
          gap: "walkway",
        },
        {
          columns: [2],
          gap: "walkway",
        },
        {
          columns: [3],
        },
      ],
    },
    order: 0,
  },
  [CABIN_TYPES.BUSINESS]: {
    id: CABIN_TYPES.BUSINESS,
    label: "Business",
    rows: ["d", "e", "f", "g", "h", "i"],
    seatsPerRow: SEAT_COLUMNS.BUSINESS,
    layout: {
      sections: [
        {
          columns: [1],
          gap: "walkway",
        },
        {
          columns: [2, 3],
          gap: "walkway",
        },
        {
          columns: [4, 5],
        },
      ],
    },
    order: 1,
  },
  [CABIN_TYPES.ECONOMY]: {
    id: CABIN_TYPES.ECONOMY,
    label: "Economy",
    rows: ["j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"],
    seatsPerRow: SEAT_COLUMNS.ECONOMY,
    layout: {
      sections: [
        {
          columns: [1, 2, 3],
          gap: "walkway",
        },
        {
          columns: [4, 5, 6],
          gap: "walkway",
        },
        {
          columns: [7, 8, 9],
        },
      ],
    },
    washrooms: {
      after: ["n", "t"],
    },
    order: 2,
  },
};

/**
 * Generate a 2D seat matrix for a cabin
 * @param {string} cabinType - Cabin type (first-class, business, economy)
 * @param {object} bookedSeats - Map of booked seats { "a1": true, ... }
 * @returns {object} Seat matrix with row as key, array of booleans as value
 */
const generateSeatMatrix = (cabinType, bookedSeats = {}) => {
  const cabin = CABIN_CONFIG[cabinType];
  if (!cabin) {
    throw new Error(`Invalid cabin type: ${cabinType}`);
  }

  const matrix = {};
  cabin.rows.forEach((row) => {
    matrix[row] = [];
    for (let col = 1; col <= cabin.seatsPerRow; col++) {
      const seatId = `${row}${col}`;
      // true = booked (unavailable), false = available
      matrix[row].push(bookedSeats[seatId] === true);
    }
  });

  return matrix;
};

/**
 * Create default aircraft seat layout with some pre-booked seats
 * @returns {object} Complete aircraft seat configuration
 */
const createDefaultAircraftLayout = () => {
  const bookedSeats = {
    // First Class
    a2: true,
    b3: true,
    c1: true,
    // Business
    d2: true,
    d4: true,
    e1: true,
    f3: true,
    g2: true,
    h1: true,
    i4: true,
    // Economy
    j2: true,
    j5: true,
    k1: true,
    k6: true,
    l3: true,
    l8: true,
    m4: true,
    n1: true,
    n9: true,
    o2: true,
    o7: true,
    p1: true,
    p4: true,
    q3: true,
    q5: true,
    r2: true,
    r8: true,
    s1: true,
    s6: true,
    t4: true,
    u2: true,
    u9: true,
    v1: true,
    v5: true,
    w3: true,
    w7: true,
    x2: true,
    x4: true,
    y1: true,
    y8: true,
    z3: true,
  };

  return {
    [CABIN_TYPES.FIRST_CLASS]: generateSeatMatrix(CABIN_TYPES.FIRST_CLASS, bookedSeats),
    [CABIN_TYPES.BUSINESS]: generateSeatMatrix(CABIN_TYPES.BUSINESS, bookedSeats),
    [CABIN_TYPES.ECONOMY]: generateSeatMatrix(CABIN_TYPES.ECONOMY, bookedSeats),
  };
};

export {
  CABIN_TYPES,
  CABIN_CONFIG,
  SEAT_COLUMNS,
  generateSeatMatrix,
  createDefaultAircraftLayout,
};
