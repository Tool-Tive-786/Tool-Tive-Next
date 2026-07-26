import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  taxRate: number;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
}

export type TemplateId = 'minimal' | 'neo-brutal' | 'modern' | 'corporate' | 'creative';

export interface InvoiceState {
  brandName: string;
  logoUrl: string | null;
  currency: string;
  locale: string;
  
  from: { name: string; address: string; email: string; };
  to: { name: string; address: string; email: string; };
  invoiceNumber: string;
  date: string;
  dueDate: string;
  items: LineItem[];
  notes: string;
  
  templateId: TemplateId;
  colors: ThemeColors;
  
  setField: <K extends keyof InvoiceState>(key: K, value: InvoiceState[K]) => void;
  setFromTo: (target: 'from' | 'to', key: 'name' | 'address' | 'email', value: string) => void;
  addItem: () => void;
  updateItem: (id: string, data: Partial<LineItem>) => void;
  removeItem: (id: string) => void;
  setTemplate: (id: TemplateId) => void;
  setColors: (colors: Partial<ThemeColors>) => void;
  setLogo: (url: string | null) => void;
}

export const useInvoiceStore = create<InvoiceState>()(
  persist(
    (set) => ({
      brandName: 'ToolTive Studio',
      logoUrl: null,
      currency: 'USD',
      locale: 'en-US',
      
      from: { name: 'Your Business LLC', address: '123 Business Ave\nNew York, NY 10001', email: 'billing@yourbusiness.com' },
      to: { name: 'Client Inc.', address: '456 Client Street\nLos Angeles, CA 90001', email: 'accounts@client.com' },
      invoiceNumber: 'INV-0001',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [
        { id: '1', description: 'Web Design Service', quantity: 1, rate: 1200, taxRate: 0 },
        { id: '2', description: 'Hosting Setup (1 yr)', quantity: 1, rate: 150, taxRate: 5 }
      ],
      notes: 'Thank you for your business! Please make payment within 14 days.',
      
      templateId: 'minimal',
      colors: {
        primary: '#1E293B',
        secondary: '#3B82F6',
        accent: '#F8FAFC',
        text: '#334155'
      },
      
      setField: (key, value) => set({ [key]: value }),
      setFromTo: (target, key, value) => set((state) => ({
        [target]: { ...state[target], [key]: value }
      })),
      addItem: () => set((state) => ({ 
        items: [...state.items, { id: Date.now().toString(), description: 'New Item', quantity: 1, rate: 0, taxRate: 0 }]
      })),
      updateItem: (id, data) => set((state) => ({
        items: state.items.map(item => item.id === id ? { ...item, ...data } : item)
      })),
      removeItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
      })),
      setTemplate: (id) => set({ templateId: id }),
      setColors: (newColors) => set((state) => ({ 
        colors: { ...state.colors, ...newColors }
      })),
      setLogo: (url) => set({ logoUrl: url }),
    }),
    { name: 'tooltive-storage' }
  )
);

export const calculateTotals = (items: LineItem[]) => {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const taxTotal = items.reduce((sum, item) => sum + ((item.quantity * item.rate) * (item.taxRate / 100)), 0);
  const total = subtotal + taxTotal;
  return { subtotal, taxTotal, total };
};

export const formatCurrency = (amount: number, currency: string, locale: string) => {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
  } catch (e) {
    return `${currency} ${amount.toFixed(2)}`;
  }
};
