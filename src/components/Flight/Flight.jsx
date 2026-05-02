import { memo, useMemo } from "react";
import { CABIN_CONFIG } from "../../utils/aircraftConfig";
import "./Flight.css";

/**
 * SeatLayout - Renders a single cabin's seat grid with walkways and washrooms
 * Handles layout structure, seat rendering, and seat interaction
 */
const SeatLayout = memo(function SeatLayout({
  cabinType,
  seatMatrix,
  selectedSeats,
  onSeatClick,
  readOnly = false,
  compact = false,
}) {
  const cabin = CABIN_CONFIG[cabinType];
  if (!cabin) {
    return null;
  }

  const renderWalkway = (index) => (
    <div key={`walkway-${index}`} className="flight-walkway" aria-hidden="true" />
  );

  const renderWashroom = () => (
    <div key="washroom" className="flight-washroom" aria-label="Restroom">
      <span className="washroom-icon">🚻</span>
    </div>
  );

  const renderSeat = (row, colIndex, colNumber) => {
    const seatId = `${row}${colNumber}`;
    const isBooked = seatMatrix[row] && seatMatrix[row][colNumber - 1];
    const isSelected = selectedSeats?.includes(seatId);

    return (
      <button
        key={seatId}
        type="button"
        className={`flight-seat ${isBooked ? "is-booked" : ""} ${isSelected ? "is-selected" : ""} ${compact ? "is-compact" : ""}`}
        onClick={() => !readOnly && !isBooked && onSeatClick?.(seatId)}
        disabled={readOnly || isBooked}
        aria-label={`Seat ${seatId} ${isBooked ? "booked" : "available"}`}
        aria-pressed={isSelected}
      >
        <span className="seat-label">{colNumber}</span>
      </button>
    );
  };

  const renderRow = (row, rowIndex) => {
    const sections = cabin.layout.sections;
    const rowElements = [];

    sections.forEach((section, sectionIdx) => {
      // Render seats in this section
      section.columns.forEach((colNumber) => {
        rowElements.push(renderSeat(row, colNumber, colNumber));
      });

      // Render gap after section (except last section)
      if (sectionIdx < sections.length - 1) {
        rowElements.push(renderWalkway(sectionIdx));
      }
    });

    // Check if washroom should follow this row
    if (cabin.layout.washrooms?.after?.includes(row)) {
      rowElements.push(renderWashroom());
    }

    return (
      <div className="flight-row" key={row}>
        <div className="flight-row-label">{row.toUpperCase()}</div>
        <div className="flight-row-seats">{rowElements}</div>
      </div>
    );
  };

  const rows = cabin.rows;

  return (
    <div className={`flight-seat-layout ${compact ? "is-compact" : ""}`}>
      <div className="flight-cabin-header">
        <h3>{cabin.label}</h3>
        {!compact && (
          <p className="flight-cabin-info">
            {cabin.rows.length} rows • {cabin.seatsPerRow} seats per row
          </p>
        )}
      </div>

      <div className="flight-aircraft-section">
        <div className="flight-cabin-marker">FRONT</div>
        <div className="flight-rows-container">{rows.map(renderRow)}</div>
        <div className="flight-cabin-marker">REAR</div>
      </div>
    </div>
  );
});

/**
 * Flight - Main component for rendering aircraft layout
 * Encapsulates seat rendering, cabin selection, and full aircraft modal
 */
export default function Flight({
  cabinType = "economy",
  aircraft,
  selectedSeats = [],
  onSeatClick,
  showFullAircraft = false,
  onToggleFullAircraft,
  readOnly = false,
}) {
  // Validate aircraft data
  if (!aircraft || !aircraft[cabinType]) {
    return <div className="flight-error">Aircraft data not available</div>;
  }

  const seatMatrix = aircraft[cabinType];

  return (
    <div className="flight-container">
      {/* Single Cabin View */}
      <div className="flight-main-view">
        <SeatLayout
          cabinType={cabinType}
          seatMatrix={seatMatrix}
          selectedSeats={selectedSeats}
          onSeatClick={onSeatClick}
          readOnly={readOnly}
          compact={false}
        />

        {/* View Full Aircraft Button */}
        {!showFullAircraft && (
          <button
            type="button"
            className="flight-view-full-button"
            onClick={onToggleFullAircraft}
            aria-label="View full aircraft layout"
          >
            View Full Aircraft Layout
          </button>
        )}
      </div>

      {/* Full Aircraft Modal */}
      {showFullAircraft && (
        <div className="flight-modal-overlay" onClick={onToggleFullAircraft}>
          <div className="flight-modal-container" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="flight-modal-close"
              onClick={onToggleFullAircraft}
              aria-label="Close full aircraft view"
            >
              ✕
            </button>

            <h2 className="flight-modal-title">Full Aircraft Layout</h2>

            <div className="flight-modal-scroll-container">
              <div className="flight-modal-content">
                {Object.entries(aircraft).map(([cabinKey, seatMatrixData]) => (
                  <SeatLayout
                    key={cabinKey}
                    cabinType={cabinKey}
                    seatMatrix={seatMatrixData}
                    selectedSeats={[]}
                    onSeatClick={null}
                    readOnly={true}
                    compact={true}
                  />
                ))}
              </div>
            </div>

            <div className="flight-modal-legend">
              <div className="legend-item">
                <span className="legend-seat available" />
                Available
              </div>
              <div className="legend-item">
                <span className="legend-seat booked" />
                Booked
              </div>
              <div className="legend-item">
                <span className="legend-walkway" />
                Walkway
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      {!showFullAircraft && (
        <div className="flight-legend">
          <div className="legend-item">
            <span className="legend-seat available" />
            Available
          </div>
          <div className="legend-item">
            <span className="legend-seat selected" />
            Selected
          </div>
          <div className="legend-item">
            <span className="legend-seat booked" />
            Booked
          </div>
          <div className="legend-item">
            <span className="legend-walkway" />
            Walkway
          </div>
        </div>
      )}
    </div>
  );
}
