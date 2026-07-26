import '@/styles/legal.css';

export const metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the ToolTive team.',
};

export default function Contact() {
  return (
    <article className="legal-page container">
      <div className="legal-page-inner-div">

        <h1>Contact Us</h1>

        <p>We love hearing from our users! Whether you have a question, a feature request, or just want to say hello, we're here to help.</p>

        <h2>Support & General Inquiries</h2>
        <p>Email us at: <a href="mailto:support@tooltive.com">support@tooltive.com</a></p>

        <p>We try to respond to all inquiries within 24-48 hours.</p>
      </div>

    </article>
  );
}
