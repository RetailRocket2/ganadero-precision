import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ganadero de Precisión | Taller IATF en Durango",
  description:
    "Taller de Certificación Práctica en Inseminación Artificial a Tiempo Fijo (IATF). Aprende a inseminar tu propio ganado y deja de perder dinero en vacas vacías. 3 días intensivos en Durango, México.",
  keywords: [
    "IATF",
    "inseminación artificial",
    "ganado de carne",
    "taller ganadería",
    "reproducción bovina",
    "Durango",
    "México",
    "curso inseminación",
  ],
  authors: [{ name: "Ganadero de Precisión" }],
  openGraph: {
    title: "Ganadero de Precisión | Taller IATF",
    description:
      "Transforma tu Hato: De la Vaca Vacía a la Rentabilidad Garantizada. Taller de 3 días en Durango.",
    url: "https://ganaderodeprecision.lat",
    siteName: "Ganadero de Precisión",
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ganadero de Precisión | Taller IATF",
    description:
      "Aprende IATF en 3 días intensivos. Certificación práctica en Durango.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.className}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Meta Pixel */}
        <Script id="meta-pixel" strategy="lazyOnload">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${process.env.NEXT_PUBLIC_META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
      </head>
      <body className="bg-white text-gray-900 overflow-x-hidden">{children}</body>
    </html>
  );
}