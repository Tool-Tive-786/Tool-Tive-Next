import '@/styles/legal.css';
import '@/styles/blog.css'; // Reusing blog layout styles for TOC and grid

export const metadata = {
  title: { absolute: 'DMCA Policy | ToolTive' },
  description: 'ToolTive DMCA Policy and Copyright Information.',
  alternates: { canonical: '/dmca' },
};

export default function DmcaPolicy() {
  return (
    <div className="container blog-page-container">
      <div className="blog-layout">
        
        {/* Main Content (65%) */}
        <article className="blog-article legal-page" style={{ padding: '0', maxWidth: '100%', margin: '0' }}>
          <h1>DMCA Policy</h1>
          <p className="legal-date"><strong>Last Updated: August 9, 2026</strong></p>

          <p>ToolTive respects copyright and the rights of copyright owners. This DMCA Policy explains how copyright concerns involving content or materials associated with ToolTive can be reported and how ToolTive may respond to valid copyright complaints.</p>
          <p>ToolTive operates as a browser-based online tools platform. Many of our tools process user-selected files locally within the user's browser rather than uploading those files to ToolTive servers for processing or storage.</p>
          <p>Because ToolTive does not operate a user-file hosting or content repository, the handling of a copyright concern may differ from a traditional website that stores user-uploaded content.</p>

          <h2 id="copyright">1. Copyright and ToolTive</h2>
          <p>ToolTive's original website materials, including its original text, branding, interface design, graphics, and website code, are protected by applicable intellectual property and copyright laws unless otherwise stated.</p>
          <p>ToolTive may also use third-party and open-source software, libraries, frameworks, fonts, icons, and other resources under their respective licenses.</p>
          <p>Third-party materials remain subject to the rights and licenses of their respective owners.</p>
          <p>Nothing in this policy transfers ownership of ToolTive's original materials or third-party materials to users.</p>

          <h2 id="user-content">2. User-Provided Content</h2>
          <p>ToolTive provides browser-based tools that allow users to process files and other content through their web browsers.</p>
          <p>For the audited browser-based tools, user-selected files are processed locally on the user's device and are not uploaded to ToolTive servers for processing or stored by ToolTive as a hosted content repository.</p>
          <p>Users remain responsible for the content they choose to process through ToolTive.</p>
          <p>Users must ensure that they have the necessary rights, permissions, licenses, or other lawful authority to upload, process, reproduce, convert, modify, or otherwise use any content through the applicable ToolTive tool.</p>

          <h2 id="infringement-notices">3. Copyright Infringement Notices</h2>
          <p>If you believe that your copyrighted work has been infringed in connection with ToolTive, you may contact us at:</p>
          <p>Email: <strong><a href="mailto:support@tooltive.com">support@tooltive.com</a></strong></p>
          <p>A copyright complaint should provide enough information for ToolTive to understand the nature of the claim and identify the material or activity concerned.</p>
          <p>Because ToolTive does not routinely host user files on its servers, please clearly identify the specific ToolTive page, URL, feature, or other material that you believe is involved.</p>

          <h2 id="info-to-include">4. Information to Include in a Copyright Notice</h2>
          <p>To help us review a copyright complaint efficiently, please include the following information:</p>
          <ul>
            <li>Identification of the copyrighted work that you believe has been infringed. If multiple works are involved, provide a representative list where appropriate.</li>
            <li>Identification of the material or activity that you believe infringes your copyright, including the specific ToolTive URL or other information that allows us to locate it.</li>
            <li>Your contact information, such as your full name, email address, and other reasonably necessary contact details.</li>
            <li>A good-faith statement that you believe the disputed use of the copyrighted material is not authorized by the copyright owner, its agent, or applicable law.</li>
            <li>A statement of accuracy and authority confirming that the information in your notice is accurate and, where applicable, that you are authorized to act on behalf of the copyright owner.</li>
            <li>Your physical or electronic signature, where required for a valid copyright notice.</li>
          </ul>
          <p>Please provide accurate and complete information. Providing false or misleading information in a copyright complaint may have legal consequences.</p>

          <h2 id="review">5. Review of Copyright Complaints</h2>
          <p>When ToolTive receives a copyright complaint, we may review the information provided to determine whether the complaint concerns material or functionality under ToolTive's control.</p>
          <p>Where appropriate and legally required, ToolTive may take reasonable action in response to a valid copyright complaint.</p>
          <p>Because ToolTive's browser-based tools generally process user files locally and do not operate as a user-file hosting service, ToolTive may not have a server-side copy of the material identified in a complaint and may therefore be unable to remove or disable access to a user file that was processed locally in a browser.</p>
          <p>This does not prevent ToolTive from reviewing other aspects of a complaint or taking appropriate action where applicable.</p>

          <h2 id="counter-notifications">6. Counter-Notifications</h2>
          <p>If you believe that material or activity associated with a copyright complaint was incorrectly identified or that you have the necessary rights or authorization to use the material, you may contact ToolTive at:</p>
          <p><strong><a href="mailto:support@tooltive.com">support@tooltive.com</a></strong></p>
          <p>A counter-notification should explain the basis of your objection and provide sufficient information for ToolTive to understand the matter.</p>
          <p>Where a formal DMCA counter-notification process applies, the information required by applicable law should be provided, including identification of the relevant material or activity, contact information, appropriate statements regarding the disputed use, and the required signature.</p>
          <p>Because ToolTive does not routinely host user-uploaded files on its servers, a traditional hosting-provider takedown and restoration process may not apply to files processed entirely within a user's browser.</p>
          <p>ToolTive will review counter-notifications and other copyright-related communications based on the circumstances and applicable law.</p>

          <h2 id="repeat-infringement">7. Repeat Infringement</h2>
          <p>ToolTive does not operate user accounts or a user-upload database through which it maintains a traditional account-based repeat-infringer system.</p>
          <p>Where ToolTive becomes aware of repeated or otherwise unlawful copyright-related activity within areas under its control, it may take appropriate action where legally required or otherwise appropriate.</p>
          <p>Such action may depend on the nature of the activity, the information available to ToolTive, and applicable law.</p>

          <h2 id="third-party">8. Third-Party Content and Rights</h2>
          <p>ToolTive may provide tools that allow users to process images, documents, PDFs, and other files.</p>
          <p>The availability of a ToolTive tool does not give a user permission to process or use copyrighted material that belongs to another person or organization.</p>
          <p>Users are responsible for ensuring that they have the necessary rights or permissions to upload, process, reproduce, convert, modify, or otherwise use content through ToolTive.</p>
          <p>Users are also responsible for complying with applicable copyright, intellectual property, privacy, and other laws when using ToolTive.</p>

          <h2 id="generated-outputs">9. Generated Outputs</h2>
          <p>ToolTive provides tools that may generate or transform outputs such as invoices, PDFs, images, or other documents.</p>
          <p>ToolTive does not claim ownership of a user's lawful generated output merely because the output was created using a ToolTive tool.</p>
          <p>Users remain responsible for the content included in their outputs and for ensuring that their use of those outputs does not infringe the rights of another person or organization.</p>
          <p>Permission to use a generated output does not override third-party copyright, trademark, privacy, publicity, or other applicable rights.</p>

          <h2 id="no-monitoring">10. No Copyright Monitoring or File Repository</h2>
          <p>ToolTive does not operate a system that routinely stores, hosts, scans, or monitors user files for copyright infringement.</p>
          <p>For browser-based tools that process files locally, the selected files remain within the user's browser during processing rather than being transmitted to ToolTive servers for file processing.</p>
          <p>Accordingly, ToolTive should not be understood as a general-purpose file-hosting, file-sharing, or user-content repository.</p>

          <h2 id="false-notices">11. False or Misleading Copyright Notices</h2>
          <p>Copyright complaints should only be submitted when the complainant has a genuine basis for believing that their copyright or applicable rights have been infringed.</p>
          <p>Submitting knowingly false, fraudulent, or materially misleading information may have legal consequences.</p>
          <p>ToolTive reserves the right to consider the accuracy and good-faith basis of copyright complaints when reviewing them.</p>

          <h2 id="third-party-websites">12. Third-Party Websites and Services</h2>
          <p>ToolTive may contain links to or rely on third-party services, software, libraries, infrastructure, or resources.</p>
          <p>Third-party services and materials may be subject to their own terms, licenses, copyright policies, and intellectual property rights.</p>
          <p>ToolTive does not claim ownership of third-party materials merely because they are used by, linked from, or integrated into the website.</p>

          <h2 id="changes">13. Policy Changes</h2>
          <p>ToolTive may update this DMCA Policy when necessary to reflect changes to the website, its tools, applicable legal requirements, or its copyright practices.</p>
          <p>When this policy is updated, the Last Updated date at the top of the page will be changed accordingly.</p>
          <p>Users are encouraged to review this page periodically for the current policy.</p>

          <h2 id="contact">14. Contact Us</h2>
          <p>For copyright concerns, DMCA notices, counter-notifications, or other copyright-related questions, please contact:</p>
          <p>
            <strong>ToolTive</strong><br />
            <strong>Email:</strong> <a href="mailto:support@tooltive.com">support@tooltive.com</a><br />
            <strong>Website:</strong> <a href="https://tooltive.com">https://tooltive.com</a>
          </p>
          <p>Please include sufficient information in your message for ToolTive to understand and review your copyright concern.</p>
        </article>

        {/* Sidebar / Table of Contents (30%) */}
        <aside className="blog-sidebar">
          <div className="toc-box">
            <h3 className="toc-title">Table of Contents</h3>
            <ul className="toc-list">
              <li><a href="#copyright">1. Copyright and ToolTive</a></li>
              <li><a href="#user-content">2. User-Provided Content</a></li>
              <li><a href="#infringement-notices">3. Infringement Notices</a></li>
              <li><a href="#info-to-include">4. Information to Include</a></li>
              <li><a href="#review">5. Review of Complaints</a></li>
              <li><a href="#counter-notifications">6. Counter-Notifications</a></li>
              <li><a href="#repeat-infringement">7. Repeat Infringement</a></li>
              <li><a href="#third-party">8. Third-Party Content</a></li>
              <li><a href="#generated-outputs">9. Generated Outputs</a></li>
              <li><a href="#no-monitoring">10. No Copyright Monitoring</a></li>
              <li><a href="#false-notices">11. False Notices</a></li>
              <li><a href="#third-party-websites">12. Third-Party Websites</a></li>
              <li><a href="#changes">13. Policy Changes</a></li>
              <li><a href="#contact">14. Contact Us</a></li>
            </ul>
          </div>
        </aside>

      </div>
    </div>
  );
}
