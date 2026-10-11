import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-jakarta", display: "swap" });
const poppins = Poppins({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-poppins", display: "swap" });

export const metadata: Metadata = {
  title: "Marifa — Clinical Knowledge & Governance",
  description: "Saudi-ready clinical knowledge, competency and governance platform."
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${inter.variable} ${poppins.variable} ${jakarta.variable}`}><body>{children}</body></html>;
}
