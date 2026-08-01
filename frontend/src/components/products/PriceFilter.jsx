function PriceFilter({ pendingMin, onMinChange, pendingMax, onMaxChange }) {
  return (
    <>
      <p className="control-dropdown-title filter-price-section-title">Price Range</p>
      <div className="filter-price-row">
        <input
          className="filter-price-input"
          type="number"
          placeholder="Min $"
          min="0"
          value={pendingMin}
          onChange={e => onMinChange(e.target.value)}
        />
        <span className="filter-price-sep">–</span>
        <input
          className="filter-price-input"
          type="number"
          placeholder="Max $"
          min="0"
          value={pendingMax}
          onChange={e => onMaxChange(e.target.value)}
        />
      </div>
    </>
  );
}

export default PriceFilter;
