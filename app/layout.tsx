import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import ThemeSync from "@/components/ThemeSync";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Aurora — See your growth in motion",
  description:
    "Aurora is a revenue and growth analytics dashboard that makes data feel alive. Orchestrated load sequence, live-morphing charts, and a refined command-center aesthetic.",
};

// Applies the persisted theme before paint to avoid a flash of the wrong theme.
const themeScript = `(function(){try{var s=localStorage.getItem('aurora-ui');if(s){var t=JSON.parse(s).state.theme;if(t==='light'){document.documentElement.classList.add('light');}}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">
        <ThemeSync />
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  );
}
