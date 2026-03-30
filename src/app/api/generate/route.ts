import Anthropic from '@anthropic-ai/sdk';
import type { MessageCreateParamsStreaming } from '@anthropic-ai/sdk/resources/messages';
import { getPrompt } from '@/lib/prompts';
import type { BookData } from '@/types';

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
  2: { model: 'claude-sonnet-4-6', maxTokens: 3000, useThinking: true },
  3: { model: 'claude-opus-4-6', maxTokens: 6000, useThinking: true },
  4: { model: 'claude-haiku-4-5-20251001', maxTokens: 2500, useThinking: false },
  5: { model: 'claude-haiku-4-5-20251001', maxTokens: 3000, useThinking: false },
  6: { model: 'claude-haiku-4-5-20251001', maxTokens: 3500, useThinking: false },
  7: { model: 'claude-sonnet-4-6', maxTokens: 3000, useThinking: false },
  8: { model: 'claude-sonnet-4-6', maxTokens: 5000, useThinking: false },
};

interface ModelConfig {
  assignments: Record<number, string>;
  thinking: Record<number, boolean>;
  maxTokens: Record<number, number>;
}

const SYSTEM_PROMPT =
  'You are an expert ebook creation assistant helping to automate the entire process of writing and publishing profitable ebooks on Amazon Kindle. You provide detailed, actionable, and professional content. Always format your responses with clear headings, bullet points, and structured information that is immediately usable.';

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
      config = {
        model: fullModelId,
        maxTokens: modelConfig.maxTokens?.[step] ?? STEP_CONFIG[step]?.maxTokens ?? 3000,
        useThinking,
      };
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
