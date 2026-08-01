import { FiX } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import CartDrawerItem from './cart/CartDrawerItem';
import CartDrawerFooter from './cart/CartDrawerFooter';

function CartDrawer() {
  const { cartItems, totalPrice, drawerOpen, setDrawerOpen } = useCart();
  const close = () => setDrawerOpen(false);

  return (
    <>
      {drawerOpen && <div className="menu-overlay" onClick={close} />}

      <aside className={`cart-drawer ${drawerOpen ? 'open' : ''}`}>
        <div className="cart-drawer-header">
          <h2>Your Cart</h2>
          <button className="slide-menu-close" onClick={close} aria-label="Close cart">
            <FiX size={22} />
          </button>
        </div>

        <div className="cart-drawer-items">
          {cartItems.length === 0 ? (
            <p className="cart-drawer-empty">Your cart is empty.</p>
          ) : (
            cartItems.map(item => (
              <CartDrawerItem key={`${item.id}-${item.size}`} item={item} onClose={close} />
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <CartDrawerFooter totalPrice={totalPrice} onClose={close} />
        )}
      </aside>
    </>
  );
}

export default CartDrawer;
