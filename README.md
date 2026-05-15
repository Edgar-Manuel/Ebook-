# EbookAI — Generador Automático de Ebooks con Claude

Una aplicación web full-stack que automatiza la creación de libros de no-ficción de alto valor para Amazon KDP usando Claude Opus 4.7, con optimizaciones de coste y calidad.

## 🎯 Qué hace

EbookAI te lleva desde una idea hasta un ebook completo en 8 pasos automatizados:

1. **Ideas** — Genera 5 ideas de libros rentables basadas en tu nicho + intereses
2. **Estructura** — Crea un índice de 9-12 capítulos con subtítulos
3. **Escritura** — Redacta cada capítulo con IA (streaming en tiempo real)
4. **Formato** — Prepara el manuscrito con márgenes exactos para KDP
5. **Portada** — Genera imagen de portada 1600×2560px con Google GenAI
6. **KDP Setup** — Guía paso a paso para publicar en Amazon
7. **Precios** — Estrategia de royalties y modelo de pricing
8. **Marketing** — Plan de lanzamiento + módulos A+ para Amazon

**Resultado:** `.docx` listo para Amazon KDP + portada JPG + contenido de marketing

## 📊 Coste real de producción

Con modelo **Equilibrado** (Sonnet 4.6 para escritura, Haiku para pasos rápidos):

- **Costo API por libro:** ~$0.30 - $0.50 (con prompt caching en capítulos 2-12)
- **Tiempo de producción:** 4-5 horas incluido diseño portada
- **ROI:** Un libro a $9.99 con 5 ventas/mes = $17.50/mes = 35x ROI anual

## 🚀 Inicio rápido

