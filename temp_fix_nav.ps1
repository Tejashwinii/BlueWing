$ErrorActionPreference = 'Stop'

function Clean-LiteralNewlines {
  param([string]$Path)
  $text = Get-Content $Path -Raw
  $text = $text.Replace('`r`n', [Environment]::NewLine)
  Set-Content $Path $text
}

# Navbar default callback
$navbarPath = 'src\components\Navbar.jsx'
$navbarText = Get-Content $navbarPath -Raw
$navbarText = $navbarText.Replace('const Navbar = ({ onNavClick, hideLogin = false }) => {', 'const Navbar = ({ onNavClick = () => {}, hideLogin = false }) => {')
Set-Content $navbarPath $navbarText

# HomePage persist and restore search form
$homePath = 'src\pages\HomePage.jsx'
$homeText = Get-Content $homePath -Raw
$homeText = $homeText.Replace(@"
    navigate(`/flight-selection?${searchParams.toString()}`, {
      state: {
        departure: formData.departure.trim(),
        arrival: formData.arrival.trim(),
        date: formData.date,
        class: normalizedClass,
        passengers: {
          adults: formData.adults,
          children: formData.children,
          infants: formData.infants,
        },
      },
    });
"@, @"
    const searchForm = {
      departure: formData.departure.trim(),
      arrival: formData.arrival.trim(),
      date: formData.date,
      class: normalizedClass,
      adults: formData.adults,
      children: formData.children,
      infants: formData.infants,
    };

    sessionStorage.setItem('bluewingSearchForm', JSON.stringify(searchForm));

    navigate(`/flight-selection?${searchParams.toString()}`, {
      state: { searchForm },
    });
"@)
Set-Content $homePath $homeText

# FlightSelection clean artifacts, add navbar/back control, and use searchForm state
$flightPath = 'src\pages\FlightSelection.jsx'
Clean-LiteralNewlines $flightPath
$flightText = Get-Content $flightPath -Raw
$flightText = $flightText.Replace('import FlightCard from "../components/FlightCard";`r`nimport Navbar from "../components/Navbar";', 'import FlightCard from "../components/FlightCard";'+[Environment]::NewLine+'import Navbar from "../components/Navbar";')
$flightText = $flightText.Replace('import FlightCard from "../components/FlightCard";'+[Environment]::NewLine+'import Navbar from "../components/Navbar";'+[Environment]::NewLine+'import Navbar from "../components/Navbar";', 'import FlightCard from "../components/FlightCard";'+[Environment]::NewLine+'import Navbar from "../components/Navbar";')
$flightText = $flightText.Replace('        const fallbackState = location.state || {};', '        const fallbackState = location.state?.searchForm || location.state || {};')
$flightText = $flightText.Replace(@"
            passengers: fallbackState.passengers || {
                adults: 1,
                children: 0,
                infants: 0,
            },
"@, @"
            passengers: {
                adults: Number(fallbackState.adults ?? fallbackState.passengers?.adults ?? 1),
                children: Number(fallbackState.children ?? fallbackState.passengers?.children ?? 0),
                infants: Number(fallbackState.infants ?? fallbackState.passengers?.infants ?? 0),
            },
"@)
$flightText = $flightText.Replace(@"
    const [searchParams] = useSearchParams();

  const flights = Array.isArray(dummyFlightsData)
"@, @"
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
"@)
$flightText = $flightText.Replace(@"
  return (
    <div className="flight-selection-page">
            <div className="flight-selection-header">
"@, @"
  return (
    <div className="flight-selection-page">
        <Navbar onNavClick={() => {}} />
        <div className="flight-selection-backRow">
            <button type="button" className="flight-selection-backButton" onClick={goBackToHome}>
                ← Back
            </button>
        </div>
            <div className="flight-selection-header">
"@)
Set-Content $flightPath $flightText

# SeatSelection clean artifacts and add navbar
$seatPath = 'src\pages\SeatSelection.jsx'
Clean-LiteralNewlines $seatPath
$seatText = Get-Content $seatPath -Raw
$seatText = $seatText.Replace('import { Link, useLocation } from "react-router-dom";', 'import { Link, useLocation } from "react-router-dom";'+[Environment]::NewLine+'import Navbar from "../components/Navbar";')
$seatText = $seatText.Replace(@"
  return (
    <div style={{ padding: "32px", fontFamily: "Arial, sans-serif" }}>
"@, @"
  return (
    <div>
      <Navbar />
      <div style={{ padding: "32px", fontFamily: "Arial, sans-serif" }}>
"@)
$seatText = $seatText.Replace(@"
      <Link to="/" style={{ display: "inline-block", marginTop: "20px" }}>Back to home</Link>
    </div>
  );
}
"@, @"
      <Link to="/" style={{ display: "inline-block", marginTop: "20px" }}>Back to home</Link>
      </div>
    </div>
  );
}
"@)
Set-Content $seatPath $seatText

# remove temp file hint by leaving for now
Write-Host 'navigation files updated'
