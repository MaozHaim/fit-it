import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { COLOR_MAP } from '../data/colorsCache';
import FilterPanel from '../components/products/FilterPanel';
import SortPanel from '../components/products/SortPanel';
import ProductGrid from '../components/products/ProductGrid';

const PAGE_SIZE = 50;
const FETCH_SIZE = 500;

function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const search = searchParams.get('search');
  const tag = searchParams.get('tag');

  const [selectedCategory, setSelectedCategory] = useState(categoryParam || '');

  // Applied filter state
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedColors, setSelectedColors] = useState([]);

  // Pending (in-panel) filter state
  const [pendingMin, setPendingMin] = useState('');
  const [pendingMax, setPendingMax] = useState('');
  const [pendingColors, setPendingColors] = useState([]);

  const [sortBy, setSortBy] = useState('default');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const sentinelRef = useRef(null);

  useEffect(() => {
    setSelectedCategory(categoryParam || '');
  }, [categoryParam]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setVisibleCount(PAGE_SIZE);
    setMinPrice('');
    setMaxPrice('');
    setSelectedColors([]);
    const params = new URLSearchParams();
    if (categoryParam) params.set('category', categoryParam);
    if (search) params.set('search', search);
    if (tag) params.set('tag', tag);
    if (tag === 'sale') params.set('page_size', 100);
    else if (tag === 'new') params.set('page_size', 30);
    else params.set('page_size', FETCH_SIZE);

    axios.get(`/api/store/products/?${params}`)
      .then(res => setProducts(res.data.results ?? res.data))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [categoryParam, search, tag]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedCategory, minPrice, maxPrice, selectedColors, sortBy]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisibleCount(c => c + PAGE_SIZE); },
      { rootMargin: '200px' }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [loading]);

  const pageColors = useMemo(() => {
    const seen = new Set();
    const result = [];
    for (const p of products) {
      const name = p.color;
      if (name && !seen.has(name) && COLOR_MAP[name]) {
        seen.add(name);
        result.push({ name, hex: COLOR_MAP[name], border: name === 'White' || name === 'Cream' });
      }
    }
    return result;
  }, [products]);

  const openFilter = () => {
    setPendingMin(minPrice);
    setPendingMax(maxPrice);
    setPendingColors([...selectedColors]);
    setFilterOpen(true);
    setSortOpen(false);
  };

  const applyFilter = () => {
    setMinPrice(pendingMin);
    setMaxPrice(pendingMax);
    setSelectedColors(pendingColors);
    setFilterOpen(false);
  };

  const togglePendingColor = (name) =>
    setPendingColors(prev => prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]);

  const filtered = products.filter(p => {
    const matchesCategory = selectedCategory ? p.category_name === selectedCategory : true;
    const matchesSearch = search
      ? p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      : true;
    const price = parseFloat(p.price);
    const matchesMin = minPrice !== '' ? price >= parseFloat(minPrice) : true;
    const matchesMax = maxPrice !== '' ? price <= parseFloat(maxPrice) : true;
    const matchesColor = selectedColors.length > 0
      ? selectedColors.some(c => p.color?.toLowerCase().includes(c.toLowerCase()))
      : true;
    return matchesCategory && matchesSearch && matchesMin && matchesMax && matchesColor;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':  return parseFloat(a.price) - parseFloat(b.price);
      case 'price-desc': return parseFloat(b.price) - parseFloat(a.price);
      case 'name-asc':   return a.name.localeCompare(b.name);
      case 'name-desc':  return b.name.localeCompare(a.name);
      default:           return 0;
    }
  });

  const displayed = sorted.slice(0, visibleCount);
  const hasMore = visibleCount < sorted.length;

  const tagLabel = tag === 'new' ? 'New' : tag === 'sale' ? 'SALE' : null;
  const title = search ? `Results for "${search}"` : tagLabel || selectedCategory || 'All Products';

  const activeFilterCount = [minPrice !== '', maxPrice !== '', selectedColors.length > 0].filter(Boolean).length;
  const pendingFilterCount = [pendingMin !== '', pendingMax !== '', pendingColors.length > 0].filter(Boolean).length;

  return (
    <div className="products-page">
      <h1>{title}</h1>

      <div className="products-page-header">
        <div className="products-controls">
          <FilterPanel
            pageColors={pageColors}
            pendingColors={pendingColors}
            onToggleColor={togglePendingColor}
            pendingMin={pendingMin}
            onMinChange={setPendingMin}
            pendingMax={pendingMax}
            onMaxChange={setPendingMax}
            pendingFilterCount={pendingFilterCount}
            activeFilterCount={activeFilterCount}
            filterOpen={filterOpen}
            onOpen={setFilterOpen}
            onApply={applyFilter}
            onClear={() => { setPendingMin(''); setPendingMax(''); setPendingColors([]); }}
          />
          <SortPanel
            sortBy={sortBy}
            onSortChange={setSortBy}
            sortOpen={sortOpen}
            onOpen={setSortOpen}
            onCloseFilter={() => setFilterOpen(false)}
          />
        </div>
      </div>

      <ProductGrid
        loading={loading}
        products={sorted}
        displayed={displayed}
        hasMore={hasMore}
        sentinelRef={sentinelRef}
        tag={tag}
      />
    </div>
  );
}

export default ProductsPage;
