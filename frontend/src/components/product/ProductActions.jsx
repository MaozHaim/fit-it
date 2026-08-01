import { useState } from 'react';
import { useCart } from '../../context/CartContext';

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

function ProductActions({ product, isOnSale }) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState(null);
  const [sizeError, setSizeError] = useState(false);

  const handleAddToCart = () => {
    if (!selectedSize) { setSizeError(true); return; }
    const cartProduct = isOnSale
      ? { ...product, price: (parseFloat(product.price) * 0.5).toFixed(2), is_on_sale: true, original_price: product.price }
      : { ...product, is_on_sale: false };
    addToCart(cartProduct, selectedSize);
  };

  return (
    <>
      <div className="detail-title-row">
        <h1>{product.name}</h1>
        {isOnSale ? (
          <div className="detail-price-wrap">
            <p className="detail-price price-original">${product.price}</p>
            <p className="detail-price price-sale">${(parseFloat(product.price) * 0.5).toFixed(2)}</p>
          </div>
        ) : (
          <p className="detail-price">${product.price}</p>
        )}
      </div>

      <div className="detail-sizes">
        <p className={`detail-label ${sizeError ? 'detail-label-error' : ''}`}>
          {sizeError ? 'Please select a size' : 'Size'}
        </p>
        <div className="size-options">
          {SIZES.map(s => (
            <button
              key={s}
              className={`size-btn ${selectedSize === s ? 'selected' : ''} ${sizeError ? 'size-btn-error' : ''}`}
              onClick={() => { setSelectedSize(s); setSizeError(false); }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <button className="btn btn-primary detail-add-btn" onClick={handleAddToCart}>
        Add to Cart
      </button>
    </>
  );
}

export default ProductActions;
