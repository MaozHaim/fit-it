import { useState } from 'react';
import OrderCard from './OrderCard';
import OrderModal from './OrderModal';

function ordersKey(email) { return `fitit_orders_${email}`; }

function OrderHistory({ userEmail }) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const orders = JSON.parse(localStorage.getItem(ordersKey(userEmail)) || '[]');

  return (
    <div className="profile-section">
      <h2>Order History</h2>

      {orders.length === 0 ? (
        <p className="profile-empty">No orders yet.</p>
      ) : (
        orders.map(order => (
          <OrderCard key={order.id} order={order} onClick={setSelectedOrder} />
        ))
      )}

      {selectedOrder && (
        <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}

export default OrderHistory;
