import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EbookAI - Automated Ebook Creator',
  description:
    'Create, format, and publish profitable ebooks on Amazon Kindle with AI automation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
