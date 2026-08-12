import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "../components/Sidebar";
import { ThemeProvider } from "../components/ThemeProvider";

export const metadata: Metadata = {
  title: "Meeting Notes & Transcription",
  description: "Fireflies-inspired meeting intelligence platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <div className="app-container">
            <Sidebar />
            <main className="main-content">
              <header className="topbar" style={{justifyContent: 'flex-end'}}>
                <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
                  <div style={{width: 36, height: 36, borderRadius: '50%', background: 'var(--accent-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>
                    SC
                  </div>
                </div>
              </header>
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
