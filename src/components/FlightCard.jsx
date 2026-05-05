import { useMemo, useState } from "react";
import dummyFlightsData, { createFareTypes } from "../data/dummyFlights";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";
import FareTypeCard from "./FareTypeCard";
import "../styles/FlightCard.css";

export default function FlightCard({ flight, selectedCabinClass = "economy", onFareSubmit }) {
    // Supports either:
    // 1) default export array: export default [...]
    // 2) default export object: export default { dummyFlights: [...] }
    const flights = Array.isArray(dummyFlightsData)
        ? dummyFlightsData
        : dummyFlightsData?.dummyFlights || [];

    // Use prop flight if passed, else first item from dummy data
    const selectedFlight = flight || flights[0] || {};
    const [isFareTypesOpen, setIsFareTypesOpen] = useState(false);
    const [selectedFareTypeId, setSelectedFareTypeId] = useState(null);

    const airlineName = selectedFlight.airlineName || selectedFlight.airline || "Data is currently Unavailable";
    const flightNumber = selectedFlight.flightNumber || "Data is currently Unavailable";
    const departureCity = selectedFlight.departureCity || selectedFlight.from || "Data is currently Unavailable";
    const departureTime = selectedFlight.departureTime || "Data is currently Unavailable";
    const duration = selectedFlight.duration || selectedFlight.durationHours || "Data is currently Unavailable";
    const stopCount = Number(selectedFlight.stops ?? 0);
    const stopsLabel = stopCount === 0 ? "Non-stop" : stopCount === 1 ? "1 stop" : `${stopCount} stops`;
    const arrivalCity = selectedFlight.arrivalCity || selectedFlight.to || "Data is currently Unavailable";
    const arrivalTime = selectedFlight.arrivalTime || "Data is currently Unavailable";
    const priceMapByClass = {
        economy: selectedFlight.economyPrice || selectedFlight.price || selectedFlight.amount || "N/A",
        business: selectedFlight.businessPrice || selectedFlight.price || selectedFlight.amount || "N/A",
        "first-class": selectedFlight.firstClassPrice || selectedFlight.price || selectedFlight.amount || "N/A",
    };

    const travelClassLabelMap = {
        economy: "Economy",
        business: "Business",
        "first-class": "First Class",
    };

    const travelClass = travelClassLabelMap[selectedCabinClass] || selectedFlight.class || selectedFlight.travelClass || "Economy";
    const price = priceMapByClass[selectedCabinClass] || selectedFlight.price || selectedFlight.amount || "N/A";
    const priceLabel = selectedFlight.priceLabel || "Lowest Price";

    const fareTypes = useMemo(() => {
        return createFareTypes(selectedFlight, selectedCabinClass);
    }, [selectedFlight, selectedCabinClass]);

    const formatPrice = (value) => {
        if (typeof value === "number") {
            return `₹${value.toLocaleString("en-IN")}`;
        }
        return value;
    };

    const selectedFareType = fareTypes.find((fareType) => fareType.id === selectedFareTypeId);

    const handleFareSubmitClick = () => {
        if (!selectedFareType) {
            return;
        }

        const payload = {
            flightId: selectedFlight.id,
            flightNumber,
            airlineName,
            departureCity,
            arrivalCity,
            departureTime,
            arrivalTime,
            fareTypeId: selectedFareType.id,
            fareTypeTitle: selectedFareType.title,
            price: formatPrice(selectedFareType.price || "N/A"),
            travelClass,
        };

        onFareSubmit?.(payload);
    };

  return (
    <div className="flight-card">
        {/* <h2>Flight Card</h2> */}

        <div className="flight-details">
            <div className="flight-nameTimingsInformation">
                <div className="flight-name">
                    <h3>{flightNumber}</h3>
                    <p>BlueWing Airlines</p>
                </div>

                <div className="flight-timings">
                    <div className="flight-departure">
                        <p className="flight-departureTime">{departureTime}</p>
                        <p className="flight-departureCity">{departureCity}</p>
                    </div>

                    <div className="flight-duration">
                        <p className="flight-durationTop">{duration}</p>
                        <div className="flight-durationLine" />
                        <p className="flight-durationBottom">{stopsLabel}</p>
                    </div>

                    <div className="flight-arrival">
                        <p className="flight-arrivalTime">{arrivalTime}</p>
                        <p className="flight-arrivalCity">{arrivalCity}</p>
                    </div>
                </div>
            </div>

            <div className="flight-price">
                <div className="flight-priceInfo">
                    <p className="flight-priceClass">{travelClass}</p>
                    <p className="flight-priceAmount">{formatPrice(price)}</p>
                    <p className="description">{priceLabel}</p>
                </div>
                <div className="flight-dropdown">
                    <button
                        type="button"
                        className="flight-dropdownLabel"
                        onClick={() => setIsFareTypesOpen((prev) => !prev)}
                        aria-expanded={isFareTypesOpen}
                        aria-label="Toggle fare types"
                    >
                        {isFareTypesOpen ? <IoChevronUp size={20} /> : <IoChevronDown size={20} />}
                    </button>
                </div>
            </div>
        </div>

        <div className={`flight-fareTypesWrapper ${isFareTypesOpen ? "is-open" : ""}`}>
            <div className="flight-fareTypes">
                <div className="flight-fareTypeInformation">
                    <p className="flight-fareTypeTitle">Fare Types</p>
                    <a className="flight-fareTypeKnowMore" href="#know-more">
                        Know more
                    </a>
                    <p className="flight-fareTypeSectionLabel">Baggage</p>
                    <p className="flight-fareTypeSectionLabel">Change/cancellation</p>
                    <p className="flight-fareTypeSectionLabel">Add-ons and services</p>
                </div>
                <div className="flight-fareTypeCards">
                    {fareTypes.map((fareType) => (
                        <FareTypeCard
                            key={fareType.id}
                            isSelected={selectedFareTypeId === fareType.id}
                            onSelect={() => setSelectedFareTypeId(fareType.id)}
                            title={fareType.title}
                            badge={fareType.badge}
                            price={formatPrice(fareType.price || "N/A")}
                            earnText={fareType.earnText}
                            baggage={fareType.baggage}
                            cancellationLabel={fareType.cancellationLabel}
                            features={fareType.features}
                            isNew={fareType.isNew}
                        />
                    ))}

                    <button
                        type="button"
                        className="flight-fareSubmitButton"
                        disabled={!selectedFareType}
                        onClick={handleFareSubmitClick}
                        data-flight-id={selectedFlight.id}
                        data-fare-type-id={selectedFareType?.id || ""}
                    >
                        {selectedFareType
                            ? `Submit ${selectedFareType.title} - ${formatPrice(selectedFareType.price || "N/A")}`
                            : "Select a fare type to submit"}
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
}