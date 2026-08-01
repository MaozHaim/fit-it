import { Link } from 'react-router-dom';

function HeroSection() {
  return (
    <div className="hero-wrapper">
      <section className="hero">
        <Link to="/products?tag=sale">
          <img className="hero-image" src="/hero-image.jpg" alt="FIT-IT style" />
        </Link>
        <video
          className="hero-video"
          src="/hero.mov"
          autoPlay
          loop
          muted
          playsInline
        />
      </section>
    </div>
  );
}

export default HeroSection;
