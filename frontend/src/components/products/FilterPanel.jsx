import { useRef } from 'react';
import { FiFilter } from 'react-icons/fi';
import useOutsideClick from '../../hooks/useOutsideClick';
import ColorFilter from './ColorFilter';
import PriceFilter from './PriceFilter';
import FilterActions from './FilterActions';

function FilterPanel({
  pageColors,
  pendingColors, onToggleColor,
  pendingMin, onMinChange,
  pendingMax, onMaxChange,
  pendingFilterCount, activeFilterCount,
  filterOpen, onOpen, onApply, onClear,
}) {
  const ref = useRef(null);
  useOutsideClick(ref, () => filterOpen && onOpen(false));

  return (
    <div className="products-control-wrap" ref={ref}>
      <button
        className={`products-control-btn ${filterOpen || activeFilterCount > 0 ? 'active' : ''}`}
        onClick={() => onOpen(true)}
      >
        <FiFilter size={15} />
        <span>Filter</span>
        {activeFilterCount > 0 && <span className="control-badge">{activeFilterCount}</span>}
      </button>

      {filterOpen && (
        <div className="control-dropdown filter-dropdown">
          <ColorFilter
            pageColors={pageColors}
            pendingColors={pendingColors}
            onToggleColor={onToggleColor}
          />
          <PriceFilter
            pendingMin={pendingMin}
            onMinChange={onMinChange}
            pendingMax={pendingMax}
            onMaxChange={onMaxChange}
          />
          <FilterActions
            pendingFilterCount={pendingFilterCount}
            onClear={onClear}
            onApply={onApply}
          />
        </div>
      )}
    </div>
  );
}

export default FilterPanel;
