export function Solution() {
  const features = [
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
      ),
      title: "100% Práctico",
      description:
        "No es una clase teórica más. Es un entrenamiento intensivo donde practicarás en condiciones reales de campo con vacas reales.",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: "Adaptado a México",
      description:
        "Diseñado específicamente para las condiciones extensivas y el ganado Beefmaster, Brahman y cruzas de nuestras regiones.",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
      title: "Certificación Real",
      description:
        "No regalamos diplomas. Te certificamos solo cuando demuestres dominio completo de la técnica con mínimo 80% en evaluaciones.",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-primary-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block px-4 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
            La Solución
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Entrenamiento de{" "}
            <span className="text-primary-600">Alto Rendimiento</span>
          </h2>
          <p className="text-lg text-gray-600">
            Un taller diseñado para que salgas inseminando con confianza y
            precisión desde el primer día.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-xl mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Quality guarantee system */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
              Lo Que Nos Hace Diferentes:{" "}
              <span className="text-primary-600">
                Sistema de Garantía de Calidad
              </span>
            </h3>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  number: "01",
                  title: "Examen Diagnóstico Inicial",
                  description:
                    "Evaluamos tu nivel actual de conocimiento y habilidades para personalizar tu aprendizaje. Medimos cómo entras para garantizar cómo sales.",
                },
                {
                  number: "02",
                  title: "Supervisión Personalizada",
                  description:
                    "Cada participante recibe atención individual durante las prácticas. No avanzas hasta dominar cada paso correctamente.",
                },
                {
                  number: "03",
                  title: "Hoja de Evaluación Práctica",
                  description:
                    "Utilizamos una lista de verificación de 10 puntos críticos: higiene, temperatura, tiempos, manejo animal y técnica de depósito.",
                },
                {
                  number: "04",
                  title: "Certificación por Mérito",
                  description:
                    "Para aprobar necesitas mínimo 80/100 puntos. Si no alcanzas el estándar, te damos retroalimentación y oportunidad de mejorar.",
                },
              ].map((item) => (
                <div key={item.number} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 text-white rounded-full font-bold">
                      {item.number}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.title}
                    </h4>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom banner */}
          <div className="bg-primary-600 px-8 py-6 text-center">
            <p className="text-white text-lg font-medium">
              <span className="font-bold">Quien se gradúa, realmente sabe hacerlo.</span>{" "}
              No es un diploma de participación.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}