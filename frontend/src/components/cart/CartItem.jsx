import { Link } from 'react-router-dom';
import { FiTrash2, FiEdit2 } from 'react-icons/fi';
import QuantityEditor from './QuantityEditor';
import CartItemPrice from './CartItemPrice';

function CartItem({ item, isEditing, draftQty, onEdit, onCancelEdit, onDraftChange, onConfirmEdit, onRemove }) {
  return (
    <div className="cart-item">
      <Link to={`/products/${item.id}`} className="cart-item-image">
        {item.image_url
          ? <img src={item.image_url} alt={item.name} />
          : <div className="cart-item-image-placeholder" />
        }
      </Link>
      <div className="cart-item-details">
        <h3>{item.name}</h3>
        <p className="cart-item-meta">Size: {item.size}</p>
        {isEditing ? (
          <QuantityEditor qty={draftQty} onChange={onDraftChange} onConfirm={onConfirmEdit} />
        ) : (
          <p className="cart-item-meta">Qty: {item.quantity}</p>
        )}
        <CartItemPrice item={item} />
      </div>
      <div className="cart-item-actions">
        <button className="cart-item-action-btn" onClick={isEditing ? onCancelEdit : onEdit} aria-label="Edit quantity">
          <FiEdit2 size={15} />
        </button>
        <button className="cart-item-action-btn" onClick={onRemove} aria-label="Remove item">
          <FiTrash2 size={15} />
        </button>
      </div>
    </div>
  );
}

export default CartItem;
