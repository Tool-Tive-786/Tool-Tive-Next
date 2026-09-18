"use client";

import React, { useState } from 'react';
import SiteIcon from '@/components/SiteIcon';

export default function ContactForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const subjectLine = subject 
            ? `[ToolTive ${subject}] from ${name.trim() || 'User'}` 
            : `ToolTive Support Inquiry from ${name.trim() || 'User'}`;
        const bodyContent = `Name: ${name.trim()}\nEmail: ${email.trim()}\nSubject: ${subject}\n\nMessage:\n${message.trim()}`;
        
        window.location.href = `mailto:support@tooltive.com?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(bodyContent)}`;
    };

    return (
        <div className="contact-form-wrapper">
            <div style={{ marginBottom: '24px' }}>
                <h2 className="contact-form-title">
                    Send Us a Message
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: '1.5' }}>
                    Fill out the inquiry details below to open your email client, or write directly to <a href="mailto:support@tooltive.com" style={{ color: 'var(--accent)', fontWeight: 600 }}>support@tooltive.com</a>.
                </p>
            </div>

            <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <input 
                        type="text" 
                        id="name" 
                        className="form-control" 
                        placeholder="John Doe" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required 
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input 
                        type="email" 
                        id="email" 
                        className="form-control" 
                        placeholder="john@example.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="subject">Subject</label>
                    <select 
                        id="subject" 
                        className="form-control" 
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                    >
                        <option value="" disabled>Select a subject</option>
                        <option value="General Support">General Support</option>
                        <option value="Feature Request">Feature Request</option>
                        <option value="Bug Report">Report a Bug</option>
                        <option value="Privacy / Data Inquiry">Privacy &amp; Data Inquiry</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="message">Message</label>
                    <textarea 
                        id="message" 
                        className="form-control" 
                        placeholder="How can we help you? Please include relevant tool names or steps to reproduce..." 
                        rows={5}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                    ></textarea>
                </div>

                <button type="submit" className="btn-primary submit-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <SiteIcon name="paper-plane" />
                    Open in Email Client
                </button>

                <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '8px', lineHeight: '1.4' }}>
                    Messages are delivered directly to <a href="mailto:support@tooltive.com" style={{ color: 'var(--accent)' }}>support@tooltive.com</a>. We typically respond within 24–48 hours.
                </p>
            </form>
        </div>
    );
}
