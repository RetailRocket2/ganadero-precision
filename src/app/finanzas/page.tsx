import type { Metadata } from "next";
import Link from "next/link";
import { WorkshopCalculator } from "@/components/WorkshopCalculator";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export const metadata: Metadata = {
  title: "Calculadora de Rentabilidad | Talleres IATF - Ganadero de Precision",
  description:
    "Calcula cuanto puedes ganar con tus talleres de IATF. Herramienta gratuita para planear tus capacitaciones y proyectar ingresos anuales. Analiza costos, margenes y punto de equilibrio.",
  keywords: [
    "calculadora rentabilidad talleres",
    "modelo financiero IATF",
    "cuanto gana un capacitador IATF",
    "negocio talleres ganaderia",
    "rentabilidad capacitaciones ganaderas",
    "ingresos taller inseminacion artificial",
    "Mexico",
  ],
  authors: [{ name: "Ganadero de Precision" }],
  openGraph: {
    title: "Calculadora de Rentabilidad - Talleres IATF",
    description:
      "Descubre cuanto puedes ganar con tus talleres de IATF. Calcula costos, margenes y proyecta tus ingresos anuales. Herramienta 100% gratuita.",
    url: "https://ganaderodeprecision.lat/finanzas",
    siteName: "Ganadero de Precision",
    locale: "es_MX",
    type: "website",
    images: [
      {
        url: "https://ganaderodeprecision.lat/og-finanzas.png",
        width: 1200,
        height: 630,
        alt: "Calculadora de Rentabilidad - Talleres IATF",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Calculadora de Rentabilidad - Talleres IATF",
    description:
      "Descubre cuanto puedes ganar con tus talleres de IATF. Herramienta gratuita.",
    images: ["https://ganaderodeprecision.lat/og-finanzas.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function FinanzasPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Ganadero de Precision
            </Link>
            <WhatsAppButton
              text="Contactar"
              message="Hola, acabo de usar la calculadora de rentabilidad de talleres IATF y me gustaria mas informacion."
              size="sm"
            />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-8 sm:py-12 bg-gradient-to-b from-primary-600 to-primary-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1 bg-white/20 text-white rounded-full text-sm font-medium mb-4">
            Herramienta Gratuita
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Calculadora de Talleres IATF
          </h1>
          <p className="text-lg sm:text-xl text-primary-100 max-w-2xl mx-auto">
            Descubre cuanto puedes ganar con tus talleres. Analiza costos,
            margenes y proyecta tus ingresos anuales.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <WorkshopCalculator />
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
              ¿Por que usar esta calculadora?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Calculo Preciso
                </h3>
                <p className="text-sm text-gray-600">
                  Modelo financiero completo con costos variables, fijos y
                  comisiones de capacitadores
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Proyecciones Anuales
                </h3>
                <p className="text-sm text-gray-600">
                  Visualiza tus ingresos mes a mes con estacionalidad de
                  temporadas de empadre
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  100% Gratuito
                </h3>
                <p className="text-sm text-gray-600">
                  Sin registro, sin limites. Ajusta todos los parametros a tu
                  realidad
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-earth-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ¿Quieres aprender a dar talleres IATF?
          </h2>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            Certificate como capacitador IATF con nuestro taller intensivo de 3
            dias. Aprende la tecnica y el modelo de negocio.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors"
            >
              Ver Taller de Certificacion
            </Link>
            <WhatsAppButton
              text="Preguntar por el Taller"
              message="Hola, use la calculadora de rentabilidad y me interesa certificarme como capacitador IATF. ¿Cuales son las proximas fechas?"
              size="lg"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Ganadero de Precision. Todos los
            derechos reservados.
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <Link
              href="/"
              className="text-primary-400 hover:text-primary-300 text-sm"
            >
              Taller IATF
            </Link>
            <Link
              href="/simulador-credito"
              className="text-primary-400 hover:text-primary-300 text-sm"
            >
              Simulador de Credito
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
