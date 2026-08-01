function ColorFilter({ pageColors, pendingColors, onToggleColor }) {
  if (pageColors.length === 0) return null;

  return (
    <>
      <p className="control-dropdown-title">Color</p>
      <div className="filter-color-swatches">
        {pageColors.map(c => (
          <button
            key={c.name}
            type="button"
            className={`color-swatch ${pendingColors.includes(c.name) ? 'selected' : ''}`}
            style={{ background: c.hex, border: c.border ? '1px solid #ccc' : undefined }}
            onClick={() => onToggleColor(c.name)}
            title={c.name}
            aria-label={c.name}
          />
        ))}
      </div>
    </>
  );
}

export default ColorFilter;
