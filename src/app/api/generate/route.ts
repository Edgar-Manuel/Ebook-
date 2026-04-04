import Anthropic from '@anthropic-ai/sdk';
import type { MessageCreateParamsStreaming } from '@anthropic-ai/sdk/resources/messages';
import { getPrompt } from '@/lib/prompts';
import type { BookData } from '@/types';

export const runtime = 'edge';

const client = new Anthropic();

// Map shorthand model IDs (from CostOptimizer) to full Anthropic model IDs
const MODEL_ID_MAP: Record<string, string> = {
  'opus-4.6':   'claude-opus-4-6',
  'sonnet-4.6': 'claude-sonnet-4-6',
  'sonnet-4.5': 'claude-sonnet-4-5',
  'haiku-4.5':  'claude-haiku-4-5-20251001',
  'haiku-3.5':  'claude-haiku-4-5-20251001', // retired — fallback to haiku 4.5
};

// Only these models support adaptive thinking
const SUPPORTS_THINKING = new Set(['opus-4.6', 'sonnet-4.6']);

// Smart model routing: assign each step the right model for cost/quality
const STEP_CONFIG: Record<
  number,
  { model: string; maxTokens: number; useThinking: boolean }
> = {
  1: { model: 'claude-haiku-4-5-20251001', maxTokens: 2000, useThinking: false },
  2: { model: 'claude-sonnet-4-6', maxTokens: 8000, useThinking: false },
  3: { model: 'claude-sonnet-4-6', maxTokens: 8192, useThinking: true },
  4: { model: 'claude-haiku-4-5-20251001', maxTokens: 2500, useThinking: false },
  5: { model: 'claude-haiku-4-5-20251001', maxTokens: 3000, useThinking: false },
  6: { model: 'claude-sonnet-4-6', maxTokens: 8192, useThinking: false },
  7: { model: 'claude-sonnet-4-6', maxTokens: 8192, useThinking: false },
  8: { model: 'claude-sonnet-4-6', maxTokens: 8192, useThinking: false },
};

interface ModelConfig {
  assignments: Record<number, string>;
  thinking: Record<number, boolean>;
  maxTokens: Record<number, number>;
}

