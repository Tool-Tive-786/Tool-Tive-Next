---
title: "How to Check Website Security: A Complete Checklist"
description: "Learn how to check website security with practical checks for HTTPS, security headers, cookies, software updates, admin access, backups, and recovery."
pubDate: "2026-10-03"
category: "business"
image: "/tooltive-card-images/how-to-check-website-security-tooltive.webp"
imageAlt: "How to check website security complete checklist and audit guide"
imageTitle: "How to Check Website Security Checklist"
imageCaption: "A complete step-by-step checklist to check website security, HTTPS, headers, and access controls."
imageDescription: "Featured image for ToolTive's guide on how to check website security, covering HTTPS, security headers, cookies, permissions, backups, and audits."
tags: ["website security", "cybersecurity", "HTTPS", "security headers", "website audit"]
---

Your website loads over HTTPS without a warning. That is a good first result, but it leaves several questions unanswered: is the software maintained, who can access the admin account, and could you restore the site if something went wrong?

To check website security, review HTTPS, redirects, mixed content, security headers, cookies, forms, and exposed information. Then inspect software updates, access controls, domain settings, backups, and monitoring. Some checks are visible to anyone; others require website, hosting, or application access.

This guide is mainly for owners reviewing their own sites. Visitors deciding whether to trust an unfamiliar business should also verify its identity and domain before entering sensitive information. HTTPS protects a connection; it does not certify the business behind it.

Work through the checklist on a site you own or are authorized to manage. Record each finding, its evidence, and who will fix it.

<figure style="margin: 2em 0; text-align: center;">
  <img src="/tooltive-card-images/how-to-check-website-security-tooltive.webp" alt="How to check website security complete checklist and audit guide" title="How to Check Website Security Checklist" style="max-width: 100%; height: auto; display: block; margin: 0 auto; border-radius: 12px;" />
  <figcaption style="font-size: 0.9em; color: #a09890; margin-top: 0.75em; font-style: italic;">A complete step-by-step checklist to check website security, HTTPS, headers, and access controls.</figcaption>
</figure>

## Why Is Website Security Important?

### Protecting visitors and their data

Passwords, enquiries, and payment information travel across networks you do not control. TLS protects their confidentiality and integrity in transit and authenticates the server for the hostname when certificate validation succeeds. After the data arrives, storage, permissions, and application controls determine how it is protected.

### Preventing avoidable security weaknesses

An obsolete plugin, an exposed credential, and an editor with administrator permissions create different problems. A useful review identifies the actual issue and its likely impact. A website can pass connection checks while still having broken authorization or unmaintained dependencies.

### Protecting trust and website availability

Unauthorized redirects, injected content, stolen accounts, and service disruption can prevent visitors using a site. Monitoring helps you notice changes; tested recovery procedures help you respond. Security work includes keeping the service usable when something fails.

### Why HTTPS alone is not enough

HTTPS protects browser-to-server communication. It does not repair application bugs, revoke stolen credentials, secure backups, or establish that a website is legitimate. A malicious site can have a valid certificate. Treat a successful HTTPS check as evidence about transport security, then review the other layers.

## What Does a Website Security Check Actually Look At?

### Transport security

Check HTTPS availability, certificate validation, redirects, and resource loading. Specialist external tools can examine observable TLS protocols and cryptographic settings. Private configuration files and renewal arrangements require internal access.

### Browser security

Response headers help control scripts, framing, content interpretation, referrer information, and supported browser features. Their values and coverage matter more than their presence alone.

### Session and cookie security

Review sensitive-cookie attributes and, internally, session lifetime, logout, and invalidation after account changes. Cookies issued after login may never appear in an anonymous scan.

### Website and application security

Assess software maintenance, input handling, and authorization. For example, a customer should only be able to access records they are entitled to see, regardless of the site's header score.

### Infrastructure and operational security

Hosting, DNS, administrator accounts, secrets, logs, and recovery systems need separate attention. Public responses rarely establish whether these controls work.

