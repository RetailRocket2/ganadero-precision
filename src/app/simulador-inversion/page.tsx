import type { Metadata } from "next";
import Link from "next/link";
import { SelfFundedSimulator } from "@/components/self-funded-projection/SelfFundedSimulator";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export const metadata: Metadata = {
  title: "Simulador de Inversión Ganadera — Capital Propio | Ganadero de Precisión",
  description:
    "Simula la inversión ganadera con capital propio a 10 años. Sin crédito bancario. Calcula estados financieros, flujo de efectivo y retorno de inversión para tu rancho.",
  keywords: [
    "inversión ganadera capital propio",
    "simulador inversión rancho",
    "ganadería sin crédito",
    "proyección financiera rancho",
    "ROI ganadería",
    "inversión ganadera México",
    "balance general rancho",
    "flujo de efectivo ganadero",
  ],
};

export default function SimuladorInversionPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-primary-700">
            Ganadero de Precisión
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/simulador-proyeccion"
              className="text-gray-600 hover:text-primary-600 text-sm"
            >
              Simulador con Crédito
            </Link>
            <Link
              href="/simulador-credito"
              className="text-gray-600 hover:text-primary-600 text-sm"
            >
              Simulador de Crédito
            </Link>
            <WhatsAppButton
              text="Contactar"
              message="Hola, me interesa información sobre inversión ganadera con capital propio."
              size="sm"
            />
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-b from-primary-600 to-primary-700">
        <div className="container mx-auto px-4 text-center">
          <span className="inline-block px-4 py-1 bg-white/20 text-white rounded-full text-sm font-medium mb-4">
            Herramienta Gratuita
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Simulador de Inversión Ganadera — Capital Propio
          </h1>
          <p className="text-lg sm:text-xl text-primary-100 max-w-2xl mx-auto">
            Proyecta tu inversión ganadera a 10 años sin crédito bancario.
            Estados financieros completos, flujo de efectivo y análisis de
            retorno sobre tu capital.
          </p>
        </div>
      </section>

      {/* Features Pills */}
      <section className="py-6 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3">
            {[
              "Estado de Resultados",
              "Balance General",
              "Flujo de Efectivo",
              "Proyección del Hato",
              "Sin Deuda Bancaria",
              "Descarga Excel",
            ].map((feature) => (
              <span
                key={feature}
                className="px-3 py-1 bg-earth-50 text-earth-700 rounded-full text-sm font-medium"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <SelfFundedSimulator />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-earth-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ¿Necesitas asesoría para tu inversión ganadera?
          </h2>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            Te ayudamos a estructurar tu plan de inversión con capital propio
            y a preparar proyecciones financieras profesionales para tu rancho.
          </p>
          <WhatsAppButton
            text="Solicitar Asesoría"
            message="Hola, usé el simulador de inversión ganadera y me gustaría recibir asesoría para mi proyecto."
            size="lg"
          />
        </div>
      </section>

      {/* Info Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              ¿Cómo funciona el simulador?
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-6 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-primary-600 mb-2">1</div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Define tu inversión
                </h3>
                <p className="text-gray-600 text-sm">
                  Configura los 9 rubros de infraestructura, cantidad de ganado,
                  y fee de consultoría. El sistema calcula el capital total requerido.
                </p>
              </div>
              <div className="p-6 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-primary-600 mb-2">2</div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Configura el hato
                </h3>
                <p className="text-gray-600 text-sm">
                  Ajusta parámetros reproductivos y define reemplazo y desecho
                  por año para optimizar el crecimiento del hato.
                </p>
              </div>
              <div className="p-6 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-primary-600 mb-2">3</div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Obtén proyecciones
                </h3>
                <p className="text-gray-600 text-sm">
                  Visualiza estados financieros a 10 años: resultados, balance,
                  flujo de efectivo y evolución del hato.
                </p>
              </div>
              <div className="p-6 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-primary-600 mb-2">4</div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Descarga Excel
                </h3>
                <p className="text-gray-600 text-sm">
                  Exporta un archivo Excel profesional con 8 hojas de análisis
                  financiero completo para presentar a socios o inversionistas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p className="text-sm">
            © {new Date().getFullYear()} Ganadero de Precisión. Todos los
            derechos reservados.
          </p>
          <p className="text-xs mt-2">
            Las proyecciones son estimaciones basadas en los datos ingresados.
            Los resultados reales pueden variar.
          </p>
          <div className="mt-4 flex justify-center gap-6">
            <Link
              href="/simulador-proyeccion"
              className="text-sm hover:text-white transition-colors"
            >
              Simulador con Crédito
            </Link>
            <Link
              href="/simulador-credito"
              className="text-sm hover:text-white transition-colors"
            >
              Simulador de Crédito
            </Link>
            <Link
              href="/"
              className="text-sm hover:text-white transition-colors"
            >
              Inicio
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
