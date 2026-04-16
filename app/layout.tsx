import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Providers from '@/src/providers';
import NavBar from '@/src/components/NavBar';
import Footer from '@/src/components/Footer';
import '@/src/index.css';

export const metadata: Metadata = {
  title: 'Aniverse',
  description: 'Aniverse Community Wiki',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="app-shell">
            <main className="app-main">
              <NavBar />
              <div className="devider" />
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
