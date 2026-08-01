function ColorsToAvoid({ selected, onChange, colors }) {
  const toggle = (name) =>
    onChange(prev => prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]);

  return (
    <div className="bundle-color-group">
      <p className="bundle-sub-label">Colors to avoid</p>
      <div className="bundle-color-swatches">
        {colors.map(c => (
          <button
            key={c.name}
            type="button"
            className={`color-swatch ${selected.includes(c.name) ? 'selected' : ''}`}
            style={{ background: c.hex, border: c.border ? '1px solid #ccc' : undefined }}
            onClick={() => toggle(c.name)}
            title={c.name}
            aria-label={c.name}
          />
        ))}
      </div>
    </div>
  );
}

export default ColorsToAvoid;
