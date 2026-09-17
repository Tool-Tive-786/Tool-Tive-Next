"use client";

import type { FormEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import '@/styles/footer.css';

export default function Footer() {
  const handleNewsletterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('newsletter-email') || '').trim();

    if (!email) return;

    const subject = encodeURIComponent('ToolTive newsletter subscription');
    const body = encodeURIComponent(`Please add ${email} to the ToolTive updates list.`);
    window.location.href = `mailto:support@tooltive.com?subject=${subject}&body=${body}`;
  };

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
          <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
            <label className="newsletter-mailbox">
              <span className="newsletter-input-area">
                <i className="fas fa-envelope newsletter-mail-icon" aria-hidden="true"></i>
                <span className="sr-only">Email address</span>
                <input
                  type="email"
                  name="newsletter-email"
                  placeholder="Enter your email address"
                  autoComplete="email"
                  aria-label="Email address for ToolTive updates"
                  required
                />
              </span>
              <button type="submit">
                Subscribe <i className="fas fa-arrow-right" aria-hidden="true"></i>
              </button>
            </label>
          </form>
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
            <h4 className="caps">Company</h4>
            <ul>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/all-tools">All Tools</Link></li>
              <li><Link href="/blog">Blog</Link></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="footer-col">
            <h4 className="caps">Legal</h4>
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
            <h4 className="caps">Contact</h4>
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