| Area | Observable from outside | Usually requires internal access |
| --- | --- | --- |
| Transport | HTTPS, certificates, redirects, selected TLS settings | Origin configuration, renewal process |
| Browser and cookies | Returned headers and observable cookie attributes | Policies across authenticated workflows |
| Application | Public forms, resource requests, visible errors | Installed dependencies, code, authorization logic |
| Operations | Public DNS and selected availability signals | Administrator accounts, logs, backups, recovery evidence |

An unauthenticated public check only observes what is available within its scope. Other assessment tools may use credentials or active testing, so read the actual service description before interpreting a report.

## How to Check Website Security

### 1. Check That Your Website Uses HTTPS

Open the homepage and representative pages using `https://`. Include login, contact, account, and checkout pages where they exist. Inspect the browser's connection details rather than relying on a particular icon; browser interfaces change.

Check that the certificate covers each public hostname, remains valid, and produces no trust warning. Investigate warnings before entering sensitive data. Internally, confirm who handles renewal and how failures trigger an alert.

[Qualys SSL Labs](https://www.ssllabs.com/ssltest/) can assess public TLS configuration in more detail. Its result applies to the tested endpoint, which may be a CDN or proxy. It does not establish the security of the origin server or application behind that endpoint.

### 2. Check That HTTP Redirects to HTTPS

Request the HTTP version explicitly. For a public website, expect a redirect to the corresponding HTTPS resource:

```text
http://example.com/contact
https://example.com/contact
```

Check several paths and both `www` and non-`www` hostnames if they receive traffic. Preserve the intended page and avoid any subsequent downgrade to HTTP. [MDN's TLS guidance](https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides/TLS) recommends upgrading on the same hostname before applying a separate cross-host canonical redirect, so the original host can deliver its HSTS policy.

From a terminal, this inspects the first response using a normal GET request without retaining the response body:

```bash
curl -sS -D - -o /dev/null http://example.com/contact
```

Look for a redirect status and an HTTPS `Location`. Inspect later hops separately or in developer tools. Browser HSTS and HTTPS settings may upgrade a request locally, which does not prove the server itself returned a redirect.

### 3. Check for Mixed Content

Mixed content occurs when an HTTPS page requests resources over HTTP. Inspect the browser Console and Network panels on important page templates, then exercise menus, forms, and embedded widgets to reveal requests made after loading.

Older guides distinguish active content, such as scripts and stylesheets, from passive content, such as images. Active content deserves particular attention because tampering can alter page behavior. Current browsers generally classify mixed requests as **blockable** or **upgradable**.

Some image, audio, and video requests are automatically upgraded to HTTPS. This is not universal: images requested through `srcset` or `<picture>`, and resources using IP-address hosts, can be blocked. Scripts, stylesheets, and frames are among the blockable types. [MDN's mixed-content reference](https://developer.mozilla.org/en-US/docs/Web/Security/Defenses/Mixed_content) describes these distinctions.

Fix insecure URLs at their source and verify that the resources exist over HTTPS. Browser upgrading may conceal an old reference; blocking may explain a broken widget. A static HTML review can also miss resources requested dynamically.

### 4. Check Your Website Security Headers

In developer tools, select the main document request and read its response headers. Repeat this for important routes, authenticated pages, and error responses: one correct homepage does not establish consistent coverage.

Missing headers can indicate hardening opportunities. They do not prove a site is compromised, and a high header score does not validate application authorization.

#### Content-Security-Policy (CSP)

CSP controls resource loading and script execution, helping reduce the impact of certain injection attacks. Review permitted sources and relevant directives. Broad allowances, including unrestricted inline execution, can weaken the policy.

Tailor CSP to the application and test integrations before enforcement. `Content-Security-Policy-Report-Only` can help observe violations during rollout, but does not enforce those restrictions. A policy that breaks checkout is not a successful deployment. CSP complements secure coding; it does not replace fixing injection or access-control bugs.

#### Strict-Transport-Security (HSTS)

HSTS tells supporting browsers to use HTTPS for a host for a specified period after receiving the policy over HTTPS. Review `max-age` and the intended coverage.

Confirm affected subdomains support HTTPS before using `includeSubDomains`. Preloading is a separate commitment involving inclusion in a browser preload list; adding the `preload` token alone does not establish that inclusion. Without an existing policy or preload entry, an initial HTTP request can still precede the redirect.

A long-lived policy requires continued HTTPS support. It does not fix invalid certificates, and supporting browsers enforce certificate errors more strictly for HSTS hosts.

#### X-Content-Type-Options

Look for:

```http
X-Content-Type-Options: nosniff
```

This controls MIME sniffing and helps prevent resources being interpreted as an unintended content type. Also verify correct `Content-Type` values, especially for uploaded or downloadable content. It is a useful, narrow control rather than general application protection.

#### X-Frame-Options and CSP `frame-ancestors`

These restrict which pages can embed yours, helping prevent clickjacking. `X-Frame-Options: DENY` prevents framing; `SAMEORIGIN` permits same-origin framing. CSP `frame-ancestors` allows more flexible ancestor restrictions.

Choose a policy that preserves legitimate booking widgets or other intended embeds. Check the effective browser behavior rather than insisting both mechanisms are always necessary. `frame-ancestors` must be sent in an HTTP CSP header; a CSP meta tag cannot supply it.

#### Referrer-Policy

Referrer Policy controls how much referring URL information is shared with destinations. Review whether paths or query strings could disclose sensitive information.

Modern browsers commonly default to `strict-origin-when-cross-origin`; an absent explicit header does not automatically mean full URLs leak. Set an appropriate policy deliberately, and avoid placing passwords or tokens in URLs regardless of the policy.

#### Permissions-Policy

Permissions Policy restricts supported browser features, including camera, microphone, and geolocation, in a document and its frames. Disable features the site does not need while preserving legitimate functions.

Support varies by browser and directive. The policy does not replace permission prompts or repair application vulnerabilities. Check compatibility for your audience before treating a particular restriction as effective.

Older checklists may also recommend `X-XSS-Protection`. The [OWASP HTTP Headers Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html) advises omitting it or setting it to `0`; the legacy filter can introduce problems. Do not enable it merely to satisfy an outdated scanner.

### 5. Check Cookie Security

Inspect browser cookie storage and `Set-Cookie` response headers. Authentication cookies deserve particular attention:

- **Secure** restricts transmission to secure connections, with browser exceptions for local development.
- **HttpOnly** prevents JavaScript reading the cookie through cookie APIs. It does not prevent malicious scripts making authenticated requests.
- **SameSite** controls inclusion in cross-site requests. `Strict` is restrictive, `Lax` allows certain navigations, and `None` permits cross-site use and requires `Secure` in modern browsers.

An illustrative session cookie looks like this:

```http
Set-Cookie: session=example-value; Secure; HttpOnly; SameSite=Lax; Path=/
```

Choose attributes according to the cookie's purpose and test login or payment integrations. A theme preference may legitimately be readable by scripts. SameSite reduces some CSRF risks but does not replace appropriate application defenses.

External scanners can assess only cookies actually observable in the responses available to them. Inspect login-issued cookies yourself during an authorized session; an anonymous homepage result cannot validate them.

### 6. Check Public Server and Error Information

Review `Server`, `X-Powered-By`, and ordinary error responses. Detailed versions, stack traces, database messages, and debug output may expose information visitors do not need.

On your own site, request a nonexistent page and inspect its response. Public errors should be restrained and useful, with diagnostic details kept in protected internal logs. Remove unnecessary banners where practical.

A software version disclosure alone is not proof of an exploitable vulnerability. Hiding it also does not substitute for patching the underlying software.

### 7. Check Forms and Data Transmission

Use test data to review login, enquiry, booking, upload, and checkout flows. Confirm both the page and its actual submission destination use HTTPS. JavaScript can send information somewhere different from the form's visible `action` attribute.

Watch the Network panel during submission. A third-party destination may be legitimate, but verify the provider and purpose. Avoid sensitive values in query strings, which can appear in histories and logs. Limit unnecessary scripts on sensitive pages.

For payments, follow the provider's integration model and applicable requirements rather than assuming outsourced collection removes every responsibility. Internally, review server-side validation, authorization, and relevant CSRF protection. A successful HTTPS submission establishes neither secure storage nor correct access control.

### 8. Check Your CMS, Plugins, Themes, and Dependencies

Inventory installed software through the CMS dashboard, dependency manifests, and hosting records. Compare components with vendor advisories and supported releases. Include build and deployment dependencies where they affect what reaches production.

Remove unused extensions and replace components without a viable maintenance path. Test updates in staging where practical and keep a recovery option. Prioritize applicable vulnerabilities according to exposure and affected functionality.

An older version may include vendor-backported fixes, so version numbers alone cannot confirm vulnerability. Public fingerprinting can suggest technologies; a basic HTTP scan cannot reliably verify every installed component or patch. This review needs internal evidence.

### 9. Check Admin Access, Passwords, and MFA

Review CMS, hosting, code repository, deployment, registrar, and email accounts. Remove access that is no longer needed, use individual accounts, and grant only the permissions required for current duties.

Use unique passwords stored in a password manager and enable MFA where supported. Prefer phishing-resistant methods, such as security keys or appropriately configured passkeys, when available. Protect recovery methods and backup codes too.

For custom applications, review login throttling, password recovery, session expiration, and invalidation after sensitive changes. Do not impose arbitrary periodic password changes as a substitute for better authentication; change compromised credentials and investigate the cause.

A static site may have no visitor sessions, but its hosting, deployment, DNS, and registrar accounts still need protection.

### 10. Check DNS, Domain, and Email Security

Protect registrar and DNS accounts with strong authentication, review administrators, and confirm contact and renewal details. Use registrar locking where appropriate. Review obsolete records, especially references to deprovisioned third-party services that might create takeover risk.

DNSSEC adds signatures that allow validating resolvers to check DNS data integrity and authenticity. It does not encrypt traffic or secure application code. Coordinate changes with your DNS provider and registrar; incorrect validation configuration can disrupt resolution.

For email, review the configuration appropriate to your domain:

- **SPF** identifies authorized senders for the relevant sending domain.
- **DKIM** lets receivers verify a message signature associated with a signing domain.
- **DMARC** checks alignment with the visible From domain and publishes handling and reporting policies.

DMARC passes when at least one of SPF or DKIM passes with the required alignment. One failing mechanism does not necessarily mean DMARC fails. Reports depend on configured reporting destinations and receiver participation; a monitoring-only policy does not request rejection.

Confirm legitimate sending services before tightening enforcement. Non-sending domains can also benefit from an explicit policy. Email authentication helps reduce domain spoofing and support email trust; it does not establish website security.

### 11. Check for Exposed Files, Secrets, and Debug Information

Review deployment output, public storage, and hosting configuration for files that should remain private: backups, database exports, environment files, logs, and debug pages. Inspect published client assets for accidentally embedded server credentials or privileged API keys.

Public source maps are not automatically vulnerabilities. Review their contents for sensitive details; their presence alone does not establish credential exposure.

Remove accidental exposure and revoke or rotate affected credentials. Deleting a published key does not invalidate copies already obtained. Review related activity to understand potential use.

Do not rely on `robots.txt` to protect private files. It guides cooperating crawlers and does not enforce access control. ToolTive's [Robots.txt Generator & Tester](/all-tools/seo/free-robots-txt-generator) helps review crawl directives; private content needs authentication, authorization, or removal from public hosting.

Also review public sitemap entries with the [XML Sitemap Generator](/all-tools/seo/free-xml-sitemap-generator). Excluding a URL from a sitemap does not prevent access to it.

### 12. Check Backups, Monitoring, and Recovery

Confirm backups include the files, database, and configuration needed to rebuild the site. Protect them from unauthorized access and keep recovery copies separated from the failure conditions affecting production, such as an isolated or offline copy where appropriate.

Restore into an isolated environment and verify important functions. Record recovery time and the data lost since the backup. A successful-backup notification alone does not demonstrate recoverability.

Monitor availability, certificate renewal, failed authentication, privilege changes, and relevant application events. Protect logs and avoid recording passwords, tokens, or unnecessary personal data. Assign someone to investigate alerts.

A short response plan should identify who can contain an incident, preserve evidence, rotate credentials, contact providers, and restore safely. Public scanning cannot validate that process.

## Which Website Security Checks Can You Automate?

### Checks an external scanner can observe

Depending on its documented scope, a scanner can inspect HTTPS, redirects, returned headers, observable cookie attributes, mixed-content signals, and selected public configuration. Tools built for DNS can examine public DNS and email-authentication records.

Know how the scanner works. An HTML-only check can miss requests made by JavaScript; a browser-based check can still miss interactions it never exercises. Record tested pages, timestamps, crawl limits, and skipped requests. Repeat checks after changes to catch regressions.

### Checks that usually require website or server access

Dependency analysis, secret detection, account reviews, backups, and internal configuration checks can also be automated. They require access to the relevant systems and suitable permissions.

Authenticated scanners reach further than anonymous checks, but business logic and authorization often need targeted assessment. A clean result means no issue was found within that tool's coverage at that time.

## Website Security Check vs Security Audit vs Penetration Test

| Approach | Typical purpose | What it can cover |
| --- | --- | --- |
| Website security check | Quick review of visible signals | Public HTTPS, headers, cookies, selected response behavior |
| Security audit | Systematic review against agreed criteria | Configuration, controls, processes, access records, evidence |
| Penetration test | Authorized active assessment | Attempts to identify and validate exploitable weaknesses within scope |

Service labels vary. Ask which systems, accounts, and workflows are included, what methods are used, and what evidence the report provides. An audit can include internal controls and need not be external-only.

Consider deeper testing for sensitive data, customer accounts, payments, or complex permissions. Agree on authorization, boundaries, operational limits, and retesting before active assessment. Routine maintenance and targeted testing serve different purposes.

## Common Website Security Problems to Look For

Common findings include insecure transport, broken redirects, mixed requests, ineffective browser policies, inappropriate session-cookie attributes, applicable software vulnerabilities, stale administrator access, exposed secrets, and untested recovery arrangements.

Prioritize by evidence and impact. An exposed database backup and an absent Permissions Policy are different findings. Give each issue an owner and a verification step; improving a scanner grade alone does not establish that a meaningful risk was resolved.

## How Often Should You Check Your Website Security?

Set a repeatable schedule according to risk and rate of change. A frequently deployed application handling customer data needs a different review pattern from a rarely changed informational site.

Repeat affected checks after migrations, DNS changes, major releases, dependency updates, new integrations, and authentication changes. Review relevant controls after incidents and retest fixes before closing findings. Integrate appropriate automated checks into deployments.

Internal reviews need their own schedule: accounts, patching, and recovery do not become less important because public pages rarely change. Any applicable standard or contractual requirement may add specific obligations. Keep dated results and clear ownership instead of treating one successful review as permanent assurance.

## Use ToolTive to Check Your Website's Security Signals

ToolTive's [AI Search Optimizer](/all-tools/seo/ai-search-optimizer) provides a free Basic Scan of public technical signals. Its published scope covers up to 10 pages, combining HTTPS, mixed-content signals, and essential headers with crawl accessibility, metadata, internal links, structured data, and other defined checks.

**[Run a Free AI Search Optimizer Scan](/all-tools/seo/ai-search-optimizer)**

ToolTive's Basic Scan is a passive public-response audit. It does not replace a penetration test or an authenticated security assessment.

Check which pages the report includes, then use the findings to organize public-facing fixes. Review internal accounts, dependencies, and recovery separately. The report does not guarantee rankings, indexing, traffic, or inclusion in AI answers.

## Quick Website Security Checklist

Apply these checks to your features and risk. Record justified exceptions rather than treating every unchecked item as proof of compromise.

- [ ] Representative pages use HTTPS without certificate warnings.
- [ ] HTTP requests redirect to the intended HTTPS resource.
- [ ] Mixed-content references and warnings are reviewed.
- [ ] HSTS coverage and rollout are appropriate.
- [ ] CSP values and enforcement are assessed.
- [ ] Content types and `X-Content-Type-Options` are correct.
- [ ] Framing protection matches intended embedding.
- [ ] Referrer and supported feature permissions are reviewed.
- [ ] Sensitive cookies have suitable security attributes.
- [ ] Forms send data securely to intended destinations.
- [ ] Private files, debug output, and secrets remain protected.
- [ ] Software and dependencies have a maintained patch process.
- [ ] Administrator access, MFA, and session controls are reviewed.
- [ ] Domain, DNS, and relevant email settings are checked.
- [ ] Protected backups are available and restores are tested.
- [ ] Monitoring, alert ownership, and response procedures are documented.

## Frequently Asked Questions

### How do I check if my website is secure?

Review representative public pages, then inspect installed software, accounts, and recovery controls internally. Record evidence and retest fixes. Custom applications may need an authorized assessment of authenticated behavior and permissions. The useful result is a documented understanding of tested controls and remaining gaps.

### Is HTTPS enough to make a website secure?

HTTPS protects communication and authenticates the server for the hostname when certificate validation succeeds. It does not assess the application's code, administrators, or business legitimacy. Continue with the other layers even when connection checks pass.

### How can I check my website security for free?

Browser developer tools show requests, headers, and cookies. SSL Labs assesses public TLS configuration, [MDN HTTP Observatory](https://developer.mozilla.org/en-US/observatory) reviews supported HTTP security controls, and ToolTive's Basic Scan covers its documented public signals. Combine these with reviews inside your hosting and administration accounts; free public tools cannot verify every internal control.

### What security headers should a website have?

Review CSP, HSTS, content-type protection, framing controls, referrer behavior, and supported feature permissions. Choose values that fit the application and test them across important routes. HTML pages, APIs, and intentionally embedded content have different requirements. Header presence alone is insufficient.

### How often should I perform a website security check?

Use a risk-based schedule and repeat relevant checks after meaningful changes. Maintain separate reviews for accounts, maintenance, and recovery. Automated observations are useful when someone acts on findings; an unattended recurring scan offers limited practical benefit.

### Is a website security scan the same as a penetration test?

A passive public scan observes defined signals. A penetration test actively evaluates weaknesses within an authorized scope and may validate exploitability. Some scanners also perform active or authenticated testing, so compare actual methods, access, and deliverables rather than relying on the label alone.

### Can a website scanner detect every security vulnerability?

No. Coverage depends on the tool, reachable pages, credentials, and testing methods. Permission errors, business-logic weaknesses, and private infrastructure problems can remain untested. Interpret scan results alongside internal evidence and targeted assessment.

## Final Takeaway

Start with public-facing checks, resolve the issues you can verify, and review internal controls with the people who manage them. Add deeper authorized testing when the application's risk calls for it. ToolTive's Basic Scan provides a starting point for visible signals; this checklist helps carry the review through the systems behind them.

## Sources and Further Reading

- [MDN practical security implementation guides](https://developer.mozilla.org/en-US/docs/Web/Security/Practical_implementation_guides)
- [MDN Content-Security-Policy reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy)
- [MDN Strict-Transport-Security reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Strict-Transport-Security)
- [MDN Set-Cookie reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Web Security Testing Guide](https://owasp.org/projects/web-security-testing-guide)
- [Google email sender guidelines](https://support.google.com/a/answer/81126)
- [Cloudflare DNSSEC documentation](https://developers.cloudflare.com/dns/dnssec/)
- [Google Search Central: robots.txt limitations](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
