import { Link } from 'react-router-dom';

function CartDrawerItem({ item, onClose }) {
  return (
    <div className="cart-drawer-item">
      <Link to={`/products/${item.id}`} className="cart-drawer-image" onClick={onClose}>
        {item.image_url
          ? <img src={item.image_url} alt={item.name} />
          : <div className="cart-item-image-placeholder" />
        }
      </Link>
      <div className="cart-drawer-info">
        <p className="cart-drawer-name">{item.name}</p>
        <p className="cart-drawer-meta">Size: {item.size} · Qty: {item.quantity}</p>
        {item.is_on_sale ? (
          <p className="cart-drawer-price">
            <span className="price-original">${(parseFloat(item.original_price) * item.quantity).toFixed(2)}</span>
            <span className="price-sale">${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
          </p>
        ) : (
          <p className="cart-drawer-price">${(parseFloat(item.price) * item.quantity).toFixed(2)}</p>
        )}
      </div>
    </div>
  );
}

export default CartDrawerItem;
