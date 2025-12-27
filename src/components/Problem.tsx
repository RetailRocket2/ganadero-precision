export function Problem() {
  const problems = [
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
      stat: "$450 USD",
      title: "Costo por Vaca Vacía",
      description:
        "Cada vaca abierta te cuesta entre $400-500 dólares al año en alimentación sin retorno de inversión.",
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
            d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
          />
        </svg>
      ),
      stat: "35%",
      title: "Pérdida por Celo Perdido",
      description:
        "Cada celo no detectado retrasa la parición y reduce el peso al destete hasta un 35%.",
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
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      ),
      stat: "$85 USD",
      title: "Semen Desperdiciado",
      description:
        "Pajillas mal manejadas y técnica deficiente pueden costarte miles al año sin resultados.",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            ¿Cuánto Dinero Estás Perdiendo{" "}
            <span className="text-red-600">Realmente</span>?
          </h2>
          <p className="text-lg text-gray-600">
            La frustración de depender de técnicos externos o ver bajas tasas de
            preñez tiene solución. El problema no está en tu ganado, está en la
            manga.
          </p>
        </div>

        {/* Problem cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-8 text-center border border-red-100"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 text-red-600 rounded-full mb-4">
                {problem.icon}
              </div>
              <div className="text-4xl font-bold text-red-600 mb-2">
                {problem.stat}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {problem.title}
              </h3>
              <p className="text-gray-600">{problem.description}</p>
            </div>
          ))}
        </div>

        {/* The real problem */}
        <div className="bg-gray-900 rounded-3xl p-8 md:p-12 text-white">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center text-4xl font-bold">
                  80%
                </div>
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  El 80% de las Fallas{" "}
                  <span className="text-red-400">
                    No Son Culpa de tu Ganado
                  </span>
                </h3>
                <p className="text-gray-300 text-lg mb-6">
                  Después de trabajar con cientos de ganaderos, hemos
                  identificado que la mayoría de las fallas reproductivas no son
                  culpa de las vacas ni de las hormonas:
                </p>
                <ul className="space-y-3">
                  {[
                    "Descongelación incorrecta del semen (pérdida de viabilidad)",
                    "Falta de higiene en el proceso (infecciones)",
                    "Depósito inadecuado del semen (lugar y momento incorrectos)",
                    "Manejo deficiente del estrés animal",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg
                        className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      <span className="text-gray-200">{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-yellow-400 font-semibold text-lg">
                  Son errores humanos prevenibles que están destruyendo tu
                  inversión genética.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}