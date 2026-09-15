"use client";

import Image from 'next/image';
import Link from 'next/link';
import '@/styles/footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-bg-glow"></div>

      <div className="footer-container">
        {/* Updates / Blog Announcement Bar */}
        <div className="footer-newsletter">
          <div className="newsletter-text">
            <h4>Stay updated with ToolTive</h4>
            <p>Explore guides, tool release updates, and business insights on our blog.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Link
              href="/blog"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                background: 'var(--btn-bg)',
                color: 'var(--btn-text)',
                borderRadius: 'var(--radius-md)',
                fontSize: '14px',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: 'var(--btn-shadow)',
                transition: 'all 0.3s ease',
              }}
            >
              Explore Our Blog <i className="fas fa-arrow-right" style={{ fontSize: '12px' }}></i>
            </Link>
          </div>
        </div>

        {/* Footer Top - Main Grid */}
        <div className="footer-top">
          {/* Brand Column */}
          <div className="footer-brand">
            <Link href="/" className="footer-logo">
              <Image
                className="footer-logo-mark"
                src="/brand/tooltive-tt-mark.png"
                alt=""
                width={973}
                height={681}
              />
              <span className="footer-wordmark">ToolTive.</span>
            </Link>
            <p className="footer-desc">
              Providing free, high-quality professional online utilities for businesses and creatives. No signups, no hassle.
            </p>
          </div>

          {/* Company Column */}
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/all-tools">All Tools</Link></li>
              <li><Link href="/blog">Blog</Link></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="footer-col">
            <h4>Legal</h4>
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
