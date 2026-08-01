import { Link } from 'react-router-dom';

function CartDrawerFooter({ totalPrice, onClose }) {
  return (
    <div className="cart-drawer-footer">
      <div className="cart-drawer-total">
        <span>Total</span>
        <span>${totalPrice.toFixed(2)}</span>
      </div>
      <div className="cart-drawer-actions">
        <Link to="/checkout" className="btn btn-primary" onClick={onClose}>
          Checkout
        </Link>
        <Link to="/cart" className="btn btn-secondary" onClick={onClose}>
          Go to Cart
        </Link>
      </div>
    </div>
  );
}

export default CartDrawerFooter;
