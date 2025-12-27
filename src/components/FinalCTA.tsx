import { WhatsAppButton } from "./WhatsAppButton";

export function FinalCTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            ¿Listo Para Transformar tu Hato?
          </h2>

          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Inscríbete ahora y da el primer paso hacia la independencia
            reproductiva y la rentabilidad sostenible. Tu ganado y tu bolsillo
            te lo agradecerán.
          </p>

          {/* Key points */}
          <div className="flex flex-wrap justify-center gap-6 mb-10">
            {[
              { icon: "📍", text: "Durango, México" },
              { icon: "📅", text: "3 Días Intensivos" },
              { icon: "👥", text: "Máx. 12 Lugares" },
              { icon: "💰", text: "$5,500 MXN" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full"
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-white font-medium">{item.text}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <WhatsAppButton
              text="Inscribirme Ahora"
              size="lg"
              variant="solid"
              message="Hola, quiero inscribirme al Taller de IATF en Durango. ¿Cuáles son las próximas fechas y cómo puedo apartar mi lugar?"
              className="!bg-white !text-primary-700 hover:!bg-gray-100 shadow-xl"
            />
            <WhatsAppButton
              text="Solicitar Más Información"
              size="lg"
              variant="outline"
              message="Hola, me gustaría recibir más información sobre el Taller de IATF."
              className="!border-white !text-white hover:!bg-white/10"
            />
          </div>

          {/* Trust note */}
          <p className="mt-8 text-primary-200 text-sm">
            Respuesta en menos de 2 horas en horario laboral
          </p>
        </div>
      </div>
    </section>
  );
}