import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import SizePicker from './product/SizePicker';

function ProductCard({ id, name = 'Product Name', price = '0.00', imageUrl, product, showSalePrice = false }) {
  const { addToCart } = useCart();
  const [showSizePicker, setShowSizePicker] = useState(false);
  const pickerRef = useRef(null);
  const to = id ? `/products/${id}` : null;
  const linkState = { product: product ?? { id, name, price, image_url: imageUrl }, isOnSale: showSalePrice };

  const effectivePrice = showSalePrice
    ? (parseFloat(price) * 0.5).toFixed(2)
    : price;

  const handlePlusClick = (e) => {
    e.preventDefault();
    setShowSizePicker(true);
  };

  const handleSizeSelect = (size) => {
    addToCart({
      id, name, price: effectivePrice, image_url: imageUrl,
      ...(showSalePrice && { is_on_sale: true, original_price: price }),
    }, size);
    setShowSizePicker(false);
  };

  useEffect(() => {
    if (!showSizePicker) return;
    const handleClick = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowSizePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showSizePicker]);

  const image = imageUrl
    ? <img src={imageUrl} alt={name} />
    : <div className="product-image-placeholder" />;

  return (
    <div className="product-card">
      <div className="product-card-image-wrap">
        {to
          ? <Link to={to} state={linkState} className="product-card-image">{image}</Link>
          : <div className="product-card-image">{image}</div>
        }
        {showSizePicker && (
          <SizePicker
            pickerRef={pickerRef}
            onSelect={handleSizeSelect}
            onClose={() => setShowSizePicker(false)}
          />
        )}
      </div>
      <div className="product-card-footer">
        {to
          ? <Link to={to} state={linkState} className="product-card-name">{name}</Link>
          : <span className="product-card-name">{name}</span>
        }
        <button className="product-add-btn" aria-label="Add to cart" onClick={handlePlusClick}>
          <FiPlus size={18} />
        </button>
      </div>
      {showSalePrice ? (
        <p className="product-price">
          <span className="price-original">${price}</span>
          <span className="price-sale">${effectivePrice}</span>
        </p>
      ) : (
        <p className="product-price">${price}</p>
      )}
    </div>
  );
}

export default ProductCard;
