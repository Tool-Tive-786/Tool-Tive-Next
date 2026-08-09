import '@/styles/legal.css';
import '@/styles/blog.css'; // Reusing blog layout styles for TOC and grid

export const metadata = {
  title: 'Cookie Policy',
  description: 'ToolTive Cookie Policy.',
  alternates: { canonical: '/cookie-policy' },
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

          <h2 id="cookies-used">2. Cookies Currently Used by ToolTive</h2>
          <p>ToolTive's current website does not intentionally set first-party cookies for its core website or tool functionality.</p>
          <p>ToolTive also does not currently use browser storage technologies such as:</p>
          <ul>
            <li><code>localStorage</code> for user data</li>
            <li><code>sessionStorage</code> for user data</li>
            <li>IndexedDB for user data</li>
            <li>Authentication or login cookies</li>
            <li>First-party tracking cookies</li>
            <li>Advertising cookies</li>
            <li>Analytics or measurement cookies</li>
          </ul>
          <p>The current ToolTive tools are primarily designed to operate directly within the user's browser.</p>

          <h2 id="browser-processing">3. Browser-Based Tool Processing</h2>
          <p>Many ToolTive tools process files and other user-provided information directly within the browser.</p>
          <p>Where a tool operates entirely client-side, the selected files remain within the browser during processing and are not uploaded to ToolTive's servers for processing.</p>
          <p>ToolTive does not currently operate a custom backend file-processing API through which user files are routinely transmitted.</p>
          <p>The use of browser-based processing does not itself require ToolTive to store user files in cookies or browser storage.</p>
          <p>Individual tools may use browser capabilities necessary to perform their functions, but ToolTive does not intentionally use these capabilities as a hidden tracking mechanism.</p>

          <h2 id="third-party">4. Third-Party Services and Resources</h2>
          <p>ToolTive currently uses a limited number of third-party resources necessary for website delivery or presentation.</p>
          <p>These currently include:</p>
          <ul>
            <li>Cloudflare Pages and Cloudflare infrastructure for website hosting, content delivery, DNS, security, and network protection.</li>
            <li>Font Awesome, delivered through cdnjs/Cloudflare CDN, for certain website icons and interface resources.</li>
            <li>Fonts used by the website may be processed and served through the website's build and asset pipeline. The website's current Next.js configuration optimizes and serves the relevant fonts locally rather than requiring the user's browser to fetch them directly from Google.</li>
          </ul>
          <p>Third-party infrastructure may process technical information associated with normal website requests as part of providing their services.</p>
          <p>ToolTive does not currently use third-party advertising, analytics, tracking pixels, or similar tracking systems on the website.</p>

          <h2 id="cloudflare">5. Cloudflare Technologies</h2>
          <p>ToolTive is hosted and delivered using Cloudflare infrastructure.</p>
          <p>Cloudflare may process technical information associated with requests to the website as part of providing services such as network delivery, security, abuse prevention, traffic management, and reliability.</p>
          <p>ToolTive currently uses Cloudflare's infrastructure and security capabilities, including CDN delivery, DNS, Web Application Firewall protections, and automated edge-level protection.</p>
          <p>ToolTive does not currently use:</p>
          <ul>
            <li>Cloudflare Turnstile</li>
            <li>Cloudflare Analytics</li>
            <li>Other optional Cloudflare tracking or analytics products</li>
          </ul>
          <p>Cloudflare's own technologies and processing practices are governed by Cloudflare's applicable privacy documentation and terms.</p>

          <h2 id="advertising">6. Advertising Cookies</h2>
          <p>ToolTive does not currently use advertising cookies because advertising services have not yet been enabled on the website.</p>
          <p>ToolTive may introduce advertising services in the future, including services such as Google AdSense.</p>
          <p>If advertising services are introduced, this Cookie Policy and, where appropriate, the Privacy Policy will be updated to describe the cookies and similar technologies actually used by those services and the choices available to users.</p>
          <p>Any advertising and consent mechanisms implemented in the future will be configured according to the applicable requirements and the services actually deployed on ToolTive.</p>

          <h2 id="analytics">7. Analytics and Measurement</h2>
          <p>ToolTive does not currently use Google Analytics or another website analytics platform.</p>
          <p>ToolTive does not currently use analytics cookies, tracking pixels, or similar measurement technologies to build user profiles or track visitors across websites.</p>
          <p>Analytics or measurement services may be introduced in the future to understand website performance, usage patterns, or technical issues.</p>
          <p>If such services are introduced, this Cookie Policy will be updated to accurately describe the technologies used and any applicable user choices.</p>

          <h2 id="gtm">8. Google Tag Manager</h2>
          <p>ToolTive does not currently use Google Tag Manager.</p>
          <p>If Google Tag Manager or another tag-management service is introduced in the future, its use will be configured according to the services actually deployed and applicable privacy requirements.</p>
          <p>This policy will be updated where the introduction of such technology materially affects cookies, tracking technologies, or user privacy choices.</p>

          <h2 id="consent">9. Cookie Consent and Privacy Choices</h2>
          <p>ToolTive does not currently operate a cookie consent banner or third-party Consent Management Platform because the current website does not intentionally use advertising or analytics cookies that require such a system.</p>
          <p>If ToolTive introduces services that require consent or privacy choices in particular regions, an appropriate consent or privacy-choice mechanism may be implemented.</p>
          <p>Where applicable, users will be provided with information about the relevant technologies and available choices.</p>

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
