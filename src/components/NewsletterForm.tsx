"use client";

import React, { useState } from 'react';
import SiteIcon from '@/components/SiteIcon';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) return;

    setSubmitted(true);
    const subject = encodeURIComponent('ToolTive Newsletter Subscription');
    const body = encodeURIComponent(`Please subscribe my email address to ToolTive updates:\n${cleanEmail}`);
    window.location.href = `mailto:support@tooltive.com?subject=${subject}&body=${body}`;
  };

  return (
    <form className="newsletter-form" onSubmit={handleSubmit}>
      <div className="newsletter-mailbox">
        <label className="newsletter-input-area">
          <SiteIcon name="envelope" className="newsletter-mail-icon" />
          <span className="sr-only">Email address</span>
          <input
            type="email"
            name="newsletter-email"
            placeholder={submitted ? "Thank you for subscribing!" : "Enter your email address"}
            autoComplete="email"
            aria-label="Email address for ToolTive updates"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (submitted) setSubmitted(false);
            }}
            required
          />
        </label>
        <button type="submit">
          {submitted ? 'Subscribed' : 'Subscribe'} <SiteIcon name="arrow-right" />
        </button>
      </div>
    </form>
  );
}
