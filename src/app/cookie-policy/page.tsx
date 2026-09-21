import '@/styles/legal.css';
import '@/styles/blog.css'; // Reusing blog layout styles for TOC and grid

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Learn how ToolTive uses cookies and local storage to preserve tool preferences and provide smooth browser-based utilities without intrusive tracking.',
  alternates: { canonical: '/cookie-policy' },
  openGraph: {
    title: 'Cookie Policy · ToolTive',
    description: 'Learn how ToolTive uses cookies and local storage to preserve tool preferences and provide smooth browser-based utilities without intrusive tracking.',
    url: '/cookie-policy',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cookie Policy · ToolTive',
    description: 'Learn how ToolTive uses cookies and local storage to preserve tool preferences and provide smooth browser-based utilities without intrusive tracking.',
  },
};

export default function CookiePolicy() {
  return (
    <div className="container blog-page-container">
      <div className="blog-layout">
        
        {/* Main Content (65%) */}
        <article className="blog-article legal-page" style={{ padding: '0', maxWidth: '100%', margin: '0' }}>
          <h1>Cookie Policy</h1>
          <p className="legal-date"><strong>Last Updated: August 9, 2026</strong></p>

          <p>ToolTive (“ToolTive,” “we,” “us,” or “our”) operates <strong><a href="https://tooltive.com">https://tooltive.com</a></strong> and provides free online tools and utilities through the website.</p>
          <p>This Cookie Policy explains how cookies and similar technologies may be used when you visit ToolTive. It also explains the technologies currently used by the website and how this may change if new services are introduced in the future.</p>

          <h2 id="what-are-cookies">1. What Are Cookies?</h2>
          <p>Cookies are small pieces of information that websites may store in a user's browser. They can be used for different purposes, including remembering preferences, enabling certain functionality, measuring website usage, maintaining security, or supporting advertising.</p>
          <p>Similar technologies may include browser storage mechanisms, pixels, tags, scripts, and other technologies that can store or access information on a user's device.</p>

          <h2 id="cookies-used">2. Technologies and Storage Used by ToolTive</h2>
          <p>ToolTive does not set first-party tracking or authentication cookies for its core website functionality.</p>
          <p>To provide a seamless user experience, certain browser-based tools make use of <strong>browser local storage (<code>localStorage</code>)</strong> directly on your device:</p>
          <ul>
            <li><strong>Invoice Generator:</strong> Temporarily saves your current invoice draft, line items, and template formatting (under the storage key <code>tooltive-storage</code>) so your progress is not lost if the page is refreshed or accidentally closed.</li>
            <li><strong>SEO Schema Generator:</strong> Saves active schema form inputs (under the storage key <code>tooltive_schema_generator_draft_v1</code>) to preserve your structured data draft during editing.</li>
          </ul>
          <p>This draft data is stored strictly on your local device within your web browser. It is not uploaded, synced, or transmitted to ToolTive's servers, and can be cleared at any time through your browser's history and storage settings or by resetting the tool.</p>

          <h2 id="browser-processing">3. Browser-Based Processing and Remote Requests</h2>
          <p>Many of ToolTive's utilities (such as the Image Compressor, Image to PDF Converter, and Profit Margin Calculator) operate entirely on the client side using your web browser's memory. User files and calculation inputs processed by these tools remain on your device and are not uploaded to our servers.</p>
          <p>For tools designed to inspect publicly available web resources (such as the <strong>XML Sitemap Generator</strong> website crawler and <strong>Robots.txt Tester</strong> fetcher), our serverless edge infrastructure makes an automated, temporary HTTP request to the public URL specified by the user to retrieve public sitemap or robots.txt directives. These requests do not transmit or store personal user files.</p>

          <h2 id="third-party">4. Third-Party Services and CDNs</h2>
          <p>ToolTive uses a small number of trusted third-party resources necessary for website delivery, presentation, and security:</p>
          <ul>
            <li><strong>Cloudflare Pages &amp; Edge Network:</strong> Provides website hosting, global content delivery (CDN), DNS resolution, DDoS protection, and SSL/TLS encryption.</li>
            <li><strong>Font Awesome:</strong> Delivered through Cloudflare's cdnjs content delivery network to render user-interface icons.</li>
            <li><strong>Self-Hosted Typography:</strong> Fonts used on ToolTive (Inter and Space Grotesk) are optimized and served directly from our build pipeline rather than external third-party font servers.</li>
          </ul>

          <h2 id="cloudflare">5. Cloudflare Security &amp; Turnstile</h2>
          <p>ToolTive is hosted and secured through Cloudflare infrastructure.</p>
          <p>Cloudflare may process technical information associated with website requests (including IP address, browser headers, and request timestamps) to protect the site from distributed denial-of-service (DDoS) attacks, malicious bots, and security threats.</p>
          <p>Where applicable on interactive forms, ToolTive uses <strong>Cloudflare Turnstile</strong> to verify that submissions originate from human visitors rather than automated spam bots. Turnstile operates in a privacy-focused manner without requiring users to solve interactive CAPTCHA puzzles.</p>

          <h2 id="advertising">6. Advertising and Google AdSense</h2>
          <p>ToolTive is configured with <strong>Google AdSense</strong> (Publisher ID: <code>pub-9227549190577691</code>) to support free access to our tools through online advertising.</p>
          <p>When advertisements are served, Google and its certified advertising partners may use cookies, web beacons, and unique device identifiers to deliver, measure, and optimize ads. Third-party vendors, including Google, may use cookies to serve ads based on a user's prior visits to ToolTive or other websites on the internet.</p>
          <p>Users may manage their personalization preferences or opt out of personalized advertising by visiting <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">Google Ads Settings</a> or through industry opt-out tools such as <a href="https://optout.aboutads.info" target="_blank" rel="noopener noreferrer">aboutads.info</a>.</p>

          <h2 id="analytics">7. Analytics and Google Analytics</h2>
          <p>ToolTive uses <strong>Google Analytics</strong> (Measurement ID: <code>G-877CM9ZVF7</code>) to analyze website traffic patterns, understand which tools are most helpful, measure site performance, and troubleshoot technical errors.</p>
          <p>Google Analytics uses cookies and similar identifiers to collect aggregated, non-personally identifiable statistical information, such as pages visited, approximate geographic region, browser and device type, referring pages, and interaction duration.</p>
          <p>For more information about how Google collects and processes data, visit <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">How Google uses information from sites or apps that use our services</a>.</p>

          <h2 id="gtm">8. Google Tag Manager Infrastructure</h2>
          <p>ToolTive utilizes Google tag loading infrastructure (<code>gtag.js</code>) to efficiently initialize analytics and site verification scripts in a structured and lightweight manner.</p>

          <h2 id="consent">9. Consent, Privacy Choices, and Cookie Controls</h2>
          <p>We respect your privacy choices and provide transparent controls over how technologies operate on your device:</p>
          <ul>
            <li><strong>Browser Cookie Controls:</strong> You can configure your web browser to block, limit, or delete cookies at any time through your browser's privacy settings.</li>
            <li><strong>Local Storage:</strong> You can clear tool drafts saved in your browser's local storage by clearing site data in your browser settings.</li>
            <li><strong>Regional Consent Requirements:</strong> For visitors accessing ToolTive from regions requiring explicit consent for advertising and measurement technologies (such as the European Economic Area, United Kingdom, and Switzerland), consent choices will be managed in accordance with Google's EU User Consent Policy and applicable data protection standards.</li>
          </ul>

          <h2 id="managing-cookies">10. Managing Cookies in Your Browser</h2>
          <p>Although ToolTive does not currently intentionally set first-party cookies for its core functionality, your browser may provide controls that allow you to manage or restrict cookies and similar technologies.</p>
          <p>Most modern browsers allow users to:</p>
          <ul>
            <li>View stored cookies</li>
            <li>Delete existing cookies</li>
            <li>Block cookies</li>
            <li>Allow cookies only for selected websites</li>
            <li>Configure privacy and tracking preferences</li>
          </ul>
          <p>Disabling cookies may affect certain websites or third-party services that rely on them. Any impact will depend on the services active on the website at the time.</p>

          <h2 id="changes">11. Changes to Cookies and Similar Technologies</h2>
          <p>ToolTive may introduce new features, services, integrations, or technologies as the website develops.</p>
          <p>For example, future services may include advertising, analytics, consent management, security tools, or other third-party integrations.</p>
          <p>If these changes result in the use of cookies or similar technologies, this Cookie Policy will be updated to accurately reflect the technologies actually implemented.</p>
          <p>The Last Updated date at the top of this page will also be updated when material changes are made.</p>

          <h2 id="relationship">12. Relationship With Our Privacy Policy</h2>
          <p>This Cookie Policy should be read together with the ToolTive Privacy Policy.</p>
          <p>The Privacy Policy provides broader information about how information may be processed when you use ToolTive, including information associated with website requests, contact inquiries, third-party infrastructure, and browser-based tool processing.</p>
          <p>The Cookie Policy specifically addresses cookies and similar technologies.</p>

          <h2 id="children">13. Children's Privacy</h2>
          <p>ToolTive is a general-purpose online tools website and is not knowingly directed toward children under the age of 13.</p>
          <p>ToolTive does not intentionally use cookies or tracking technologies to create profiles of children.</p>
          <p>Parents or guardians who believe that a child has provided personal information to ToolTive may contact us using the information below.</p>

          <h2 id="contact">14. Contact Us</h2>
          <p>If you have questions about this Cookie Policy or the use of cookies and similar technologies on ToolTive, please contact us:</p>
          <p>
            <strong>ToolTive</strong><br />
            <strong>Email:</strong> <a href="mailto:support@tooltive.com">support@tooltive.com</a><br />
            <strong>Website:</strong> <a href="https://tooltive.com">https://tooltive.com</a>
          </p>
          <p>We will make reasonable efforts to review and respond to privacy-related inquiries.</p>
        </article>

        {/* Sidebar / Table of Contents (30%) */}
        <aside className="blog-sidebar">
          <div className="toc-box">
            <h3 className="toc-title">Table of Contents</h3>
            <ul className="toc-list">
              <li><a href="#what-are-cookies">1. What Are Cookies?</a></li>
              <li><a href="#cookies-used">2. Cookies Currently Used</a></li>
              <li><a href="#browser-processing">3. Browser-Based Processing</a></li>
              <li><a href="#third-party">4. Third-Party Services</a></li>
              <li><a href="#cloudflare">5. Cloudflare Technologies</a></li>
              <li><a href="#advertising">6. Advertising Cookies</a></li>
              <li><a href="#analytics">7. Analytics & Measurement</a></li>
              <li><a href="#gtm">8. Google Tag Manager</a></li>
              <li><a href="#consent">9. Cookie Consent & Choices</a></li>
              <li><a href="#managing-cookies">10. Managing Cookies</a></li>
              <li><a href="#changes">11. Changes to Technologies</a></li>
              <li><a href="#relationship">12. Privacy Policy Relationship</a></li>
              <li><a href="#children">13. Children's Privacy</a></li>
              <li><a href="#contact">14. Contact Us</a></li>
            </ul>
          </div>
        </aside>

      </div>
    </div>
  );
}
