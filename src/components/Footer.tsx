import Link from 'next/link';
import '@/styles/footer.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-top">
          {/* Brand Column */}
          <div className="footer-brand">
            <Link href="/" className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif', fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>
                <div style={{ width: '38px', height: '38px', background: 'var(--btn-bg)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--btn-text)', fontSize: '18px', boxShadow: 'var(--btn-shadow)' }}><i className="fas fa-bolt"></i></div>
                Tool<span style={{ color: 'var(--accent)' }}>Tive.</span>
            </Link>
            <p>Providing free, high-quality professional online utilities for businesses and creatives. No signups, no hassle.</p>
            <div className="footer-social">
                <a href="#" className="social-link"><i className="fab fa-twitter"></i></a>
                <a href="#" className="social-link"><i className="fab fa-github"></i></a>
                <a href="#" className="social-link"><i className="fab fa-discord"></i></a>
            </div>
          </div>

          {/* Tools Column */}
          <div className="footer-col">
            <h4>Free Tools</h4>
            <ul>
              <li><Link href="/business/invoice-generator">Invoice Generator</Link></li>
              <li><Link href="/editing/free-image-refiner-and-upscaler-online">Image Refiner</Link></li>
            </ul>
          </div>

          {/* Legal & Policies Column */}
          <div className="footer-col">
            <h4>Legal & Policies</h4>
            <ul>
              <li><Link href="/privacy-policy">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service">Terms of Service</Link></li>
              <li><Link href="/disclaimer">Disclaimer</Link></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li><a href="mailto:support@tooltive.com">support@tooltive.com</a></li>
              <li><Link href="/contact">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-copy">© {year} ToolTive. All rights reserved.</div>
          <div className="footer-love">Made with <i className="fas fa-heart"></i> by ToolTive Team</div>
        </div>
      </div>
    </footer>
  );
}
