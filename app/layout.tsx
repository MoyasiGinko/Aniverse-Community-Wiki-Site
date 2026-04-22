import type { Metadata } from "next";
import type { ReactNode } from "react";
import Providers from "@/src/providers";
import NavBar from "@/src/components/NavBar";
import Footer from "@/src/components/Footer";
import "@/src/index.css";

export const metadata: Metadata = {
  title: "Aniverse",
  description: "Aniverse Community Wiki",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="app-shell">
            <NavBar />
            <div className="app-container">
              <main className="app-main">
                <div className="devider" />
                {children}
              </main>
            </div>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
