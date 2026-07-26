'use client';
import { useInvoiceStore, calculateTotals, formatCurrency } from '@/lib/store';

export default function LivePreview() {
  const state = useInvoiceStore();
  const { templateId, colors, brandName, logoUrl, from, to, items, currency, locale, notes, invoiceNumber, date, dueDate } = state;
  const { subtotal, taxTotal, total } = calculateTotals(items);
  const fmt = (amt: number) => formatCurrency(amt, currency, locale);

  const baseStyle = { color: colors.text };

  return (
    <div className="panel-center">
      <div className="preview-document">
        
        {/* 1. MINIMAL TEMPLATE */}
        {templateId === 'minimal' && (
          <div className="preview-template" style={{ ...baseStyle, fontFamily: 'Arial, sans-serif' }}>
            <div className="preview-header">
              <div>
                {logoUrl && <img src={logoUrl} alt="Logo" className="preview-logo" />}
                <div className="preview-brand-name" style={{ color: colors.primary }}>{brandName}</div>
                <div className="preview-address">{from.address}</div>
              </div>
              <div>
                <div className="preview-title" style={{ color: colors.secondary, fontWeight: 300 }}>INVOICE</div>
                <div className="preview-meta">
                  {invoiceNumber}<br />
                  Date: {date}<br />
                  Due: {dueDate}
                </div>
              </div>
            </div>
            <div className="preview-bill-to">
              <div className="preview-bill-to-label">Bill To</div>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{to.name}</div>
              <div className="preview-address">{to.address}</div>
            </div>
            <table className="preview-table">
              <thead>
                <tr style={{ borderBottom: `1px solid ${colors.primary}` }}>
                  <th style={{ color: colors.primary }}>Description</th>
                  <th className="right" style={{ color: colors.primary }}>Qty</th>
                  <th className="right" style={{ color: colors.primary }}>Rate</th>
                  <th className="right" style={{ color: colors.primary }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id}>
                    <td>{item.description}</td>
                    <td className="right">{item.quantity}</td>
                    <td className="right">{fmt(item.rate)}</td>
                    <td className="right">{fmt(item.quantity * item.rate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="preview-totals">
              <div className="preview-totals-container">
                <div className="preview-totals-row"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                <div className="preview-totals-row"><span>Tax</span><span>{fmt(taxTotal)}</span></div>
                <div className="preview-totals-total" style={{ borderTop: `1px solid ${colors.primary}`, color: colors.secondary }}>
                  <span>TOTAL</span><span>{fmt(total)}</span>
                </div>
              </div>
            </div>
            <div className="preview-footer">{notes}</div>
          </div>
        )}

        {/* 2. NEO-BRUTAL TEMPLATE */}
        {templateId === 'neo-brutal' && (
          <div className="preview-template" style={{ background: colors.accent, padding: '32px' }}>
            <div style={{ border: `3px solid ${colors.primary}`, background: '#fff', height: '100%', padding: '32px', fontFamily: 'monospace' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `3px solid ${colors.primary}`, paddingBottom: '16px', marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 900, textTransform: 'uppercase', color: colors.primary }}>{brandName}</h1>
                <h2 style={{ fontSize: '24px', fontWeight: 900, textTransform: 'uppercase', color: colors.secondary }}>INVOICE</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px', fontSize: '12px' }}>
                <div style={{ borderRight: `2px solid ${colors.primary}`, paddingRight: '16px' }}>
                  <strong>FROM:</strong><br />{from.name}<br />{from.address}
                </div>
                <div>
                  <strong>TO:</strong><br />{to.name}<br />{to.address}
                </div>
              </div>
              <div style={{ marginBottom: '32px' }}>
                {items.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', border: `2px solid ${colors.primary}`, padding: '8px', marginBottom: '8px', fontSize: '12px' }}>
                    <div>
                      <strong>{item.description}</strong><br />
                      <span style={{ color: '#666' }}>{item.quantity} x {fmt(item.rate)}</span>
                    </div>
                    <strong style={{ fontSize: '14px' }}>{fmt(item.quantity * item.rate)}</strong>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ width: '50%', border: `3px solid ${colors.primary}`, padding: '16px', background: colors.accent }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}><strong>Subtotal:</strong> <span>{fmt(subtotal)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}><strong>Tax:</strong> <span>{fmt(taxTotal)}</span></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 900, borderTop: `2px solid ${colors.primary}`, paddingTop: '8px' }}>
                    <span>TOTAL:</span><span>{fmt(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. MODERN TEMPLATE */}
        {templateId === 'modern' && (
          <div className="preview-template" style={{ ...baseStyle, padding: 0, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '48px', background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`, color: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  {logoUrl && <img src={logoUrl} alt="Logo" className="preview-logo" style={{ filter: 'brightness(0) invert(1)' }} />}
                  <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>{brandName}</h1>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h2 style={{ fontSize: '36px', fontWeight: 300, letterSpacing: '5px' }}>INVOICE</h2>
                  <p style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px' }}>{invoiceNumber}</p>
                </div>
              </div>
            </div>
            <div style={{ padding: '32px 48px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', borderBottom: '1px solid #eee' }}>
              <div>
                <div className="preview-bill-to-label">From</div>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{from.name}</div>
                <div className="preview-address">{from.address}</div>
              </div>
              <div>
                <div className="preview-bill-to-label">Bill To</div>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{to.name}</div>
                <div className="preview-address">{to.address}</div>
              </div>
            </div>
            <div style={{ padding: '32px 48px', flex: 1 }}>
              <table className="preview-table" style={{ marginBottom: 0 }}>
                <thead>
                  <tr style={{ background: colors.accent }}>
                    <th style={{ padding: '12px', color: colors.primary, borderRadius: '8px 0 0 8px' }}>Description</th>
                    <th className="right" style={{ padding: '12px', color: colors.primary }}>Qty</th>
                    <th className="right" style={{ padding: '12px', color: colors.primary }}>Rate</th>
                    <th className="right" style={{ padding: '12px', color: colors.primary, borderRadius: '0 8px 8px 0' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                      <td style={{ padding: '12px 0' }}>{item.description}</td>
                      <td className="right" style={{ padding: '12px 0' }}>{item.quantity}</td>
                      <td className="right" style={{ padding: '12px 0' }}>{fmt(item.rate)}</td>
                      <td className="right" style={{ padding: '12px 0', fontWeight: 'bold' }}>{fmt(item.quantity * item.rate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '24px 48px', background: colors.accent, display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: '33%' }}>
                <div className="preview-totals-row"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                <div className="preview-totals-row"><span>Tax</span><span>{fmt(taxTotal)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', marginTop: '8px', fontWeight: 'bold', fontSize: '18px', color: colors.primary }}>
                  <span>TOTAL</span><span>{fmt(total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. CORPORATE TEMPLATE */}
        {templateId === 'corporate' && (
          <div className="preview-template" style={{ ...baseStyle, fontFamily: 'Times New Roman, serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `4px solid ${colors.primary}`, paddingBottom: '16px', marginBottom: '32px' }}>
              <div>
                {logoUrl && <img src={logoUrl} alt="Logo" className="preview-logo" />}
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', color: colors.primary }}>{brandName}</h1>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h2 style={{ fontSize: '32px', fontWeight: 'bold', textTransform: 'uppercase', color: colors.secondary }}>Invoice</h2>
                <p style={{ fontSize: '12px', marginTop: '4px' }}>{invoiceNumber}</p>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px', fontSize: '12px' }}>
              <div style={{ border: `1px solid ${colors.accent}`, padding: '16px' }}>
                <div style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '10px', color: colors.primary, marginBottom: '8px' }}>Remit To:</div>
                <div style={{ fontWeight: '600' }}>{from.name}</div>
                <div className="preview-address">{from.address}</div>
              </div>
              <div style={{ border: `1px solid ${colors.accent}`, padding: '16px' }}>
                <div style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '10px', color: colors.primary, marginBottom: '8px' }}>Bill To:</div>
                <div style={{ fontWeight: '600' }}>{to.name}</div>
                <div className="preview-address">{to.address}</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', fontSize: '12px', borderBottom: `1px solid ${colors.accent}`, borderTop: `1px solid ${colors.accent}`, padding: '8px 0', marginBottom: '32px' }}>
              <div><strong style={{ color: colors.primary }}>Invoice Date:</strong> {date}</div>
              <div><strong style={{ color: colors.primary }}>Due Date:</strong> {dueDate}</div>
              <div><strong style={{ color: colors.primary }}>Amount Due:</strong> <span style={{ fontWeight: 'bold' }}>{fmt(total)}</span></div>
            </div>
            <table className="preview-table">
              <thead style={{ background: colors.accent }}>
                <tr>
                  <th style={{ padding: '8px', color: colors.primary }}>Description</th>
                  <th className="right" style={{ padding: '8px', color: colors.primary, width: '60px' }}>Qty</th>
                  <th className="right" style={{ padding: '8px', color: colors.primary, width: '100px' }}>Rate</th>
                  <th className="right" style={{ padding: '8px', color: colors.primary, width: '100px' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} style={{ borderBottom: `1px solid ${colors.accent}` }}>
                    <td style={{ padding: '8px' }}>{item.description}</td>
                    <td className="right" style={{ padding: '8px' }}>{item.quantity}</td>
                    <td className="right" style={{ padding: '8px' }}>{fmt(item.rate)}</td>
                    <td className="right" style={{ padding: '8px', fontWeight: '500' }}>{fmt(item.quantity * item.rate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="preview-totals" style={{ marginTop: '32px' }}>
              <div className="preview-totals-container">
                <div className="preview-totals-row"><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                <div className="preview-totals-row"><span>Tax</span><span>{fmt(taxTotal)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', fontWeight: 'bold', fontSize: '14px', color: colors.primary, borderTop: `2px solid ${colors.accent}` }}>
                  <span>TOTAL DUE</span><span>{fmt(total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. CREATIVE TEMPLATE */}
        {templateId === 'creative' && (
          <div className="preview-template" style={{ ...baseStyle, padding: 0, display: 'flex' }}>
            <div style={{ width: '33%', background: colors.primary, color: '#fff', padding: '32px', display: 'flex', flexDirection: 'column' }}>
              {logoUrl && <img src={logoUrl} alt="Logo" className="preview-logo" style={{ filter: 'brightness(0) invert(1)' }} />}
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px' }}>{brandName}</h1>
              <div style={{ marginTop: 'auto' }}>
                <div style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.6, marginBottom: '4px' }}>From</div>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{from.name}</div>
                <div style={{ fontSize: '12px', opacity: 0.8, whiteSpace: 'pre-line' }}>{from.address}</div>
                
                <div style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.6, marginBottom: '4px', marginTop: '16px' }}>Details</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>{invoiceNumber}</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>Date: {date}</div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>Due: {dueDate}</div>
              </div>
            </div>
            <div style={{ width: '67%', padding: '32px', display: 'flex', flexDirection: 'column' }}>
              <h2 style={{ fontSize: '48px', fontWeight: 300, color: colors.secondary, marginBottom: '32px' }}>invoice</h2>
              <div style={{ marginBottom: '24px' }}>
                <div className="preview-bill-to-label">Bill To</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{to.name}</div>
                <div className="preview-address">{to.address}</div>
              </div>
              <div style={{ flex: 1, marginBottom: '24px' }}>
                {items.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: `1px dashed ${colors.accent}`, marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.description}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.quantity} x {fmt(item.rate)}</div>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: colors.secondary }}>{fmt(item.quantity * item.rate)}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 'auto' }}>
                <div className="preview-totals-row" style={{ marginBottom: '4px' }}><span>Subtotal</span><span>{fmt(subtotal)}</span></div>
                <div className="preview-totals-row" style={{ marginBottom: '8px' }}><span>Tax</span><span>{fmt(taxTotal)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: colors.accent, borderRadius: '8px' }}>
                  <span style={{ fontSize: '12px', textTransform: 'uppercase', fontWeight: 'bold', color: colors.primary }}>Total Due</span>
                  <span style={{ fontSize: '24px', fontWeight: 'bold', color: colors.primary }}>{fmt(total)}</span>
                </div>
                <p style={{ fontSize: '10px', color: '#9ca3af', marginTop: '16px' }}>{notes}</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
