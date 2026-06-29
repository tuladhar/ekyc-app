export const metadata = {
  title: process.env.APP_BANNER || 'eKYC Application Service',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
