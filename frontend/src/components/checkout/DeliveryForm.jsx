import FormField from '../FormField';
import SaveAddressToggle from './SaveAddressToggle';

function DeliveryForm({
  firstName, setFirstName,
  lastName, setLastName,
  address, setAddress,
  city, setCity,
  zip, setZip,
  country, setCountry,
  saveAddress, setSaveAddress,
  onNext,
}) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onNext(); }}>
      <p className="checkout-section-title">Delivery Info</p>
      <div className="checkout-row">
        <FormField label="First Name" value={firstName} onChange={setFirstName} autoComplete="given-name" />
        <FormField label="Last Name" value={lastName} onChange={setLastName} autoComplete="family-name" />
      </div>
      <FormField label="Address" value={address} onChange={setAddress} autoComplete="street-address" />
      <div className="checkout-row">
        <FormField label="City" value={city} onChange={setCity} autoComplete="address-level2" />
        <FormField label="ZIP Code" value={zip} onChange={setZip} autoComplete="postal-code" />
      </div>
      <FormField label="Country" value={country} onChange={setCountry} autoComplete="country-name" />
      <SaveAddressToggle saveAddress={saveAddress} onChange={setSaveAddress} />
      <div className="checkout-submit">
        <button type="submit" className="btn btn-primary btn-full">
          Continue to Payment
        </button>
      </div>
    </form>
  );
}

export default DeliveryForm;
