import '@/styles/legal.css';
import '@/styles/blog.css'; // Reusing blog layout styles for TOC and grid

export const metadata = {
  title: 'Privacy Policy',
  description: 'ToolTive Privacy Policy — how we handle your data.',
  alternates: { canonical: '/privacy-policy' },
};

export default function PrivacyPolicy() {
  return (
    <div className="container blog-page-container">
      <div className="blog-layout">
        
        {/* Main Content (65%) */}
        <article className="blog-article legal-page" style={{ padding: '0', maxWidth: '100%', margin: '0' }}>
          <h1>Privacy Policy</h1>
          <p className="legal-date"><strong>Last Updated: August 9, 2026</strong></p>

          <p>ToolTive (“ToolTive,” “we,” “us,” or “our”) operates <strong><a href="https://tooltive.com">https://tooltive.com</a></strong> and provides free online tools and utilities through the website.</p>
          <p>This Privacy Policy explains what information may be collected when you use ToolTive, how that information may be used, and the choices available to you.</p>
          <p>By using ToolTive, you acknowledge the practices described in this Privacy Policy.</p>

          <h2 id="info-we-collect">1. Information We Collect</h2>
          <h3>Information You Provide</h3>
          <p>ToolTive does not require you to create an account or register to use our tools.</p>
          <p>If you contact us through our contact form or by email, you may provide information such as:</p>
          <ul>
            <li>Full name</li>
            <li>Email address</li>
            <li>Subject</li>
            <li>Message or other information included in your inquiry</li>
          </ul>
          <p>We use this information to review, respond to, and manage your inquiry or support request.</p>
          <p>Contact information and correspondence may be retained in our designated business email system for communication and record-keeping purposes.</p>
          <p>Our public contact email is: <strong><a href="mailto:support@tooltive.com">support@tooltive.com</a></strong></p>

          <h3>Information Collected Automatically</h3>
          <p>When you visit a website, certain technical information may be processed automatically as part of operating, securing, and delivering the website.</p>
          <p>Because ToolTive is hosted on Cloudflare Pages, Cloudflare may process technical information associated with website requests, which can include information such as IP address, browser or user-agent information, timestamps, and other technical or security-related request information.</p>
          <p>This processing may support website delivery, security, abuse prevention, reliability, and network operations.</p>
          <p>ToolTive does not operate its own custom visitor logging system.</p>

          <h2 id="browser-processing">2. Browser-Based Tool Processing</h2>
          <p>Many ToolTive tools are designed to perform processing directly within your web browser.</p>
          <p>Where a tool operates entirely on the client side, files selected for processing remain within your browser during the processing operation and are not uploaded to or transmitted to ToolTive's servers.</p>
          <p>For example, our browser-based tools may process images or generate documents locally using technologies available within your browser.</p>
          <p>ToolTive does not currently operate a backend file-upload system or API through which user files are routinely transmitted for processing.</p>
          <p>You should nevertheless review the behavior and functionality of an individual tool before using it, particularly as ToolTive may add or change tools over time.</p>

          <h2 id="cookies">3. Cookies and Similar Technologies</h2>
          <p>ToolTive's current website does not intentionally set first-party cookies for its core tool functionality.</p>
          <p>ToolTive also does not currently use:</p>
          <ul>
            <li><code>localStorage</code> for user data</li>
            <li><code>sessionStorage</code> for user data</li>
            <li>First-party tracking cookies</li>
            <li>A newsletter or subscription tracking system</li>
          </ul>
          <p>However, third-party services may use cookies or similar technologies when they are integrated into or used by the website.</p>
          <p>For example, advertising services such as Google AdSense may use cookies and similar technologies when advertising is enabled on ToolTive.</p>
          <p>The use of cookies and similar technologies may change as new services and features are introduced. Where required, ToolTive will provide appropriate disclosures and consent mechanisms.</p>

          <h2 id="adsense">4. Advertising and Google AdSense</h2>
          <p>ToolTive intends to use Google AdSense to display advertisements as part of its future monetization.</p>
          <p>Google and third-party advertising partners may use cookies, web beacons, IP addresses, or similar technologies to serve, measure, and personalize advertising.</p>
          <p>When Google advertising is enabled, third-party vendors, including Google, may use cookies to serve advertisements based on a user's previous visits to ToolTive or other websites.</p>
          <p>Google's advertising technologies may allow advertising to be personalized based on applicable information and user settings.</p>
          <p>Users may manage or opt out of personalized advertising through Google's advertising settings.</p>
          <p>Google's current publisher requirements specifically require publishers to disclose the use of advertising cookies and related technologies when Google advertising is used. ToolTive will maintain its disclosures and consent configuration in accordance with the Google products actually deployed on the website.</p>
          <p>For additional information about how Google uses information from websites and apps that use its services, users may review Google's applicable privacy information.</p>

          <h2 id="analytics">5. Analytics and Measurement</h2>
          <p>ToolTive may use Google Analytics or other analytics technologies in the future to understand website usage, measure performance, identify technical issues, and improve the website and its tools.</p>
          <p>Analytics services may process technical information such as device information, browser information, pages viewed, interactions, approximate location information, and other usage information depending on the service and configuration.</p>
          <p>Any analytics service used by ToolTive will be configured and disclosed according to the service actually implemented on the website.</p>

          <h2 id="gtm">6. Google Tag Manager and Third-Party Services</h2>
          <p>ToolTive may use Google Tag Manager or other third-party technologies to manage website tags and integrations.</p>
          <p>Third-party services may process technical information or set or read cookies and similar technologies depending on how they are configured.</p>
          <p>ToolTive does not currently use third-party chat widgets, social-login systems, advertising networks other than those that may be introduced through its monetization setup, or external APIs to process user files.</p>
          <p>The third-party services used by ToolTive may change as the website develops. When such services materially affect user data or privacy, this Privacy Policy will be updated as appropriate.</p>

          <h2 id="cloudflare">7. Cloudflare & Security</h2>
          <p>ToolTive is hosted and delivered through Cloudflare Pages.</p>
          <p>Cloudflare provides infrastructure and security services that may involve processing technical information associated with requests to ToolTive, including information used for network delivery, security, abuse prevention, and reliability.</p>
          <p>We use <strong>Cloudflare Turnstile</strong> to protect our forms (such as the contact form and newsletter subscription) from spam and automated abuse. Turnstile securely verifies that a visitor is a real human without requiring them to solve interactive puzzles. This process may involve analyzing technical information such as browser details and interaction patterns.</p>
          <p>Cloudflare may use security and network technologies to detect and mitigate malicious traffic, attacks, automated abuse, and other threats.</p>
          <p>ToolTive also uses Cloudflare's content delivery infrastructure to help deliver website resources efficiently.</p>
          <p>For information about Cloudflare's handling of personal data and privacy practices, users should review Cloudflare's current privacy documentation.</p>

          <h2 id="third-party">8. Third-Party Content and Assets</h2>
          <p>ToolTive may use third-party resources necessary for website functionality or presentation.</p>
          <p>For example, the website currently uses Font Awesome resources delivered through Cloudflare's cdnjs infrastructure.</p>
          <p>ToolTive may also use locally served, build-optimized fonts and other website assets.</p>
          <p>Third-party resources may change as the website is updated. Where a third-party service processes personal information or uses tracking technologies, the applicable disclosure will be reflected in this Privacy Policy where appropriate.</p>

          <h2 id="contact-form">9. Contact Form and Communications</h2>
          <p>ToolTive provides a contact form that allows visitors to send inquiries.</p>
          <p>The contact form may request:</p>
          <ul>
            <li>Full name</li>
            <li>Email address</li>
            <li>Subject</li>
            <li>Message</li>
          </ul>
          <p>Information submitted through the contact form is used to review and respond to the inquiry.</p>
          <p>Contact correspondence may be delivered to and retained within ToolTive's designated business email system.</p>
          <p>ToolTive does not sell contact information or use contact-form submissions for unrelated advertising purposes.</p>
          <p>Please do not submit passwords, payment card information, confidential credentials, or other highly sensitive information through the contact form.</p>

          <h2 id="how-we-use">10. How We Use Information</h2>
          <p>Information available to ToolTive may be used to:</p>
          <ul>
            <li>Provide and maintain the website</li>
            <li>Respond to support and contact requests</li>
            <li>Communicate with users who contact us</li>
            <li>Protect the website against abuse, fraud, malicious activity, and security threats</li>
            <li>Monitor and improve website performance</li>
            <li>Improve our tools and user experience</li>
            <li>Comply with applicable legal obligations</li>
            <li>Support advertising and analytics services when those services are enabled</li>
          </ul>
          <p>We do not sell personal information as a standalone data product.</p>

          <h2 id="data-sharing">11. Data Sharing and Disclosure</h2>
          <p>ToolTive does not sell or rent users' personal information.</p>
          <p>Information may be processed or disclosed when reasonably necessary to:</p>
          <ul>
            <li>Provide website infrastructure and security</li>
            <li>Respond to user inquiries</li>
            <li>Operate third-party services integrated into the website</li>
            <li>Provide advertising or analytics services when enabled</li>
            <li>Protect ToolTive, its users, or the public from security threats, fraud, abuse, or unlawful activity</li>
            <li>Comply with legal obligations, lawful requests, or applicable regulations</li>
            <li>Enforce our terms and policies</li>
          </ul>
          <p>Third-party service providers may process information on our behalf or independently in accordance with their own applicable privacy policies and terms.</p>

          <h2 id="data-retention">12. Data Retention</h2>
          <p>ToolTive retains information only for as long as reasonably necessary for the purposes described in this Privacy Policy, including responding to communications, maintaining appropriate business records, protecting the website, resolving disputes, complying with legal obligations, and maintaining security.</p>
          <p>Retention periods may vary depending on the type of information, its purpose, applicable legal requirements, and the systems used to process it.</p>
          <p>Files processed entirely within a user's browser are not retained by ToolTive as server-side uploads because they are not transmitted to ToolTive's servers for processing.</p>

          <h2 id="data-security">13. Data Security</h2>
          <p>ToolTive takes reasonable technical and organizational measures to protect information against unauthorized access, misuse, alteration, disclosure, or destruction.</p>
          <p>Our website uses HTTPS and security-related technologies provided through our hosting and infrastructure.</p>
          <p>ToolTive also uses Cloudflare's network and security infrastructure to help protect the website against malicious traffic and attacks.</p>
          <p>No method of transmission or electronic storage can be guaranteed to be completely secure. Therefore, while we take reasonable precautions, we cannot guarantee absolute security.</p>

          <h2 id="privacy-choices">14. Your Privacy Choices and Rights</h2>
          <p>Depending on your location and applicable law, you may have certain rights regarding your personal information.</p>
          <p>These rights may include, where applicable:</p>
          <ul>
            <li>Requesting access to personal information we hold about you</li>
            <li>Requesting correction of inaccurate information</li>
            <li>Requesting deletion of information</li>
            <li>Objecting to or restricting certain processing</li>
            <li>Withdrawing consent where processing is based on consent</li>
            <li>Requesting information about how your data is processed</li>
          </ul>
          <p>To make a privacy-related request, contact us at: <strong><a href="mailto:support@tooltive.com">support@tooltive.com</a></strong></p>
          <p>We may need to verify a request before taking action in order to protect user privacy and prevent unauthorized requests.</p>

          <h2 id="advertising-consent">15. Advertising and Consent Choices</h2>
          <p>When advertising services are enabled, certain visitors may be presented with consent or privacy-choice messages depending on their location and the applicable requirements.</p>
          <p>For users in the European Economic Area, the United Kingdom, and Switzerland, Google currently requires publishers using its advertising products to use an appropriate consent management solution when serving personalized advertising. Google requires a Google-certified CMP integrated with the IAB Transparency and Consent Framework for personalized ads in these regions.</p>
          <p>ToolTive will configure its advertising and consent mechanisms according to the Google services actually deployed and the applicable requirements at the time those services are enabled.</p>
          <p>Google's Privacy &amp; Messaging system may be used to provide users with appropriate consent and privacy choices. Google also provides consent-mode functionality for compatible Google services such as Google Analytics.</p>

          <h2 id="children-privacy">16. Children's Privacy</h2>
          <p>ToolTive is a general-purpose online tools website and is not knowingly directed toward children under the age of 13.</p>
          <p>We do not knowingly request or collect personal information from children under 13 through our website.</p>
          <p>If you believe that a child has provided personal information to ToolTive, please contact us at <strong><a href="mailto:support@tooltive.com">support@tooltive.com</a></strong> so that we can review the matter and take appropriate action where required.</p>

          <h2 id="international-users">17. International Users</h2>
          <p>ToolTive is operated from Pakistan and may be accessed by users around the world.</p>
          <p>Depending on where you are located, your information may be processed by infrastructure or service providers operating in different countries.</p>
          <p>Where applicable, ToolTive will take reasonable steps to address privacy and data-protection requirements relevant to the processing of personal information.</p>
          <p>Users located in jurisdictions with specific privacy rights may contact us using the information provided in this Privacy Policy.</p>

          <h2 id="third-party-websites">18. Third-Party Websites and Services</h2>
          <p>ToolTive may contain links to external websites, services, or resources.</p>
          <p>We are not responsible for the privacy practices, content, security, or policies of third-party websites.</p>
          <p>We encourage users to review the privacy policies and terms of any external service they choose to visit or use.</p>

          <h2 id="changes">19. Changes to This Privacy Policy</h2>
          <p>We may update this Privacy Policy from time to time to reflect changes to ToolTive, our services, third-party integrations, applicable legal requirements, or our privacy practices.</p>
          <p>When we make changes, we will update the <strong>Last Updated</strong> date at the top of this page.</p>
          <p>We encourage users to periodically review this page for the latest information about our privacy practices.</p>

          <h2 id="contact-us">20. Contact Us</h2>
          <p>If you have questions, concerns, or requests relating to this Privacy Policy or the privacy practices of ToolTive, please contact us:</p>
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
              <li><a href="#info-we-collect">1. Information We Collect</a></li>
              <li><a href="#browser-processing">2. Browser-Based Tool Processing</a></li>
              <li><a href="#cookies">3. Cookies & Similar Technologies</a></li>
              <li><a href="#adsense">4. Advertising & AdSense</a></li>
              <li><a href="#analytics">5. Analytics & Measurement</a></li>
              <li><a href="#gtm">6. Tag Manager & 3rd-Party</a></li>
              <li><a href="#cloudflare">7. Cloudflare</a></li>
              <li><a href="#third-party">8. Third-Party Content</a></li>
              <li><a href="#contact-form">9. Contact Form</a></li>
              <li><a href="#how-we-use">10. How We Use Information</a></li>
              <li><a href="#data-sharing">11. Data Sharing & Disclosure</a></li>
              <li><a href="#data-retention">12. Data Retention</a></li>
              <li><a href="#data-security">13. Data Security</a></li>
              <li><a href="#privacy-choices">14. Your Privacy Choices</a></li>
              <li><a href="#advertising-consent">15. Advertising Consent</a></li>
              <li><a href="#children-privacy">16. Children's Privacy</a></li>
              <li><a href="#international-users">17. International Users</a></li>
              <li><a href="#third-party-websites">18. External Links</a></li>
              <li><a href="#changes">19. Changes to Policy</a></li>
              <li><a href="#contact-us">20. Contact Us</a></li>
            </ul>
          </div>
        </aside>

      </div>
    </div>
  );
}
