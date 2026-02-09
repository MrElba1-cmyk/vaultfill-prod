import type { Metadata } from 'next';
import './globals.css';
import FloatingChat from '../components/FloatingChat';

export const metadata: Metadata = {
  title: 'VaultFill',
  description: 'AI assistance for GRC and security questionnaires.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="vaultfill-bg">
        {children}
        <FloatingChat />
      </body>
    </html>
  );
}
