import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import MainItemSelector from './MainItemSelector';
import ColorsToAvoid from './ColorsToAvoid';

function CustomizeOptions({ open, onToggle, mainItem, onMainItemChange, avoidColors, onAvoidColorsChange, colors }) {
  const hasChanges = mainItem !== 'Shirt' || avoidColors.length > 0;

  return (
    <div className="bundle-customize">
      <button type="button" className="bundle-customize-toggle" onClick={onToggle}>
        <span>Customize your request</span>
        {open ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
      </button>

      {open && (
        <div className="bundle-customize-body">
          <p className="bundle-explain">
            We believe that every great outfit starts with the perfect shirt, and we never shy away from color. If you have a different vibe in mind, just let us know!
          </p>

          <MainItemSelector selected={mainItem} onChange={onMainItemChange} />

          <div className="bundle-color-group">
            <ColorsToAvoid selected={avoidColors} onChange={onAvoidColorsChange} colors={colors} />
            <button
              type="button"
              className="filter-clear-btn"
              className="filter-clear-btn bundle-clear-btn"
              style={{ visibility: hasChanges ? 'visible' : 'hidden' }}
              onClick={() => { onMainItemChange('Shirt'); onAvoidColorsChange([]); }}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomizeOptions;
