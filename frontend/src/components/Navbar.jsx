import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiSearch, FiUser, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import SearchBanner from './navbar/SearchBanner';
import SlideMenu from './navbar/SlideMenu';

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { totalItems, setDrawerOpen } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const closeSearch = () => { setSearchOpen(false); setSearchQuery(''); };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <button className="nav-icon-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <FiMenu size={22} />
          </button>
          <Link to="/bundling" className="bundling-nav-btn">Bundling</Link>
        </div>

        <div className="navbar-center">
          <Link to="/">FIT-IT</Link>
        </div>

        <div className="navbar-right">
          <button className="nav-icon-btn" onClick={() => { setSearchOpen(true); setMenuOpen(false); }} aria-label="Search">
            <FiSearch size={20} />
          </button>
          <button className="nav-icon-btn" aria-label="Account" onClick={() => navigate(user ? '/profile' : '/auth')}>
            <FiUser size={20} />
          </button>
          <button className="nav-icon-btn cart-btn" aria-label="Cart" onClick={() => setDrawerOpen(true)}>
            <FiShoppingBag size={20} />
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </button>
        </div>
      </nav>

      {searchOpen && (
        <SearchBanner query={searchQuery} onQueryChange={setSearchQuery} onClose={closeSearch} />
      )}

      <SlideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

export default Navbar;
