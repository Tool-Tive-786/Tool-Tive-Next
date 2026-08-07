import '@/styles/legal.css';

export const metadata = {
  title: 'Privacy Policy',
  description: 'ToolTive Privacy Policy — how we handle your data.',
  alternates: { canonical: '/privacy-policy' },
};

export default function PrivacyPolicy() {
  return (
    <article className="legal-page container">
      <h1>Privacy Policy</h1>
      <p className="legal-date">Last updated: July 24, 2026</p>

      <h2>Information We Collect</h2>
      <p>ToolTive does not collect, store, or process any personal data on our servers. All tools run entirely client-side in your browser. Any files you upload (images, logos, signatures) are processed locally and never transmitted to our servers.</p>

      <h2>Cookies</h2>
      <p>We may use minimal cookies for essential site functionality (e.g., saving draft data locally). We do not use tracking cookies or third-party analytics that collect personal information.</p>

      <h2>Third-Party Services</h2>
      <p>We use Google AdSense for advertising. AdSense may use cookies to serve relevant ads. Please refer to Google's Privacy Policy for more details.</p>

      <h2>Contact</h2>
      <p>If you have questions about this policy, please contact us at <a href="mailto:support@tooltive.com">support@tooltive.com</a>.</p>
    </article>
  );
}
