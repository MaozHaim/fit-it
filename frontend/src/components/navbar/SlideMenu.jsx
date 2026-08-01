import { Link } from 'react-router-dom';
import { FiX } from 'react-icons/fi';

const CATEGORIES = ['Shirts', 'Pants', 'Coats & Jackets', 'Footwear'];

function SlideMenu({ open, onClose }) {
  return (
    <>
      {open && <div className="menu-overlay" onClick={onClose} />}
      <aside className={`slide-menu ${open ? 'open' : ''}`}>
        <button className="slide-menu-close" onClick={onClose} aria-label="Close menu">
          <FiX size={22} />
        </button>
        <ul className="slide-menu-list">
          {CATEGORIES.map(cat => (
            <li key={cat}>
              <Link to={`/products?category=${encodeURIComponent(cat)}`} onClick={onClose}>
                {cat}
              </Link>
            </li>
          ))}
          <li className="slide-menu-divider" />
          <li className="slide-menu-new">
            <Link to="/products?tag=new" onClick={onClose}>New</Link>
          </li>
          <li className="slide-menu-sale">
            <Link to="/products?tag=sale" onClick={onClose}>SALE</Link>
          </li>
        </ul>
      </aside>
    </>
  );
}

export default SlideMenu;
