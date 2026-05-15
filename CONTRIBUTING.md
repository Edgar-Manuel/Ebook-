# Guía de Contribución — EbookAI

Instrucciones para extender la app y agregar nuevas características.

## Estructura de carpetas

```
src/
├── app/
│   ├── page.tsx          ← Componente React principal (wizard)
│   ├── layout.tsx        ← HTML root + metadata
│   ├── globals.css       ← Estilos globales
│   └── api/              ← Endpoints Next.js
│       ├── generate/route.ts    — POST /api/generate (streaming)
│       ├── cover/route.ts       — POST /api/cover (portadas)
│       ├── marketing/route.ts   — POST /api/marketing (A+ content)
│       ├── export/route.ts      — POST /api/export (DOCX)
│       └── migrate/route.ts     — GET /api/migrate (schema)
├── lib/
│   ├── prompts.ts        ← Prompts de los 8 pasos (657 líneas)
│   ├── docx-generator.ts ← Generación de archivos .docx (543 líneas)
│   ├── postprocess.ts    ← Limpieza de texto (134 líneas)
│   ├── niches.ts         ← Base de datos de nichos (188 líneas)
│   └── insforge.ts       ← Cliente de BD (9 líneas)
├── components/
│   ├── CostOptimizer.tsx ← Selector de modelos (442 líneas)
│   └── NicheRoulette.tsx ← Spinner de nicho aleatorio (138 líneas)
├── types/
│   └── index.ts          ← Interfaces TypeScript (68 líneas)
└── public/               ← Favicon, assets estáticos
```

## Agregar un nuevo paso al wizard

### Paso 1: Actualizar el tipo Step

```typescript
// src/types/index.ts
export type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;  // ← Add 9
```

### Paso 2: Crear el prompt

```typescript
// src/lib/prompts.ts
export function getPrompt(step: number, data: Partial<BookData>): PromptParts {
  switch (step) {
    // ...
    case 9:
      return { user: `Actúa como un experto en [tema]...
      
      Datos del libro:
      - Título: ${data.selectedIdea?.title}
      - Contenido: ${data.formattedContent}
      
      Genera: [lo que quieras]` };
  }
}
```

### Paso 3: Agregar endpoint si es necesario

```typescript
// src/app/api/my-feature/route.ts
export const runtime = 'nodejs'; // o 'edge'

export async function POST(req: Request) {
  const { step, data } = await req.json();
  
  // Tu lógica aquí
  
  return new Response(JSON.stringify({ result: '...' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

### Paso 4: Agregar UI en page.tsx

```typescript
// src/app/page.tsx
{step === 9 && (
  <div className="space-y-3">
    <label className="text-eb-muted text-xs font-medium mb-1.5 block">
      Tu input
    </label>
    <input
      type="text"
      value={bookData.myField}
      onChange={(e) => setBookData((p) => ({ ...p, myField: e.target.value }))}
      className="w-full px-3 py-2 bg-eb-surface-2 border border-eb-border rounded-lg text-eb-text focus:outline-none focus:ring-2 focus:ring-eb-gold"
      placeholder="Ej: My value"
    />
    <button
      onClick={() => generate()}
      className="w-full px-4 py-2 bg-eb-gold hover:bg-eb-gold-lt text-[#0a0600] rounded-lg font-medium transition-colors border-none cursor-pointer"
    >
      Generar
    </button>
  </div>
)}
```

### Paso 5: Agregar a la lista STEPS

```typescript
// src/app/page.tsx (línea ~1092)
const STEPS = [
  // ...
  { number: 9, title: 'Mi Feature', sub: 'Descripción', desc: 'Más detalles' }
];
```

## Modificar un prompt

### Ubicación

`src/lib/prompts.ts` → función `getPrompt(step, data)`

### Variables disponibles

```typescript
// Todos los pasos tienen acceso a esto:
data.niche              // String: "Finanzas personales"
data.interests          // String: "Ahorro, inversión"
data.authorName         // String: "Tu nombre"
data.selectedIdea       // BookIdea | null
  .title
  .subtitle
  .description
  .targetAudience
  .amazonKeywords

