import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import ProductImage from '../components/product/ProductImage';
import ProductActions from '../components/product/ProductActions';
import ProductAccordions from '../components/product/ProductAccordions';

function ProductDetailPage() {
  const { id } = useParams();
  const { state } = useLocation();

  const isOnSale = state?.isOnSale ?? false;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (state?.product) {
      setProduct(state.product);
      setLoading(false);
    } else {
      setLoading(true);
      axios.get(`/api/store/products/${id}/`)
        .then(res => setProduct(res.data))
        .catch(() => setProduct(null))
        .finally(() => setLoading(false));
    }
  }, [id, state]);

  if (loading) return <p className="detail-loading">Loading…</p>;

  if (!product) return (
    <div className="product-detail-page">
      <Link to="/products" className="back-link">&larr; Back</Link>
      <p>Product not found.</p>
    </div>
  );

  return (
    <div key={id} className="product-detail-page">
      <ProductImage imageUrl={product.image_url} name={product.name} />
      <div className="detail-body">
        <ProductActions product={product} isOnSale={isOnSale} />
        <ProductAccordions description={product.description} />
      </div>
    </div>
  );
}

export default ProductDetailPage;
