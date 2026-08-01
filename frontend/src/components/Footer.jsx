import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-col">
          <h3 className="footer-col-title">About Us</h3>
          <p className="footer-about-text">
            At FIT-IT, we believe getting dressed should be effortless. Our platform goes beyond individual clothing items by helping customers discover complete outfit bundles tailored to their unique style and preferences.
          </p>
        </div>

        <div className="footer-col">
          <h3 className="footer-col-title">Help</h3>
          <ul className="footer-links">
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/delivery">Delivery Info</Link></li>
            <li><Link to="/returns">Returns Policy</Link></li>
            <li><Link to="/size-guide">Size Guide</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h3 className="footer-col-title">Contact</h3>
          <ul className="footer-links">
            <li><a href="mailto:support@fit-it.com">support@fit-it.com</a></li>
            <li><a href="tel:+12125550198">+1 (212) 555-0198</a></li>
            <li><a href="https://www.instagram.com/fitit.official" target="_blank" rel="noreferrer">Instagram</a></li>
            <li><a href="https://www.tiktok.com/@fitit.official" target="_blank" rel="noreferrer">TikTok</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} FIT-IT. All rights reserved.</p>
        <p className="footer-tagline">Wear what fits you.</p>
      </div>
    </footer>
  );
}

export default Footer;
