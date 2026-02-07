import type { Metadata } from "next";
import Link from "next/link";
import { RanchingSimulator } from "@/components/ranching-projection/RanchingSimulator";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export const metadata: Metadata = {
  title: "Simulador de Proyección Ganadera | Ganadero de Precisión",
  description:
    "Simula la proyección financiera de tu rancho ganadero a 5 años. Calcula estados financieros, flujo de efectivo y retorno de inversión para créditos de $7-10 millones MXN.",
  keywords: [
    "simulador ganadero",
    "proyección financiera rancho",
    "crédito ganadero México",
    "modelo financiero ganado",
    "ROI ganadería",
    "inversión ganadera",
    "balance general rancho",
    "flujo de efectivo ganadero",
  ],
};

export default function SimuladorProyeccionPage() {
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
              href="/simulador-credito"
              className="text-gray-600 hover:text-primary-600 text-sm"
            >
              Simulador de Crédito
            </Link>
            <WhatsAppButton
              text="Contactar"
              message="Hola, me interesa información sobre créditos ganaderos."
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
            Simulador de Proyección Ganadera
          </h1>
          <p className="text-lg sm:text-xl text-primary-100 max-w-2xl mx-auto">
            Proyecta tu operación ganadera a 5 años. Estados financieros
            completos, flujo de efectivo y análisis de retorno de inversión.
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
              "Tabla de Amortización",
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
          <RanchingSimulator />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-earth-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ¿Necesitas asesoría para tu crédito ganadero?
          </h2>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            Te ayudamos a estructurar tu crédito de $7-10 millones MXN y a
            preparar tu plan de negocios ganadero con proyecciones financieras
            profesionales.
          </p>
          <WhatsAppButton
            text="Solicitar Asesoría"
            message="Hola, usé el simulador de proyección ganadera y me gustaría recibir asesoría para mi crédito."
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
                  Ingresa tus datos
                </h3>
                <p className="text-gray-600 text-sm">
                  Configura el monto del crédito, infraestructura, cantidad de
                  ganado y costos operativos.
                </p>
              </div>
              <div className="p-6 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-primary-600 mb-2">2</div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Define ingresos
                </h3>
                <p className="text-gray-600 text-sm">
                  Establece precios de venta de becerros y vacas de desecho
                  según el mercado actual.
                </p>
              </div>
              <div className="p-6 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-primary-600 mb-2">3</div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Obtén proyecciones
                </h3>
                <p className="text-gray-600 text-sm">
                  Visualiza estados financieros a 5 años: resultados, balance,
                  flujo de efectivo.
                </p>
              </div>
              <div className="p-6 bg-gray-50 rounded-xl">
                <div className="text-2xl font-bold text-primary-600 mb-2">4</div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Descarga Excel
                </h3>
                <p className="text-gray-600 text-sm">
                  Exporta un archivo Excel profesional con 7 hojas de análisis
                  financiero completo.
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
