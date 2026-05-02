const seatLetters = ["A", "B", "C", "D", "E", "F"];

const rows = [
  { row: 1, cabinClass: "first-class", bookedSeats: ["1B"] },
  { row: 2, cabinClass: "first-class", bookedSeats: ["2D"] },
  { row: 3, cabinClass: "business", bookedSeats: ["3A", "3F"] },
  { row: 4, cabinClass: "business", bookedSeats: ["4C"] },
  { row: 5, cabinClass: "economy", bookedSeats: ["5E"] },
  { row: 6, cabinClass: "economy", bookedSeats: ["6A", "6F"] },
  { row: 7, cabinClass: "economy", bookedSeats: ["7C"] },
  { row: 8, cabinClass: "economy", bookedSeats: ["8B"] },
  { row: 9, cabinClass: "economy", bookedSeats: ["9D"] },
  { row: 10, cabinClass: "economy", bookedSeats: [] },
  { row: 11, cabinClass: "economy", bookedSeats: ["11A"] },
  { row: 12, cabinClass: "economy", bookedSeats: ["12F"] },
];

const seatData = rows.flatMap(({ row, cabinClass, bookedSeats }) =>
  seatLetters.map((column) => {
    const id = `${row}${column}`;

    return {
      id,
      row,
      column,
      cabinClass,
      booked: bookedSeats.includes(id),
    };
  })
);

export default seatData;