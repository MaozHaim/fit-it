import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import StepIndicator from '../components/checkout/StepIndicator';
import DeliveryForm from '../components/checkout/DeliveryForm';
import PaymentForm from '../components/checkout/PaymentForm';
import OrderSummary from '../components/checkout/OrderSummary';

function nextOrderId() {
  const current = parseInt(localStorage.getItem('fitit_order_counter') || '1000', 10);
  const next = current + 1;
  localStorage.setItem('fitit_order_counter', String(next));
  return String(next);
}

function CheckoutPage() {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const submitting = useRef(false);

  useEffect(() => {
    if (!submitting.current && cartItems.length === 0) {
      navigate('/products', { replace: true });
    }
  }, [cartItems, navigate]);

  const defaultAddr = (() => {
    if (!user?.email) return null;
    const idx = localStorage.getItem(`fitit_default_address_idx_${user.email}`);
    if (idx === null) return null;
    const addrs = JSON.parse(localStorage.getItem(`fitit_addresses_${user.email}`) || '[]');
    return addrs[parseInt(idx, 10)] || null;
  })();

  const [firstName, setFirstName] = useState(defaultAddr?.firstName || user?.firstName || '');
  const [lastName, setLastName] = useState(defaultAddr?.lastName || user?.lastName || '');
  const [address, setAddress] = useState(defaultAddr?.address || '');
  const [city, setCity] = useState(defaultAddr?.city || '');
  const [zip, setZip] = useState(defaultAddr?.zip || '');
  const [country, setCountry] = useState(defaultAddr?.country || '');
  const [saveAddress, setSaveAddress] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    submitting.current = true;
    setLoading(true);

    const order = {
      id: nextOrderId(),
      date: new Date().toISOString(),
      status: 'Processing',
      items: cartItems,
      total: totalPrice,
      shipping: { firstName, lastName, address, city, zip, country },
    };

    try {
      await fetch('/api/store/orders/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
    } catch { }

    const userEmail = user?.email || 'guest';
    const ordersKey = `fitit_orders_${userEmail}`;
    const addressesKey = `fitit_addresses_${userEmail}`;
    const existing = JSON.parse(localStorage.getItem(ordersKey) || '[]');
    localStorage.setItem(ordersKey, JSON.stringify([order, ...existing]));
    localStorage.setItem('fitit_last_order', JSON.stringify(order));

    if (saveAddress) {
      const newAddr = { firstName, lastName, address, city, zip, country };
      const savedAddrs = JSON.parse(localStorage.getItem(addressesKey) || '[]');
      const isDuplicate = savedAddrs.some(a => a.address === address && a.city === city && a.zip === zip);
      if (!isDuplicate) {
        const updated = [...savedAddrs, newAddr];
        localStorage.setItem(addressesKey, JSON.stringify(updated));
        if (updated.length === 1) {
          localStorage.setItem(`fitit_default_address_idx_${userEmail}`, '0');
        }
      }
    }

    await new Promise((r) => setTimeout(r, 1500));
    clearCart();
    navigate('/order-success');
  };

  if (cartItems.length === 0) return null;

  if (loading) {
    return (
      <div className="order-loading">
        <div className="spinner" />
        <p>Placing your order…</p>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

      <div className="checkout-form">
        <StepIndicator step={step} />

        {step === 1 && (
          <DeliveryForm
            firstName={firstName} setFirstName={setFirstName}
            lastName={lastName} setLastName={setLastName}
            address={address} setAddress={setAddress}
            city={city} setCity={setCity}
            zip={zip} setZip={setZip}
            country={country} setCountry={setCountry}
            saveAddress={saveAddress} setSaveAddress={setSaveAddress}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <PaymentForm onSubmit={handleSubmit} onBack={() => setStep(1)} />
        )}
      </div>

      <OrderSummary cartItems={cartItems} totalPrice={totalPrice} />
    </div>
  );
}

export default CheckoutPage;
