'use client';
import { useInvoiceStore } from '@/lib/store';

export default function DataPanel() {
  const { 
    from, to, items, invoiceNumber, date, dueDate, notes, 
    setFromTo, setField, addItem, updateItem, removeItem, setLogo 
  } = useInvoiceStore();

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="panel panel-left">
      <div className="brand-header">
        <h1 className="brand-title">ToolTive</h1>
        <p className="brand-subtitle">Invoice Studio</p>
      </div>
      
      <div className="section">
        <h2 className="section-title">Invoice Details</h2>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Invoice #</label>
            <input className="form-input" type="text" value={invoiceNumber} onChange={(e) => setField('invoiceNumber', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input className="form-input" type="date" value={date} onChange={(e) => setField('date', e.target.value)} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Due Date</label>
          <input className="form-input" type="date" value={dueDate} onChange={(e) => setField('dueDate', e.target.value)} />
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Brand Logo</h2>
        <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ fontSize: '12px' }} />
      </div>

      <div className="section">
        <h2 className="section-title">From (You)</h2>
        <div className="form-group">
          <input className="form-input" placeholder="Business Name" value={from.name} onChange={(e) => setFromTo('from', 'name', e.target.value)} />
        </div>
        <div className="form-group">
          <textarea className="form-textarea" placeholder="Address" value={from.address} onChange={(e) => setFromTo('from', 'address', e.target.value)}></textarea>
        </div>
        <div className="form-group">
          <input className="form-input" placeholder="Email" value={from.email} onChange={(e) => setFromTo('from', 'email', e.target.value)} />
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Bill To (Client)</h2>
        <div className="form-group">
          <input className="form-input" placeholder="Client Name" value={to.name} onChange={(e) => setFromTo('to', 'name', e.target.value)} />
        </div>
        <div className="form-group">
          <textarea className="form-textarea" placeholder="Address" value={to.address} onChange={(e) => setFromTo('to', 'address', e.target.value)}></textarea>
        </div>
        <div className="form-group">
          <input className="form-input" placeholder="Email" value={to.email} onChange={(e) => setFromTo('to', 'email', e.target.value)} />
        </div>
      </div>

      <div className="section">
        <h2 className="section-title">Line Items</h2>
        {items.map((item) => (
          <div key={item.id} className="line-item">
            <div className="line-item-header">
              <input className="form-input" placeholder="Description" value={item.description} onChange={(e) => updateItem(item.id, { description: e.target.value })} />
              <button className="btn-remove-item" onClick={() => removeItem(item.id)}>✕</button>
            </div>
            <div className="line-item-inputs">
              <input className="form-input" type="number" title="Qty" value={item.quantity} onChange={(e) => updateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })} />
              <input className="form-input" type="number" title="Rate" value={item.rate} onChange={(e) => updateItem(item.id, { rate: parseFloat(e.target.value) || 0 })} />
              <input className="form-input" type="number" title="Tax %" value={item.taxRate} onChange={(e) => updateItem(item.id, { taxRate: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>
        ))}
        <button className="btn btn-secondary" onClick={addItem}>+ Add Line Item</button>
      </div>

      <div className="section">
        <h2 className="section-title">Notes / Terms</h2>
        <textarea className="form-textarea" value={notes} onChange={(e) => setField('notes', e.target.value)}></textarea>
      </div>
    </div>
  );
}
