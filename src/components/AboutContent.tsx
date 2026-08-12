'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import FaqSection from '@/components/FaqSection';
import ToolCard from '@/components/ToolCard';
import '@/styles/about.css';
import '@/styles/tools.css';

export default function AboutContent() {
  const [activeTab, setActiveTab] = useState('p-inv');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const badRef = useRef<HTMLDivElement>(null);

  /* ---- Scroll reveal ---- */
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }),
      { threshold: 0.12 }
    );
    document.querySelectorAll('.ab-reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  /* ---- Counter animation ---- */
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      document.querySelectorAll('[data-count]').forEach(el => {
        const target = parseInt(el.getAttribute('data-count') || '0');
        const suffix = el.getAttribute('data-suffix') || '';
        let cur = 0;
        const step = Math.max(1, Math.floor(target / 30));
        const iv = setInterval(() => {
          cur = Math.min(cur + step, target);
          el.textContent = cur + suffix;
          if (cur >= target) clearInterval(iv);
        }, 30);
      });
      obs.disconnect();
    }, { threshold: 0.5 });
    const el = document.querySelector('.ab-stat-row');
    if (el) obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* ---- Invoice lines animation ---- */
  useEffect(() => {
    if (activeTab !== 'p-inv') return;
    const lines = document.querySelectorAll('.ab-inv-line');
    const stamp = document.getElementById('invStamp');
    lines.forEach(l => l.classList.remove('show'));
    stamp?.classList.remove('show');
    lines.forEach((l, i) => setTimeout(() => l.classList.add('show'), 200 + i * 250));
    setTimeout(() => stamp?.classList.add('show'), 200 + lines.length * 250 + 300);
  }, [activeTab]);

  /* ---- Compressor slider ---- */
  const handleSlider = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const q = parseInt(e.target.value);
    const orig = 2.4;
    const out = (orig * (q / 100)).toFixed(1);
    const saved = (100 - (parseFloat(out) / orig) * 100).toFixed(0);
    const outEl = document.getElementById('cmpOut');
    const savedEl = document.getElementById('cmpSaved');
    const barEl = document.getElementById('cmpBar');
    const tagEl = document.getElementById('cmpTag');
    if (outEl) outEl.textContent = out + ' MB';
    if (savedEl) savedEl.textContent = saved + '%';
    if (barEl) barEl.style.width = saved + '%';
    if (tagEl) tagEl.textContent = q < 30 ? 'AGGRESSIVE' : q < 70 ? 'BALANCED' : 'LOSSLESS';
  }, []);

  /* ---- PDF progress simulation ---- */
  useEffect(() => {
    if (activeTab !== 'p-pdf') return;
    const bar = document.getElementById('pdfBar');
    const status = document.getElementById('pdfStatus');
    if (!bar || !status) return;
    bar.style.width = '0%';
    status.textContent = 'merging in-browser…';
    let w = 0;
    const iv = setInterval(() => {
      w = Math.min(w + Math.random() * 12 + 3, 100);
      bar.style.width = w + '%';
      bar.style.transition = 'width .3s';
      if (w >= 100) { status.textContent = '✓ document.pdf ready — 0 uploads'; clearInterval(iv); }
    }, 180);
    return () => clearInterval(iv);
  }, [activeTab]);

  /* ---- Bad ledger strikethrough on scroll ---- */
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) badRef.current?.classList.add('struck');
    }, { threshold: 0.6 });
    if (badRef.current) obs.observe(badRef.current);
    return () => obs.disconnect();
  }, []);

  /* ---- Meter bars animation ---- */
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      document.querySelectorAll('.ab-meter .bar i').forEach(bar => {
        const w = (bar as HTMLElement).dataset.w;
        if (w) (bar as HTMLElement).style.width = w;
      });
      obs.disconnect();
    }, { threshold: 0.4 });
    const el = document.querySelector('.ab-meter-card');
    if (el) obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const faqData = [
    { 
      question: 'Is ToolTive free to use?', 
      answer: 'Yes. ToolTive currently provides its available tools free of charge, with no subscription required or credit card needed to use the supported tools. The platform is designed to make practical online utilities accessible for everyday tasks, work, study, and personal projects.',
      schemaAnswer: 'Yes. ToolTive currently provides its available tools free of charge, with no subscription required or credit card needed to use the supported tools. The platform is designed to make practical online utilities accessible for everyday tasks, work, study, and personal projects.'
    },
    { 
      question: 'Do I need to upload my files to ToolTive?', 
      answer: "For ToolTive's supported browser-based file tools, processing takes place locally in your browser rather than uploading the files to ToolTive servers for processing. This allows supported tasks to be completed directly on your device. You should still review each tool's information and keep your own backups of important files.",
      schemaAnswer: "For ToolTive's supported browser-based file tools, processing takes place locally in your browser rather than uploading the files to ToolTive servers for processing. This allows supported tasks to be completed directly on your device. You should still review each tool's information and keep your own backups of important files."
    },
    { 
      question: 'Do I need to create an account to use ToolTive?', 
      answer: "No account or registration is currently required to use ToolTive's available tools. You can access supported tools directly through your browser without creating a user account. If you choose to contact ToolTive through the contact form, you may be asked to provide the information required to respond to your message.",
      schemaAnswer: "No account or registration is currently required to use ToolTive's available tools. You can access supported tools directly through your browser without creating a user account. If you choose to contact ToolTive through the contact form, you may be asked to provide the information required to respond to your message."
    },
    { 
      question: 'What tools are currently available on ToolTive?', 
      answer: 'ToolTive currently offers an Invoice Generator, Image Compressor, and Image to PDF Converter. Each tool is built for a specific everyday digital task, with a focus on straightforward workflows and practical results. The available tool collection may grow as new utilities are developed and published.',
      schemaAnswer: 'ToolTive currently offers an Invoice Generator, Image Compressor, and Image to PDF Converter. Each tool is built for a specific everyday digital task, with a focus on straightforward workflows and practical results. The available tool collection may grow as new utilities are developed and published.'
    },
    { 
      question: 'Will ToolTive add more tools in the future?', 
      answer: 'Yes. ToolTive is being developed as a growing collection of practical online utilities. We plan to introduce additional tools that can help with more everyday digital tasks while maintaining a simple, accessible, and easy-to-use experience.',
      schemaAnswer: 'Yes. ToolTive is being developed as a growing collection of practical online utilities. We plan to introduce additional tools that can help with more everyday digital tasks while maintaining a simple, accessible, and easy-to-use experience.'
    },
  ];

  return (
    <div className="about-page">

      {/* ===== OPENING / HERO ===== */}
      <section className="ab-section ab-open">
        <div className="ab-wrap">
          {/* Centered H1 */}
          <h1 style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="ab-line-mask"><span style={{ '--d': '.05s', display: 'inline-block' } as React.CSSProperties}>Free tools. </span></span>
            <span className="ab-line-mask"><span style={{ '--d': '.18s', display: 'inline-block' } as React.CSSProperties}>Simple experience. </span></span>
            <span className="ab-line-mask"><span style={{ '--d': '.31s', display: 'inline-block' } as React.CSSProperties}><span className="hl">No unnecessary barriers.</span></span></span>
          </h1>

          {/* Grid below H1 */}
          <div className="ab-open-grid">
            <div>
              <p className="ab-open-sub ab-reveal" style={{ '--d': '.35s' } as React.CSSProperties}>
                ToolTive is a seamless platform offering free, fast, and no-signup utilities for professionals, creatives, students, developers, and everyday internet users. Everyday digital tasks shouldn&apos;t require complicated software, unnecessary accounts, or confusing workflows.
              </p>
              <div className="ab-stat-row ab-reveal" style={{ '--d': '.45s' } as React.CSSProperties}>
                <div className="ab-stat"><b data-count="0">0</b><span>Sign-ups required</span></div>
                <div className="ab-stat"><b data-count="0">0</b><span>Files uploaded</span></div>
                <div className="ab-stat"><b data-count="3">0</b><span>Tools live</span></div>
                <div className="ab-stat"><b data-count="100" data-suffix="%">0</b><span>Free to use</span></div>
              </div>
              <div className="ab-open-cta ab-reveal" style={{ '--d': '.55s' } as React.CSSProperties}>
                <Link href="/all-tools" className="ab-btn ab-btn-accent">Explore Tools <span className="arr">→</span></Link>
                <a href="#ab-what" className="ab-btn ab-btn-ghost">Read Our Story <span className="arr">↓</span></a>
              </div>
            </div>

          {/* LIVE CONSOLE */}
          <div className="ab-console ab-reveal" style={{ '--d': '.3s' } as React.CSSProperties}>
            <div className="ab-console-bar">
              <span className="ab-dot l" /><span className="ab-dot o" /><span className="ab-dot k" />
              <span className="ab-ttl">tooltive://live-preview</span>
              <span className="ab-side"><span className="ab-blink" /> BROWSER-SIDE</span>
            </div>
            <div className="ab-tabs" role="tablist">
              {[{ id: 'p-inv', label: 'Invoice' }, { id: 'p-cmp', label: 'Compressor' }, { id: 'p-pdf', label: 'Image → PDF' }].map(t => (
                <button key={t.id} className={`ab-tab${activeTab === t.id ? ' on' : ''}`} role="tab" onClick={() => setActiveTab(t.id)}>{t.label}</button>
              ))}
            </div>

            {/* Invoice Panel */}
            <div className={`ab-panel${activeTab === 'p-inv' ? ' on' : ''}`} id="p-inv" role="tabpanel">
              <div className="ab-inv-doc">
                <div className="ab-inv-head"><span>INVOICE</span><span>#TL-1042</span></div>
                <div className="ab-inv-line"><span>Billed to</span><b>Acme Studio</b></div>
                <div className="ab-inv-line"><span>Service</span><b>Brand Design</b></div>
                <div className="ab-inv-line"><span>Due date</span><b>On receipt</b></div>
                <div className="ab-inv-line"><span>Amount</span><b>$1,240.00</b></div>
                <span className="ab-stamp" id="invStamp">PAID ✓</span>
              </div>
            </div>

            {/* Compressor Panel */}
            <div className={`ab-panel${activeTab === 'p-cmp' ? ' on' : ''}`} id="p-cmp" role="tabpanel">
              <div className="ab-comp">
                <div className="ab-comp-img"><img src="https://picsum.photos/seed/tooltive-compress/560/360" alt="Sample image" /></div>
                <div className="ab-comp-ctl">
                  <label htmlFor="cmpRange">Quality — drag to compress</label>
                  <input type="range" id="cmpRange" min={5} max={100} defaultValue={62} onChange={handleSlider} />
                  <div className="ab-comp-read">
                    <div><span>Original</span><b>2.4 MB</b></div>
                    <div><span>Output</span><b id="cmpOut">—</b></div>
                    <div><span>Saved</span><b id="cmpSaved" style={{ color: 'var(--ab-accent)' }}>—</b></div>
                  </div>
                  <div className="ab-saved-bar"><i id="cmpBar" /></div>
                  <span className="ab-q-tag" id="cmpTag">BALANCED</span>
                </div>
              </div>
            </div>

            {/* PDF Panel */}
            <div className={`ab-panel${activeTab === 'p-pdf' ? ' on' : ''}`} id="p-pdf" role="tabpanel">
              <div className="ab-pdf-flow">
                <div className="ab-pdf-thumbs">
                  <img src="https://picsum.photos/seed/pdf-one/140/100" alt="" />
                  <img src="https://picsum.photos/seed/pdf-two/140/100" alt="" />
                  <img src="https://picsum.photos/seed/pdf-three/140/100" alt="" />
                </div>
                <span className="ab-flow-arr" aria-hidden="true">⟶</span>
                <div className="ab-pdf-out">
                  <div className="nm"><em>PDF</em> document.pdf</div>
                  <div className="ab-pdf-prog"><i id="pdfBar" /></div>
                  <div className="ab-pdf-status" id="pdfStatus">merging in-browser…</div>
                </div>
              </div>
            </div>

            <div className="ab-console-note"><span>* Interactive preview — real tools run fully in your browser</span><span>0 uploads · 0 accounts</span></div>
          </div>
        </div>
        </div>
      </section>

      {/* ===== WHAT IS TOOLTIVE ===== */}
      <section className="ab-section" id="ab-what">
        <div className="ab-wrap">
          {/* Centered Heading */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '3rem' }}>
            <p className="ab-kicker ab-reveal">WHAT IS TOOLTIVE</p>
            <h2 className="ab-sec-title ab-reveal" style={{ '--d': '.1s', margin: '0 auto' } as React.CSSProperties}>A growing platform of free online tools.</h2>
          </div>

          {/* Side-by-side Grid */}
          <div className="ab-def-grid">
            <div>
              <p className="ab-reveal" style={{ '--d': '.2s' } as React.CSSProperties}>ToolTive is a growing free online tools platform designed to make everyday digital tasks simpler.</p>
              <p className="ab-reveal" style={{ '--d': '.3s', marginTop: '1rem' } as React.CSSProperties}>Whether you need to <b>create an invoice</b>, <b>reduce an image file size</b>, or <b>convert an image into a PDF</b>, ToolTive provides straightforward browser-based utilities built around one principle.</p>
              <p className="ab-reveal" style={{ '--d': '.4s', marginTop: '1rem' } as React.CSSProperties}>Our tools are easy to understand and accessible — <b>without requiring you to create an account</b> for the current toolset.</p>
              <span className="ab-no-account ab-reveal" style={{ '--d': '.5s', marginTop: '1.4rem' } as React.CSSProperties}>⚿ No account. No setup. Just open &amp; go.</span>
            </div>
            <div className="ab-quote-card ab-reveal" style={{ '--d': '.25s' } as React.CSSProperties}>
              <p className="q">&ldquo;Get things done <mark>without the extra hassle.</mark>&rdquo;</p>
              <p className="src">— THE IDEA BEHIND EVERY TOOLTIVE TOOL</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TOOLS ===== */}
      <section className="ab-section ab-tools-sec" id="ab-tools">
        <span className="ab-cross" style={{ top: '2rem', left: '2rem' }} aria-hidden="true">+</span>
        <span className="ab-cross" style={{ top: '2rem', right: '2rem' }} aria-hidden="true">+</span>
        <div className="ab-wrap">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '3rem' }}>
            <p className="ab-kicker ab-reveal">THE TOOLBENCH</p>
            <h2 className="ab-sec-title ab-reveal" style={{ '--d': '.1s', maxWidth: '100%', margin: '0 auto' } as React.CSSProperties}>Tools built for real-world tasks.</h2>
            <p className="ab-reveal" style={{ '--d': '.2s', maxWidth: '40ch', marginTop: '1.2rem' } as React.CSSProperties}>ToolTive currently offers a focused collection of practical utilities — each one designed to finish a job, not to keep you browsing.</p>
          </div>

          <div style={{ marginTop: '2.5rem' }}>
            <ul className="tools-grid">
              <ToolCard
                title="Free Invoice Generator"
                description="Create professional invoices directly in your browser — without complicated software or unnecessary setup. Fill, preview, and done."
                icon={`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`}
                tags={['Business', 'Document', 'No Setup']}
                category="business"
                href="/all-tools/business/free-invoice-generator"
              />
              <ToolCard
                title="Free Image Compressor"
                description="Reduce image file sizes while maintaining useful image quality — making files easier to share, upload, and manage."
                icon={`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>`}
                tags={['Image', 'Optimization', 'Client-side']}
                category="editing"
                href="/all-tools/compress/free-image-compressor"
              />
              <ToolCard
                title="Free Image to PDF Converter"
                description="Convert images into PDF documents directly from your browser through a simple, focused workflow."
                icon={`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><circle cx="10" cy="13" r="2"></circle><path d="m20 17-1.09-1.09a2 2 0 0 0-2.82 0L10 22"></path></svg>`}
                tags={['Converter', 'PDF', 'Browser-based']}
                category="pdf"
                href="/all-tools/pdf/free-online-image-to-pdf-converter"
              />
            </ul>
          </div>

          <p className="ab-growth-note ab-reveal">As ToolTive grows, we plan to expand our collection of free online tools and practical utilities, helping users handle more everyday digital tasks directly from their browser.</p>
        </div>
      </section>

      {/* ===== WHY ===== */}
      <section className="ab-section" id="ab-why">
        <div className="ab-wrap">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '3rem' }}>
            <p className="ab-kicker ab-reveal">WHY WE BUILT TOOLTIVE</p>
            <h2 className="ab-sec-title ab-reveal" style={{ '--d': '.1s', margin: '0 auto', maxWidth: '100%' } as React.CSSProperties}>Making Everyday Digital Tasks <span style={{ color: 'var(--ab-accent)' }}>Easier, Faster, and More Accessible</span></h2>
          </div>
          <div className="ab-why-grid">
            <div className="ab-ledger bad ab-reveal" ref={badRef} style={{ '--d': '.15s' } as React.CSSProperties}>
              <div className="ab-ledger-h"><span>The usual way</span><span style={{ color: 'var(--ab-orange)' }}>✕</span></div>
              <ul>
                {['Required sign-ups', 'Complicated interfaces', 'Unclear pricing', 'Unnecessary steps', 'Distracting experiences', 'Tools built around upselling, not the task'].map((t, i) => (
                  <li key={i} style={{ '--d': `${(i + 1) * 0.1}s` } as React.CSSProperties}><span className="ab-xmark">✕</span><span>{t}</span></li>
                ))}
              </ul>
            </div>
            <div className="ab-ledger good ab-reveal" style={{ '--d': '.3s' } as React.CSSProperties}>
              <div className="ab-ledger-h"><span>The ToolTive way</span><span>✓</span></div>
              <ol className="ab-steps">
                <li>Open a tool</li>
                <li>Complete your task</li>
                <li>Move on with your day</li>
              </ol>
              <ul>
                <li><span className="ab-cmark">✓</span>No unnecessary account creation</li>
                <li><span className="ab-cmark">✓</span>No complicated workflow</li>
                <li><span className="ab-cmark">✓</span>Just practical tools that get the job done</li>
              </ul>
            </div>
          </div>
          <p className="ab-why-verdict ab-reveal">We built a cleaner environment — <mark>open, finish, leave.</mark></p>
        </div>
      </section>

      {/* ===== PRIVACY ===== */}
      <section className="ab-section ab-priv-sec" id="ab-privacy">
        <div className="ab-wrap">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '3rem' }}>
            <p className="ab-kicker ab-reveal">PRIVACY</p>
            <h2 className="ab-sec-title ab-reveal" style={{ '--d': '.05s', margin: '0 auto', maxWidth: '800px' } as React.CSSProperties}>Your files <span style={{ color: 'var(--ab-accent)' }}>stay on your device.</span></h2>
            <p className="ab-reveal" style={{ '--d': '.15s', maxWidth: '58ch', marginTop: '1.2rem' } as React.CSSProperties}>For client-side tools, your selected files are processed locally in your browser and are not uploaded to ToolTive&apos;s servers for processing.</p>
          </div>
          <div className="ab-priv-grid">
            <div>
              <ul className="ab-priv-list">
                {[
                  'Supported client-side tools do not require your files to be uploaded to our servers for processing.',
                  'For these tools, processing takes place directly within your browser.',
                  'We do not maintain a server-side database of processed user files.',
                  'You can use supported tools without creating an account.',
                ].map((t, i) => (
                  <li key={i} className="ab-reveal" style={{ '--d': `${(i + 2) * 0.1}s` } as React.CSSProperties}>
                    <span className="ic">{String(i + 1).padStart(2, '0')}</span>{t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="ab-reveal" style={{ '--d': '.25s' } as React.CSSProperties}>
              <div className="ab-diagram">
                <p className="ab-diag-title"><span>FILE JOURNEY — CLIENT-SIDE PROCESSING</span><span className="ab-blink" style={{ display: 'inline-block' }} /></p>
                <div className="ab-diag-row">
                  <div className="ab-node"><div className="box">🗎</div><p className="lbl">YOUR FILE</p></div>
                  <div className="ab-pipe"><span className="pkt" /></div>
                  <div className="ab-node browser"><div className="box">🔒</div><p className="lbl">YOUR BROWSER</p></div>
                  <div className="ab-pipe dead" />
                  <div className="ab-node blocked"><div className="box">🖧</div><p className="lbl">TOOLTIVE SERVERS</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRINCIPLES ===== */}
      <section className="ab-section" id="ab-principles">
        <div className="ab-wrap">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '3rem' }}>
            <p className="ab-kicker">CORE PRINCIPLES</p>
            <h2 className="ab-sec-title ab-reveal" style={{ maxWidth: '100%', margin: '0 auto', whiteSpace: 'nowrap' }}><span style={{ color: 'var(--ab-accent)' }}>Four core principles</span> that guide ToolTive.</h2>
            <p className="ab-reveal" style={{ '--d': '.15s', maxWidth: '58ch', marginTop: '1.2rem' } as React.CSSProperties}>ToolTive focuses on four core principles that shape how we build our tools, design our interfaces, and improve the experience for our users.</p>
          </div>
          <div className="ab-prin-list">
            {[
              { num: '01', icon: '⚡', title: 'Speed', desc: 'Digital tools should help users finish tasks efficiently — not add unnecessary steps to the process.' },
              { num: '02', icon: '🔒', title: 'Privacy', desc: "Where technically possible, ToolTive's browser-based tools are designed to process files locally on your device." },
              { num: '03', icon: '◧', title: 'Simplicity', desc: 'Tools should be understandable from the moment you open them — without complicated workflows.' },
              { num: '04', icon: '✦', title: 'Premium User Experience', desc: 'Free should not mean poorly designed. ToolTive aims to provide a clean, modern, and thoughtful interface across the platform.' },
            ].map((p, i) => (
              <article key={p.num} className="ab-prin-item ab-reveal" style={{ '--d': `${i * 0.1}s` } as React.CSSProperties}>
                <div className="num">{p.num}</div>
                <div>
                  <h3><span className="ic">{p.icon}</span>{p.title}</h3>
                  <p>{p.desc}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== USERS / POSTCARDS ===== */}
      <section className="ab-section ab-users-sec">
        <div className="ab-wrap">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '3rem' }}>
            <p className="ab-kicker ab-reveal">WHO IT&apos;S FOR</p>
            <h2 className="ab-sec-title ab-reveal" style={{ '--d': '.1s', maxWidth: '100%', margin: '0 auto', whiteSpace: 'nowrap' } as React.CSSProperties}>Built for people who need useful <span style={{ color: 'var(--ab-accent)' }}>digital tools</span>.</h2>
            <p className="ab-reveal" style={{ '--d': '.2s', maxWidth: '60ch', marginTop: '1.2rem' } as React.CSSProperties}>ToolTive is designed for people who want simple, practical online tools to get everyday digital tasks done without unnecessary complexity.</p>
          </div>
          <div className="ab-postcards">
            {[
              { title: 'Freelancers', tag: 'CLIENT WORK + DOCUMENTS', img: 'tooltive-freelancer', r: '0deg', desc: 'Create, convert, organize, and prepare files more efficiently while working with clients and managing everyday digital tasks.' },
              { title: 'Designers & Creators', tag: 'DESIGN + MEDIA', img: 'tooltive-designer', r: '0deg', desc: 'Handle common image, file, and content-related tasks with practical browser-based tools built for everyday creative workflows.' },
              { title: 'Students', tag: 'STUDY + PROJECTS', img: 'tooltive-student', r: '0deg', desc: 'Complete common file and document tasks for assignments, projects, research, and everyday study needs without complicated software.' },
            ].map((c, i) => (
              <figure key={c.title} className="ab-pc ab-reveal" style={{ '--r': c.r, '--d': `${i * 0.1}s`, display: 'flex', flexDirection: 'column' } as React.CSSProperties}>
                <div className="ph"><img src={`https://picsum.photos/seed/${c.img}/440/340`} alt={`${c.title} workspace`} loading="lazy" /></div>
                <figcaption className="cap"><b>{c.title}</b><span>{c.tag}</span></figcaption>
                <p style={{ padding: '0 0.5rem', marginTop: '0.8rem', fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{c.desc}</p>
              </figure>
            ))}
          </div>
          <p className="ab-users-line ab-reveal">Useful tools for getting <mark>everyday digital work done.</mark></p>
        </div>
      </section>

      {/* ===== VISION + DECK ===== */}
      <section className="ab-section" id="ab-vision">
        <div className="ab-wrap">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '3rem' }}>
            <p className="ab-kicker ab-reveal">OUR VISION</p>
            <h2 className="ab-sec-title ab-reveal" style={{ '--d': '.1s', maxWidth: '100%', margin: '0 auto' } as React.CSSProperties}>What&apos;s next for ToolTive?</h2>
            <p className="ab-reveal" style={{ '--d': '.2s', maxWidth: '50ch', marginTop: '1.2rem', color: 'var(--text-secondary)' } as React.CSSProperties}>ToolTive is growing into a broader collection of practical online tools designed to help people handle everyday digital tasks from their browser. We&apos;re continuing to improve existing tools while developing new utilities based on common user needs.</p>
          </div>
          <div className="ab-deck-wrap">
            <div className="ab-meter-card">
              <h4 style={{ fontFamily: 'var(--ab-mono)', fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#ffffff', marginBottom: '1.4rem' }}>PLATFORM PROGRESS</h4>
              <div className="ab-meter live">
                <div className="m-top"><span>Available tools</span><b style={{ color: 'var(--ab-accent)' }}>3</b></div>
              </div>
              <div className="ab-meter plan">
                <div className="m-top"><span>In development</span><b style={{ color: 'var(--ab-accent)' }}>5+</b></div>
              </div>
              <p className="m-note">Our collection is continuously evolving, with new tools and improvements planned across file conversion, image processing, document workflows, productivity, and other everyday digital tasks.</p>
            </div>
            <div className="ab-deck">
              {[
                { title: 'More File & Image Utilities', tags: ['FILES', 'IMAGES'], desc: 'We plan to expand ToolTive with more practical utilities for working with common files, images, and digital content directly from the browser.' },
                { title: 'Faster Everyday Workflows', tags: ['PRODUCTIVITY', 'EFFICIENCY'], desc: 'Future tools will focus on reducing unnecessary steps in common digital tasks and making routine file and document workflows easier to complete.' },
                { title: 'More Tools for Work & Productivity', tags: ['BUSINESS', 'PRODUCTIVITY'], desc: 'As the platform grows, we plan to add more useful tools for freelancers, creators, students, businesses, and anyone who needs practical digital utilities.' },
              ].map((d, i) => (
                <div key={d.title} className="ab-deck-card" style={{ '--i': i } as React.CSSProperties}>
                  <h3>{d.title}</h3>
                  <div className="ab-dc-chips">{d.tags.map(t => <span key={t} className="ab-tag" style={{ color: 'var(--ab-accent)', borderColor: 'rgba(235, 179, 75, 0.3)' }}>{t}</span>)}</div>
                  <p style={{ marginTop: '0.8rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{d.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="ab-users-line ab-reveal" style={{ marginTop: '3rem' }}>More useful tools. <mark>Simpler digital workflows.</mark></p>
        </div>
      </section>

      {/* ===== FREE + TECH ===== */}
      <section className="ab-section" id="ab-free">
        <div className="ab-wrap">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '3rem' }}>
            <p className="ab-kicker ab-reveal">FREE + SIMPLE</p>
            <h2 className="ab-sec-title ab-reveal" style={{ '--d': '.1s', maxWidth: '100%', margin: '0 auto' } as React.CSSProperties}>Free tools. Simple workflows. Built for everyone.</h2>
            <p className="ab-reveal" style={{ '--d': '.2s', maxWidth: '60ch', marginTop: '1.2rem', color: 'var(--text-secondary)' } as React.CSSProperties}>ToolTive brings practical online tools together in one simple place, helping you handle everyday digital tasks without downloading complicated software or navigating unnecessary workflows.</p>
          </div>
          <div className="ab-ft-grid">
            <div className="ab-ft-card ab-reveal" style={{ '--d': '.15s' } as React.CSSProperties}>
              <h3>Free to use</h3>
              <p>ToolTive currently provides its supported tools free of charge, making useful digital utilities accessible for everyday tasks, work, study, and personal projects.</p>
              <span className="ab-ad-chip">💡 CURRENTLY FREE — NO SUBSCRIPTION REQUIRED</span>
            </div>
            <div className="ab-ft-card dark ab-reveal" style={{ '--d': '.25s' } as React.CSSProperties}>
              <h3>Built around real tasks</h3>
              <p>From working with files and images to handling everyday document and productivity needs, ToolTive focuses on tools that solve practical problems quickly and clearly.</p>
              <ul className="ab-tech-list">
                <li><span className="tick">✓</span> Practical everyday utilities</li>
                <li><span className="tick">✓</span> Simple browser-based workflows</li>
                <li><span className="tick">✓</span> Designed for different types of users</li>
                <li><span className="tick">✓</span> Continuously growing tool collection</li>
              </ul>
            </div>
          </div>
          <p className="ab-ft-footer ab-reveal" style={{ textTransform: 'uppercase', color: 'var(--ab-accent)' }}>SIMPLE TOOLS. USEFUL RESULTS. LESS FRICTION.</p>
        </div>
      </section>

      {/* ===== CLOSING CTA ===== */}
      <div className="ab-wrap">
        <section className="ab-section ab-close-sec" style={{ borderRadius: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <p className="ab-kicker ab-reveal">READY TO GET STARTED?</p>
            <h2 className="ab-reveal" style={{ '--d': '.1s', maxWidth: '100%', margin: '0 auto' } as React.CSSProperties}>Simple tools. Real results.<br />No unnecessary complexity.</h2>
            <p className="ab-reveal" style={{ '--d': '.2s', maxWidth: '65ch', margin: '1.2rem auto 3rem auto' } as React.CSSProperties}>Whether you need to create an invoice, compress an image, convert a file, or handle another everyday digital task, ToolTive brings practical online tools together in one place.</p>
            <div className="ab-close-cta ab-reveal" style={{ '--d': '.3s' } as React.CSSProperties}>
              <Link href="/all-tools" className="ab-btn ab-btn-accent">EXPLORE TOOLS <span className="arr">→</span></Link>
              <Link href="/contact" className="ab-btn ab-btn-ghost">CONTACT US <span className="arr">→</span></Link>
            </div>
            <p className="ab-welcome ab-reveal" style={{ '--d': '.4s', textTransform: 'uppercase', marginTop: '3rem' } as React.CSSProperties}>USEFUL TOOLS. SIMPLE WORKFLOWS.</p>
          <div className="ab-wireframe-container" aria-hidden="true" style={{ marginTop: '6rem', marginBottom: '6rem', width: '100%', display: 'flex', justifyContent: 'center', userSelect: 'none' }}>
            <style dangerouslySetInnerHTML={{ __html: `
              .ab-wireframe-svg {
                width: 100%;
                height: 0.85em;
                overflow: visible;
              }
              .ab-wireframe-text {
                font-family: var(--ab-disp);
                font-weight: 800;
                font-size: clamp(4rem, 14vw, 12rem);
                letter-spacing: -.02em;
              }
              .ab-wt-base {
                fill: transparent;
                stroke: #0a0908;
                stroke-width: 2px;
                opacity: 0.16;
              }
              .ab-wt-trace {
                fill: transparent;
                stroke: rgba(255, 255, 255, 0.2);
                stroke-width: 1px;
                stroke-dasharray: 20 140;
                animation: wt-dash-1 12s linear infinite;
                transform: translate(1px, 1px);
              }
              .ab-wt-trace-2 {
                fill: transparent;
                stroke: rgba(255, 220, 100, 0.35);
                stroke-width: 1.5px;
                stroke-dasharray: 5 195;
                animation: wt-dash-2 18s linear infinite;
                transform: translate(-1px, -1px);
                filter: drop-shadow(0 0 3px rgba(255, 200, 50, 0.3));
              }
              .ab-wt-node {
                fill: transparent;
                stroke: rgba(255, 255, 255, 0.85);
                stroke-width: 2.5px;
                stroke-dasharray: 1 299;
                stroke-linecap: round;
                animation: wt-dash-1 8s linear infinite;
                filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.6));
              }
              .ab-wt-pulse {
                fill: transparent;
                stroke: rgba(255, 210, 100, 0.5);
                stroke-width: 3px;
                stroke-dasharray: 40 360;
                animation: wt-dash-2 14s ease-in-out infinite;
                filter: drop-shadow(0 0 6px rgba(255, 200, 50, 0.5));
              }
              @keyframes wt-dash-1 { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -1600; } }
              @keyframes wt-dash-2 { from { stroke-dashoffset: 0; } to { stroke-dashoffset: 2000; } }
              
              @media (prefers-reduced-motion: reduce) {
                .ab-wt-trace, .ab-wt-trace-2, .ab-wt-node, .ab-wt-pulse {
                  animation: none !important;
                  stroke-dasharray: none !important;
                  opacity: 0.2;
                }
              }
            `}} />
            <svg className="ab-wireframe-svg">
              <g className="ab-wireframe-text">
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="ab-wt-base">TOOLTIVE</text>
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="ab-wt-trace">TOOLTIVE</text>
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="ab-wt-trace-2">TOOLTIVE</text>
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="ab-wt-node">TOOLTIVE</text>
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="ab-wt-pulse">TOOLTIVE</text>
              </g>
            </svg>
          </div>
          </div>
        </section>
      </div>

      {/* ===== FAQ ===== */}
      <FaqSection 
        faqs={faqData} 
        label="FAQ" 
        title="Frequently asked questions." 
        description={null} 
        showCta={false} 
      />

    </div>
  );
}
