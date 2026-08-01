function CardNumberInput({ value, onChange }) {
  const handleChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    onChange(raw.match(/.{1,4}/g)?.join(' ') || raw);
  };

  return (
    <div className="auth-field">
      <label>Card Number</label>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="1234 5678 9012 3456"
        maxLength={19}
        required
        autoComplete="cc-number"
        inputMode="numeric"
      />
    </div>
  );
}

export default CardNumberInput;
