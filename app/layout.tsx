import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://informatika.chexo.my.id'),
  title: 'CHEXO — Informatika',
  description: 'Platform pembelajaran Informatika SMAN 1 Cicalengka.',
  icons: {
    icon: '/chexo.webp',
    shortcut: '/chexo.webp',
    apple: '/chexo.webp',
  },
  openGraph: {
    title: 'CHEXO — Informatika',
    description: 'Platform pembelajaran Informatika SMAN 1 Cicalengka.',
    url: 'https://informatika.chexo.my.id',
    siteName: 'CHEXO',
    images: ['/chexo.webp'],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'CHEXO — Informatika',
    description: 'Platform pembelajaran Informatika SMAN 1 Cicalengka.',
    images: ['/chexo.webp'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><head>
    <script dangerouslySetInnerHTML={{ __html: `
      (function(){
        try {
          var saved = localStorage.getItem('chexo-theme');
          var theme = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
          document.documentElement.setAttribute('data-theme', theme);
        } catch (e) {}
      })();
    ` }} />
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Roboto+Flex:opsz,wght@8..144,400..700&display=swap" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round&display=block" rel="stylesheet" />
  </head><body style={{fontFamily: "'Roboto', ui-sans-serif, system-ui, sans-serif"}}>{children}</body></html>;
}
