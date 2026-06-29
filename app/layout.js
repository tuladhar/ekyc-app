import './globals.css';
import { SiteFooter } from '@/components/site-footer';

export const metadata = {
  title: process.env.APP_BANNER || 'CKYC · Central Know Your Customer',
  description: 'Central Know Your Customer — identity repository (demo).',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
