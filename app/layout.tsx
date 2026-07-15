import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NEST / Inductive Canvas",
  description: "A guided canvas for learning inductive decomposition with AI."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
