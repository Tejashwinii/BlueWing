import { useMemo, useState } from "react";
import dummyFlightsData from "../../data/dummyFlights";
import Flight from "../Flight/Flight";
import "./SeatSelection.css";

const flights = Array.isArray(dummyFlightsData)
  ? dummyFlightsData
  : dummyFlightsData?.dummyFlights || [];

const cabinClassLabels = {
  economy: "Economy",
  business: "Business",
  "first-class": "First Class",
};

const cabinClassOrder = ["first-class", "business", "economy"];

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;

const normalizeCabinClass = (value) => {
  if (value === "business") {
    return "business";
  }

  if (value === "first-class" || value === "first class" || value === "first_class") {
    return "first-class";
  }

  return "economy";
};

const getPassengerSummary = (selectionContext = {}) => {
  const passengers = selectionContext.passengers || selectionContext.journey?.passengers || {};

  // Handle both array and number formats for adults/children
  const adultsValue = passengers.adults;
  const childrenValue = passengers.children;
  
  const adults = Array.isArray(adultsValue) 
    ? adultsValue.length 
    : Math.max(Number(adultsValue ?? selectionContext.passengerCount ?? 1), 1);
  
  const children = Array.isArray(childrenValue)
    ? childrenValue.length
    : Math.max(Number(childrenValue ?? 0), 0);
  
  const infants = Math.max(Number(passengers.infants ?? 0), 0);
  const total = Math.max(Number(selectionContext.passengerCount ?? adults + children + infants), 1);

  const summaryParts = [];
  if (adults > 0) summaryParts.push(`${adults} Adult${adults !== 1 ? "s" : ""}`);
  if (children > 0) summaryParts.push(`${children} Child${children !== 1 ? "ren" : ""}`);
  if (infants > 0) summaryParts.push(`${infants} Infant${infants !== 1 ? "s" : ""}`);

  return {
    adults,
    children,
    infants,
    total,
    label: summaryParts.join(", ") || `${total} Passenger${total !== 1 ? "s" : ""}`,
  };
};

const resolveFlight = (selectionContext = {}) => {
  const byFlightId = selectionContext.flightId
    ? flights.find((flight) => String(flight.id) === String(selectionContext.flightId))
    : null;
  const byFlightNumber = selectionContext.flightNumber
    ? flights.find((flight) => flight.flightNumber === selectionContext.flightNumber)
    : null;

  return byFlightId || byFlightNumber || flights[0] || {};
};

const groupSeatsByRow = (seats) => {
  return seats.reduce((rows, seat) => {
    if (!rows[seat.row]) {
      rows[seat.row] = [];
    }

    rows[seat.row].push(seat);
    return rows;
  }, {});
};

const getSeatPrice = (flight, cabinClass) => {
  if (cabinClass === "business") {
    return Number(flight?.businessPrice ?? flight?.price ?? 0);
  }

  if (cabinClass === "first-class") {
    return Number(flight?.firstClassPrice ?? flight?.price ?? 0);
  }

  return Number(flight?.economyPrice ?? flight?.price ?? 0);
};

const buildCabinOptions = (flight) => {
  if (!flight.aircraft) return [];

  const cabinCounts = {};
  Object.keys(flight.aircraft).forEach((cabinType) => {
    const seatMatrix = flight.aircraft[cabinType];
    let total = 0;
    let booked = 0;

    Object.values(seatMatrix).forEach((row) => {
      row.forEach((isSeatBooked) => {
        total += 1;
        if (isSeatBooked) {
          booked += 1;
        }
      });
    });

    cabinCounts[cabinType] = { total, booked };
  });

  return cabinClassOrder.map((cabinClass) => {
    const counts = cabinCounts[cabinClass] || { total: 0, booked: 0 };

    return {
      id: cabinClass,
      label: cabinClassLabels[cabinClass],
      price: formatCurrency(getSeatPrice(flight, cabinClass)),
      availableSeats: Math.max(counts.total - counts.booked, 0),
      totalSeats: counts.total,
    };
  });
};

