"use client";

import { useState } from "react";

const faqs = [
  {
    question: "¿Necesito ser veterinario para tomar el taller?",
    answer:
      "No. El taller está diseñado tanto para veterinarios como para ganaderos y técnicos que quieran aprender a inseminar su propio ganado. Lo importante es el compromiso de aprender y practicar.",
  },
  {
    question: "¿Necesito experiencia previa en inseminación?",
    answer:
      "No es necesario. Comenzamos desde los fundamentos y avanzamos progresivamente. Tanto principiantes como personas con algo de experiencia pueden beneficiarse del taller.",
  },
  {
    question: "¿Cuántas vacas voy a inseminar durante el taller?",
    answer:
      "Cada participante realizará múltiples inseminaciones supervisadas. El número exacto depende del tamaño del grupo, pero garantizamos que cada alumno practique lo suficiente hasta sentirse seguro con la técnica.",
  },
  {
    question: "¿Qué pasa si no apruebo el examen?",
    answer:
      "Recibirás retroalimentación detallada sobre tus áreas de mejora. Puedes repetir la evaluación en una fecha posterior sin costo adicional de inscripción, solo cubriendo gastos operativos mínimos.",
  },
  {
    question: "¿El certificado tiene validez oficial?",
    answer:
      "El certificado avala que completaste el entrenamiento y aprobaste las evaluaciones con un mínimo del 80%. Es reconocido en el sector ganadero como evidencia de capacitación práctica real.",
  },
  {
    question: "¿Qué debo llevar al taller?",
    answer:
      "Ropa cómoda de campo, botas de trabajo, gorra o sombrero, y bloqueador solar. Nosotros proporcionamos todo el equipo técnico: guantes, pipetas, semen de práctica, etc.",
  },
  {
    question: "¿Puedo pagar en parcialidades?",
    answer:
      "Sí, ofrecemos facilidades de pago. Contáctanos por WhatsApp para conocer las opciones disponibles y apartar tu lugar con un anticipo.",
  },
  {
    question: "¿Dónde exactamente se realiza el taller?",
    answer:
      "El taller se realiza en un rancho sede en Durango con instalaciones adecuadas: manga de compresión, corral techado y ganado disponible para práctica. Los detalles exactos de ubicación se envían al confirmar tu inscripción.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block px-4 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Preguntas <span className="text-primary-600">Frecuentes</span>
          </h2>
          <p className="text-lg text-gray-600">
            Resolvemos tus dudas antes de que las tengas.
          </p>
        </div>

        {/* FAQ accordion */}
        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-100"
              >
                <button
                  onClick={() =>
                    setOpenIndex(openIndex === index ? null : index)
                  }
                  className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-gray-100 transition-colors"
                >
                  <span className="font-semibold text-gray-900">
                    {faq.question}
                  </span>
                  <svg
                    className={`w-5 h-5 text-primary-600 flex-shrink-0 transition-transform duration-300 ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === index ? "max-h-96" : "max-h-0"
                  }`}
                >
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* More questions CTA */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              ¿Tienes otra pregunta? Escríbenos directamente.
            </p>
            <a
              href="https://wa.me/526183199966?text=Hola%2C%20tengo%20una%20pregunta%20sobre%20el%20Taller%20de%20IATF."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Enviar pregunta por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}