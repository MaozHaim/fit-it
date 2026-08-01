import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';

function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, totalPrice } = useCart();
  const [editingKey, setEditingKey] = useState(null);
  const [draftQty, setDraftQty] = useState(1);

  const startEdit = (item) => {
    setEditingKey(`${item.id}-${item.size}`);
    setDraftQty(item.quantity);
  };

  const confirmEdit = (item) => {
    updateQuantity(item.id, item.size, draftQty);
    setEditingKey(null);
  };

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>
      {cartItems.length === 0 ? (
        <div className="cart-empty">
          <p>Your cart is empty.</p>
          <Link to="/products" className="btn btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map(item => {
              const key = `${item.id}-${item.size}`;
              return (
                <CartItem
                  key={key}
                  item={item}
                  isEditing={editingKey === key}
                  draftQty={draftQty}
                  onEdit={() => startEdit(item)}
                  onCancelEdit={() => setEditingKey(null)}
                  onDraftChange={setDraftQty}
                  onConfirmEdit={() => confirmEdit(item)}
                  onRemove={() => removeFromCart(item.id, item.size)}
                />
              );
            })}
          </div>
          <CartSummary totalPrice={totalPrice} />
        </div>
      )}
    </div>
  );
}

export default CartPage;
