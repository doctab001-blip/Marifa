import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./theme-dark.css";
import "./glass.css";
import "./clinical-orders.css";
import "./theme-v21.css";
import { Icon3DDefs } from "@/components/icons-3d";

// Inter: one variable font file serves every weight, chosen for clinical legibility.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "Marifa — Clinical Knowledge & Governance",
  description: "Saudi-ready clinical knowledge, competency and governance platform."
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#f3f6fb", colorScheme: "light" };

// Applies the saved theme before first paint so there is no flash. Light is the default.
const themeScript = `try{if(localStorage.getItem("marifa.theme")==="dark")document.documentElement.dataset.theme="dark"}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={inter.variable} suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head><body><Icon3DDefs />{children}</body></html>;
}
