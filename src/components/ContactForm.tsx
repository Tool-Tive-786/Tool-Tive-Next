"use client";

import React, { useState } from 'react';

export default function ContactForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call for form submission
        setTimeout(() => {
            setIsSubmitting(false);
            setIsSuccess(true);
        }, 1500);
    };

    if (isSuccess) {
        return (
            <div className="contact-form-wrapper">
                <div className="form-success">
                    <div className="success-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                    </div>
                    <h3>Message Sent Successfully!</h3>
                    <p>Thank you for reaching out. We will get back to you within 24-48 hours.</p>
                    <button className="btn-secondary" onClick={() => setIsSuccess(false)} style={{ marginTop: '20px' }}>
                        Send Another Message
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="contact-form-wrapper">
            <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input type="text" id="name" className="form-control" placeholder="John Doe" required />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input type="email" id="email" className="form-control" placeholder="john@example.com" required />
                </div>

                <div className="form-group">
                    <label htmlFor="subject">Subject</label>
                    <select id="subject" className="form-control" required defaultValue="">
                        <option value="" disabled>Select a subject</option>
                        <option value="support">General Support</option>
                        <option value="feature">Feature Request</option>
                        <option value="bug">Report a Bug</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="message">Message</label>
                    <textarea id="message" className="form-control" placeholder="How can we help you?" required></textarea>
                </div>

                <button type="submit" className="btn-primary submit-btn" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
            </form>
        </div>
    );
}