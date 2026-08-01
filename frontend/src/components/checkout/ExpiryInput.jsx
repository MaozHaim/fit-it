function ExpiryInput({ value, onChange }) {
  const handleChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length > 2) val = val.slice(0, 2) + '/' + val.slice(2);
    onChange(val);
  };

  return (
    <div className="auth-field">
      <label>Expiry Date</label>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="MM/YY"
        maxLength={5}
        required
        autoComplete="cc-exp"
        inputMode="numeric"
      />
    </div>
  );
}

export default ExpiryInput;