### Requisitos
- Node.js 18+
- Claves de API:
  - `ANTHROPIC_API_KEY` — [Claude API](https://console.anthropic.com/)
  - `GOOGLE_API_KEY` — [Google GenAI](https://aistudio.google.com/)
  - Base de datos PostgreSQL (opcional, para guardar libros en nube)

### Instalación

```bash
git clone <repo>
cd Ebook-

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Edita .env.local con tus claves API

# Iniciar en desarrollo
npm run dev
# Abre http://localhost:3000
```

### Variables de entorno

```env
# API Keys (requeridas)
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...

# Database (opcional)
NEXT_PUBLIC_INSFORGE_URL=https://...
NEXT_PUBLIC_INSFORGE_ANON_KEY=ik_...

# Modelos
NANO_BANANA_MODEL=gemini-3-pro-image-preview
```

## 💡 Cómo usar

### Flujo típico

1. **Selecciona un nicho** — Ej: "Finanzas personales para millennials"
2. **Tus intereses** — Lo que sabes sobre el tema
3. **Genera ideas** — La IA crea 5 propuestas con keywords para Amazon
4. **Elige una idea** — Click en "SELECCIONAR"
5. **Genera estructura** — Crea el índice de capítulos
6. **Escribe capítulos** — Streaming en tiempo real, uno por uno o todos a la vez
7. **Exporta** — Descarga `.docx` + imagen de portada
8. **Sube a KDP** — Usa el formulario Step 6 como guía

### Estrategias de coste

**Selector visual:** Elige entre 4 estrategias en el panel lateral:

- **Máxima Calidad** — Opus 4.7 + thinking adaptativo (más lento, mejor texto)
- **Equilibrado** — Sonnet 4.6 + thinking en escritura (recomendado)
- **Económico** — Sonnet 4.6 sin thinking (35% más barato)
- **Ultra Presupuesto** — Haiku todo (75% más barato, calidad reducida)
- **Custom** — Elige modelo por paso

Cada estrategia muestra:
- Coste estimado mensual (100 libros, 12 capítulos/libro)
- Ahorro vs máxima calidad
- Modelos asignados por paso

## 📚 Arquitectura

```
src/
├── app/
│   ├── page.tsx          — Componente wizard principal (2,337 líneas)
│   ├── layout.tsx        — Root layout + metadata
│   └── api/
│       ├── generate/     — Endpoint de streaming para escritura
│       ├── cover/        — Generación de portadas con Google GenAI
│       ├── marketing/    — Módulos A+ (imágenes 1940x1200)
│       └── export/       — Exportar a .docx
├── lib/
│   ├── prompts.ts        — Prompts de los 8 pasos
│   ├── docx-generator.ts — Construcción de archivos Word
│   ├── postprocess.ts    — Limpieza de texto (anulación de markdown)
│   └── niches.ts         — Base de datos de nichos de KDP
├── components/
│   ├── CostOptimizer.tsx — Selector de estrategias
│   └── NicheRoulette.tsx — Generador random de nichos
├── types/
│   └── index.ts          — Interfaces TypeScript
└── globals.css           — Estilos Tailwind + custom eb-* colors
```

### Stack técnico

- **Frontend:** React 18 + Next.js 14 App Router + TypeScript
- **Styling:** Tailwind CSS 3.4 + tema navy+oro (eb-* custom colors)
- **API:** Streaming SSE, prompt caching de Anthropic
- **Base de datos:** InsForge (PostgreSQL) — opcional
- **Imagen:** Google GenAI (Nano Banana Pro) + Sharp para resize
- **DOCX:** Librería `docx` para generación de Word

## 🎨 Tema de color (Tailwind)

```css
eb-bg: #05080f (navy profundo)
eb-surface: #0d1117 (más claro)
eb-gold: #c8963a (oro principal)
eb-gold-lt: #e8b85a (oro claro)
eb-text: #e8e8e8 (blanco suave)
eb-muted: #7a8a9b (gris medio)
```

Aplicar a cualquier elemento: `className="text-eb-gold bg-eb-surface"`

## 🔧 Desarrollo

### Comando útiles

```bash
npm run dev          # Dev con hot-reload en :3000
npm run build        # Build para producción
npm start            # Servir build generado
npm run lint         # ESLint

# Deploy a Vercel
vercel deploy
```

### Agregar un nuevo paso al wizard

1. Añade nuevo número en `type Step = 1 | 2 | ... | 8 | 9`
2. Crea el prompt en `lib/prompts.ts` → función `getPrompt(step, data)`
3. Añade endpoint en `app/api/` si necesita generar contenido
4. Modifica `page.tsx` → agrega controles en Step 9 dentro del switch
5. Actualiza constante `STEPS` con título y descripción

### Modificar un prompt

1. Abre `src/lib/prompts.ts`
2. Busca `case X:` del paso que quieres cambiar
3. Edita el string del prompt (variables como `${data.niche}` se reemplazan)
4. Los cambios aplican inmediatamente en desarrollo

## 📱 Responsive design

- **Móvil (< 1024px):** Sidebar colapsable como overlay, hamburger menu
- **Tablet (1024px+):** Sidebar fijo 240px
- **Desktop (1280px+):** Grid 3-columnas completo

Breakpoint Tailwind: `lg:`

## 🔐 Seguridad

### ⚠️ Nota importante

**InsForge Anon Key:** La aplicación usa una clave anónima para acceso público a BD. En producción, implementa:

1. Autenticación de usuarios (Clerk, NextAuth, Auth0)
2. Row-level security en PostgreSQL
3. Proxy server-side para todas las operaciones DB

**API Keys:**
- Almacena en `.env.local` (gitignored)
- Nunca las commits
- Rota periódicamente
- Usa Vercel Secrets para producción

### Validación de entrada

- Todos los prompts escapan valores de usuario
- Paso 1 rechaza títulos con nombres de marcas/celebridades
- No hay riesgo de SQL injection (SDK de InsForge parameteriza)

## 📈 Escalado

### Para 100+ libros/mes

1. **Batch generation:** Cola de trabajos (Bull, RabbitMQ)
2. **Rate limiting:** Implementa límite de tokens/usuario/día
3. **Caching:** Redis para cachear prompts cacheados
4. **Async jobs:** Procesa generaciones como background workers

### Métricas recomendadas

- Tracking con PostHog o Mixpanel (gratis hasta 1M eventos/mes)
- CloudWatch para logs
- Sentry para error tracking

## 📚 Guía de prompts KDP

### Prompt 1: Investigación de nicho

```
Analiza el nicho de "[TEMA]" para [TIPO].
Extrae las 5 subcategorías + 10 long-tail keywords
+ perfil de comprador
```

Palabras clave que funcionan:
- "Cómo..." (problem-solving)
- "Guía de..." (authority)
- "30 días para..." (urgency)

### Prompt 3: Escritura de capítulos

Utiliza `adaptive thinking` con `effort: xhigh` para:
- Coherencia narrativa
- Validación de reglas de tono
- Profundidad de ejemplos

## 🚀 Deployment

### Vercel (recomendado)

```bash
vercel deploy
```

Automáticamente:
- Detecta Next.js
- Crea build optimizado
- Despliega en CDN global

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t ebook-ai .
docker run -p 3000:3000 -e ANTHROPIC_API_KEY=... ebook-ai
```

## 🐛 Troubleshooting

### "ANTHROPIC_API_KEY is not defined"
Verifica que está en `.env.local` y reinicia el servidor (`npm run dev`)

### "La portada no se genera"
- Confirma que `GOOGLE_API_KEY` es válido
- Comprueba cuota de Google GenAI (gratis: 60 req/min)
- Ve a `/api/cover` logs para ver el error exacto

### "El libro se corta en el Step 3"
Sube `maxTokens` en Step 3 en `CostOptimizer` o dentro de `page.tsx` línea 172

### "Streaming se congela"
Timeout de Edge Runtime (Vercel): 25 segundos. Para libros muy largos, usa Node.js runtime en `api/generate` (añade `export const runtime = 'nodejs'`)

## 📖 Referencias

- [Anthropic Claude API Docs](https://docs.anthropic.com/)
- [Amazon KDP Guidelines](https://kdp.amazon.com/en_US/help/topic/A1PF2QZGFZQ0RJ)
- [Next.js 14 Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/)

## 📄 Licencia

Código de ejemplo — úsalo libremente. Los ebooks generados son 100% tuyos.

## 💬 Soporte

Preguntas o issues:
- Revisa `/src/lib/prompts.ts` para cambiar contenido generado
- Sube `maxTokens` en `CostOptimizer` si el contenido se trunca
- Experimenta con diferentes nichos — algunos generan contenido mejor que otros

---

**Última actualización:** Mayo 2026 | **Versión:** 2.0 (Opus 4.7 optimizado)
