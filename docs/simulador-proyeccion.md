# Simulador de Proyecto de Inversión Ganadera

Herramienta de proyección financiera a 5 años para operaciones ganaderas de cría usando tecnología IATF (Inseminación Artificial a Tiempo Fijo).

## Descripción General

El simulador genera proyecciones financieras completas incluyendo:
- Evolución del hato (inventario de ganado)
- Estado de resultados pro-forma
- Balance general
- Flujo de efectivo
- Tabla de amortización del crédito
- Métricas de inversión (VPN, TIR, ROI, Payback)

## Parámetros por Defecto

### Crédito
| Parámetro | Valor | Descripción |
|-----------|-------|-------------|
| Monto del Crédito | $5,474,227 | Auto-calculado: (ganado + infraestructura) / (1 - consultoría%) |
| Tasa de Interés | 17% | Tasa comercial anual |
| Plazo | 60 meses | 5 años |
| Período de Gracia | 6 meses | Sin pagos los primeros 6 meses |
| Enganche | 20% | Aportación del productor |

### Infraestructura
| Parámetro | Valor | Descripción |
|-----------|-------|-------------|
| Bodega | $200,000 | Bodega rústica 100m² |
| Manga de Manejo | $60,000 | Manga prefabricada básica |
| Oficina | $50,000 | Oficina básica |
| **Total** | **$310,000** | |

### Ganado
| Parámetro | Valor | Descripción |
|-----------|-------|-------------|
| Cantidad de Vacas | 100 | Vientres productivos |
| Costo por Vaca | $50,000 | Precio unitario |
| **Total Ganado** | **$5,000,000** | |

### Manejo del Hato
| Parámetro | Valor | Descripción |
|-----------|-------|-------------|
| Tasa de Parición | 85% | Usando IATF (sin toros) |
| Mortalidad Becerros | 4% | |
| Mortalidad Adultos | 2% | |
| Vaquillas Retenidas | 16 | Para reemplazo anual |
| Tasa de Desecho | 16% | Vacas vendidas por edad |
| % Machos | 50% | Distribución natural |

### Precios de Venta
| Parámetro | Valor | Descripción |
|-----------|-------|-------------|
| Becerro Macho | $70,000 | Por cabeza |
| Becerra Hembra | $40,000 | Por cabeza |
| Vaca de Desecho | $20,000 | Por cabeza |
| Inflación Anual | 4% | Incremento de precios |

### Costos de Operación
| Parámetro | Valor | Descripción |
|-----------|-------|-------------|
| Costo Variable/Vaca/Año | $4,500 | Alimento, veterinario, reproducción |
| Alimentación Becerro/Mes | $800 | Durante crianza |
| Nómina Mensual | $25,000 | 2 trabajadores + prestaciones |
| Servicios | $5,000/mes | Contabilidad, etc. |
| Viáticos | $3,000/mes | |
| Mantenimiento | $4,000/mes | |
| Servicios Públicos | $3,000/mes | Luz, agua |
| Seguro Anual | $50,000 | |
| Otros Fijos | $2,000/mes | |

### Consultoría
| Parámetro | Valor | Descripción |
|-----------|-------|-------------|
| Comisión | 3% | Del monto del crédito |

---

## Lógica de Negocio

### 1. Cálculo del Hato (Anual)

```
nacimientos = vacas × tasa_parición × (1 - mortalidad_becerros)
machos = nacimientos × 50%
hembras = nacimientos × 50%
hembras_vendidas = hembras - vaquillas_retenidas
```

### 2. Fórmula de Desecho Inteligente

El sistema mantiene el hato en el tamaño objetivo (cantidad inicial de vacas):

```
vacas_proyectadas = vacas_inicio + vaquillas_maduras - muertas
desecho = max(0, vacas_proyectadas - tamaño_objetivo)
desecho = min(desecho, vacas × tasa_desecho_max)
```

**Comportamiento por año:**
- **Años 1-2**: Sin desecho (no hay vaquillas maduras aún)
- **Año 3+**: Se desechan vacas solo si hay exceso sobre el objetivo

### 3. Cola de Maduración de Vaquillas

Las vaquillas retenidas tardan 2 años en madurar a vacas productivas:

| Año | Vaquillas Retenidas | Vaquillas que Maduran |
|-----|---------------------|----------------------|
| 1 | 16 | 0 |
| 2 | 16 | 0 |
| 3 | 16 | 16 (las del año 1) |
| 4 | 16 | 16 (las del año 2) |
| 5 | 16 | 16 (las del año 3) |

