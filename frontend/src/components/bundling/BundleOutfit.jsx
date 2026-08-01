import ProductCard from '../ProductCard';
import { useCart } from '../../context/CartContext';

function BundleOutfit({ items }) {
  const { addToCart } = useCart();

  return (
    <div className="bundle-outfit">
      <div className="bundle-outfit-grid" style={{ gridTemplateColumns: `repeat(${items.length}, 1fr)` }}>
        {items.map(p => (
          <ProductCard key={p.id} id={p.id} name={p.name} price={p.price} imageUrl={p.image_url} product={p} />
        ))}
      </div>
      <div className="bundle-outfit-action">
        <button
          className="btn btn-primary bundle-get-look-btn"
          onClick={() => items.forEach(p => addToCart(p, 'M'))}
        >
          Get the<br />Look
        </button>
      </div>
    </div>
  );
}

export default BundleOutfit;
