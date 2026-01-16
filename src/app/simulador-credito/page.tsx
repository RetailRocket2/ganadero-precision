import type { Metadata } from "next";
import Link from "next/link";
import { LoanSimulator } from "@/components/LoanSimulator";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export const metadata: Metadata = {
  title: "Simulador de Crédito Ganadero | Ganadero de Precisión",
  description:
    "Calcula tu crédito para compra de ganado. Genera tu tabla de amortización y descárgala en Excel. Herramienta gratuita para ganaderos mexicanos.",
  keywords: [
    "simulador crédito ganadero",
    "crédito para ganado",
    "tabla amortización",
    "financiamiento ganadero",
    "préstamo ganado",
    "crédito agropecuario",
    "México",
  ],
  openGraph: {
    title: "Simulador de Crédito Ganadero",
    description:
      "Calcula tu crédito para compra de ganado. Genera tabla de amortización y descarga en Excel.",
    url: "https://ganaderodeprecision.lat/simulador-credito",
    siteName: "Ganadero de Precisión",
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Simulador de Crédito Ganadero",
    description:
      "Calcula tu crédito para compra de ganado. Herramienta gratuita.",
  },
};

export default function SimuladorCreditoPage() {
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
              Ganadero de Precisión
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-primary-600 to-primary-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1 bg-white/20 text-white rounded-full text-sm font-medium mb-4">
            Herramienta Gratuita
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Simulador de Crédito Ganadero
          </h1>
          <p className="text-lg sm:text-xl text-primary-100 max-w-2xl mx-auto">
            Calcula el financiamiento para tu compra de ganado. Genera tu tabla
            de amortización y descárgala en Excel.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <LoanSimulator />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
              ¿Por qué usar este simulador?
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
                  Cálculo Preciso
                </h3>
                <p className="text-sm text-gray-600">
                  Método francés de amortización, el más usado en créditos
                  mexicanos
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
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Descarga Excel
                </h3>
                <p className="text-sm text-gray-600">
                  Lleva tu tabla de amortización completa a tu computadora
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
                  Sin registro, sin límites. Úsalo las veces que necesites
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
            ¿Necesitas asesoría para tu crédito ganadero?
          </h2>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            Te ayudamos a entender tus opciones de financiamiento y a preparar
            tu solicitud de crédito.
          </p>
          <WhatsAppButton
            text="Solicitar Asesoría"
            message="Hola, acabo de usar el simulador de crédito ganadero y me gustaría recibir asesoría para mi financiamiento."
            size="lg"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Ganadero de Precisión. Todos los
            derechos reservados.
          </p>
          <Link
            href="/"
            className="text-primary-400 hover:text-primary-300 text-sm mt-2 inline-block"
          >
            Conoce nuestro Taller de IATF →
          </Link>
        </div>
      </footer>
    </main>
  );
}
