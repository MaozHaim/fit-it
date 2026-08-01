import { Link } from 'react-router-dom';
import ProductCard from '../ProductCard';

function NewProducts({ products }) {
  return (
    <section className="featured-products">
      <h2>New Products</h2>
      {products.length > 0 && (
        <>
          <div className="products-grid">
            {products.slice(0, 8).map(p => (
              <ProductCard key={p.id} id={p.id} name={p.name} price={p.price} imageUrl={p.image_url} product={p} />
            ))}
          </div>
          <div className="home-see-more-wrap">
            <Link to="/products?tag=new" className="home-see-more-btn">See More</Link>
          </div>
        </>
      )}
    </section>
  );
}

export default NewProducts;
