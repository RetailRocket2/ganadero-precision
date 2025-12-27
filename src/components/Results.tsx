export function Results() {
  const benefits = [
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
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      title: "Parición Compacta y Predecible",
      description:
        "Concentra los nacimientos en 60-90 días. Facilita el manejo, reduce costos de mano de obra y mejora la vigilancia de partos.",
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
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: "Genética Superior en Cada Becerro",
      description:
        "Acceso a toros probados de clase mundial sin los costos de mantenerlos. Becerros más pesados al destete y mayor precio de venta.",
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
      title: "Control Total de tu Reproducción",
      description:
        "Ya no dependes de terceros ni de la suerte. Tú decides cuándo, cómo y con qué genética inseminar.",
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
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: "Retorno de Inversión Inmediato",
      description:
        "Con solo mejorar 10-15% tu tasa de preñez, recuperas la inversión del taller en la primera temporada.",
    },
  ];

  const stats = [
    { value: "55-65%", label: "Tasa de Preñez Esperada" },
    { value: "60-90", label: "Días de Parición" },
    { value: "1ra", label: "Temporada ROI" },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-primary-50 to-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block px-4 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
            Resultados
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Visualiza el Éxito en{" "}
            <span className="text-primary-600">Tu Rancho</span>
          </h2>
          <p className="text-lg text-gray-600">
            Esto es lo que puedes esperar al dominar la técnica IATF.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto mb-16">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 text-center shadow-lg border border-gray-100"
            >
              <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Benefits grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="flex gap-4 bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100"
            >
              <div className="flex-shrink-0">
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
                  {benefit.icon}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Proof banner */}
        <div className="mt-16 bg-gray-900 rounded-3xl p-8 md:p-12 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Respaldado por Estándares Internacionales
          </h3>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto mb-6">
            Nuestro programa está basado en los protocolos de éxito de ReproMax
            y BovinosVirtual, adaptados a las condiciones reales del campo
            mexicano y el ganado de carne en sistemas extensivos.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-primary-400">
            <span className="px-4 py-2 bg-gray-800 rounded-full text-sm">
              Protocolos probados
            </span>
            <span className="px-4 py-2 bg-gray-800 rounded-full text-sm">
              Casos de éxito documentados
            </span>
            <span className="px-4 py-2 bg-gray-800 rounded-full text-sm">
              Mejora continua
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}