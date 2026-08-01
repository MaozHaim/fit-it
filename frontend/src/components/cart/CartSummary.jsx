import { useNavigate } from 'react-router-dom';

function CartSummary({ totalPrice }) {
  const navigate = useNavigate();

  return (
    <div className="cart-summary">
      <h2>Order Summary</h2>
      <p className="cart-total">Total: ${totalPrice.toFixed(2)}</p>
      <button className="btn btn-primary btn-full" onClick={() => navigate('/checkout')}>
        Checkout
      </button>
    </div>
  );
}

export default CartSummary;
