import { useState } from 'react';
import FormField from '../FormField';
import CardNumberInput from './CardNumberInput';
import ExpiryInput from './ExpiryInput';

function PaymentForm({ onSubmit, onBack }) {
  const [nameOnCard, setNameOnCard] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  return (
    <form onSubmit={onSubmit}>
      <p className="checkout-section-title">Payment</p>
      <FormField label="Name on Card" value={nameOnCard} onChange={setNameOnCard} autoComplete="cc-name" />
      <CardNumberInput value={cardNumber} onChange={setCardNumber} />
      <div className="checkout-row">
        <ExpiryInput value={expiry} onChange={setExpiry} />
        <FormField
          label="CVV"
          value={cvv}
          onChange={val => setCvv(val.replace(/\D/g, '').slice(0, 4))}
          autoComplete="cc-csc"
          placeholder="123"
          maxLength={4}
          inputMode="numeric"
        />
      </div>
      <div className="checkout-submit">
        <button type="button" className="btn btn-secondary btn-full-mb" onClick={onBack}>
          ← Back to Delivery Info
        </button>
        <button type="submit" className="btn btn-primary btn-full">
          Place Order
        </button>
      </div>
    </form>
  );
}

export default PaymentForm;
