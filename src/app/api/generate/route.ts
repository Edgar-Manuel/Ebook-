import Anthropic from '@anthropic-ai/sdk';
import { getPrompt } from '@/lib/prompts';
import type { BookData } from '@/types';

const client = new Anthropic();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { step, data }: { step: number; data: Partial<BookData> } = body;

    if (!step || step < 1 || step > 8) {
      return new Response(JSON.stringify({ error: 'Invalid step' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const prompt = getPrompt(step, data);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const anthropicStream = await client.messages.create({
            model: 'claude-opus-4-6',
            max_tokens: 8000,
            thinking: { type: 'adaptive' },
            stream: true,
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
            system: `You are an expert ebook creation assistant helping to automate the entire process of writing and publishing profitable ebooks on Amazon Kindle. You provide detailed, actionable, and professional content. Always format your responses with clear headings, bullet points, and structured information that is immediately usable.`,
          });

          for await (const event of anthropicStream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              const data = `data: ${JSON.stringify({ text: event.delta.text })}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Stream error';
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
