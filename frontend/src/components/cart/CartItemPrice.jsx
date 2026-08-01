function CartItemPrice({ item }) {
  if (item.is_on_sale) {
    return (
      <p className="cart-item-price">
        <span className="price-original">${(parseFloat(item.original_price) * item.quantity).toFixed(2)}</span>
        <span className="price-sale">${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
      </p>
    );
  }
  return (
    <p className="cart-item-price">${(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
  );
}

export default CartItemPrice;