// Steps posteriores además tienen:
data.outline            // String: índice con capítulos
data.chapters           // Chapter[]
data.writtenChapters    // Record<number, string>: capítulos ya escritos
data.formattedContent   // String: manuscrito formateado
data.coverDesign        // String: prompt de portada
data.coverImage         // String: base64 JPEG
data.kdpSetup           // String: guía de KDP
data.pricingStrategy    // String: estrategia de precios
data.marketingContent   // String: plan de marketing
```

### Ejemplo: Cambiar el prompt de Step 1

```typescript
// Antes
case 1:
  return { user: `Actúa como experto en KDP...` };

// Después
case 1:
  return { user: `Actúa como super experto en KDP...
  
  Genera 10 ideas en vez de 5.
  Incluye análisis de tendencias de 2026.
  ` };
```

## Agregar una estrategia de coste

### Ubicación

`src/components/CostOptimizer.tsx` → línea ~90

### Estructura

```typescript
const STRATEGIES = [
  // Existentes...
  {
    id: 'mi-estrategia',
    title: 'Mi Estrategia',
    description: 'Descripción',
    color: 'eb-gold',      // Usa cualquier color Tailwind custom
    badge: 'Ahorro -50%',
    steps: {
      1: { model: 'haiku-4.5', thinking: false },
      2: { model: 'sonnet-4.6', thinking: false },
      3: { model: 'opus-4.7', thinking: true },
      // ... hasta step 8
    },
  },
];
```

### Calcular el ahorro

```typescript
const totalCost = calcCost(s.steps, chaptersPerBook, ebooksPerMonth);
const baseCost = calcCost(STRATEGIES[0].steps, chaptersPerBook, ebooksPerMonth);
const savings = ((1 - totalCost / baseCost) * 100).toFixed(0);
```

## Cambiar el color del tema

### Ubicación

`tailwind.config.js` → `theme.extend.colors`

### Paleta actual (navy + oro)

```javascript
'eb-bg': '#05080f',        // Navy profundo
'eb-surface': '#0d1117',   // Navy más claro
'eb-surface-2': '#16212f', // Navy aún más claro
'eb-gold': '#c8963a',      // Oro principal
'eb-gold-lt': '#e8b85a',   // Oro claro
'eb-gold-dim': '#8b6f47',  // Oro oscuro
'eb-text': '#e8e8e8',      // Blanco suave
'eb-muted': '#7a8a9b',     // Gris medio
'eb-muted-2': '#36485e',   // Gris oscuro
'eb-green': '#3a9e76',     // Verde para checkmarks
'eb-border': '#1f2937',    // Borde oscuro
'eb-border-2': '#2d3748',  // Borde más claro
```

Para cambiar:
```javascript
'eb-gold': '#FF6B35',      // Nuevo color
'eb-gold-lt': '#FF8A50',
'eb-gold-dim': '#CC5629',
```

Luego usa: `className="text-eb-gold bg-eb-surface"`

## Agregar logging o telemetría

### Opción 1: Console (desarrollo)

```typescript
console.log('Mi evento:', { step, niche: data.niche });
```

### Opción 2: PostHog (recomendado)

```bash
npm install posthog-js
```

```typescript
// src/lib/analytics.ts
import { PostHog } from 'posthog-js';

export const posthog = new PostHog(
  process.env.NEXT_PUBLIC_POSTHOG_KEY || '',
  { api_host: 'https://us.posthog.com' }
);

// Uso
posthog.capture('book_generated', {
  niche: data.niche,
  step_completed: step,
  time_taken_seconds: Date.now() - startTime
});
```

### Opción 3: Sentry (error tracking)

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

## Testing

### Unit test (ejemplo: postprocess.ts)

```bash
npm install --save-dev jest @types/jest ts-jest
```

```typescript
// src/lib/__tests__/postprocess.test.ts
import { removeMarkdown } from '../postprocess';

describe('postprocess', () => {
  it('debe remover markdown', () => {
    const input = '**bold** *italic* [link](url)';
    const expected = 'bold italic link';
    expect(removeMarkdown(input)).toBe(expected);
  });
});
```

### E2E test (Playwright)

```bash
npm install --save-dev @playwright/test
```

```typescript
// e2e/full-flow.spec.ts
import { test, expect } from '@playwright/test';

