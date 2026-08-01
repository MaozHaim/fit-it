import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BundleOutfit from '../components/bundling/BundleOutfit';

const ITEM_MAP = {
  'Shirt': 'shirts',
  'Pants': 'pants',
  'Jacket': 'coats_jackets',
  'Shoes': 'footwear',
};

function BundleResultPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const query = state?.query || '';
  const mainItem = state?.mainItem || 'Shirt';
  const avoidColors = state?.avoidColors || [];

  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    const params = new URLSearchParams();
    params.set('q', query);
    params.set('main_category', ITEM_MAP[mainItem] || 'shirts');
    params.set('num_bundles', '5');
    if (avoidColors.length > 0) params.set('colors', avoidColors.join(','));
    axios.get(`/api/store/bundling/?${params}`)
      .then(res => {
        const bundles = res.data.bundles || [];
        setOutfits(bundles.map(bundle => Object.values(bundle.items).filter(Boolean)));
      })
      .catch(() => setError('Could not load results. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  const handleBack = () => {
    navigate('/bundling', { state: { query, mainItem, avoidColors, customizeOpen: state?.customizeOpen } });
  };

  return (
    <div className="bundle-result-page">
      <div className="bundle-result-header">
        <button className="back-link" onClick={handleBack}>&larr; Back</button>
        {query && <p className="bundle-result-query">Results for: <strong>"{query}"</strong></p>}
      </div>

      {loading ? (
        <div className="products-spinner-wrap"><div className="products-spinner" /></div>
      ) : error ? (
        <p className="products-empty">{error}</p>
      ) : outfits.length === 0 ? (
        <p className="products-empty">No results found. Try a different query.</p>
      ) : (
        outfits.map((items, idx) => (
          <div key={idx}>
            <BundleOutfit items={items} />
            {idx < outfits.length - 1 && <hr className="bundle-outfit-divider" />}
          </div>
        ))
      )}
    </div>
  );
}

export default BundleResultPage;
