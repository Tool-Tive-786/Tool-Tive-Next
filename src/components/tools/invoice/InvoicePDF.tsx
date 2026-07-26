'use client';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { useInvoiceStore, calculateTotals, formatCurrency, InvoiceState } from '@/lib/store';

const InvoicePDFDocument = ({ state }: { state: InvoiceState }) => {
  const { colors, brandName, logoUrl, from, to, items, currency, locale, notes, invoiceNumber, date, dueDate } = state;
  const { subtotal, taxTotal, total } = calculateTotals(items);
  const fmt = (amt: number) => formatCurrency(amt, currency, locale);

  const styles = StyleSheet.create({
    page: { padding: 40, fontSize: 10, color: colors.text, fontFamily: 'Helvetica' },
    row: { flexDirection: 'row' },
    col: { flexDirection: 'column' },
    right: { textAlign: 'right' },
    bold: { fontFamily: 'Helvetica-Bold' },
    header: { fontSize: 24, fontFamily: 'Helvetica-Bold', color: colors.primary },
    subHeader: { fontSize: 12, color: colors.secondary },
    label: { fontSize: 8, color: '#9CA3AF', marginBottom: 2 },
    section: { marginBottom: 20 },
    tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.primary, paddingBottom: 5, marginBottom: 5 },
    tableRow: { flexDirection: 'row', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
    totals: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
    totalsCol: { width: '40%' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5, paddingTop: 5, borderTopWidth: 1, borderTopColor: colors.primary },
    footer: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 8, color: '#9CA3AF', textAlign: 'center' }
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.row}>
          <View style={styles.col}>
            {logoUrl && <Image src={logoUrl} style={{ width: 80, height: 40, marginBottom: 10, objectFit: 'contain' }} />}
            <Text style={styles.header}>{brandName}</Text>
            <Text style={{ marginTop: 4 }}>{from.address}</Text>
          </View>
          <View style={[styles.col, { marginLeft: 'auto', textAlign: 'right' }]}>
            <Text style={styles.subHeader}>INVOICE</Text>
            <Text style={{ marginTop: 4 }}>{invoiceNumber}</Text>
            <Text>Date: {date}</Text>
            <Text>Due: {dueDate}</Text>
          </View>
        </View>

        <View style={[styles.section, { marginTop: 30 }]}>
          <Text style={styles.label}>BILL TO</Text>
          <Text style={styles.bold}>{to.name}</Text>
          <Text>{to.address}</Text>
        </View>

        <View>
          <View style={styles.tableHeader}>
            <Text style={{ flex: 2, color: colors.primary }}>DESCRIPTION</Text>
            <Text style={{ flex: 1, textAlign: 'right', color: colors.primary }}>QTY</Text>
            <Text style={{ flex: 1, textAlign: 'right', color: colors.primary }}>RATE</Text>
            <Text style={{ flex: 1, textAlign: 'right', color: colors.primary }}>AMOUNT</Text>
          </View>
          {items.map(item => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={{ flex: 2 }}>{item.description}</Text>
              <Text style={{ flex: 1, textAlign: 'right' }}>{item.quantity}</Text>
              <Text style={{ flex: 1, textAlign: 'right' }}>{fmt(item.rate)}</Text>
              <Text style={{ flex: 1, textAlign: 'right' }}>{fmt(item.quantity * item.rate)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalsCol}>
            <View style={[styles.row, { justifyContent: 'space-between', marginBottom: 2 }]}>
              <Text>Subtotal</Text>
              <Text>{fmt(subtotal)}</Text>
            </View>
            <View style={[styles.row, { justifyContent: 'space-between', marginBottom: 2 }]}>
              <Text>Tax</Text>
              <Text>{fmt(taxTotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.bold}>TOTAL</Text>
              <Text style={[styles.bold, { color: colors.secondary }]}>{fmt(total)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>{notes}</Text>
      </Page>
    </Document>
  );
};

export default function InvoicePDF() {
  const state = useInvoiceStore();
  return <InvoicePDFDocument state={state} />;
}
