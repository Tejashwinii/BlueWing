import { useEffect, useMemo, useState } from "react";
import dummyFlightsData from "../../data/dummyFlights";
import Flight from "../Flight/Flight";
import { flightAPI } from "../../utils/api";
import { CABIN_TYPES, generateSeatMatrix } from "../../utils/aircraftConfig";
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

const buildCabinOptions = (aircraft) => {
  if (!aircraft) return [];

  const cabinCounts = {};
  Object.keys(aircraft).forEach((cabinType) => {
    const seatMatrix = aircraft[cabinType];
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
      availableSeats: Math.max(counts.total - counts.booked, 0),
      totalSeats: counts.total,
    };
  });
};

const buildAircraftFromSeats = (seats = []) => {
  const bookedByCabin = {
    [CABIN_TYPES.FIRST_CLASS]: {},
    [CABIN_TYPES.BUSINESS]: {},
    [CABIN_TYPES.ECONOMY]: {},
  };

  seats.forEach((seat) => {
    const row = String(seat.row || '').toLowerCase();
    const col = Number(seat.column);
    if (!row || !col) return;

    const seatId = `${col}${row}`;
    if (seat.cabin === 'firstClass') {
      bookedByCabin[CABIN_TYPES.FIRST_CLASS][seatId] = Boolean(seat.isBooked);
    } else if (seat.cabin === 'business') {
      bookedByCabin[CABIN_TYPES.BUSINESS][seatId] = Boolean(seat.isBooked);
    } else {
      bookedByCabin[CABIN_TYPES.ECONOMY][seatId] = Boolean(seat.isBooked);
    }
  });

  return {
    [CABIN_TYPES.FIRST_CLASS]: generateSeatMatrix(CABIN_TYPES.FIRST_CLASS, bookedByCabin[CABIN_TYPES.FIRST_CLASS]),
    [CABIN_TYPES.BUSINESS]: generateSeatMatrix(CABIN_TYPES.BUSINESS, bookedByCabin[CABIN_TYPES.BUSINESS]),
    [CABIN_TYPES.ECONOMY]: generateSeatMatrix(CABIN_TYPES.ECONOMY, bookedByCabin[CABIN_TYPES.ECONOMY]),
  };
};

function SeatSelection({ bookingContext, flight, onBack, onContinue }) {
  const selectionContext = bookingContext || flight || {};
  const resolvedFlight = useMemo(() => resolveFlight(selectionContext), [selectionContext]);
  const [activeFlight, setActiveFlight] = useState(resolvedFlight);
  const [aircraft, setAircraft] = useState(resolvedFlight.aircraft || null);
  const [isLoadingSeats, setIsLoadingSeats] = useState(false);
  const [seatLoadError, setSeatLoadError] = useState(null);

  const cabinOptions = useMemo(() => buildCabinOptions(aircraft), [aircraft]);
  const passengerSummary = useMemo(() => getPassengerSummary(selectionContext), [selectionContext]);

  const lockedCabinClass = selectionContext.journey?.cabinClass
    ? normalizeCabinClass(selectionContext.journey.cabinClass)
    : selectionContext.fareTypeId
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

  useEffect(() => {
    const loadSeatsFromBackend = async () => {
      const backendFlightId = selectionContext?.selectedFare?.flightId || selectionContext?.flightId;

      if (!backendFlightId) {
        setActiveFlight(resolvedFlight);
        setAircraft(resolvedFlight.aircraft || null);
        return;
      }

      try {
        setIsLoadingSeats(true);
        setSeatLoadError(null);

        const response = await flightAPI.getFlightById(backendFlightId);
        const backendFlight = response?.data || null;

        if (backendFlight && backendFlight.seats) {
          setActiveFlight(backendFlight);
          setAircraft(buildAircraftFromSeats(backendFlight.seats));
        } else {
          setActiveFlight(resolvedFlight);
          setAircraft(resolvedFlight.aircraft || null);
        }
      } catch (error) {
        console.error('Failed to load seats from backend:', error);
        setSeatLoadError('Unable to load seats from backend. Showing cached layout.');
        setActiveFlight(resolvedFlight);
        setAircraft(resolvedFlight.aircraft || null);
      } finally {
        setIsLoadingSeats(false);
      }
    };

    loadSeatsFromBackend();
  }, [selectionContext, resolvedFlight]);

  // Get available seats for the selected cabin from aircraft data
  const seatMatrix = aircraft?.[selectedCabinClass];
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

  const seatPrice = selectionContext.selectedFare?.rawPrice 
    ? Number(selectionContext.selectedFare.rawPrice)
    : selectionContext.price 
    ? Number(String(selectionContext.price).replace(/[^\d.]/g, ''))
    : getSeatPrice(activeFlight, selectedCabinClass);
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
    const seatMatrix = aircraft?.[selectedCabinClass];
    if (!seatMatrix) return;

    // Parse seat ID (e.g., "1a" -> row="a", col=1)
    const row = seatId.slice(-1);
    const col = parseInt(seatId.slice(0, -1), 10);

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
      flightNumber: selectionContext.flightNumber || activeFlight.flightNumber || "Unknown flight",
      airlineName: selectionContext.airlineName || activeFlight.airline || "BlueWing Airlines",
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
            {selectionContext.airlineName || activeFlight.airline || "BlueWing Airlines"} · {selectionContext.flightNumber || activeFlight.flightNumber || "Flight"}
          </h2>
          <p className="seat-flightRoute">
            {selectionContext.departureCity || activeFlight.from || "Origin"} → {selectionContext.arrivalCity || activeFlight.to || "Destination"}
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

      {isLoadingSeats && (
        <div className="seat-note" style={{ margin: "12px 0" }}>
          Loading seats from backend...
        </div>
      )}

      {seatLoadError && (
        <div className="seat-note" style={{ margin: "12px 0", color: "#c0392b" }}>
          {seatLoadError}
        </div>
      )}

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
            aircraft={aircraft}
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