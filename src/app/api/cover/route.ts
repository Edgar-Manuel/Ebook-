import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';
import sharp from 'sharp';
import type { BookData } from '@/types';
import { insforge } from '@/lib/insforge';

// Use Node.js runtime — required for sharp and Google GenAI
export const runtime = 'nodejs';

const claudeClient = new Anthropic();

// Kindle cover dimensions (Amazon KDP requirement)
const KINDLE_WIDTH = 1600;
const KINDLE_HEIGHT = 2560;

/**
 * Use Claude Haiku to craft a detailed, optimised image prompt
 * for Nano Banana Pro based on the book's metadata.
 */
async function buildImagePrompt(bookData: Partial<BookData>): Promise<string> {
  const title = bookData.selectedIdea?.title ?? 'My Book';
  const subtitle = bookData.selectedIdea?.subtitle ?? '';
  const niche = bookData.niche ?? 'self-help';
  const audience = bookData.selectedIdea?.targetAudience ?? 'general readers';

  const authorName = bookData.authorName ?? 'Edgar Manchón';

  const response = await claudeClient.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    messages: [
      {
        role: 'user',
        content: `Create a single detailed image generation prompt for Nano Banana Pro (Google Gemini 3 Pro Image) to generate a professional Amazon Kindle book cover.

Book details:
- Title: "${title}"
- Subtitle: "${subtitle}"
- Author Name: "${authorName}"
- Genre / Niche: "${niche}"
- Target Audience: "${audience}"

ABSOLUTE SAFE ZONE RULES (MOST IMPORTANT - text gets cropped if you ignore these):
- The cover has a SAFE ZONE: nothing important in the top 12%, bottom 12%, left 10%, or right 10% of the image.
- ALL text (title, subtitle, author) MUST be INSIDE this safe zone. Text outside gets cropped by Amazon.
- Title "${title}": Place it starting at ~15% from the top, horizontally centered, with text staying inside the safe zone. Use a font size that fits WITHOUT reaching the edges.
- Subtitle "${subtitle}": Place BELOW the title, centered, smaller font, well inside the safe zone.
- Author name "${authorName}": Place at approximately 85% from the top (NOT at the very bottom). It must be fully visible with space below it.
- The visual artwork/illustration should occupy the CENTER of the cover (between ~35% and ~80% from top).
- Portrait 9:16 ratio, high production quality, KDP-ready
- Style must suit the "${niche}" genre
- All text must be clearly legible (use contrast, text shadows, or semi-transparent backgrounds behind text)
- No watermarks, no borders, no extra UI elements
- Return ONLY the prompt text — no explanation, no labels`,
      },
    ],
  });

  const block = response.content[0];
  return block.type === 'text' ? block.text.trim() : `Professional book cover for "${title}", ${niche} genre`;
}

export async function POST(req: Request) {
  try {
    const bookData: Partial<BookData> = await req.json();

    const googleApiKey = process.env.GOOGLE_API_KEY;
    if (!googleApiKey) {
      return new Response(
        JSON.stringify({
          error:
            'GOOGLE_API_KEY not set. Add it to your .env file to use Nano Banana Pro.',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ── Step 1: craft prompt ───────────────────────────────────────────────
    const imagePrompt = await buildImagePrompt(bookData);

    // ── Step 2: call Nano Banana Pro ───────────────────────────────────────
    const ai = new GoogleGenAI({ apiKey: googleApiKey });

    // Default to Nano Banana Pro; fall back to the cheaper Nano Banana 2
    const model =
      process.env.NANO_BANANA_MODEL ?? 'gemini-3-pro-image-preview';

    const genResponse = await ai.models.generateContent({
      model,
      contents: [
        {
          role: 'user',
          parts: [{ text: imagePrompt }],
        },
      ],
      config: {
        // Request both an image and a brief text caption
        responseModalities: ['IMAGE', 'TEXT'],
      },
    });

    // ── Step 3: extract the image bytes ───────────────────────────────────
    let imageBase64: string | null = null;
    let mimeType = 'image/jpeg';

    const parts = genResponse.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        imageBase64 = part.inlineData.data;
        mimeType = part.inlineData.mimeType ?? 'image/jpeg';
        break;
      }
    }

    if (!imageBase64) {
      return new Response(
        JSON.stringify({
          error: 'Nano Banana Pro did not return an image. Check your API key and model availability.',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ── Step 4: resize to exact Kindle dimensions ─────────────────────────
    // Use 'contain' instead of 'cover' to avoid cropping text at edges.
    // Detect dominant edge color for seamless background fill.
    const rawBuffer = Buffer.from(imageBase64, 'base64');
    const { dominant } = await sharp(rawBuffer).stats();
    const bgColor = { r: dominant.r, g: dominant.g, b: dominant.b };
    const kindleBuffer = await sharp(rawBuffer)
      .resize(KINDLE_WIDTH, KINDLE_HEIGHT, {
        fit: 'contain',
        position: 'centre',
        background: bgColor,
      })
      .jpeg({ quality: 95, chromaSubsampling: '4:4:4' })
      .toBuffer();

    const coverBase64 = kindleBuffer.toString('base64');

    // Auto-save cover to InsForge Storage
    try {
      const title = bookData.selectedIdea?.title ?? 'cover';
      const fileName = `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-COVER.jpg`;
      const blob = new Blob([new Uint8Array(kindleBuffer)], { type: 'image/jpeg' });
      await insforge.storage.from('ebooks').remove(fileName).catch(() => {});
      await insforge.storage.from('ebooks').upload(fileName, blob);
    } catch (e) {
      console.warn('Cover cloud sync failed:', e);
    }

    return new Response(
      JSON.stringify({
        image: coverBase64,
        mimeType: 'image/jpeg',
        width: KINDLE_WIDTH,
        height: KINDLE_HEIGHT,
        prompt: imagePrompt,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Cover generation failed';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
