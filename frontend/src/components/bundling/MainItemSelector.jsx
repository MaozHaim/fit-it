const MAIN_ITEMS = ['Shirt', 'Pants', 'Shoes'];

function MainItemSelector({ selected, onChange }) {
  return (
    <div className="bundle-option-group">
      <p className="bundle-sub-label">Main Item</p>
      <div className="bundle-item-options">
        {MAIN_ITEMS.map(item => (
          <button
            key={item}
            type="button"
            className={`bundle-item-btn ${selected === item ? 'selected' : ''}`}
            onClick={() => onChange(item)}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

export default MainItemSelector;
