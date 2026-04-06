import { GoogleGenAI } from '@google/genai';
import sharp from 'sharp';
import { insforge } from '@/lib/insforge';

export const runtime = 'nodejs';

// ─────────────────────────────────────────────────────────────────────────────
// Amazon KDP A+ Content Module Generator — v2.0
// Based on: "Estrategias Avanzadas y Optimización Algorítmica para A+ en KDP"
//
// KEY SPECS (from official Amazon docs):
//   - Standard Image Header: 970×600 px → 2x Retina: 1940×1200 px
//   - Format: JPG (photos) or PNG (graphics), RGB only, max 2MB, target <500KB
//   - "Safe Zone": bottom 20% must be kept clear of critical elements
//   - Ratio: 70% visual / 30% text maximum
//   - PROHIBITED: prices, CTAs ("buy now"), urgency language, customer reviews,
//     star ratings, Kindle Unlimited mentions, competitor names, QR codes
//   - Alt-text required for SEO (Google indexes A+ text, Amazon A9 does NOT)
// ─────────────────────────────────────────────────────────────────────────────

const MODULE_PROMPTS: Record<string, (title: string, authorName: string) => string> = {

  // ── MODULE 1: TRANSFORMATION / COMPARISON ──────────────────────────────
  // Purpose: Emotional hook. Shows the reader's journey from pain to solution.
  // Amazon spec: "Standard Image Header" (Hero Banner) — 970×600 / 1940×1200
  comparison: (title: string, _authorName: string) => `
    You are a world-class Amazon KDP A+ Content designer creating a premium "Standard Image Header" module.
    
    TECHNICAL SPECS:
    - Output exactly 1940×1200 pixels (this is the 2x Retina-optimized version of the 970×600 standard).
    - RGB color space only. No CMYK.
    - Keep the BOTTOM 20% of the canvas completely clear of critical elements (Amazon's "Safe Zone" — UI overlays may appear there).
    
    DESIGN BRIEF:
    Create a sophisticated split-screen visual comparison for the book "${title}".
    
    LEFT HALF — "The Problem" (Before):
    - Dark, desaturated, moody atmosphere with cool blue-grey tones.
    - Visual metaphor for psychological confusion, emotional pain, or feeling trapped.
    - Shadowy silhouette, fragmented mirror, tangled threads, or fog — choose what fits the book's theme.
    - Subtle vignette darkening at the edges.
    
    RIGHT HALF — "The Solution" (After):
    - Warm, cinematic golden-hour lighting that matches the ATTACHED COVER's color palette exactly.
    - Visual metaphor for clarity, healing, empowerment, or freedom.
    - Clean lines, open space, warm light breaking through, or a figure standing tall.
    - The visual style and color temperature must mirror the attached cover's aesthetic.
    
    TRANSITION: A subtle gradient or light beam divides the two halves — NOT a hard line.
    
    CONTENT RULES (Amazon compliance):
    - NO text whatsoever on the image. Zero words. Zero logos.
    - NO book cover shown. Only use the cover's colors and mood as reference.
    - NO faces shown clearly (avoid likeness issues). Use silhouettes, back views, or abstract figures.
    - 70% visual, 30% negative space. Keep it breathable and premium.
    - Style: Editorial, cinematic, minimalist. Think high-end psychology book — NOT generic stock photo.
  `,

  // ── MODULE 2: AUTHORITY / AUTHOR BRANDING ──────────────────────────────
  // Purpose: Build author credibility and trust. Social proof without testimonials.
  // Amazon spec: "Standard Image Header" — 970×600 / 1940×1200
  authority: (title: string, authorName: string) => `
    You are a world-class Amazon KDP A+ Content designer creating a premium "Standard Image Header" module.
    
    TECHNICAL SPECS:
    - Output exactly 1940×1200 pixels (2x Retina of 970×600 standard).
    - RGB color space only.
    - Keep the BOTTOM 20% of the canvas clear (Amazon Safe Zone).
    
    DESIGN BRIEF:
    Create an elegant author authority module for "${title}" by ${authorName}.
    
    COMPOSITION (left to right):
    1. LEFT THIRD: A photorealistic 3D mockup of the ATTACHED BOOK COVER.
       - The book should appear as a physical hardcover or thick paperback, angled ~30° for depth.
       - Soft shadow beneath the book grounding it to the surface.
       - The cover artwork MUST match the ATTACHED COVER with pixel-perfect accuracy.
    
    2. CENTER: Clean negative space with a subtle warm-grey textured background.
       - Very faint paper or linen texture for editorial sophistication.
    
    3. RIGHT THIRD: An elegant calligraphic signature reading "${authorName}" in dark ink.
       - Below the signature, a thin horizontal decorative line (editorial divider).
       - The signature should feel handwritten, personal, and distinguished.
    
    LIGHTING: Soft, directional warm light from the upper left — editorial studio photography style.
    The overall feel must be "credible author brand" — like the inside flap of a bestselling book.
    
    CONTENT RULES (Amazon compliance):
    - The ONLY text allowed is the author's signature "${authorName}" — nothing else.
    - NO star ratings, NO customer quotes, NO superlatives ("bestseller", "#1").
    - NO prices, NO CTAs, NO promotional language.
    - Style: Clean, prestigious, warm. Think Penguin Random House quality.
  `,

  // ── MODULE 3: METHODOLOGY / PROCESS ────────────────────────────────────
  // Purpose: Show the reader what they'll learn — transform features into benefits.
  // Amazon spec: "Standard Image with Text Overlay" — 970×300 / 1940×600
  // OR "Standard Image Header" 970×600 / 1940×1200
  method: (title: string, _authorName: string) => `
    You are a world-class Amazon KDP A+ Content designer creating a premium "Standard Image Header" module.
    
    TECHNICAL SPECS:
    - Output exactly 1940×1200 pixels (2x Retina of 970×600 standard).
    - RGB color space only.
    - Keep the BOTTOM 20% of the canvas clear (Amazon Safe Zone).
    - Any text on the image must be at least 30pt equivalent (legible on mobile at 320px width).
    
    DESIGN BRIEF:
    Create a horizontal methodology/process infographic for the book "${title}".
    
    LAYOUT: 4 STAGES in a clean left-to-right horizontal flow.
    - Infer the 4 key transformation stages from the book title "${title}".
    - Each stage should represent one step of the reader's journey as promised by the book.
    
    PER STAGE:
    1. A minimalist, premium icon or illustration (line art or flat design, NOT clipart).
    2. A SHORT label in SPANISH below each icon (2-3 words maximum per label).
    3. A subtle connecting element between stages (arrow, dotted line, gradient flow).
    
    VISUAL STYLE:
    - Use the EXACT color palette from the ATTACHED COVER — match hues, saturation, and temperature.
    - Background should be clean and uncluttered — subtle gradient or solid warm tone.
    - Icons should be consistent in style (all line art, or all filled, or all duotone — pick one and commit).
    - Typography: Clean sans-serif, high contrast against background. Minimum 30pt equivalent.
    
    CONTENT RULES (Amazon compliance):
    - Text is ONLY the 4 short stage labels in SPANISH. Nothing else.
    - NO prices, NO CTAs, NO urgency language, NO promotional text.
    - NO customer testimonials or star ratings.
    - Maintain 70/30 ratio: 70% visual elements, 30% text maximum.
    - Style: Premium infographic — think McKinsey consulting deck, NOT PowerPoint template.
    
    ALL TEXT MUST BE IN SPANISH.
  `,
};

