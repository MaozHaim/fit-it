function FilterActions({ pendingFilterCount, onClear, onApply }) {
  return (
    <div className="filter-actions">
      {pendingFilterCount > 0 && (
        <button className="filter-clear-btn" onClick={onClear}>Clear</button>
      )}
      <button className="filter-apply-btn" onClick={onApply}>Apply</button>
    </div>
  );
}

export default FilterActions;
