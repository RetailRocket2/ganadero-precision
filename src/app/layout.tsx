import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
      <body className="bg-white text-gray-900">{children}</body>
    </html>
  );
}