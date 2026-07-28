import '@/styles/contact.css';
import ContactForm from '@/components/ContactForm';

export const metadata = {
  title: 'Contact Us | ToolTive',
  description: 'Get in touch with the ToolTive team for support, feature requests, or inquiries.',
};

export default function Contact() {
  return (
    <section className="contact-page">
      <div className="contact-header">
        <h1 className="page-heading">Contact Us</h1>
        <p className="page-sub">We love hearing from our users! Whether you have a question, a feature request, or just want to say hello, we're here to help.</p>
      </div>

      <div className="contact-content">
        <div className="contact-info">
          <div className="info-card">
            <h3>Support & Inquiries</h3>
            <p style={{ marginBottom: '16px' }}>Need help with a tool or have a general question? Drop us a line and we'll try to respond within 24-48 hours.</p>
            <p><strong>Email:</strong> <a href="mailto:support@tooltive.com">support@tooltive.com</a></p>
          </div>

          <div className="info-card">
            <h3>Feature Requests</h3>
            <p>Missing a tool? Let us know what you'd like us to build next! We prioritize user suggestions for our roadmap.</p>
          </div>
        </div>

        <ContactForm />
      </div>
    </section>
  );
}