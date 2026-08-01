function OrderCard({ order, onClick }) {
  return (
    <div className="order-card order-card-clickable" onClick={() => onClick(order)}>
      <div className="order-card-header">
        <div>
          <span className="order-card-id">{order.id}</span>
          <span className="order-card-date">
            {new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        <span className="order-status-badge">{order.status}</span>
      </div>
      <div className="order-card-items">
        {(order.items || []).map((item, idx) => (
          <div key={idx}>{item.quantity}x {item.name} (Size {item.size})</div>
        ))}
      </div>
      <div className="order-card-footer">Total: ${Number(order.total).toFixed(2)}</div>
    </div>
  );
}

export default OrderCard;
