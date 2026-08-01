function QueryInput({ value, onChange }) {
  return (
    <div className="bundling-prompt-form">
      <input
        className="bundling-prompt-input"
        type="text"
        placeholder="e.g. A casual summer wedding"
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  );
}

export default QueryInput;
