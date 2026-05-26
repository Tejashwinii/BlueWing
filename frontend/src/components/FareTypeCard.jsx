import "../styles/FareTypeCard.css";

export default function FareTypeCard({
  isSelected = false,
  onSelect,
  title,
  badge,
  price,
  earnText,
  baggage = [],
  cancellationLabel,
  features = [],
  isNew = false,
  upgradeText,
  upgradeCta,
}) {
  return (
    <div
      className={`flight-fareTypeCard ${isSelected ? "is-selected" : ""}`}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect?.();
        }
      }}
      aria-pressed={isSelected}
    >
      <div className="flight-fareTypeCardHeader">
        <div>
          <p className="flight-fareTypePrice">{price}</p>
          {earnText ? <p className="flight-fareTypeRewards">{earnText}</p> : null}
        </div>

        {badge ? (
          <div className="flight-fareTypeBadgeWrap">
            <span className="flight-fareTypeBadge">{badge}</span>
            {isNew ? <span className="flight-fareTypeNewTag">New</span> : null}
          </div>
        ) : null}
      </div>

      <div className="flight-fareTypeCardDivider" />

      {baggage.length > 0 ? (
        <div className="flight-fareTypeSection">
          {baggage.map((item) => (
            <p className="flight-fareTypeLine" key={item}>
              {item}
            </p>
          ))}
        </div>
      ) : null}

      {baggage.length > 0 ? <div className="flight-fareTypeSectionDivider" /> : null}

      {cancellationLabel ? (
        <div className="flight-fareTypeSection">
          <p className="flight-fareTypeLine">
            Change and cancellation charges <strong>{cancellationLabel}</strong>
          </p>
        </div>
      ) : null}

      {cancellationLabel || features.length > 0 ? <div className="flight-fareTypeSectionDivider" /> : null}

      {upgradeText ? (
        <div className="flight-fareTypeUpgradeBox">
          <div>
            <p className="flight-fareTypeUpgradeText">{upgradeText}</p>
            {title ? <p className="flight-fareTypeUpgradeTitle">{title}</p> : null}
          </div>
          {upgradeCta ? <button type="button" className="flight-fareTypeUpgradeButton">{upgradeCta}</button> : null}
        </div>
      ) : null}

      {features.length > 0 ? (
        <div className="flight-fareTypeSection">
          {features.map((item) => (
            <p className="flight-fareTypeLine" key={item}>
              {item}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
