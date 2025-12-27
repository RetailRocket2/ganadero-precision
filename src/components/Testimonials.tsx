export function Testimonials() {
  const testimonials = [
    {
      name: "Roberto M.",
      location: "Sonora",
      quote:
        "Después del taller, mi tasa de preñez pasó de 45% a 62% en la siguiente temporada. La inversión se pagó sola. Ahora tengo el control de mi genética y ya no dependo de nadie.",
      result: "45% → 62% tasa de preñez",
    },
    {
      name: "María G.",
      location: "Veracruz",
      quote:
        "Pensé que sabía inseminar, pero el examen diagnóstico me mostró mis errores. Los instructores fueron pacientes y exigentes. La certificación tiene valor porque realmente te evalúan, no te regalan nada.",
      result: "Certificación con mérito",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block px-4 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
            Testimonios
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Ganaderos Como Tú Ya Lo{" "}
            <span className="text-primary-600">Lograron</span>
          </h2>
        </div>

        {/* Testimonials grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-gray-50 to-primary-50 rounded-2xl p-8 relative"
            >
              {/* Quote mark */}
              <div className="absolute top-6 left-6 text-6xl text-primary-200 font-serif leading-none">
                &ldquo;
              </div>

              <div className="relative">
                <p className="text-gray-700 text-lg leading-relaxed mb-6 pt-8">
                  {testimonial.quote}
                </p>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.location}
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                    {testimonial.result}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Guarantee banner */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
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
              </div>
            </div>
            <h3 className="text-xl md:text-2xl font-bold mb-3">
              Garantía de Calidad
            </h3>
            <p className="text-primary-100 max-w-2xl mx-auto">
              Si después de completar el taller y aplicar correctamente la
              técnica no ves mejora en tus resultados reproductivos, revisaremos
              tu caso sin costo adicional para identificar factores externos.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}