# Portal de Contratación

Landing page y motor de búsqueda interactivo de procesos de **contratación pública en Colombia**, que consolida **SECOP I** y **SECOP II** a través de la API Socrata (SoQL) de [datos.gov.co](https://www.datos.gov.co).

Construido con **Vite + React + TypeScript + Tailwind CSS**, componentes estilo **shadcn/ui** (Radix primitives), **TanStack Query** para caché/paginación y **Lucide** para iconografía.

---

## 🚀 Puesta en marcha

```bash
npm install
cp .env.example .env   # y completa tu App Token de Socrata
npm run dev            # http://localhost:5173
```

Scripts:

| Script            | Descripción                              |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Servidor de desarrollo (HMR)             |
| `npm run build`   | Type-check (`tsc -b`) + build de producción |
| `npm run preview` | Sirve el build de producción             |
| `npm run lint`    | Type-check sin emitir (`tsc --noEmit`)   |

---

## 🔑 Variables de entorno

Definidas en `.env` (ignorado por git). En una SPA pura las variables `VITE_*`
se embeben en el bundle; el App Token de Socrata es un token de *rate-limit*
para datos públicos, por lo que su exposición es aceptable.

```
VITE_SOCRATA_APP_TOKEN=...
VITE_SECOP_II_ENDPOINT=https://www.datos.gov.co/resource/p6dx-8zbt.json
VITE_SECOP_I_ENDPOINT=https://www.datos.gov.co/resource/f789-7hwg.json
```

---

## 🏛️ Arquitectura

```
src/
├── components/
│   ├── ui/              # Primitivos estilo shadcn (button, select, dialog…)
│   ├── layout/          # Navbar, Footer
│   ├── Hero.tsx         # Hero + barra de búsqueda universal
│   ├── HeroSearch.tsx   # Input con selector de fuente
│   ├── FilterDrawer.tsx # Panel de filtros (sidebar + drawer móvil)
│   ├── ProcessCard.tsx  # Tarjeta de proceso (tipado estricto)
│   ├── ProcessList.tsx  # Grid + skeletons + empty states + paginación
│   ├── Metrics.tsx      # Métricas / propuesta de valor
│   └── SearchDashboard.tsx
├── config/filters.ts    # Facetas: modalidades, estados, departamentos
├── hooks/               # useProcesses (React Query), useDebounce
├── lib/                 # cn, formateo COP/fechas, estado de filtros
├── services/secopService.ts  # Constructor de queries SoQL + normalización
└── types/secop.ts       # Contratos TypeScript (Raw* + UnifiedProcess)
```

### Capa de servicios (`secopService.ts`)

- `escSoql()` sanitiza literales de cadena SoQL (duplica comillas simples).
- `buildWhere()` arma `$where` dinámico por fuente usando un **mapa de campos**
  (los nombres de columna difieren entre SECOP I y II).
- `searchProcesses()` pagina con `$limit`/`$offset`; para la fuente **Todos**
  consulta ambas APIs en paralelo y combina por fecha de publicación.
- Las interfaces `RawSecopII` / `RawSecopI` se normalizan a `UnifiedProcess`,
  el modelo único que consume toda la UI.

### Motor de filtrado

Full-text (`$q`) + facetas: **modalidad**, **estado**, **rango de cuantía**
(COP), **departamento**, **UNSPSC/clase** y **rango de fechas**. Cada grupo
lógico (p. ej. «Selección Abreviada») expande a los valores crudos reales de
cada dataset, verificados contra `$select=distinct` en vivo.

---

## 🎨 Diseño

Paleta B2B / GovTech: azul institucional/marino (`--primary`), neutros slate y
acento esmeralda para estados abiertos. Tipografía Inter, mobile-first,
objetivos de accesibilidad WCAG AA (foco visible, roles, labels, contraste).

---

## ⚠️ Notas sobre los datos

- **SECOP II** (`p6dx-8zbt`) es a nivel de **proceso**; **SECOP I**
  (`f789-7hwg`) es a nivel de **contrato**, con otro esquema de columnas.
- Los valores y fechas provienen tal cual de Datos Abiertos; pueden contener
  registros incompletos. Esta herramienta es de **uso informativo no oficial**.
- Fuente y detalle oficial: enlace directo al proceso en cada tarjeta.
