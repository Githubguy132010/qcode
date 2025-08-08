import type { Metadata, Viewport } from "next";
import "./globals.css";
import { I18nProvider } from "@/components/I18nProvider";
import { HtmlLanguageAttribute } from "@/components/HtmlLanguageAttribute";

export const metadata: Metadata = {
  title: "QCode - Kortingscodes Beheren",
  description: "Bewaar en beheer al je kortingscodes op één plek. Nooit meer een korting missen!",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
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
    <html>
      <body
        className={`font-sans antialiased min-h-screen transition-colors`}
      >
        <I18nProvider>
          <HtmlLanguageAttribute>
            {children}
          </HtmlLanguageAttribute>
        </I18nProvider>
      </body>
    </html>
  );
}
