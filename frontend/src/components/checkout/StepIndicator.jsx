function StepIndicator({ step }) {
  return (
    <div className="checkout-steps">
      <span className={`checkout-step ${step >= 1 ? 'active' : ''}`}>1. Delivery Info</span>
      <span className="checkout-step-sep">›</span>
      <span className={`checkout-step ${step >= 2 ? 'active' : ''}`}>2. Payment</span>
    </div>
  );
}

export default StepIndicator;
