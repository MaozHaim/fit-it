import { useState, useEffect } from 'react';
import axios from 'axios';
import { prefetchColors } from '../data/colorsCache';
import HeroSection from '../components/home/HeroSection';
import NewProducts from '../components/home/NewProducts';

function HomePage() {
  const [newProducts, setNewProducts] = useState([]);

  useEffect(() => {
    axios.get('/api/store/products/?tag=new')
      .then(res => setNewProducts(res.data.results ?? res.data))
      .catch(() => setNewProducts([]));
    prefetchColors();
  }, []);

  return (
    <div className="home-page">
      <HeroSection />
      <NewProducts products={newProducts} />
    </div>
  );
}

export default HomePage;
