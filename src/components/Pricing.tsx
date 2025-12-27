import { WhatsAppButton } from "./WhatsAppButton";

export function Pricing() {
  const included = [
    "3 días de capacitación intensiva",
    "Material didáctico y manual del estudiante",
    "Práctica con vacas reales en manga",
    "Examen teórico y práctico",
    "Certificado de aprobación (si apruebas)",
    "Acceso a grupo de WhatsApp de egresados",
    "Coffee breaks incluidos",
    "Asesoría post-taller por 30 días",
  ];

  const notIncluded = [
    "Hospedaje (podemos recomendar opciones cercanas)",
    "Transportación al rancho sede",
    "Comidas principales (hay opciones cerca)",
  ];

  return (
    <section id="inversion" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block px-4 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
            Inversión
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            No Gastes en Hormonas Si{" "}
            <span className="text-primary-600">No Inviertes en Técnica</span>
          </h2>
          <p className="text-lg text-gray-600">
            El costo del taller es menor que el valor de 2-3 becerros al
            destete. Es la decisión más rentable que tomarás este año.
          </p>
        </div>

        {/* Pricing card */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-8 text-center text-white">
              <h3 className="text-xl font-medium mb-2">
                Taller de Certificación IATF
              </h3>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl md:text-6xl font-bold">$5,500</span>
                <span className="text-xl opacity-90">MXN</span>
              </div>
              <p className="mt-2 text-primary-100">Por participante</p>
            </div>

            {/* Content */}
            <div className="p-8">
              {/* Included */}
              <div className="mb-8">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-primary-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                  Incluye:
                </h4>
                <ul className="space-y-3">
                  {included.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Not included */}
              <div className="mb-8 p-4 bg-gray-50 rounded-xl">
                <h4 className="font-medium text-gray-700 mb-3 text-sm">
                  No incluye (pero te ayudamos a organizar):
                </h4>
                <ul className="space-y-2">
                  {notIncluded.map((item, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-sm text-gray-600"
                    >
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="text-center">
                <WhatsAppButton
                  text="Reservar Mi Lugar Ahora"
                  size="lg"
                  message="Hola, quiero reservar mi lugar en el Taller de IATF. ¿Cuáles son las fechas disponibles?"
                  className="w-full"
                />
                <p className="mt-4 text-sm text-gray-500">
                  Cupo limitado a 12 participantes por grupo
                </p>
              </div>
            </div>

            {/* Urgency footer */}
            <div className="bg-yellow-50 border-t border-yellow-100 p-4 text-center">
              <p className="text-yellow-800 font-medium flex items-center justify-center gap-2">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Los lugares se agotan rápido. Reserva con anticipación.
              </p>
            </div>
          </div>

          {/* Value comparison */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              <span className="font-semibold text-gray-900">
                Piénsalo así:
              </span>{" "}
              Con solo 2-3 preñeces adicionales por temporada, el taller se paga
              solo.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}