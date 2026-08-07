import '@/styles/legal.css';

export const metadata = {
  title: 'Disclaimer',
  description: 'ToolTive Disclaimer.',
  alternates: { canonical: '/disclaimer' },
};

export default function Disclaimer() {
  return (
    <article className="legal-page container">
      <h1>Disclaimer</h1>
      <p className="legal-date">Last updated: July 24, 2026</p>

      <p>The information and tools provided on ToolTive are for general informational and utility purposes only.</p>

      <h2>Financial Tools (e.g., Invoice Generator)</h2>
      <p>Our Invoice Generator is a utility to help you format documents. We are not a financial institution, accounting firm, or legal advisor. We do not guarantee the legal compliance of invoices generated using our tool in your specific jurisdiction. Always consult with a qualified accountant or legal professional regarding your tax and billing requirements.</p>

      <h2>No Guarantees</h2>
      <p>While we strive to keep our tools functional and accurate, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability with respect to the website or the information, products, or services contained on the website.</p>
    </article>
  );
}
