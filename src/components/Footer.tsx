import Image from 'next/image';
import SiteIcon from '@/components/SiteIcon';
import NewsletterForm from '@/components/NewsletterForm';
import '@/styles/footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-bg-glow"></div>

      <div className="footer-container">
        {/* Updates / Blog Announcement Bar */}
        <div className="footer-newsletter">
          <div className="newsletter-text">
            <h3>Stay updated with ToolTive</h3>
            <p>Explore guides, tool release updates, and business insights on our blog.</p>
          </div>
          <NewsletterForm />
        </div>

        {/* Footer Top - Main Grid */}
        <div className="footer-top">
          {/* Brand Column */}
          <div className="footer-brand">
            <a href="/" className="footer-logo">
              <Image
                className="footer-logo-mark"
                src="/brand/tooltive-tt-mark-104.webp"
                alt=""
                width={104}
                height={73}
                sizes="52px"
              />
              <span className="footer-wordmark">ToolTive.</span>
            </a>
            <p className="footer-desc">
              Providing free, high-quality professional online utilities for businesses and creatives. No signups, no hassle.
            </p>
          </div>

          {/* Company Column */}
          <div className="footer-col">
            <h3 className="caps">Company</h3>
            <ul>
              <li><a href="/about">About Us</a></li>
              <li><a href="/all-tools">All Tools</a></li>
              <li><a href="/blog">Blog</a></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="footer-col">
            <h3 className="caps">Legal</h3>
            <ul>
              <li><a href="/privacy-policy">Privacy Policy</a></li>
              <li><a href="/terms-of-service">Terms of Service</a></li>
              <li><a href="/cookie-policy">Cookie Policy</a></li>
              <li><a href="/disclaimer">Disclaimer</a></li>
              <li><a href="/dmca">DMCA Policy</a></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="footer-col">
            <h3 className="caps">Contact</h3>
            <ul>
              <li>
                <a href="mailto:support@tooltive.com" className="contact-item">
                  <SiteIcon name="envelope" />
                  support@tooltive.com
                </a>
              </li>
              <li>
                <a href="/contact" className="contact-item">
                  <SiteIcon name="comment" />
                  Contact Us
                </a>
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
