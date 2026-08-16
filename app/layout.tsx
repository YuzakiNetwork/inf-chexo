import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CHEXO — Informatika',
  description: 'Platform pembelajaran Informatika SMAN 1 Cicalengka.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
