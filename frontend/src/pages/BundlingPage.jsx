import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { prefetchColors, getCachedColors } from '../data/colorsCache';
import QueryInput from '../components/bundling/QueryInput';
import CustomizeOptions from '../components/bundling/CustomizeOptions';

function BundlingPage() {
  const { state } = useLocation();
  const [query, setQuery] = useState(state?.query || '');
  const [customizeOpen, setCustomizeOpen] = useState(state?.customizeOpen ?? !!(state?.avoidColors?.length));
  const [mainItem, setMainItem] = useState(state?.mainItem || 'Shirt');
  const [avoidColors, setAvoidColors] = useState(state?.avoidColors || []);
  const [colors, setColors] = useState(getCachedColors);
  const navigate = useNavigate();

  useEffect(() => {
    prefetchColors().then(c => setColors(c));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate('/bundle-result', { state: { query, mainItem, avoidColors, customizeOpen } });
  };

  return (
    <div className="bundling-page">
      <div className="bundling-header">
        <div className="bundling-description">
          <h1 className="bundling-title">Don't waste time scrolling.</h1>
          <p>Tell us exactly what you're dressing up for and we'll instantly curate a complete, coordinated outfit.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <QueryInput value={query} onChange={setQuery} />

        <CustomizeOptions
          open={customizeOpen}
          onToggle={() => setCustomizeOpen(o => !o)}
          mainItem={mainItem}
          onMainItemChange={setMainItem}
          avoidColors={avoidColors}
          onAvoidColorsChange={setAvoidColors}
          colors={colors}
        />

        <button className="bundling-prompt-submit bundle-submit-bottom" type="submit">
          Let's Bundle!
        </button>
      </form>
    </div>
  );
}

export default BundlingPage;
