"use client";

import Link from 'next/link';
import '@/styles/footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-bg-glow"></div>

      <div className="footer-container">
        {/* Newsletter Bar */}
        <div className="footer-newsletter">
          <div className="newsletter-text">
            <h4>Stay in the loop</h4>
            <p>Get notified when we launch new tools and features.</p>
          </div>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Enter your email..." required />
            <button type="submit">Subscribe</button>
          </form>
        </div>

        {/* Footer Top - Main Grid */}
        <div className="footer-top">
          {/* Brand Column */}
          <div className="footer-brand">
            <Link href="/" className="footer-logo">
              {/* <div className="footer-logo-icon">
                <i className="fas fa-bolt"></i>
              </div> */}
              Tool <span>Tive.</span>
            </Link>
            <p className="footer-desc">
              Providing free, high-quality professional online utilities for businesses and creatives. No signups, no hassle.
            </p>
            <div className="footer-social">
              <a href="#" className="social-link" aria-label="Twitter">
                <i className="fab fa-x-twitter"></i>
              </a>
              <a href="#" className="social-link" aria-label="GitHub">
                <i className="fab fa-github"></i>
              </a>
              <a href="#" className="social-link" aria-label="Discord">
                <i className="fab fa-discord"></i>
              </a>
              <a href="#" className="social-link" aria-label="YouTube">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>

          {/* Free Tools Column */}
          <div className="footer-col">
            <h4>Free Tools</h4>
            <ul>
              <li><Link href="/all-tools/business/free-invoice-generator">Invoice Generator</Link></li>
              <li><Link href="/all-tools/compress/free-image-compressor">Image Compressor</Link></li>
              <li><Link href="/all-tools/pdf/free-online-image-to-pdf-converter">Image to PDF Converter</Link></li>
              {/* <li><Link href="/all-tools">QR Code Maker</Link></li> */}
              {/* <li><Link href="/all-tools">Grammar Checker</Link></li> */}
            </ul>
          </div>

          {/* Legal Column */}
          <div className="footer-col">
            <h4>Legal & Policies</h4>
            <ul>
              <li><Link href="/privacy-policy">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service">Terms of Service</Link></li>
              <li><Link href="/cookie-policy">Cookie Policy</Link></li>
              <li><Link href="/disclaimer">Disclaimer</Link></li>
              <li><Link href="/dmca">DMCA Policy</Link></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="footer-col">
            <h4>Contact</h4>
            <ul>
              <li>
                <a href="mailto:support@tooltive.com" className="contact-item">
                  <i className="fas fa-envelope"></i>
                  support@tooltive.com
                </a>
              </li>
              <li>
                <Link href="/contact" className="contact-item">
                  <i className="fas fa-comment-dots"></i>
                  Contact Us
                </Link>
              </li>

            </ul>
          </div>
        </div>

        {/* Footer Bottom - Copyright */}
        <div className="footer-bottom">
          <div className="footer-copy">
            &copy; 2026 ToolTive. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}