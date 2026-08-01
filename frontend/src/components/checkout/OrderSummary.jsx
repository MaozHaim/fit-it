function OrderSummary({ cartItems, totalPrice }) {
  return (
    <div className="checkout-summary">
      {cartItems.map((item) => (
        <div key={`${item.id}-${item.size}`} className="checkout-summary-item">
          <div className="checkout-item-image">
            {item.image_url
              ? <img src={item.image_url} alt={item.name} />
              : <div className="checkout-item-placeholder" />
            }
          </div>
          <div className="checkout-item-info">
            <strong>{item.name}</strong>
            <span className="checkout-item-meta">Size: {item.size} · Qty: {item.quantity}</span>
          </div>
          <span className="checkout-item-price">
            ${(parseFloat(item.price) * item.quantity).toFixed(2)}
          </span>
        </div>
      ))}
      <div className="checkout-total">
        <span>Total</span>
        <span>${totalPrice.toFixed(2)}</span>
      </div>
    </div>
  );
}

export default OrderSummary;