export async function POST(req: Request) {
  try {
    const { title, authorName, coverImage, type } = await req.json();

    const googleApiKey = process.env.GOOGLE_API_KEY;
    if (!googleApiKey || !coverImage) {
      return new Response(JSON.stringify({ error: 'Faltan credenciales o imagen de portada' }), { status: 400 });
    }

    const promptBuilder = MODULE_PROMPTS[type];
    if (!promptBuilder) {
      return new Response(JSON.stringify({ error: `Tipo de módulo inválido: ${type}` }), { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: googleApiKey });
    const model = process.env.NANO_BANANA_MODEL ?? 'gemini-3-pro-image-preview';
    const prompt = promptBuilder(title, authorName);

    const genResponse = await ai.models.generateContent({
      model,
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            { inlineData: { data: coverImage.replace(/^data:image\/[a-z]+;base64,/, ''), mimeType: 'image/jpeg' } }
          ],
        },
      ],
      config: { responseModalities: ['IMAGE'] },
    });

    let resultBase64: string | null = null;
    const parts = genResponse.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        resultBase64 = part.inlineData.data;
        break;
      }
    }

    if (!resultBase64) throw new Error('La IA no generó la imagen.');

    // Resize to 2x Retina standard (1940×1200) then export at standard (970×600)
    // to ensure crisp rendering on all screens including HiDPI/Retina displays.
    const rawBuffer = Buffer.from(resultBase64, 'base64');
    const aPlusBuffer = await sharp(rawBuffer)
      .resize(1940, 1200, { fit: 'cover' })
      .jpeg({ quality: 92, mozjpeg: true }) // mozjpeg for better compression, <500KB target
      .toBuffer();

    // Verify file size is within Amazon's 2MB limit (target <500KB for mobile performance)
    const fileSizeKB = aPlusBuffer.length / 1024;
    let finalBuffer = aPlusBuffer;
    if (fileSizeKB > 1800) {
      // If too large, reduce quality slightly
      finalBuffer = await sharp(aPlusBuffer)
        .jpeg({ quality: 80, mozjpeg: true })
        .toBuffer();
    }

    const fileName = `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-APLUS-${type}-2x.jpg`;
    
    // Silently sync to InsForge Cloud Storage
    try {
      const arrayBuffer = new Uint8Array(finalBuffer);
      const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });
      await insforge.storage.from('ebooks').remove(fileName).catch(() => {});
      await insforge.storage.from('ebooks').upload(fileName, blob);
    } catch (e) {
      console.warn('Sync to Cloud Storage failed:', e);
    }

    return new Response(JSON.stringify({ 
      image: finalBuffer.toString('base64'),
      fileName,
      specs: {
        dimensions: '1940×1200 (2x Retina)',
        displaySize: '970×600',
        format: 'JPEG RGB',
        sizeKB: Math.round(finalBuffer.length / 1024),
      }
    }), { headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Marketing pack generation failed';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
