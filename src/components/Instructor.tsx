export function Instructor() {
  const credentials = [
    "Médico Veterinario Zootecnista (MVZ)",
    "Maestro en Ciencias en Producción Animal",
    "38 años de experiencia en reproducción bovina",
    "Especialista en ganado de carne extensivo",
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Instructor photo */}
            <div className="relative">
              <div className="aspect-[4/5] bg-gradient-to-br from-primary-100 to-earth-100 rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="/images/MVZ Manuel Henriquez 1.jpg"
                  alt="MVZ Manuel Henríquez Martínez realizando inseminación artificial"
                  className="w-full h-full object-cover object-center"
                />
              </div>

              {/* Experience badge */}
              <div className="absolute -bottom-6 -right-6 bg-primary-600 text-white p-6 rounded-2xl shadow-xl">
                <div className="text-4xl font-bold">38+</div>
                <div className="text-sm opacity-90">Años de Experiencia</div>
              </div>
            </div>

            {/* Content */}
            <div>
              <span className="inline-block px-4 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
                Tu Instructor
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                MVZ Manuel Henríquez Martínez
              </h2>
              <p className="text-xl text-primary-600 font-medium mb-6">
                Maestro en Ciencias en Producción Animal
              </p>

              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Con más de tres décadas dedicadas a la reproducción bovina, el
                MVZ Henríquez ha capacitado a cientos de ganaderos y
                veterinarios en las técnicas más efectivas de inseminación
                artificial. Su enfoque práctico y adaptado a las condiciones del
                campo mexicano garantiza resultados reales.
              </p>

              {/* Credentials list */}
              <div className="space-y-4 mb-8">
                {credentials.map((credential, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
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
                    </div>
                    <span className="text-gray-700">{credential}</span>
                  </div>
                ))}
              </div>

              {/* Quote */}
              <blockquote className="border-l-4 border-primary-500 pl-6 py-2">
                <p className="text-gray-700 italic text-lg">
                  &ldquo;Mi compromiso es que cada alumno salga del taller con
                  la confianza y habilidad para inseminar de forma independiente.
                  No se trata de dar diplomas, se trata de formar técnicos
                  competentes.&rdquo;
                </p>
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}