function SeatSelection({ bookingContext, flight, onBack, onContinue }) {
  const selectionContext = bookingContext || flight || {};
  const resolvedFlight = useMemo(() => resolveFlight(selectionContext), [selectionContext]);
  const cabinOptions = useMemo(() => buildCabinOptions(resolvedFlight), [resolvedFlight]);
  const passengerSummary = useMemo(() => getPassengerSummary(selectionContext), [selectionContext]);

  const lockedCabinClass = selectionContext.fareTypeId
    ? normalizeCabinClass(selectionContext.fareTypeId)
    : selectionContext.travelClass
      ? normalizeCabinClass(selectionContext.travelClass)
      : null;

  const initialCabinClass = cabinOptions.some((option) => option.id === lockedCabinClass)
    ? lockedCabinClass
    : "economy";

  const [selectedCabinClass, setSelectedCabinClass] = useState(initialCabinClass);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [confirmation, setConfirmation] = useState(null);
  const [showFullAircraft, setShowFullAircraft] = useState(false);
  const passengerCount = passengerSummary.total;

  // Get available seats for the selected cabin from aircraft data
  const seatMatrix = resolvedFlight.aircraft?.[selectedCabinClass];
  const availableSeatCount = useMemo(() => {
    if (!seatMatrix) return 0;
    let count = 0;
    Object.values(seatMatrix).forEach((row) => {
      row.forEach((isBooked) => {
        if (!isBooked) count += 1;
      });
    });
    return count;
  }, [seatMatrix]);

  const seatPrice = getSeatPrice(resolvedFlight, selectedCabinClass);
  const selectedTotal = selectedSeats.length * seatPrice;
  const isSelectionComplete = selectedSeats.length === passengerCount;
  const selectedFareLabel = selectionContext.fareTypeTitle || cabinClassLabels[selectedCabinClass];

  const handleCabinClassChange = (nextCabinClass) => {
    if (nextCabinClass === selectedCabinClass || lockedCabinClass === nextCabinClass) {
      return;
    }

    setSelectedCabinClass(nextCabinClass);
    setSelectedSeats([]);
    setConfirmation(null);
  };

  const handleSeatClick = (seatId) => {
    const seatMatrix = resolvedFlight.aircraft?.[selectedCabinClass];
    if (!seatMatrix) return;

    // Parse seat ID (e.g., "a1" -> row="a", col=1)
    const row = seatId.charAt(0);
    const col = parseInt(seatId.slice(1), 10);

    // Check if seat is booked
    if (seatMatrix[row]?.[col - 1]) {
      return;
    }

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats((currentSeats) => currentSeats.filter((id) => id !== seatId));
      setConfirmation(null);
      return;
    }

    if (selectedSeats.length >= passengerCount) {
      return;
    }

    setSelectedSeats((currentSeats) => [...currentSeats, seatId]);
    setConfirmation(null);
  };

  const handleConfirmSeats = () => {
    if (!isSelectionComplete) {
      return;
    }

    const summary = {
      flightNumber: selectionContext.flightNumber || resolvedFlight.flightNumber || "Unknown flight",
      airlineName: selectionContext.airlineName || resolvedFlight.airline || "BlueWing Airlines",
      cabinClass: selectedCabinClass,
      passengerCount,
      seats: selectedSeats,
      pricePerSeat: seatPrice,
      totalPrice: selectedTotal,
    };

    setConfirmation(summary);
    onContinue?.(summary);
  };

  return (
    <div className="seat-page">
      <header className="seat-hero">
        <div className="seat-heroCopy">
          <p className="seat-eyebrow">BlueWing Seat Selection</p>
          <h1>Select your seats</h1>
          <p>Choose a cabin, pick seats for every passenger, and confirm your selection before checkout.</p>
        </div>

        <button type="button" className="seat-backButton" onClick={onBack}>
          Back to flights
        </button>
      </header>

      <section className="seat-flightCard">
        <div>
          <p className="seat-flightLabel">Flight</p>
          <h2>
            {selectionContext.airlineName || resolvedFlight.airline || "BlueWing Airlines"} · {selectionContext.flightNumber || resolvedFlight.flightNumber || "Flight"}
          </h2>
          <p className="seat-flightRoute">
            {selectionContext.departureCity || resolvedFlight.from || "Origin"} → {selectionContext.arrivalCity || resolvedFlight.to || "Destination"}
          </p>
        </div>

        <div className="seat-flightMetaGroup">
          <div>
            <span>Selected fare</span>
            <strong>{selectedFareLabel}</strong>
          </div>
          <div>
            <span>Passengers</span>
            <strong>{passengerCount}</strong>
          </div>
          <div>
            <span>Seat price</span>
            <strong>{formatCurrency(seatPrice)}</strong>
          </div>
        </div>
      </section>

      <div className="seat-layout">
        <aside className="seat-sidebar">
          <section className="seat-panel">
            <h3>Passenger count</h3>
            <div className="seat-passengerSummary">
              <strong>{passengerCount}</strong>
              <span>{passengerSummary.label}</span>
            </div>
            <p className="seat-note">
              {availableSeatCount} seats available in {cabinClassLabels[selectedCabinClass]}.
            </p>
          </section>

          <section className="seat-panel">
            <h3>Cabin class</h3>
            <div className="seat-classList">
              {cabinOptions.map((option) => (
                <button
                  type="button"
                  key={option.id}
                  className={`seat-classButton ${selectedCabinClass === option.id ? "is-active" : ""}`}
                  onClick={() => handleCabinClassChange(option.id)}
                  disabled={Boolean(lockedCabinClass) && lockedCabinClass !== option.id}
                >
                  <span>{option.label}</span>
                  <strong>{option.price}</strong>
                  <small>{option.availableSeats} seats left</small>
                </button>
              ))}
            </div>
            {lockedCabinClass ? (
              <p className="seat-note">This cabin is locked to your selected fare from the previous step.</p>
            ) : null}
          </section>
        </aside>

        <main className="seat-mapPanel">
          <Flight
            cabinType={selectedCabinClass}
            aircraft={resolvedFlight.aircraft}
            selectedSeats={selectedSeats}
            onSeatClick={handleSeatClick}
            showFullAircraft={showFullAircraft}
            onToggleFullAircraft={() => setShowFullAircraft(!showFullAircraft)}
            readOnly={false}
          />
        </main>
      </div>

      <section className="seat-summaryCard">
        <div>
          <h3>Selection summary</h3>
          <p>
            {selectedSeats.length} of {passengerCount} seats selected. Pick {Math.max(passengerCount - selectedSeats.length, 0)} more to continue.
          </p>
        </div>

        <div className="seat-summaryGrid">
          <div>
            <span>Seats</span>
            <strong>{selectedSeats.length > 0 ? selectedSeats.join(", ") : "None"}</strong>
          </div>
          <div>
            <span>Price per seat</span>
            <strong>{formatCurrency(seatPrice)}</strong>
          </div>
          <div>
            <span>Total</span>
            <strong>{formatCurrency(selectedTotal)}</strong>
          </div>
        </div>

        <button type="button" className="seat-confirmButton" onClick={handleConfirmSeats} disabled={!isSelectionComplete}>
          Confirm seats
        </button>

        {confirmation ? (
          <div className="seat-confirmation">
            <strong>Seats confirmed</strong>
            <p>
              {confirmation.seats.join(", ")} reserved in {cabinClassLabels[confirmation.cabinClass]} for {confirmation.passengerCount} passenger(s).
            </p>
            <p>Total booking value: {formatCurrency(confirmation.totalPrice)}</p>
          </div>
        ) : null}
      </section>
    </div>
  );
}

export default SeatSelection;