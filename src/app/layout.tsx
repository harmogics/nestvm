import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NestVM — the wave-log machine",
  description:
    "The Nest Runtime Specification Set and the study workbench built on it: the machine whose first study subject is the machine itself."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <div className="frame">
          <header className="topbar">
            <a className="brand" href="/">
              <b>NestVM</b>
              <small>The wave-log machine</small>
            </a>
            <nav className="topnav">
              <a href="/spec">Specification</a>
              <a href="/studio">Study workbench</a>
              <span className="runtime-chip">
                <i />
                Simulated runtime · v0
              </span>
            </nav>
          </header>
          {children}
          <footer className="foot">
            <span>NestVM — Nest studying Nest</span>
            <span>One append-only truth</span>
            <span>A sibling of The Algorithmic Company</span>
          </footer>
        </div>
      </body>
    </html>
  );
}
