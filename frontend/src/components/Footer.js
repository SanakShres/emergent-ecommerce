import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-secondary border-t border-border mt-24" data-testid="main-footer">
      <div className="container mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h3 className="text-lg font-bold mb-4" data-testid="footer-brand">LUMINA</h3>
            <p className="text-sm text-muted-foreground" data-testid="footer-tagline">
              Modern minimalist e-commerce for the discerning shopper.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4" data-testid="shop-heading">Shop</h4>
            <ul className="space-y-2">
              <li><Link to="/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-all-products-link">All Products</Link></li>
              <li><Link to="/products?category=Fashion" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-fashion-link">Fashion</Link></li>
              <li><Link to="/products?category=Electronics" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-electronics-link">Electronics</Link></li>
              <li><Link to="/products?category=Home & Living" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-home-link">Home & Living</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4" data-testid="customer-service-heading">Customer Service</h4>
            <ul className="space-y-2">
              <li><Link to="/account" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-account-link">My Account</Link></li>
              <li><Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-about-link">About Us</Link></li>
              <li><Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-contact-link">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4" data-testid="legal-heading">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-privacy-link">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="footer-terms-link">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 text-center">
          <p className="text-sm text-muted-foreground" data-testid="footer-copyright">
            © {new Date().getFullYear()} Lumina. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}