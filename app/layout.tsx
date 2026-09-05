import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CHEXO — Informatika',
  description: 'Platform pembelajaran Informatika SMAN 1 Cicalengka.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id" className="light"><head>
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Roboto+Flex:opsz,wght@8..144,400..700&display=swap" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
  </head><body style={{fontFamily: "'Roboto', ui-sans-serif, system-ui, sans-serif"}}>{children}</body></html>;
}
