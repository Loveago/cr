import type { Metadata } from 'next';
import './globals.css';
import { ScamPopup } from '@/components/ScamPopup';

export const metadata: Metadata = {
  title: 'CRYPTEX — The Most Trusted Crypto Exchange | Lost crypto? Contact @bengoshidesu',
  description: 'Buy, sell, trade and invest in 350+ cryptocurrencies with the lowest fees and highest security. Lost crypto to a scam? Contact us on Telegram @bengoshidesu.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://cryptex.exchange')
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                const t = localStorage.getItem('cryptex.theme');
                const d = t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches);
                document.documentElement.classList.toggle('dark', d);
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen antialiased">
        <ScamPopup />
        {children}
      </body>
    </html>
  );
}
