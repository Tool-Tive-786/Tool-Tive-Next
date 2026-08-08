export default function InvoiceLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // We return children directly because the root layout handles <html>, <body>, Header, and Footer
    return <>{children}</>;
}