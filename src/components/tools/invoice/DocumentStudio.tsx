"use client";

import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import '@/styles/document-studio.css';

type DocType = 'invoice' | 'quote' | 'credit';
type TemplateId = 'minimal' | 'bold' | 'gradient' | 'classic' | 'stub';

interface LineItem {
    id: string;
    desc: string;
    qty: number;
    rate: number;
    tax: number;
}

export default function DocumentStudio() {
    const [docType, setDocType] = useState<DocType>('invoice');
    const [template, setTemplate] = useState<TemplateId>('minimal');
    const [accent, setAccent] = useState('#E8A33D');
    const [currency, setCurrency] = useState('USD');

    const [company, setCompany] = useState({ name: '', address: '', email: '', phone: '', logo: null as string | null });
    const [client, setClient] = useState({ name: '', address: '', email: '' });

    const [meta, setMeta] = useState({
        number: '',
        issueDate: '',
        date2: '',
        poNumber: '',
        status: 'Unpaid',
        quoteRef: '',
        refInvoice: '',
        creditReason: ''
    });

    const [items, setItems] = useState<LineItem[]>([]);
    const [discount, setDiscount] = useState({ type: 'none', value: 0 });
    const [shipping, setShipping] = useState({ type: 'none', value: 0 });
    const [notes, setNotes] = useState('');
    const [paymentInstructions, setPaymentInstructions] = useState('');
    const [signature, setSignature] = useState('');

    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const today = new Date().toISOString().slice(0, 10);
        const d2 = new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10);
        setMeta(prev => ({ ...prev, issueDate: today, date2: d2, number: `INV-${new Date().getFullYear()}-0001` }));
        setItems([{ id: uid(), desc: '', qty: 1, rate: 0, tax: 0 }]);
    }, []);

    const uid = () => 'i' + Math.random().toString(36).slice(2, 9);

    const fmt = (n: number) => {
        const v = isNaN(n) ? 0 : n;
        try {
            return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(v);
        } catch (e) {
            return `${currency} ${v.toFixed(2)}`;
        }
    };

    const lineAmount = (item: LineItem) => (item.qty || 0) * (item.rate || 0);

    const computeTotals = () => {
        let subtotal = 0, taxTotal = 0;
        items.forEach(it => {
            const amt = lineAmount(it);
            subtotal += amt;
            taxTotal += amt * ((it.tax || 0) / 100);
        });
        let discountAmt = 0;
        if (discount.type === 'percent') discountAmt = subtotal * ((discount.value || 0) / 100);
        else if (discount.type === 'flat') discountAmt = discount.value || 0;

        const shippingAmt = shipping.type === 'flat' ? (shipping.value || 0) : 0;
        const total = subtotal + taxTotal - discountAmt + shippingAmt;
        return { subtotal, taxTotal, discountAmt, shippingAmt, total };
    };

    const t = computeTotals();

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setCompany({ ...company, logo: reader.result as string });
        reader.readAsDataURL(file);
    };

    const loadSample = () => {
        setCompany({ name: 'Tooltive Studio', address: '12 Ember Lane\nLahore, Punjab, Pakistan', email: 'hello@tooltivestudio.com', phone: '+92 300 1234567', logo: null });
        setClient({ name: 'Northwind Retail Co.', address: '45 Vertex Ave\nKarachi, Pakistan', email: 'accounts@northwindretail.com' });
        setNotes('Thank you for your business! Please reach out with any questions.');
        setPaymentInstructions('Bank: Meezan Bank\nAccount Title: Tooltive Studio\nAccount No: 0123-4567890\nIBAN: PK00MEZN0000000123456789');
        setSignature('Ayesha Karim');
        setItems([
            { id: uid(), desc: 'Website redesign', qty: 1, rate: 450, tax: 0 },
            { id: uid(), desc: 'Logo & brand kit', qty: 1, rate: 180, tax: 0 },
            { id: uid(), desc: 'Monthly hosting (3 months)', qty: 3, rate: 15, tax: 5 }
        ]);
        setDiscount({ type: 'percent', value: 5 });
    };

    const downloadPDF = async () => {
        const node = document.getElementById('previewDoc');
        if (!node) return;
        setIsGenerating(true);
        try {
            const canvas = await html2canvas(node, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = 210, pageHeight = 297;
            const imgWidth = pageWidth;
            const imgHeight = canvas.height * imgWidth / canvas.width;
            let heightLeft = imgHeight, position = 0;
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }
            pdf.save(`${meta.number || docType}.pdf`);
        } catch (err) {
            alert('Could not generate PDF — try Print instead.');
        } finally {
            setIsGenerating(false);
        }
    };

    const docTitles = { invoice: 'INVOICE', quote: 'QUOTE', credit: 'CREDIT NOTE' };
    const totalLabels = { invoice: 'Amount Due', quote: 'Estimated Total', credit: 'Total Credit' };
    const statusColors: Record<string, [string, string]> = { Draft: ['#f1f5f9', '#64748b'], Unpaid: ['#fef3c7', '#b45309'], Paid: ['#dcfce7', '#15803d'], Overdue: ['#fee2e2', '#b91c1c'] };

    const dateLabelMap = { invoice: 'Due Date', quote: 'Valid Until', credit: 'Issue Date' };
    const numberLabelMap = { invoice: 'Invoice #', quote: 'Quote #', credit: 'Credit Note #' };
    const notesLabelMap = { invoice: 'Notes / Terms', quote: 'Terms & Conditions', credit: 'Notes' };

    return (
        <div className="doc-studio-wrapper">
            <div className="workspace">
                {/* CONTROL PANEL */}
                <aside className="panel">

                    <div className="pgroup">
                        <h3>Document Type</h3>
                        <div className="doctabs">
                            <button className={docType === 'invoice' ? 'is-active' : ''} onClick={() => setDocType('invoice')}>Invoice</button>
                            <button className={docType === 'quote' ? 'is-active' : ''} onClick={() => setDocType('quote')}>Quote</button>
                            <button className={docType === 'credit' ? 'is-active' : ''} onClick={() => setDocType('credit')}>Credit Note</button>
                        </div>
                    </div>

                    <div className="pgroup">
                        <h3>Choose a Template</h3>
                        <div className="tpl-grid">
                            {(['minimal', 'bold', 'gradient', 'classic', 'stub'] as TemplateId[]).map(tpl => (
                                <div key={tpl} className={`tpl-card ${template === tpl ? 'is-active' : ''}`} onClick={() => setTemplate(tpl)}>
                                    <div className={`tpl-thumb thumb-${tpl}`}>
                                        {tpl === 'minimal' && <><i className="l1 accent"></i><i className="l2"></i><i className="l3"></i><i className="l4"></i></>}
                                        {tpl === 'bold' && <><i className="band accent"></i><i className="l4"></i></>}
                                        {tpl === 'gradient' && <><i className="blob accent"></i><i className="l4"></i></>}
                                        {tpl === 'classic' && <><i className="l1"></i><i className="l3"></i><i className="l3b"></i></>}
                                        {tpl === 'stub' && <><i className="side accent"></i><i className="l4"></i></>}
                                    </div>
                                    <span style={{ textTransform: 'capitalize' }}>{tpl}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pgroup">
                        <h3>Accent Colour</h3>
                        <div className="color-row">
                            {['#E8A33D', '#2563EB', '#059669', '#D6336C', '#475569'].map(c => (
                                <div key={c} className={`swatch ${accent === c ? 'is-active' : ''}`} style={{ background: c }} onClick={() => setAccent(c)}></div>
                            ))}
                            <input type="color" value={accent} onChange={e => setAccent(e.target.value)} title="Custom colour" />
                        </div>
                    </div>

                    <div className="pgroup">
                        <h3>Your Business</h3>
                        <div className="field"><label>Logo</label><input type="file" accept="image/*" onChange={handleLogoUpload} /></div>
                        <div className="field"><label>Business Name</label><input type="text" value={company.name} onChange={e => setCompany({ ...company, name: e.target.value })} placeholder="Tooltive Studio" /></div>
                        <div className="field"><label>Address</label><textarea value={company.address} onChange={e => setCompany({ ...company, address: e.target.value })} placeholder="12 Ember Lane, Lahore, Pakistan"></textarea></div>
                        <div className="row2">
                            <div className="field"><label>Email</label><input type="email" value={company.email} onChange={e => setCompany({ ...company, email: e.target.value })} placeholder="hello@yourbusiness.com" /></div>
                            <div className="field"><label>Phone</label><input type="text" value={company.phone} onChange={e => setCompany({ ...company, phone: e.target.value })} placeholder="+92 300 1234567" /></div>
                        </div>
                    </div>

                    <div className="pgroup">
                        <h3>Bill To</h3>
                        <div className="field"><label>Client Name</label><input type="text" value={client.name} onChange={e => setClient({ ...client, name: e.target.value })} placeholder="Northwind Retail Co." /></div>
                        <div className="field"><label>Client Address</label><textarea value={client.address} onChange={e => setClient({ ...client, address: e.target.value })} placeholder="45 Vertex Ave, Karachi, Pakistan"></textarea></div>
                        <div className="field"><label>Client Email</label><input type="email" value={client.email} onChange={e => setClient({ ...client, email: e.target.value })} placeholder="accounts@client.com" /></div>
                    </div>

                    <div className="pgroup">
                        <h3>Document Details</h3>
                        <div className="field"><label>{numberLabelMap[docType]}</label><input type="text" value={meta.number} onChange={e => setMeta({ ...meta, number: e.target.value })} /></div>
                        <div className="row2">
                            <div className="field"><label>Issue Date</label><input type="date" value={meta.issueDate} onChange={e => setMeta({ ...meta, issueDate: e.target.value })} /></div>
                            <div className="field"><label>{dateLabelMap[docType]}</label><input type="date" value={meta.date2} onChange={e => setMeta({ ...meta, date2: e.target.value })} /></div>
                        </div>

                        {docType === 'invoice' && (
                            <div className="row2">
                                <div className="field"><label>PO Number (optional)</label><input type="text" value={meta.poNumber} onChange={e => setMeta({ ...meta, poNumber: e.target.value })} /></div>
                                <div className="field"><label>Status</label>
                                    <select value={meta.status} onChange={e => setMeta({ ...meta, status: e.target.value })}>
                                        <option value="Draft">Draft</option>
                                        <option value="Unpaid">Unpaid</option>
                                        <option value="Paid">Paid</option>
                                        <option value="Overdue">Overdue</option>
                                    </select>
                                </div>
                            </div>
                        )}
                        {docType === 'quote' && (
                            <div className="field"><label>Project / Reference (optional)</label><input type="text" value={meta.quoteRef} onChange={e => setMeta({ ...meta, quoteRef: e.target.value })} /></div>
                        )}
                        {docType === 'credit' && (
                            <>
                                <div className="field"><label>Original Invoice #</label><input type="text" value={meta.refInvoice} onChange={e => setMeta({ ...meta, refInvoice: e.target.value })} /></div>
                                <div className="field"><label>Reason for Credit</label><input type="text" value={meta.creditReason} onChange={e => setMeta({ ...meta, creditReason: e.target.value })} placeholder="Returned item / billing correction" /></div>
                            </>
                        )}
                    </div>

                    <div className="pgroup">
                        <h3>Line Items</h3>
                        <table className="items-table">
                            <thead><tr><th className="col-desc">Description</th><th className="col-qty">Qty</th><th className="col-rate">Rate</th><th className="col-tax">Tax %</th><th></th><th></th></tr></thead>
                            <tbody>
                                {items.map((it, idx) => (
                                    <tr key={it.id}>
                                        <td><input type="text" value={it.desc} onChange={e => { const newItems = [...items]; newItems[idx].desc = e.target.value; setItems(newItems); }} placeholder="Item description" /></td>
                                        <td><input type="number" min="0" step="1" value={it.qty} onChange={e => { const newItems = [...items]; newItems[idx].qty = parseFloat(e.target.value) || 0; setItems(newItems); }} /></td>
                                        <td><input type="number" min="0" step="0.01" value={it.rate} onChange={e => { const newItems = [...items]; newItems[idx].rate = parseFloat(e.target.value) || 0; setItems(newItems); }} /></td>
                                        <td><input type="number" min="0" step="0.1" value={it.tax} onChange={e => { const newItems = [...items]; newItems[idx].tax = parseFloat(e.target.value) || 0; setItems(newItems); }} /></td>
                                        <td className="amount-cell">{fmt(lineAmount(it))}</td>
                                        <td><button className="remove-item" onClick={() => setItems(items.filter(i => i.id !== it.id))} title="Remove">&#10005;</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button className="btn btn--ghost btn--sm" onClick={() => setItems([...items, { id: uid(), desc: '', qty: 1, rate: 0, tax: 0 }])}>+ Add line item</button>
                    </div>

                    <div className="pgroup">
                        <h3>Currency & Adjustments</h3>
                        <div className="field"><label>Currency</label>
                            <select value={currency} onChange={e => setCurrency(e.target.value)}>
                                <option value="USD">USD — US Dollar</option>
                                <option value="EUR">EUR — Euro</option>
                                <option value="GBP">GBP — British Pound</option>
                                <option value="PKR">PKR — Pakistani Rupee</option>
                                <option value="INR">INR — Indian Rupee</option>
                                <option value="AED">AED — UAE Dirham</option>
                                <option value="SAR">SAR — Saudi Riyal</option>
                                <option value="CAD">CAD — Canadian Dollar</option>
                                <option value="AUD">AUD — Australian Dollar</option>
                            </select>
                        </div>
                        <div className="row2">
                            <div className="field"><label>Discount</label>
                                <select value={discount.type} onChange={e => setDiscount({ ...discount, type: e.target.value })}>
                                    <option value="none">None</option>
                                    <option value="percent">Percentage (%)</option>
                                    <option value="flat">Flat amount</option>
                                </select>
                            </div>
                            <div className="field"><label>&nbsp;</label><input type="number" min="0" step="0.01" value={discount.value} onChange={e => setDiscount({ ...discount, value: parseFloat(e.target.value) || 0 })} /></div>
                        </div>
                        <div className="row2">
                            <div className="field"><label>Shipping</label>
                                <select value={shipping.type} onChange={e => setShipping({ ...shipping, type: e.target.value })}>
                                    <option value="none">None</option>
                                    <option value="flat">Flat amount</option>
                                </select>
                            </div>
                            <div className="field"><label>&nbsp;</label><input type="number" min="0" step="0.01" value={shipping.value} onChange={e => setShipping({ ...shipping, value: parseFloat(e.target.value) || 0 })} /></div>
                        </div>
                    </div>

                    <div className="pgroup">
                        <h3>Notes & Signature</h3>
                        <div className="field"><label>{notesLabelMap[docType]}</label><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Thank you for your business!"></textarea></div>
                        {docType === 'invoice' && (
                            <div className="field"><label>Payment Instructions</label><textarea value={paymentInstructions} onChange={e => setPaymentInstructions(e.target.value)} placeholder="Bank name, account title, account number, IBAN..."></textarea></div>
                        )}
                        <div className="field"><label>Authorized Signature (optional)</label><input type="text" value={signature} onChange={e => setSignature(e.target.value)} placeholder="Your name" /></div>
                    </div>

                    <div className="pgroup">
                        <div className="actions-grid">
                            <button className="btn btn--outline btn--sm" onClick={loadSample}>Load Sample</button>
                            <button className="btn btn--outline btn--sm" onClick={() => window.location.reload()}>Reset Form</button>
                        </div>
                        <div className="actions-grid">
                            <button className="btn btn--ghost" onClick={() => window.print()}>Print</button>
                            <button className="btn btn--primary" onClick={downloadPDF} disabled={isGenerating}>{isGenerating ? 'Generating...' : 'Download PDF'}</button>
                        </div>
                    </div>

                </aside>

                {/* PREVIEW PANE */}
                <section className="preview-pane">
                    <div className="preview-toolbar">
                        <span className="preview-toolbar__label">Live Preview</span>
                        <div className="preview-toolbar__actions">
                            <button className="btn btn--ghost btn--sm" onClick={() => window.print()}>Print</button>
                            <button className="btn btn--primary btn--sm" onClick={downloadPDF} disabled={isGenerating}>{isGenerating ? 'Generating...' : 'Download PDF'}</button>
                        </div>
                    </div>
                    <div className="preview-scroll">
                        <div id="previewDoc" className={`doc-page doc--${template}`} data-doctype={docType} style={{ '--doc-accent': accent } as React.CSSProperties}>

                            <div className="doc__body">
                                <div className="doc__brand">
                                    {company.logo && <img className="doc-logo" src={company.logo} alt="Logo" />}
                                    <div className="doc-company-name">{company.name || 'Your Business Name'}</div>
                                    <div className="doc-muted" style={{ whiteSpace: 'pre-line' }}>
                                        {company.address}{company.email ? `\n${company.email}` : ''}{company.phone ? `\n${company.phone}` : ''}
                                    </div>
                                </div>

                                <div className="doc__title">
                                    <div className="doc-heading">{docTitles[docType]}</div>
                                    <div className="doc-meta-line"><b>#</b> {meta.number}</div>
                                    <div className="doc-meta-line">Issued: {meta.issueDate}</div>
                                    {docType === 'invoice' && (
                                        <>
                                            <div className="doc-meta-line">Due: {meta.date2}</div>
                                            {meta.poNumber && <div className="doc-meta-line">PO#: {meta.poNumber}</div>}
                                            <div className="doc-badge" style={{ background: (statusColors[meta.status] || statusColors.Unpaid)[0], color: (statusColors[meta.status] || statusColors.Unpaid)[1] }}>{meta.status}</div>
                                        </>
                                    )}
                                    {docType === 'quote' && (
                                        <>
                                            <div className="doc-meta-line">Valid Until: {meta.date2}</div>
                                            {meta.quoteRef && <div className="doc-meta-line">Ref: {meta.quoteRef}</div>}
                                        </>
                                    )}
                                    {docType === 'credit' && (
                                        <>
                                            <div className="doc-meta-line">Original Invoice: {meta.refInvoice}</div>
                                            {meta.creditReason && <div className="doc-meta-line">Reason: {meta.creditReason}</div>}
                                        </>
                                    )}
                                </div>

                                <div className="doc__parties">
                                    <div>
                                        <div className="doc-party-label">Bill To</div>
                                        <div className="doc-party-name">{client.name || 'Client Name'}</div>
                                        <div className="doc-muted" style={{ whiteSpace: 'pre-line' }}>
                                            {client.address}{client.email ? `\n${client.email}` : ''}
                                        </div>
                                    </div>
                                </div>

                                <div className="doc__items">
                                    <table className="doc-table">
                                        <thead>
                                            <tr>
                                                <th>Description</th>
                                                <th className="num">Qty</th>
                                                <th className="num">Rate</th>
                                                <th className="num">Tax</th>
                                                <th className="num">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {items.map(it => (
                                                <tr key={it.id}>
                                                    <td>{it.desc || 'Item'}</td>
                                                    <td className="num">{it.qty || 0}</td>
                                                    <td className="num">{fmt(it.rate || 0)}</td>
                                                    <td className="num">{it.tax || 0}%</td>
                                                    <td className="num">{fmt(lineAmount(it))}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="doc__totals">
                                    <div className="doc-totals-box">
                                        <div className="row"><span>Subtotal</span><span>{fmt(t.subtotal)}</span></div>
                                        <div className="row"><span>Tax</span><span>{fmt(t.taxTotal)}</span></div>
                                        {t.discountAmt > 0 && <div className="row"><span>Discount</span><span>-{fmt(t.discountAmt)}</span></div>}
                                        {t.shippingAmt > 0 && <div className="row"><span>Shipping</span><span>{fmt(t.shippingAmt)}</span></div>}
                                        <div className="row grand"><span>{totalLabels[docType]}</span><span>{fmt(t.total)}</span></div>
                                    </div>
                                </div>

                                <div className="doc__notes">
                                    <div className="doc-note-block">
                                        <h4>{docType === 'quote' ? 'Terms' : 'Notes'}</h4>
                                        <p style={{ whiteSpace: 'pre-line' }}>{notes}</p>
                                        {signature && (
                                            <div className="doc-signature">
                                                <div className="sig-name">{signature}</div>
                                                <div className="sig-label">Authorized Signature</div>
                                            </div>
                                        )}
                                    </div>
                                    {docType === 'invoice' && paymentInstructions && (
                                        <div className="doc-note-block">
                                            <h4>Payment Instructions</h4>
                                            <p style={{ whiteSpace: 'pre-line' }}>{paymentInstructions}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}