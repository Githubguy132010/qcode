import type { Metadata, Viewport } from "next";
import "./globals.css";
import { I18nProvider } from "@/components/I18nProvider";
import { HtmlLanguageAttribute } from "@/components/HtmlLanguageAttribute";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "QCode - Kortingscodes Beheren",
  description: "Bewaar en beheer al je kortingscodes op één plek. Nooit meer een korting missen!",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const h = await headers();
  const acceptLanguage = h.get('accept-language') || '';
  const parseDefaultLocale = (accept: string): string => {
    const parts = accept.split(',').map(p => p.split(';')[0].trim()).filter(Boolean);
    // Find first with base 'nl' or 'en'
    for (const p of parts) {
      const base = p.split('-')[0];
      if (base === 'nl') return 'nl-NL';
      if (base === 'en') return 'en-US';
    }
    return 'en-US';
  };
  const ssrLang = parseDefaultLocale(acceptLanguage);

  return (
    <html lang={ssrLang}>
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
