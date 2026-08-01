import { FiSearch, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

function SearchBanner({ query, onQueryChange, onClose }) {
  const navigate = useNavigate();

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
      onClose();
    }
    if (e.key === 'Escape') onClose();
  };

  return (
    <>
      <div className="search-overlay" onClick={onClose} />
      <div className="search-banner">
        <div className="search-banner-inner">
          <FiSearch size={18} className="search-banner-icon" />
          <input
            className="search-banner-input"
            type="text"
            placeholder="Search for products…"
            value={query}
            onChange={e => onQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <button className="nav-icon-btn" onClick={onClose} aria-label="Close search">
            <FiX size={20} />
          </button>
        </div>
      </div>
    </>
  );
}

export default SearchBanner;
