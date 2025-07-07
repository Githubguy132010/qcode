import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/components/I18nProvider";
import { HtmlLanguageAttribute } from "@/components/HtmlLanguageAttribute";
import { ToastProvider } from "@/components/ToastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QCode - Kortingscodes Beheren",
  description: "Bewaar en beheer al je kortingscodes op één plek. Nooit meer een korting missen!",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192x192.png",
    apple: "/icon-192x192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "QCode",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#3b82f6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen transition-colors`}
      >
        <I18nProvider>
          <HtmlLanguageAttribute>
            <ToastProvider>
              {children}
            </ToastProvider>
          </HtmlLanguageAttribute>
        </I18nProvider>
      </body>
    </html>
  );
}
