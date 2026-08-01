import { FiX } from 'react-icons/fi';

function OrderModal({ order, onClose }) {
  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="order-modal">
        <div className="order-modal-header">
          <div>
            <span className="order-card-id">{order.id}</span>
            <span className="order-card-date">
              {new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <div className="order-modal-header-actions">
            <span className="order-status-badge">{order.status}</span>
            <button className="slide-menu-close" onClick={onClose} aria-label="Close">
              <FiX size={20} />
            </button>
          </div>
        </div>

        <div className="order-modal-items">
          {(order.items || []).map((item, idx) => (
            <div key={idx} className="order-modal-item">
              <div className="order-modal-image">
                {item.image_url
                  ? <img src={item.image_url} alt={item.name} />
                  : <div className="cart-item-image-placeholder" />
                }
              </div>
              <div className="order-modal-info">
                <p className="order-modal-name">{item.name}</p>
                <p className="order-modal-meta">Size: {item.size} · Qty: {item.quantity}</p>
                <p className="order-modal-price">${(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>

        {order.shipping && (
          <div className="order-modal-shipping">
            <p className="order-modal-section-title">Shipped to</p>
            <p>{order.shipping.firstName} {order.shipping.lastName}</p>
            <p>{order.shipping.address}</p>
            <p>{order.shipping.city}, {order.shipping.zip}</p>
            <p>{order.shipping.country}</p>
          </div>
        )}

        <div className="order-modal-footer">
          <span>Total</span>
          <span>${Number(order.total).toFixed(2)}</span>
        </div>
      </div>
    </>
  );
}

export default OrderModal;
