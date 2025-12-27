export function Workshop() {
  const days = [
    {
      day: "Día 1",
      title: "Fundamentos Teóricos",
      subtitle: "El 'Por Qué'",
      color: "primary",
      schedule: [
        {
          time: "08:00 - 08:30",
          title: "Registro y Examen Diagnóstico",
          description: "Evaluamos tu nivel actual para personalizar el aprendizaje",
        },
        {
          time: "08:30 - 10:30",
          title: "Anatomía y Fisiología Reproductiva",
          description: "Tracto reproductivo, dinámica folicular y ciclo estral",
        },
        {
          time: "11:00 - 13:30",
          title: "Farmacología y Protocolos",
          description: "GnRH, Prostaglandinas, Progesterona (CIDR/DIB)",
        },
        {
          time: "14:30 - 17:00",
          title: "Protocolos de Sincronización",
          description: "Co-Synch + CIDR paso a paso + Casos de Estudio",
        },
      ],
    },
    {
      day: "Día 2",
      title: "Práctica Supervisada",
      subtitle: "El 'Cómo'",
      color: "earth",
      schedule: [
        {
          time: "08:00 - 10:00",
          title: "Manejo del Semen y Equipo",
          description: "Cadena de frío, descongelación, armado de pistola",
        },
        {
          time: "10:30 - 13:30",
          title: "Práctica Intensiva en Manga",
          description: "Técnica recto-vaginal con vacas reales supervisada",
        },
        {
          time: "14:30 - 16:00",
          title: "Ecografía Básica + Selección",
          description: "Identificación de estructuras ováricas, CC y nutrición",
        },
        {
          time: "16:00 - 17:00",
          title: "Rentabilidad y Resincronización",
          description: "Análisis de casos exitosos y estrategias a 30 días",
        },
      ],
    },
    {
      day: "Día 3",
      title: "Evaluación y Certificación",
      subtitle: "La Prueba",
      color: "primary",
      schedule: [
        {
          time: "08:00 - 09:30",
          title: "Repaso General",
          description: "Resolución de dudas y revisión de conceptos clave",
        },
        {
          time: "09:30 - 10:30",
          title: "Examen Teórico Final",
          description: "20 preguntas, 100 puntos, mínimo 80% para aprobar",
        },
        {
          time: "11:00 - 14:00",
          title: "Examen Práctico Individual",
          description: "Cada alumno ejecuta IA completa evaluada en 10 criterios",
        },
        {
          time: "15:00 - 17:00",
          title: "Retroalimentación + Certificación",
          description: "Revisión de errores y entrega de diplomas",
        },
      ],
    },
  ];

  return (
    <section id="taller" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block px-4 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
            Programa del Taller
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            <span className="text-primary-600">3 Días</span> que Transformarán
            tu Operación
          </h2>
          <p className="text-lg text-gray-600">
            Un programa intensivo diseñado para que domines la técnica IATF de
            principio a fin.
          </p>
        </div>

        {/* Days grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {days.map((day, dayIndex) => (
            <div
              key={dayIndex}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300"
            >
              {/* Day header */}
              <div
                className={`p-6 ${
                  day.color === "primary"
                    ? "bg-gradient-to-r from-primary-600 to-primary-700"
                    : "bg-gradient-to-r from-earth-600 to-earth-700"
                } text-white`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium opacity-90">
                    {day.day}
                  </span>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                    {day.subtitle}
                  </span>
                </div>
                <h3 className="text-2xl font-bold">{day.title}</h3>
              </div>

              {/* Schedule */}
              <div className="p-6">
                <div className="space-y-6">
                  {day.schedule.map((item, itemIndex) => (
                    <div key={itemIndex} className="relative">
                      {itemIndex !== day.schedule.length - 1 && (
                        <div className="absolute left-[7px] top-8 bottom-0 w-0.5 bg-gray-200" />
                      )}
                      <div className="flex gap-4">
                        <div className="flex-shrink-0">
                          <div
                            className={`w-4 h-4 rounded-full ${
                              day.color === "primary"
                                ? "bg-primary-500"
                                : "bg-earth-500"
                            } ring-4 ring-white`}
                          />
                        </div>
                        <div className="flex-1 pb-2">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                            {item.time}
                          </span>
                          <h4 className="font-semibold text-gray-900 mt-1">
                            {item.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-12 text-center px-4">
          <div className="inline-flex flex-col sm:flex-row items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 sm:px-6 py-3 rounded-2xl sm:rounded-full">
            <svg
              className="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-medium text-sm sm:text-base text-center">
              Cada participante realizará múltiples inseminaciones supervisadas.
              Ratio instructor-alumno diseñado para atención personalizada.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}