### 4. Cálculo de Ingresos

```
venta_becerros = (machos × precio_macho) + (hembras_vendidas × precio_hembra)
venta_desecho = vacas_desecho × precio_desecho
ingresos_totales = venta_becerros + venta_desecho
```

Los precios se incrementan anualmente según la tasa de inflación configurada.

### 5. Métricas Financieras

#### VPN (Valor Presente Neto)
```
VPN = Σ(flujo_año_t / (1 + tasa_descuento)^t)
```
- Tasa de descuento: 10%
- Si VPN > 0, el proyecto es viable

#### TIR (Tasa Interna de Retorno)
```
TIR = tasa donde VPN = 0
```
- Calculada con método Newton-Raphson
- Si TIR > costo de capital, el proyecto es rentable

#### Payback
```
Payback = primer año donde flujo_acumulado ≥ 0
```

#### ROI
```
ROI = (utilidad_total / inversión_inicial) × 100
```

---

## Arquitectura Técnica

### Archivos Principales

| Archivo | Propósito |
|---------|-----------|
| `types.ts` | Definición de tipos TypeScript |
| `defaults.ts` | Valores por defecto y rangos de validación |
| `herd-calculations.ts` | Cálculos de inventario del hato |
| `financial-calculations.ts` | Estados financieros pro-forma |
| `metrics.ts` | VPN, TIR, ROI, evaluación |
| `ranching-export.ts` | Exportación multi-hoja a Excel |
| `formula-definitions.ts` | Textos para tooltips educativos |

### Flujo de Datos

```
RanchingProjectionInput
        ↓
calculateHerdProjections() → YearlyHerdSnapshot[]
        ↓
calculateFinancialProjections() → YearlyFinancialStatement[]
        ↓
calculateMetrics() → ProjectionMetrics
        ↓
RanchingProjectionResult
        ↓
exportProjectionToXLSX() → archivo .xlsx
```

### Hojas del Excel Exportado

1. **Resumen** - KPIs y métricas principales
2. **Hato** - Evolución del inventario de ganado
3. **Estado de Resultados** - Ingresos, costos, utilidades
4. **Balance** - Activos, pasivos, capital
5. **Flujo de Efectivo** - Cash flow operativo, inversión, financiamiento
6. **Amortización** - Tabla de pagos del crédito
7. **Inversión** - Desglose de inversión inicial
8. **Parámetros** - Todos los inputs utilizados
9. **Glosario Fórmulas** - Explicación de cada cálculo

---

## Uso del Simulador

### Interfaz de Usuario

El simulador presenta tabs para navegar entre secciones:

1. **Resumen** - Vista general con métricas clave
2. **Hato** - Tabla con evolución anual del ganado
3. **Ingresos** - Estado de resultados simplificado
4. **Balance** - Balance general por año
5. **Flujo** - Flujo de efectivo
6. **Amortización** - Pagos del crédito
7. **Inversión** - Desglose de la inversión inicial

### Tooltips Educativos

Cada campo muestra un tooltip al hacer hover/click con:
- Nombre del campo
- Fórmula utilizada
- Descripción en español sencillo

### Exportación

El botón "Descargar Excel" genera un archivo con todas las proyecciones en formato profesional, listo para presentar a bancos o inversionistas.

---

## Validación de Parámetros

Todos los inputs tienen rangos de validación definidos en `defaults.ts`:

```typescript
PARAM_RANGES = {
  loan: {
    loanAmount: { min: 1_000_000, max: 20_000_000 },
    annualInterestRate: { min: 0, max: 50 },
    // ...
  },
  cattle: {
    numberOfCows: { min: 10, max: 1000 },
    costPerCow: { min: 10_000, max: 200_000 },
    // ...
  },
  // ...
}
```

---

## Notas Importantes

### IATF vs Monta Natural

Este simulador asume uso de IATF (Inseminación Artificial a Tiempo Fijo):
- **Sin toros** en el hato
- Costo de IATF incluido en `variableCostPerCowYear`
- Tasa de parición esperada: 85%

### Operación de Cría

El modelo es para operaciones de **cría** (venta de becerros):
- Precios por cabeza, no por kilo
- Becerros vendidos al destete (~6 meses)
- No incluye engorda

### Consideraciones Fiscales

- El modelo asume exención de ISR para productores primarios
- Consultar con contador para situación específica
