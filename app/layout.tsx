import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hobby Tracker',
  description: 'Track your hobbies and time spent on them',
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
