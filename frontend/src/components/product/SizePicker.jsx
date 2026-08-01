import { FiX } from 'react-icons/fi';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

function SizePicker({ pickerRef, onSelect, onClose }) {
  return (
    <div className="size-picker-popup" ref={pickerRef}>
      <div className="size-picker-inner">
        <div className="size-picker-header">
          <span>Select Size</span>
          <button className="size-picker-close" onClick={onClose}>
            <FiX size={14} />
          </button>
        </div>
        <div className="size-picker-options">
          {SIZES.map(s => (
            <button key={s} className="size-picker-btn" onClick={() => onSelect(s)}>
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SizePicker;
