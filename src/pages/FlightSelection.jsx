import FlightCard from "../components/FlightCard";
import Navbar from "../components/Navbar";
import dummyFlightsData from "../data/dummyFlights";
import "../styles/FlightSelection.css";
import { useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

export default function FlightSelection() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const goBackToHome = () => {
        const searchForm = {
            ...searchCriteria,
            adults: searchCriteria.passengers.adults,
            children: searchCriteria.passengers.children,
            infants: searchCriteria.passengers.infants,
        };

        navigate('/', { state: { searchForm } });
    };

  const flights = Array.isArray(dummyFlightsData)
    ? dummyFlightsData
    : dummyFlightsData?.dummyFlights || [];

    const normalizeCity = (value) => String(value || "").trim().toLowerCase();

    const normalizeCabinClass = (value) => {
        const normalizedValue = String(value || "").trim().toLowerCase();

        if (normalizedValue === "first" || normalizedValue === "first class" || normalizedValue === "first-class") {
            return "first-class";
        }

        if (normalizedValue === "business") {
            return "business";
        }

        return "economy";
    };

    const searchCriteria = useMemo(() => {
        const fallbackState = location.state?.searchForm || location.state || {};

        return {
            departure: searchParams.get("departure") || fallbackState.departure || "",
            arrival: searchParams.get("arrival") || fallbackState.arrival || "",
            date: searchParams.get("date") || fallbackState.date || "",
            cabinClass: normalizeCabinClass(searchParams.get("class") || fallbackState.class),
            passengers: {
                adults: Number(fallbackState.adults ?? fallbackState.passengers?.adults ?? 1),
                children: Number(fallbackState.children ?? fallbackState.passengers?.children ?? 0),
                infants: Number(fallbackState.infants ?? fallbackState.passengers?.infants ?? 0),
            },
        };
    }, [location.state, searchParams]);

    const [draftStopFilter, setDraftStopFilter] = useState("any");
    const [appliedStopFilter, setAppliedStopFilter] = useState("any");

    const [draftCabinClass, setDraftCabinClass] = useState(searchCriteria.cabinClass);
    const [appliedCabinClass, setAppliedCabinClass] = useState(searchCriteria.cabinClass);

    const [draftSortConfig, setDraftSortConfig] = useState({
        key: "price",
        order: "asc",
    });
    const [appliedSortConfig, setAppliedSortConfig] = useState({
        key: "price",
        order: "asc",
    });

    const [selectedFarePayload, setSelectedFarePayload] = useState(null);

    const activeStopFilterCount = draftStopFilter === "any" ? 0 : 1;
    const matchingRouteFlights = useMemo(() => {
        return flights.filter((flight) => {
            const matchesDeparture =
                !searchCriteria.departure || normalizeCity(flight.from) === normalizeCity(searchCriteria.departure);
            const matchesArrival =
                !searchCriteria.arrival || normalizeCity(flight.to) === normalizeCity(searchCriteria.arrival);
            const matchesDate = !searchCriteria.date || String(flight.departureDate || "") === searchCriteria.date;

            return matchesDeparture && matchesArrival && matchesDate;
        });
    }, [flights, searchCriteria]);

    const parseTimeToMinutes = (value) => {
        if (!value || typeof value !== "string") {
            return Number.MAX_SAFE_INTEGER;
        }

        const [timePart, modifierRaw] = value.trim().split(" ");
        const [rawHours, rawMinutes] = (timePart || "").split(":").map(Number);
        const modifier = (modifierRaw || "").toUpperCase();

        if (Number.isNaN(rawHours) || Number.isNaN(rawMinutes)) {
            return Number.MAX_SAFE_INTEGER;
        }

        let hours = rawHours % 12;
        if (modifier === "PM") {
            hours += 12;
        }

        return hours * 60 + rawMinutes;
    };

    const parseDurationToMinutes = (value) => {
        if (!value || typeof value !== "string") {
            return Number.MAX_SAFE_INTEGER;
        }

        const hoursMatch = value.match(/(\d+)\s*h/i);
        const minutesMatch = value.match(/(\d+)\s*m/i);
        const hours = hoursMatch ? Number(hoursMatch[1]) : 0;
        const minutes = minutesMatch ? Number(minutesMatch[1]) : 0;

        return hours * 60 + minutes;
    };

    const getPriceByClass = (flight, cabinClass) => {
        if (cabinClass === "business") {
            return Number(flight.businessPrice ?? flight.price ?? Number.MAX_SAFE_INTEGER);
        }

        if (cabinClass === "first-class") {
            return Number(flight.firstClassPrice ?? flight.price ?? Number.MAX_SAFE_INTEGER);
        }

        return Number(flight.economyPrice ?? flight.price ?? Number.MAX_SAFE_INTEGER);
    };

    const filteredFlights = useMemo(() => {
        const filtered = matchingRouteFlights.filter((flight) => {
            if (appliedStopFilter === "any") {
                return true;
            }

            const stopCount = Number(flight.stops ?? 0);
            const stopBucket = stopCount === 0 ? "nonStop" : stopCount === 1 ? "oneStop" : "twoPlusStops";

            return stopBucket === appliedStopFilter;
        });

        const getSortValue = (flight) => {
            if (appliedSortConfig.key === "time") {
                return parseTimeToMinutes(flight.departureTime);
            }

            if (appliedSortConfig.key === "duration") {
                return parseDurationToMinutes(flight.duration || flight.durationHours);
            }

            return getPriceByClass(flight, appliedCabinClass);
        };

        return [...filtered].sort((firstFlight, secondFlight) => {
            const firstValue = getSortValue(firstFlight);
            const secondValue = getSortValue(secondFlight);
            const direction = appliedSortConfig.order === "asc" ? 1 : -1;

            return firstValue > secondValue ? direction : firstValue < secondValue ? -direction : 0;
        });
    }, [matchingRouteFlights, appliedStopFilter, appliedSortConfig, appliedCabinClass]);

    const handleApplyFilters = () => {
        setAppliedStopFilter(draftStopFilter);
        setAppliedCabinClass(draftCabinClass);
        setAppliedSortConfig(draftSortConfig);
    };

    const handleFareSubmit = (payload) => {
        setSelectedFarePayload(payload);
        navigate("/seat-selection", {
            state: {
                journey: searchCriteria,
                selectedFare: payload,
            },
        });
    };

    const routeHeading = searchCriteria.departure && searchCriteria.arrival
        ? `${searchCriteria.departure} → ${searchCriteria.arrival}`
        : "All available flights";

    const passengerCount = `${searchCriteria.passengers.adults} adult${searchCriteria.passengers.adults !== 1 ? 's' : ""}${searchCriteria.passengers.children > 0 ? `, ${searchCriteria.passengers.children} child${searchCriteria.passengers.children !== 1 ? 'ren' : ""}` : ""}${searchCriteria.passengers.infants > 0 ? `, ${searchCriteria.passengers.infants} infant${searchCriteria.passengers.infants !== 1 ? 's' : ""}` : ""}`;

  return (
    <>
        <Navbar onNavClick={() => {}} />
        <div className="flight-selection-page">
            <div className="flight-selection-topBar">
                <button type="button" className="flight-selection-backButton" onClick={goBackToHome}>
                    ← Back
                </button>
                <div className="flight-selection-header">
                    <h1>{filteredFlights.length} flights are available</h1>
                    <p>
                        <span>{routeHeading}</span>
                        {searchCriteria.date && <span>{searchCriteria.date}</span>}
                        <span>{passengerCount}</span>
                    </p>
                </div>
            </div>

            <div className="flight-selection-area">
                <aside className="flight-selection-filter">
                    <h3>Filter by</h3>

                    <section className="flight-selection-filterSection">
                        <h4>Stops</h4>
                        <div className="flight-selection-filterOptions">
                            <label className="flight-selection-inputWrapper" htmlFor="nonStop">
                                <input
                                    type="radio"
                                    id="nonStop"
                                    name="stopFilter"
                                    checked={draftStopFilter === "nonStop"}
                                    onChange={() => setDraftStopFilter("nonStop")}
                                />
                                <span>Non-stop</span>
                            </label>

                            <label className="flight-selection-inputWrapper" htmlFor="oneStop">
                                <input
                                    type="radio"
                                    id="oneStop"
                                    name="stopFilter"
                                    checked={draftStopFilter === "oneStop"}
                                    onChange={() => setDraftStopFilter("oneStop")}
                                />
                                <span>1 stop</span>
                            </label>

                            <label className="flight-selection-inputWrapper" htmlFor="twoPlusStops">
                                <input
                                    type="radio"
                                    id="twoPlusStops"
                                    name="stopFilter"
                                    checked={draftStopFilter === "twoPlusStops"}
                                    onChange={() => setDraftStopFilter("twoPlusStops")}
                                />
                                <span>2+ stops</span>
                            </label>

                            <label className="flight-selection-inputWrapper" htmlFor="anyStops">
                                <input
                                    type="radio"
                                    id="anyStops"
                                    name="stopFilter"
                                    checked={draftStopFilter === "any"}
                                    onChange={() => setDraftStopFilter("any")}
                                />
                                <span>Any</span>
                            </label>
                        </div>
                    </section>

                    <section className="flight-selection-filterSection">
                        <h4>Class</h4>
                        <div className="flight-selection-filterOptions">
                            <label className="flight-selection-inputWrapper" htmlFor="economy">
                                <input
                                    type="radio"
                                    id="economy"
                                    name="cabinClass"
                                    checked={draftCabinClass === "economy"}
                                    onChange={() => setDraftCabinClass("economy")}
                                />
                                <span>Economy</span>
                            </label>

                            <label className="flight-selection-inputWrapper" htmlFor="business">
                                <input
                                    type="radio"
                                    id="business"
                                    name="cabinClass"
                                    checked={draftCabinClass === "business"}
                                    onChange={() => setDraftCabinClass("business")}
                                />
                                <span>Business</span>
                            </label>

                            <label className="flight-selection-inputWrapper" htmlFor="firstClass">
                                <input
                                    type="radio"
                                    id="firstClass"
                                    name="cabinClass"
                                    checked={draftCabinClass === "first-class"}
                                    onChange={() => setDraftCabinClass("first-class")}
                                />
                                <span>First Class</span>
                            </label>
                        </div>
                    </section>

                    <section className="flight-selection-filterSection">
                        <h4>Sorting</h4>
                        <div className="flight-selection-filterOptions">
                            <label className="flight-selection-inputWrapper with-select" htmlFor="sortType">
                                <span>Type</span>
                                <select
                                    id="sortType"
                                    className="flight-selection-select"
                                    value={draftSortConfig.key}
                                    onChange={(event) =>
                                        setDraftSortConfig((prev) => ({
                                            ...prev,
                                            key: event.target.value,
                                        }))
                                    }
                                >
                                    <option value="price">Price</option>
                                    <option value="time">Departure Time</option>
                                    <option value="duration">Duration</option>
                                </select>
                            </label>

                            <label className="flight-selection-inputWrapper with-select" htmlFor="sortOrder">
                                <span>Order</span>
                                <select
                                    id="sortOrder"
                                    className="flight-selection-select"
                                    value={draftSortConfig.order}
                                    onChange={(event) =>
                                        setDraftSortConfig((prev) => ({
                                            ...prev,
                                            order: event.target.value,
                                        }))
                                    }
                                >
                                    <option value="asc">Ascending</option>
                                    <option value="desc">Descending</option>
                                </select>
                            </label>
                        </div>
                    </section>

                    <button type="button" className="flight-selection-applyButton" onClick={handleApplyFilters}>
                        Apply Filters
                    </button>

                    <p className="flight-selection-filterMeta">Active stop filters: {activeStopFilterCount}</p>
                </aside>

                <div className="flight-selection-list">
                    {selectedFarePayload ? (
                        <div className="flight-selection-selectedMeta">
                            Selected: {selectedFarePayload.flightNumber} - {selectedFarePayload.fareTypeTitle} ({selectedFarePayload.price})
                        </div>
                    ) : null}

                    {filteredFlights.map((flight) => (
                        <FlightCard
                            key={flight.id}
                            flight={flight}
                            selectedCabinClass={appliedCabinClass}
                            onFareSubmit={handleFareSubmit}
                        />
                    ))}

                    {filteredFlights.length === 0 ? (
                        <div className="flight-selection-emptyState">
                            No flights match the selected route. Try changing the search details or filters.
                        </div>
                    ) : null}
        </div>
            </div>
        </div>
    </>
  );
}






