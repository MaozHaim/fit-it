import { Link } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';

function OrderSuccessPage() {
  let orderId = null;
  try {
    const raw = localStorage.getItem('fitit_last_order');
    if (raw) {
      orderId = JSON.parse(raw).id;
    }
  } catch {
    // ignore parse errors
  }

  return (
    <div className="order-success">
      <FiCheckCircle size={64} color="#364C84" />
      <h1>Order Confirmed!</h1>
      <p>Thank you for your purchase. You'll receive a confirmation email shortly.</p>
      {orderId && <span className="order-success-id">Order {orderId}</span>}
      <div className="order-success-actions">
        <Link to="/products" className="btn btn-secondary">
          Continue Shopping
        </Link>
        <Link to="/profile" className="btn btn-primary">
          View My Orders
        </Link>
      </div>
    </div>
  );
}

export default OrderSuccessPage;
