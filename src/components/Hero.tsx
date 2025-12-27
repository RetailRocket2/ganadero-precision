import { WhatsAppButton } from "./WhatsAppButton";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/images/hero-bg.jpg')`,
        }}
      />
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/40" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-800 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-600"></span>
            </span>
            Próximo Taller en Durango
          </div>

          {/* Main headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 drop-shadow-lg">
            Transforma tu Hato:{" "}
            <span className="text-primary-400 block sm:inline">
              De la Vaca Vacía a la Rentabilidad Garantizada
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto px-2">
            Taller de Certificación Práctica en{" "}
            <strong className="text-white">Inseminación Artificial a Tiempo Fijo (IATF)</strong>.
            Aprende a inseminar tu propio ganado en{" "}
            <span className="text-primary-400 font-semibold">3 días intensivos</span>.
          </p>

          {/* Key benefits */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {[
              "100% Práctico",
              "Certificación Real",
              "Grupos Reducidos",
            ].map((benefit) => (
              <div
                key={benefit}
                className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm"
              >
                <svg
                  className="w-5 h-5 text-primary-600"
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
                <span className="font-medium text-gray-800">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <WhatsAppButton
              text="Reservar Mi Lugar"
              size="lg"
              pulse={true}
              message="Hola, quiero reservar mi lugar en el Taller de IATF en Durango."
            />
            <a
              href="#taller"
              className="inline-flex items-center gap-2 px-6 py-3 text-lg font-medium text-white/90 hover:text-white bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all"
            >
              Ver Programa Completo
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
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </a>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-sm text-gray-300 mb-4">
              Impartido por profesional con más de 38 años de experiencia
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-gray-300 text-sm sm:text-base">
              <div className="flex items-center gap-2">
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
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>Durango, México</span>
              </div>
              <div className="flex items-center gap-2">
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
                <span>3 Días Intensivos</span>
              </div>
              <div className="flex items-center gap-2">
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
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span>Máx. 12 Participantes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg
          className="w-6 h-6 text-white/60"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}