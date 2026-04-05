import { GoogleGenAI } from '@google/genai';
import sharp from 'sharp';
import { insforge } from '@/lib/insforge';

export const runtime = 'nodejs';

/**
 * Creates 3 professional Amazon KDP A+ Content modules based on the book's cover image
 * Using Nano Banana Pro (Gemini 3 Pro Image) Multimodal capabilities.
 */
export async function POST(req: Request) {
  try {
    const { title, authorName, coverImage, type } = await req.json();

    const googleApiKey = process.env.GOOGLE_API_KEY;
    if (!googleApiKey || !coverImage) {
      return new Response(JSON.stringify({ error: 'Faltan credenciales o imagen de portada' }), { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: googleApiKey });
    const model = process.env.NANO_BANANA_MODEL ?? 'gemini-3-pro-image-preview';

    let prompt = "";
    if (type === 'comparison') {
      prompt = `High-end Amazon KDP A+ module (970x600). Create a split-screen visual comparison. 
      The LEFT side visually represents 'toxic confusion' with dark, moody lighting. 
      The RIGHT side uses the aesthetic of the ATTACHED COVER to showcase 'healing clarity' with warm, cinematic lighting. 
      DO NOT include the book cover directly, just use its colors and style for the right side metaphor. 
      Premium, minimalist, and empathetic. No text.`;
    } else if (type === 'authority') {
      prompt = `High-end Amazon KDP A+ module (970x600). Place a professional 3D MOCKUP of the ATTACHED BOOK COVER 
      in the center of a clean, minimalist warm-grey background. To the right of the book, include an elegant 
      signature line for author '${authorName}'. Ensure the cover in the mockup matches the ATTACHED COVER exactly. 
      Professional editorial lighting. No extra text.`;
    } else if (type === 'method') {
      prompt = `High-end Amazon KDP A+ module (970x600). Create a horizontal process layout with 4 minimalist icons representing these 4 stages IN SPANISH:
      1. "Identificación", 2. "Raíces", 3. "Romper el Ciclo", 4. "Sanación".
      Write these labels IN SPANISH below each icon.
      Use the EXACT warm, golden, cinematic color palette and artistic style of the ATTACHED COVER.
      Icons should look like high-quality professional illustrations. Premium editorial aesthetic. ALL TEXT MUST BE IN SPANISH.`;
    }

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

    // Resize to A+ standard (970x600 px)
    const rawBuffer = Buffer.from(resultBase64, 'base64');
    const aPlusBuffer = await sharp(rawBuffer)
      .resize(970, 600, { fit: 'cover' })
      .jpeg({ quality: 95 })
      .toBuffer();

    const fileName = `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-APLUS-${type}.jpg`;
    
    // Silently sync to InsForge Storage as requested
    try {
      const arrayBuffer = new Uint8Array(aPlusBuffer);
      const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });
      await insforge.storage.from('ebooks').upload(fileName, blob);
    } catch (e) {
      console.warn('Sync to Cloud Storage failed:', e);
    }

    return new Response(JSON.stringify({ 
      image: aPlusBuffer.toString('base64'),
      fileName 
    }), { headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Marketing pack generation failed';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
