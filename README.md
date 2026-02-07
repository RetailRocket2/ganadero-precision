# Ganadero de Precisión

Landing page y herramientas financieras para Ganadero de Precisión - Consultoría especializada en ganadería con tecnología IATF (Inseminación Artificial a Tiempo Fijo).

## Características

- **Landing Page** - Promoción de talleres de certificación en IATF
- **Simulador de Crédito Ganadero** - Calculadora de financiamiento para proyectos ganaderos
- **Simulador de Proyecto de Inversión** - Proyección financiera completa a 5 años para operaciones ganaderas

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Estilos**: Tailwind CSS 4
- **Lenguaje**: TypeScript
- **Deploy**: Vercel

## Desarrollo Local

```bash
# Instalar dependencias
pnpm install

# Iniciar servidor de desarrollo
pnpm dev

# Build de producción
pnpm build
```

## Estructura del Proyecto

```
src/
├── app/                          # Rutas de Next.js (App Router)
│   ├── page.tsx                  # Landing page principal
│   ├── simulador-credito/        # Simulador de crédito
│   └── simulador-proyeccion/     # Simulador de inversión
├── components/
│   ├── Hero.tsx                  # Hero section con CTAs
│   ├── ranching-projection/      # Componentes del simulador
│   │   └── RanchingSimulator.tsx # Simulador principal
│   └── ui/                       # Componentes reutilizables
└── lib/
    └── ranching-projection/      # Lógica del simulador
        ├── types.ts              # Tipos TypeScript
        ├── defaults.ts           # Parámetros por defecto
        ├── herd-calculations.ts  # Cálculos del hato
        ├── financial-calculations.ts
        ├── metrics.ts            # VPN, TIR, ROI
        ├── ranching-export.ts    # Exportación a Excel
        └── formula-definitions.ts # Definiciones para tooltips
```

## Documentación

- [Simulador de Proyecto de Inversión](docs/simulador-proyeccion.md) - Documentación técnica y de negocio

## URLs

- **Producción**: https://ganadero-precision.vercel.app
- **Simulador de Crédito**: /simulador-credito
- **Simulador de Proyección**: /simulador-proyeccion

## Licencia

Privado - Ganadero de Precisión