const SYSTEM_PROMPT = `Eres un escritor profesional de libros de no-ficción en español para Amazon Kindle. Escribes capítulos completos, pulidos y listos para publicar sin edición posterior.

REGLAS ABSOLUTAS DE FORMATO:
1. IDIOMA: Todo en español. NUNCA inglés, placeholders ni secciones vacías.
2. GUIONES: Para incisos usa SIEMPRE guión simple (-). NUNCA em-dash (—) ni dobles guiones (--). Ejemplo: "algo -como esto- dentro de la frase".
3. PÁRRAFOS: Máximo 4-5 líneas. SIN sangría de primera línea (no ficción). Espacio entre párrafos.
4. NEGRITA: Solo títulos, nombres de técnicas y labels de listas. NUNCA palabras sueltas en texto narrativo.
5. CURSIVA: Solo títulos de obras, palabras en otro idioma, diálogo interno del lector.
6. LISTAS: "- " (guión simple + espacio) como viñeta.
7. SEPARADORES: "---" en línea propia entre secciones.
8. SIN DUPLICADOS: Nunca repitas títulos ni frases consecutivas.
9. ESTRUCTURA: Abre con gancho (pregunta/escena/afirmación). Cierra con transición o ejercicio.
10. TONO: Directo, conversacional, tutea al lector.
11. TEXTO JUSTIFICADO.

REGLAS DE GÉNERO INCLUSIVO (OBLIGATORIO):
- El libro se dirige TANTO a hombres como a mujeres de 20 a 45 años.
- SIEMPRE usa formas inclusivas: "tú mismo/a", "solo/a", "seguro/a", "preparado/a".
- Cuando sea posible, reformula para evitar la barra: "recuperar tu autenticidad" en vez de "ser tú mismo/a".
- NUNCA uses femenino exclusivo ("tú misma", "segura", "sola") ni masculino exclusivo ("tú mismo", "seguro", "solo") cuando te diriges al lector.
- En ejemplos concretos, alterna: a veces "tu pareja" (neutro), a veces "tu novio", a veces "tu novia". A veces "tu jefe", a veces "tu jefa". Que el lector vea que el libro habla de su realidad independientemente de su género.
- Los ejercicios prácticos también deben ser inclusivos: "Escribe una frase que te decían frecuentemente" en vez de "Cuando era niña, yo sabía que..."

REGLA DE ENFOQUE EN EL PRESENTE (CRÍTICA - NO en la infancia):
- El público son adultos de 20 a 45 años que viven el problema AHORA.
- El FOCO del libro es el presente: relaciones actuales, trabajo actual, vida diaria actual.
- La infancia puede mencionarse como origen de un patrón UNA SOLA VEZ EN TODO EL LIBRO, y solo si es estrictamente necesario. Si puedes explicar el patrón sin mencionar la infancia, no la menciones.
- NUNCA abras un capítulo con una escena de infancia. Abre con una situación que el lector adulto reconozca HOY: una discusión de pareja, una situación en el trabajo, un momento con amigos, una reacción que tuvo esta semana.
- NUNCA uses frases como "cuando eras pequeño/a", "tu cerebro infantil", "en tu infancia", "a los cinco años", "antes que el alfabeto". Este libro NO trata sobre la niñez. Trata sobre la vida adulta.
- NUNCA abras ni cierres un capítulo con un ejercicio que pida al lector recordar su infancia. Los ejercicios deben referirse al PRESENTE: "Piensa en tu última semana. ¿En qué momento te callaste algo que querías decir?"
- Transforma TODA referencia de infancia en referencia de presente:
  × "Cuando eras pequeño/a y tu padre te ignoraba" → ✓ "Cuando tu pareja te ignora después de una discusión"
  × "Tu madre te decía que eras demasiado sensible" → ✓ "¿Cuántas veces esta semana alguien te dijo que exagerabas?"
  × "Aprendiste de niño/a que tus emociones eran un problema" → ✓ "Hoy sigues tragándote lo que sientes para no 'molestar' a nadie"
- Si necesitas explicar el ORIGEN de un patrón, hazlo breve y abstracto: "Ese patrón se instaló hace mucho tiempo, probablemente antes de que pudieras cuestionarlo" y pasa inmediatamente al presente. NO desarrolles la escena de infancia.

REGLA DE DIFERENCIACIÓN CON "EL PATRÓN QUE NO VES":
- Este es un libro DIFERENTE al anterior. No debe sentirse como una versión 2.0 del mismo libro.
- "El Patrón Que No Ves" se centraba en patrones relacionales y apego. Los nuevos libros se centran en narcisismo y recuperación de identidad.
- Evita repetir la misma estructura narrativa: NO abras con "hay algo que nadie te enseñó a ver". NO cierres con "el patrón dejó de ser invisible".
- El tono puede ser similar (directo, conversacional) pero los ejemplos, escenarios y herramientas deben ser DISTINTOS.

ESTRUCTURA DEL LIBRO:
- Portada interior (título, subtítulo, autor)
- Copyright (© Año, autor, derechos reservados)
- Nota importante (disclaimer: no sustituye terapia profesional)
- Índice (cada sección UNA SOLA VEZ)
- Capítulos
- "Tu Opinión Importa" (CTA reseña Amazon, 3-4 líneas)`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { step, data, modelConfig }: {
      step: number;
      data: Partial<BookData>;
      modelConfig?: ModelConfig;
    } = body;

    // Build step config: use modelConfig overrides when provided
    let config = STEP_CONFIG[step];
    if (modelConfig?.assignments?.[step]) {
      const shortId = modelConfig.assignments[step];
      const fullModelId = MODEL_ID_MAP[shortId] ?? shortId;
      const useThinking = SUPPORTS_THINKING.has(shortId) && !!(modelConfig.thinking?.[step]);
      
      let maxTokens = modelConfig.maxTokens?.[step] ?? STEP_CONFIG[step]?.maxTokens ?? 3000;

      // Enforce minimum tokens for content-heavy steps regardless of CostOptimizer
      const MIN_TOKENS: Record<number, number> = { 2: 8000, 3: 8192, 6: 8192, 7: 8192, 8: 8192 };
      if (MIN_TOKENS[step] && maxTokens < MIN_TOKENS[step]) {
        maxTokens = MIN_TOKENS[step];
      }

      config = {
        model: fullModelId,
        maxTokens,
        useThinking,
      };
    }

    // Steps 1-2: NEVER use thinking — delays first visible token on edge runtime
    // Step 3: disable thinking too — each chapter needs full 30s for text output
    if (step <= 3) {
      config = { ...config, useThinking: false };
    }

    if (!config) {
      return new Response(JSON.stringify({ error: 'Invalid step (1-8)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const prompt = getPrompt(step, data);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Build params — only add thinking when the model supports it
          const createParams: MessageCreateParamsStreaming = {
            model: config.model,
            max_tokens: config.maxTokens,
            stream: true as const,
            messages: [{ role: 'user', content: prompt }],
            system: [
              {
                type: 'text',
                text: SYSTEM_PROMPT,
                cache_control: { type: 'ephemeral' },
              },
            ],
            ...(config.useThinking ? { thinking: { type: 'adaptive' } } : {}),
          };

          const anthropicStream = await client.messages.create(createParams);

          for await (const event of anthropicStream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              const chunk = `data: ${JSON.stringify({ text: event.delta.text })}\n\n`;
              controller.enqueue(encoder.encode(chunk));
            }
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Stream error';
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
