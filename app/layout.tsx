import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Providers from '../src/providers';
import NavBar from '../src/components/NavBar';
import '../src/index.css';

export const metadata: Metadata = {
  title: 'Aniverse',
  description: 'Aniverse Community Wiki',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <NavBar />
          <div className="devider" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
