import { useRef } from 'react';
import { FiSliders } from 'react-icons/fi';
import useOutsideClick from '../../hooks/useOutsideClick';

const SORT_OPTIONS = [
  { value: 'default',    label: 'Most Recommended' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name-asc',   label: 'Name: A → Z' },
  { value: 'name-desc',  label: 'Name: Z → A' },
];

function SortPanel({ sortBy, onSortChange, sortOpen, onOpen, onCloseFilter }) {
  const ref = useRef(null);
  useOutsideClick(ref, () => sortOpen && onOpen(false));

  const activeLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label;

  return (
    <div className="products-control-wrap" ref={ref}>
      <button
        className={`products-control-btn ${sortOpen || sortBy !== 'default' ? 'active' : ''}`}
        onClick={() => { onOpen(o => !o); onCloseFilter(); }}
      >
        <FiSliders size={15} />
        <span>{sortBy !== 'default' ? activeLabel : 'Sort'}</span>
      </button>

      {sortOpen && (
        <div className="control-dropdown sort-dropdown">
          {SORT_OPTIONS.map(o => (
            <button
              key={o.value}
              className={`sort-option ${sortBy === o.value ? 'active' : ''}`}
              onClick={() => { onSortChange(o.value); onOpen(false); }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default SortPanel;
