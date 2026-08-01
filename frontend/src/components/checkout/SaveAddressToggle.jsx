function SaveAddressToggle({ saveAddress, onChange }) {
  return (
    <label className="save-address-toggle">
      <div
        className={`toggle-switch ${saveAddress ? 'on' : ''}`}
        onClick={() => onChange(o => !o)}
        role="switch"
        aria-checked={saveAddress}
      >
        <div className="toggle-knob" />
      </div>
      <span>Save this address to my profile</span>
    </label>
  );
}

export default SaveAddressToggle;
