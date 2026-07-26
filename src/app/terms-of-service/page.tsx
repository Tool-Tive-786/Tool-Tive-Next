import '@/styles/legal.css';

export const metadata = {
  title: 'Terms of Service',
  description: 'ToolTive Terms of Service.',
};

export default function TermsOfService() {
  return (
    <article className="legal-page container">
      <h1>Terms of Service</h1>
      <p className="legal-date">Last updated: July 24, 2026</p>

      <h2>1. Acceptance of Terms</h2>
      <p>By accessing and using ToolTive, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our website.</p>

      <h2>2. Use of Tools</h2>
      <p>All tools on ToolTive are provided free of charge for both personal and commercial use. You may use generated assets (such as invoices or images) for your business.</p>

      <h2>3. Disclaimer of Warranties</h2>
      <p>ToolTive is provided "as is" without warranty of any kind. We do not guarantee that the tools will meet your specific requirements, be uninterrupted, or error-free.</p>

      <h2>4. Limitation of Liability</h2>
      <p>ToolTive shall not be liable for any indirect, incidental, special, or consequential damages resulting from the use or inability to use our services.</p>
    </article>
  );
}
