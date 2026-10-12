import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Inter: one variable font file serves every weight, chosen for clinical legibility.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "Marifa — Clinical Knowledge & Governance",
  description: "Saudi-ready clinical knowledge, competency and governance platform."
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0f766e" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={inter.variable}><body>{children}</body></html>;
}