test('generar un libro completo', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Step 1: Ideas
  await page.fill('[placeholder="Nicho"]', 'Finanzas personales');
  await page.click('text=Generar Ideas');
  await page.waitForText('Idea 1:');
  
  // Step 2: Estructura
  await page.click('text=SELECCIONAR');
  // ... continua
});
```

## Performance

### Medir bundle size

```bash
npm install --save-dev @next/bundle-analyzer
```

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({ /* ... */ });
```

```bash
ANALYZE=true npm run build
```

### Optimizar prompts

- Reduce tokens innecesarios en prompts
- Usa prompt caching (`cache_control: { type: 'ephemeral' }`)
- Batch múltiples capítulos con uma sola llamada (no implementado)

## Debugging

### Logs de API

```typescript
// src/app/api/generate/route.ts
console.log('Incoming request:', { step, modelId });
console.log('Prompt length:', promptParts.user.length);
```

Ver en:
- Local: Terminal where `npm run dev` runs
- Vercel: `vercel logs` or web dashboard

### Network inspector (browser DevTools)

1. Abre DevTools (F12)
2. Tab "Network"
3. Filtra por `/api/generate`
4. Haz click en el request
5. Tab "Response" para ver el streaming

### State debugging

```typescript
useEffect(() => {
  console.log('bookData updated:', bookData);
}, [bookData]);
```

## Mejores prácticas

### 1. Inputs siempre validados

```typescript
// ❌ Evitar
const niche = userInput;
const prompt = `Analiza el nicho de ${niche}`;

// ✅ Hacer
if (!niche || niche.length > 100) throw new Error('Invalid niche');
if (!/^[a-zA-Z0-9\s,áéíóú-]+$/.test(niche)) throw new Error('Invalid chars');
```

### 2. Errores descriptivos

```typescript
// ❌ Evitar
throw new Error('Failed');

// ✅ Hacer
throw new Error(`Step 3 failed: No chapters generated for "Capítulo 5". Prompt: ${prompt.slice(0, 100)}...`);
```

### 3. Componentes pequeños

```typescript
// ❌ Evitar: 2000 líneas en un componente
export default function Wizard() { /* 2000 líneas */ }

// ✅ Hacer: Separar en subcomponentes
function StepCard() { /* 200 líneas */ }
function ControlPanel() { /* 300 líneas */ }
function ContentDisplay() { /* 300 líneas */ }
export default function Wizard() { /* 100 líneas */ }
```

### 4. Tipos explícitos

```typescript
// ❌ Evitar
const data = { title: 'Hola', ideas: [] };

// ✅ Hacer
const data: BookData = {
  niche: '',
  interests: '',
  // ... todas las props
};
```

## Checklist para PR

- [ ] Los cambios están en una rama feature: `feature/mi-feature`
- [ ] `npm run lint` pasa sin warnings
- [ ] `npm run build` construye sin errores
- [ ] TypeScript strict: `npx tsc --noEmit` pasa
- [ ] Probaste en móvil (sidebar responsivo)
- [ ] Documentaste cambios en este archivo
- [ ] Actualizaste README.md si aplica
- [ ] Sin hardcoded env vars o API keys

## Preguntas frecuentes

**P: ¿Cómo cambio el modelo de Step 1?**
R: En `CostOptimizer.tsx`, encuentra `STRATEGIES` y modifica el `model` para `step: 1`.

**P: ¿Dónde agrego datos persistentes?**
R: `InsForge.ts` conecta a PostgreSQL. Agrega tablas en schema.

**P: ¿Cómo hago streaming de contenido?**
R: `api/generate/route.ts` es un ejemplo. Usa `ReadableStream` + `text/event-stream`.

**P: ¿El app soporta múltiples usuarios?**
R: Actualmente no. Necesitas agregar autenticación (NextAuth, Clerk) + row-level security en BD.

---

¿Preguntas? Abre un issue o contacta al team.
