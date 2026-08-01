function FormField({ label, value, onChange, autoComplete, type = 'text', id, ...rest }) {
  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required
        autoComplete={autoComplete}
        {...rest}
      />
    </div>
  );
}

export default FormField;
