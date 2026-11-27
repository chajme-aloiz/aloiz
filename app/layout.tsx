import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aloiz",
  description: "Školní život dětí na jednom místě. Vyfoťte lísteček, přepošlete e-mail nebo to řekněte nahlas.",
  appleWebApp: { capable: true, title: "Aloiz", statusBarStyle: "default" },
  icons: { icon: "/icon.svg", apple: "/apple-icon.png" },
};

export const viewport: Viewport = {
  width: "device-width", initialScale: 1, viewportFit: "cover",
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#F6F5F1" }, { media: "(prefers-color-scheme: dark)", color: "#141416" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="cs">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&display=swap" />
      </head>
      <body>{children}</body>
    </html>
  );
}
