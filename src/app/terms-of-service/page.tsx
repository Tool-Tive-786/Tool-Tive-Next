import '@/styles/legal.css';
import '@/styles/blog.css'; // Reusing blog layout styles for TOC and grid

export const metadata = {
  title: 'Terms of Service',
  description: 'ToolTive Terms of Service.',
  alternates: { canonical: '/terms-of-service' },
};

export default function TermsOfService() {
  return (
    <div className="container blog-page-container">
      <div className="blog-layout">
        
        {/* Main Content (65%) */}
        <article className="blog-article legal-page" style={{ padding: '0', maxWidth: '100%', margin: '0' }}>
          <h1>Terms of Service</h1>
          <p className="legal-date"><strong>Last Updated: August 9, 2026</strong></p>

          <p>These Terms of Service (“Terms”) govern your access to and use of ToolTive, available at <strong><a href="https://tooltive.com">https://tooltive.com</a></strong>. By accessing or using ToolTive, you agree to these Terms. If you do not agree with these Terms, please do not use the website or its tools.</p>

          <h2 id="acceptance">1. Acceptance of Terms</h2>
          <p>By accessing or using ToolTive, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and any applicable laws and regulations.</p>
          <p>If you use ToolTive on behalf of another person or organization, you represent that you have the authority to accept these Terms on their behalf.</p>

          <h2 id="use-of-tooltive">2. Use of ToolTive</h2>
          <p>ToolTive provides free online tools and utilities for general personal and commercial use, unless a specific tool or page states otherwise.</p>
          <p>You may use ToolTive for lawful purposes and in accordance with these Terms.</p>
          <p>Commercial use of ToolTive and its generated outputs is permitted, provided that your use complies with applicable laws, regulations, third-party rights, and any terms that may apply to the content or materials you use.</p>

          <h2 id="browser-processing">3. Browser-Based Processing</h2>
          <p>Many ToolTive tools are designed to process files and information directly within your web browser.</p>
          <p>Where a tool operates entirely on the client side, files selected for processing are handled locally within your browser and are not uploaded to ToolTive servers for processing.</p>
          <p>ToolTive does not currently operate a custom backend API for routinely processing user files.</p>
          <p>Because ToolTive may introduce or modify tools and functionality over time, users should review the behavior and information provided for an individual tool before using it.</p>

          <h2 id="user-files">4. User Files and Content</h2>
          <p>You remain responsible for the files, text, images, documents, and other content that you choose to process through ToolTive.</p>
          <p>You represent that you have the necessary rights, permissions, or lawful authority to use and process any content submitted to or processed by the tools.</p>
          <p>You must not use ToolTive to process content in a way that violates applicable law or infringes the rights of another person or organization.</p>
          <p>ToolTive does not claim ownership of your files or content.</p>

          <h2 id="generated-outputs">5. Generated Outputs</h2>
          <p>ToolTive may generate, convert, transform, compress, format, or otherwise process content based on the functionality of a particular tool.</p>
          <p>You are responsible for reviewing generated or processed outputs before relying on them, publishing them, sharing them, or using them for business or other important purposes.</p>
          <p>ToolTive does not guarantee that generated outputs will always be complete, accurate, suitable for a particular purpose, or free from errors.</p>
          <p>You are also responsible for keeping appropriate backups of important files and outputs.</p>

          <h2 id="prohibited-uses">6. Prohibited Uses</h2>
          <p>You may not use ToolTive to:</p>
          <ul>
            <li>Violate any applicable law, regulation, or legal requirement.</li>
            <li>Infringe or violate another person's or organization's intellectual property, privacy, publicity, or other legal rights.</li>
            <li>Upload, process, create, or distribute content that you do not have the necessary rights or permissions to use.</li>
            <li>Attempt to gain unauthorized access to ToolTive, its infrastructure, systems, or security mechanisms.</li>
            <li>Interfere with, disrupt, damage, or place an unreasonable burden on the website or its infrastructure.</li>
            <li>Use automated methods to abuse, overload, scrape, or otherwise interfere with ToolTive's normal operation.</li>
            <li>Attempt to bypass security controls, access restrictions, rate limits, or other technical safeguards.</li>
            <li>Introduce malicious code, malware, viruses, or other harmful material into the website or systems.</li>
            <li>Use ToolTive for fraudulent, deceptive, abusive, or otherwise unlawful activities.</li>
            <li>Use the website in a manner that could harm ToolTive, its users, service providers, or third parties.</li>
          </ul>
          <p>ToolTive may restrict or suspend access where reasonably necessary to protect the website, its infrastructure, users, or third parties from abuse, security threats, or unlawful activity.</p>

          <h2 id="availability">7. Service Availability</h2>
          <p>ToolTive is provided as an online service and may occasionally be unavailable due to maintenance, updates, technical problems, infrastructure issues, network interruptions, or circumstances outside our reasonable control.</p>
          <p>We do not guarantee that ToolTive or any particular tool will always be available, uninterrupted, or compatible with every device, browser, operating system, or future environment.</p>
          <p>ToolTive may add, modify, suspend, or discontinue tools or features at any time.</p>

          <h2 id="disclaimer">8. Disclaimer of Warranties</h2>
          <p>ToolTive and its tools are provided on an “as is” and “as available” basis to the extent permitted by applicable law.</p>
          <p>We do not warrant that the website or its tools will:</p>
          <ul>
            <li>Meet your particular requirements or expectations.</li>
            <li>Be continuously available or uninterrupted.</li>
            <li>Be completely free from errors, defects, or technical issues.</li>
            <li>Produce accurate, complete, or suitable results for every use case.</li>
            <li>Be compatible with every device, browser, file type, or software environment.</li>
          </ul>
          <p>You are responsible for determining whether a particular tool or output is appropriate for your intended use.</p>

          <h2 id="liability">9. Limitation of Liability</h2>
          <p>To the maximum extent permitted by applicable law, ToolTive and its operators, service providers, and contributors will not be liable for indirect, incidental, special, consequential, or similar damages arising from or related to your use of, or inability to use, ToolTive or its tools.</p>
          <p>This may include loss of data, loss of business, loss of profits, loss of opportunities, or other indirect losses.</p>
          <p>You are responsible for maintaining appropriate backups of important files and for reviewing outputs before relying on them.</p>
          <p>Nothing in these Terms is intended to exclude or limit liability where such exclusion or limitation is not permitted by applicable law.</p>

          <h2 id="ip">10. Intellectual Property</h2>
          <p>The ToolTive website, including its design, branding, interface, original text, software, graphics, and other original materials, is owned by or used by ToolTive under applicable rights and may be protected by intellectual property laws.</p>
          <p>You may not copy, reproduce, modify, distribute, reverse engineer, or commercially exploit ToolTive's proprietary website materials except where permitted by applicable law or with appropriate authorization.</p>
          <p>These Terms do not transfer ownership of ToolTive's intellectual property to you.</p>

          <h2 id="third-party">11. Third-Party Services and Resources</h2>
          <p>ToolTive may rely on third-party infrastructure, services, libraries, content, or resources to operate and deliver certain website functionality.</p>
          <p>Third-party services may have their own terms, licenses, privacy policies, or other requirements.</p>
          <p>Your use of third-party services or resources may therefore be subject to the applicable terms of those providers.</p>
          <p>ToolTive is not responsible for the independent operation, availability, policies, or practices of third-party services that are outside our control.</p>

          <h2 id="advertising">12. Advertising and Monetization</h2>
          <p>ToolTive may use advertising services, including Google AdSense, to support the operation, maintenance, and development of the website.</p>
          <p>Advertising services may use cookies and similar technologies to deliver, measure, and personalize advertisements in accordance with applicable policies, settings, and user choices.</p>
          <p>The advertising services and technologies used by ToolTive may change over time. Where applicable, information about advertising-related data processing and privacy choices is described in our Privacy Policy.</p>

          <h2 id="responsibility">13. User Responsibility and Legal Compliance</h2>
          <p>You are responsible for your use of ToolTive and for ensuring that your use complies with applicable laws and regulations.</p>
          <p>You are also responsible for:</p>
          <ul>
            <li>Having the necessary rights and permissions for content you process.</li>
            <li>Reviewing generated or processed outputs before using them.</li>
            <li>Maintaining backups of important files and outputs.</li>
            <li>Ensuring that your use of generated content complies with applicable laws and third-party rights.</li>
            <li>Using ToolTive responsibly and without interfering with the rights or security of others.</li>
          </ul>

          <h2 id="changes-tooltive">14. Changes to ToolTive</h2>
          <p>ToolTive may add, remove, modify, update, or discontinue tools, features, content, or functionality from time to time.</p>
          <p>Changes may be made to improve performance, security, usability, compatibility, or the overall operation of the website.</p>
          <p>We do not guarantee that a particular tool or feature will remain available indefinitely.</p>

          <h2 id="changes-terms">15. Changes to These Terms</h2>
          <p>We may update these Terms of Service from time to time to reflect changes to ToolTive, its tools, applicable requirements, or our practices.</p>
          <p>When changes are made, the Last Updated date at the top of this page will be updated.</p>
          <p>Your continued use of ToolTive after updated Terms are published means that you acknowledge the updated Terms, subject to applicable law.</p>

          <h2 id="waiver">16. No Waiver</h2>
          <p>If ToolTive does not immediately enforce a provision of these Terms, that does not mean that ToolTive has permanently waived its right to enforce that provision later.</p>
          <p>Any waiver of a provision must be considered in the context of the specific circumstances in which it occurs.</p>

          <h2 id="severability">17. Severability</h2>
          <p>If any provision of these Terms is found to be invalid, unlawful, or unenforceable under applicable law, that provision will be interpreted or limited to the extent necessary, and the remaining provisions will continue to apply to the extent permitted by law.</p>

          <h2 id="governing-law">18. Governing Law</h2>
          <p>These Terms are governed by and interpreted in accordance with the applicable laws of Pakistan, subject to any mandatory laws or consumer protection rights that may apply to you based on your location.</p>
          <p>Nothing in this section is intended to deprive you of protections that cannot lawfully be excluded or limited under applicable law.</p>

          <h2 id="contact-us">19. Contact Us</h2>
          <p>If you have questions, concerns, or requests regarding these Terms of Service, you can contact ToolTive at:</p>
          <p>
            <strong>ToolTive</strong><br />
            <strong>Email:</strong> <a href="mailto:support@tooltive.com">support@tooltive.com</a><br />
            <strong>Website:</strong> <a href="https://tooltive.com">https://tooltive.com</a>
          </p>
          <p>We will make reasonable efforts to review and respond to inquiries.</p>
        </article>

        {/* Sidebar / Table of Contents (30%) */}
        <aside className="blog-sidebar">
          <div className="toc-box">
            <h3 className="toc-title">Table of Contents</h3>
            <ul className="toc-list">
              <li><a href="#acceptance">1. Acceptance of Terms</a></li>
              <li><a href="#use-of-tooltive">2. Use of ToolTive</a></li>
              <li><a href="#browser-processing">3. Browser-Based Processing</a></li>
              <li><a href="#user-files">4. User Files & Content</a></li>
              <li><a href="#generated-outputs">5. Generated Outputs</a></li>
              <li><a href="#prohibited-uses">6. Prohibited Uses</a></li>
              <li><a href="#availability">7. Service Availability</a></li>
              <li><a href="#disclaimer">8. Disclaimer of Warranties</a></li>
              <li><a href="#liability">9. Limitation of Liability</a></li>
              <li><a href="#ip">10. Intellectual Property</a></li>
              <li><a href="#third-party">11. Third-Party Services</a></li>
              <li><a href="#advertising">12. Advertising & Monetization</a></li>
              <li><a href="#responsibility">13. User Responsibility</a></li>
              <li><a href="#changes-tooltive">14. Changes to ToolTive</a></li>
              <li><a href="#changes-terms">15. Changes to These Terms</a></li>
              <li><a href="#waiver">16. No Waiver</a></li>
              <li><a href="#severability">17. Severability</a></li>
              <li><a href="#governing-law">18. Governing Law</a></li>
              <li><a href="#contact-us">19. Contact Us</a></li>
            </ul>
          </div>
        </aside>

      </div>
    </div>
  );
}
