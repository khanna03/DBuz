import './globals.css';

export const metadata = {
  title: 'Bus Booking App',
  description: 'Book bus tickets easily in Sri Lanka',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}