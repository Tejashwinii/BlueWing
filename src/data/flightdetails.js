// Flight details with airport pairs and durations (in hours)
export const airportDurations = [
  // DEL (Delhi) connections
  { from: 'DEL', to: 'BOM', duration: 2.5 },
  { from: 'DEL', to: 'BLR', duration: 3 },
  { from: 'DEL', to: 'HYD', duration: 2.5 },
  { from: 'DEL', to: 'COK', duration: 4 },
  { from: 'DEL', to: 'MAA', duration: 3 },
  { from: 'DEL', to: 'PNQ', duration: 2 },
  { from: 'DEL', to: 'CCU', duration: 2 },
  { from: 'DEL', to: 'SXR', duration: 2.5 },
  { from: 'DEL', to: 'AMD', duration: 1.5 },
  { from: 'DEL', to: 'JAI', duration: 1 },

  // BOM (Mumbai) connections
  { from: 'BOM', to: 'DEL', duration: 2.5 },
  { from: 'BOM', to: 'BLR', duration: 2 },
  { from: 'BOM', to: 'HYD', duration: 1.5 },
  { from: 'BOM', to: 'COK', duration: 2.5 },
  { from: 'BOM', to: 'MAA', duration: 2.5 },
  { from: 'BOM', to: 'PNQ', duration: 1 },
  { from: 'BOM', to: 'CCU', duration: 2.5 },
  { from: 'BOM', to: 'AMD', duration: 1 },
  { from: 'BOM', to: 'JAI', duration: 1.5 },
  { from: 'BOM', to: 'SXR', duration: 2 },

  // BLR (Bangalore) connections
  { from: 'BLR', to: 'DEL', duration: 3 },
  { from: 'BLR', to: 'BOM', duration: 2 },
  { from: 'BLR', to: 'HYD', duration: 1 },
  { from: 'BLR', to: 'COK', duration: 1.5 },
  { from: 'BLR', to: 'MAA', duration: 1.5 },
  { from: 'BLR', to: 'PNQ', duration: 2.5 },
  { from: 'BLR', to: 'CCU', duration: 3 },
  { from: 'BLR', to: 'JAI', duration: 2.5 },
  { from: 'BLR', to: 'SXR', duration: 2.5 },

  // HYD (Hyderabad) connections
  { from: 'HYD', to: 'DEL', duration: 2.5 },
  { from: 'HYD', to: 'BOM', duration: 1.5 },
  { from: 'HYD', to: 'BLR', duration: 1 },
  { from: 'HYD', to: 'COK', duration: 2 },
  { from: 'HYD', to: 'MAA', duration: 1 },
  { from: 'HYD', to: 'PNQ', duration: 2 },
  { from: 'HYD', to: 'CCU', duration: 2.5 },
  { from: 'HYD', to: 'JAI', duration: 2 },

  // COK (Kochi) connections
  { from: 'COK', to: 'DEL', duration: 4 },
  { from: 'COK', to: 'BOM', duration: 2.5 },
  { from: 'COK', to: 'BLR', duration: 1.5 },
  { from: 'COK', to: 'HYD', duration: 2 },
  { from: 'COK', to: 'MAA', duration: 1.5 },
  { from: 'COK', to: 'PNQ', duration: 3 },
  { from: 'COK', to: 'CCU', duration: 3.5 },

  // MAA (Chennai) connections
  { from: 'MAA', to: 'DEL', duration: 3 },
  { from: 'MAA', to: 'BOM', duration: 2.5 },
  { from: 'MAA', to: 'BLR', duration: 1.5 },
  { from: 'MAA', to: 'HYD', duration: 1 },
  { from: 'MAA', to: 'COK', duration: 1.5 },
  { from: 'MAA', to: 'PNQ', duration: 2.5 },
  { from: 'MAA', to: 'CCU', duration: 3 },

  // PNQ (Pune) connections
  { from: 'PNQ', to: 'DEL', duration: 2 },
  { from: 'PNQ', to: 'BOM', duration: 1 },
  { from: 'PNQ', to: 'BLR', duration: 2.5 },
  { from: 'PNQ', to: 'HYD', duration: 2 },
  { from: 'PNQ', to: 'COK', duration: 3 },
  { from: 'PNQ', to: 'MAA', duration: 2.5 },
  { from: 'PNQ', to: 'CCU', duration: 2.5 },
  { from: 'PNQ', to: 'JAI', duration: 1.5 },

  // CCU (Kolkata) connections
  { from: 'CCU', to: 'DEL', duration: 2 },
  { from: 'CCU', to: 'BOM', duration: 2.5 },
  { from: 'CCU', to: 'BLR', duration: 3 },
  { from: 'CCU', to: 'HYD', duration: 2.5 },
  { from: 'CCU', to: 'COK', duration: 3.5 },
  { from: 'CCU', to: 'MAA', duration: 3 },
  { from: 'CCU', to: 'PNQ', duration: 2.5 },

  // JAI (Jaipur) connections
  { from: 'JAI', to: 'DEL', duration: 1 },
  { from: 'JAI', to: 'BOM', duration: 1.5 },
  { from: 'JAI', to: 'BLR', duration: 2.5 },
  { from: 'JAI', to: 'HYD', duration: 2 },
  { from: 'JAI', to: 'PNQ', duration: 1.5 },

  // SXR (Srinagar) connections
  { from: 'SXR', to: 'DEL', duration: 2.5 },
  { from: 'SXR', to: 'BOM', duration: 2 },
  { from: 'SXR', to: 'BLR', duration: 2.5 },

  // AMD (Ahmedabad) connections
  { from: 'AMD', to: 'DEL', duration: 1.5 },
  { from: 'AMD', to: 'BOM', duration: 1 },
  { from: 'AMD', to: 'BLR', duration: 2.5 },
];

export const airports = [
  { code: 'DEL', name: 'Delhi' },
  { code: 'BOM', name: 'Mumbai' },
  { code: 'BLR', name: 'Bangalore' },
  { code: 'HYD', name: 'Hyderabad' },
  { code: 'COK', name: 'Kochi' },
  { code: 'MAA', name: 'Chennai' },
  { code: 'PNQ', name: 'Pune' },
  { code: 'CCU', name: 'Kolkata' },
  { code: 'JAI', name: 'Jaipur' },
  { code: 'SXR', name: 'Srinagar' },
  { code: 'AMD', name: 'Ahmedabad' },
];

// Helper function to get duration between two airports
export const getDuration = (from, to) => {
  const route = airportDurations.find(r => r.from === from && r.to === to);
  return route ? route.duration : null;
};

// Helper to calculate arrival time
export const calculateArrivalTime = (departureTime, duration) => {
  const [hours, minutes] = departureTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + Math.floor(duration * 60);
  const arrivalHours = Math.floor(totalMinutes / 60) % 24;
  const arrivalMinutes = totalMinutes % 60;
  return `${String(arrivalHours).padStart(2, '0')}:${String(arrivalMinutes).padStart(2, '0')}`;
};
