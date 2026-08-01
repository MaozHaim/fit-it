import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import ScrollToTop from './components/ScrollToTop';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import FAQPage from './pages/FAQPage';
import DeliveryPage from './pages/DeliveryPage';
import ReturnsPage from './pages/ReturnsPage';
import SizeGuidePage from './pages/SizeGuidePage';
import BundleResultPage from './pages/BundleResultPage';
import BundlingPage from './pages/BundlingPage';

function App() {
  return (
    <AuthProvider>
    <CartProvider>
    <Router>
      <div className="app">
        <ScrollToTop />
        <Navbar />
        <CartDrawer />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success" element={<OrderSuccessPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/delivery" element={<DeliveryPage />} />
            <Route path="/returns" element={<ReturnsPage />} />
            <Route path="/size-guide" element={<SizeGuidePage />} />
            <Route path="/bundle-result" element={<BundleResultPage />} />
            <Route path="/bundling" element={<BundlingPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
    </CartProvider>
    </AuthProvider>
  );
}

export default App;
