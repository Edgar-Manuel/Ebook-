import type { BookData } from '@/types';

export function getPrompt(step: number, data: Partial<BookData>): string {
  switch (step) {
    case 1:
      return `Actúa como un estratega de marketing de contenidos y experto en Amazon Kindle Direct Publishing (KDP) con más de 10 años de experiencia en lanzamientos de "Non-Fiction" Best Sellers.

Genera 5 ideas de ebooks altamente rentables para alguien interesado en el nicho: "${data.niche}" con estos intereses/habilidades: "${data.interests}".

Para cada idea, genera la siguiente estructura de venta y metadatos optimizados (usa exactamente este formato de texto plano):

**Idea [N]: [TÍTULO MAGNÉTICO]**
Subtítulo: [SUBTÍTULO ESTRATÉGICO]
Descripción: [DESCRIPCIÓN CON GANCHO Y BULLET POINTS]
Target Audience: [AUDIENCIA OBJETIVO ESPECÍFICA]
Amazon Keywords: [Keyword 1], [Keyword 2], [Keyword 3], [Keyword 4], [Keyword 5], [Keyword 6], [Keyword 7]
Categorías Sugeridas: [Categoría KDP 1], [Categoría KDP 2]
Tono: [TONO DE VOZ DEL LIBRO]

REGLAS DE GENERACIÓN:
1. TÍTULO: Debe incluir la palabra clave principal, un beneficio claro, y si aplica, un marco de tiempo o número. No uses palabras genéricas.
2. SUBTÍTULO: Debe expandir la promesa del título y mencionar a quién va dirigido (el dolor).
3. DESCRIPCIÓN: Usa el modelo AIDA. Empieza con una pregunta dolorosa o estadística, explica el problema, da 3-5 bullet points de lo que descubrirán, y termina con un Call to Action.
4. KEYWORDS: 7 frases de búsqueda de "cola larga" (long-tail) que usuarios reales escribirían.
5. CATEGORÍAS: 2 categorías nicho muy específicas donde sea más fácil ser Best Seller.
6. TARGET AUDIENCE: Define exactamente a quién le duele el problema.

Prioriza consejos accionables sobre teoría aburrida y evita introducciones genéricas tipo "En el mundo actual...". El contenido se publicará en España y Latinoamérica, usa un español neutro-profesional.`;

    case 2:
      return `You are a professional book outline creator. Create a detailed, comprehensive outline for this ebook:

Title: "${data.selectedIdea?.title}"
Subtitle: "${data.selectedIdea?.subtitle}"
Description: "${data.selectedIdea?.description}"
Target Audience: "${data.selectedIdea?.targetAudience}"

Create a complete book outline with:
- Introduction
- 7-10 chapters
- 3-5 subheadings per chapter
- A conclusion

Format each chapter like:
**Chapter [N]: [CHAPTER TITLE]**
- [Subheading 1]
- [Subheading 2]
- [Subheading 3]

Ensure logical flow from introduction to advanced concepts, and problem-to-solution progression. The outline should cover the topic comprehensively.`;

    case 3: {
      const chapterNum = data.currentWritingChapter ?? 1;
      const chapterInfo = data.chapters?.[chapterNum - 1];
      const chapterTitle = chapterInfo?.title ?? `Chapter ${chapterNum}`;
      const subheadings = chapterInfo?.subheadings?.join(', ') ?? '';

      return `You are a professional ebook writer. Write a complete, detailed chapter for this ebook:

Book Title: "${data.selectedIdea?.title}"
Target Audience: "${data.selectedIdea?.targetAudience}"

Chapter ${chapterNum}: ${chapterTitle}
Subheadings to cover: ${subheadings}

Write approximately 600-800 words for this chapter. Requirements:
- Use H2 headings (##) for the chapter title
- Use H3 headings (###) for each subheading
- Write in a clear, engaging, and informative tone
- Include practical examples and actionable tips
- Maintain consistency with the book's theme
- Add personal insights and real-world applications
- End with a brief summary or key takeaways

Write the full chapter now:`;
    }

    case 4:
      return `You are a professional ebook formatter. Review and format this ebook content for Amazon Kindle publishing.

Book: "${data.selectedIdea?.title}"

Current content summary: The book has ${data.chapters?.length ?? 0} chapters covering ${data.selectedIdea?.description}

Note: This app automatically exports the book as a formatted .docx file ready for Kindle upload. Provide guidance on the content structure itself.

Provide:
1. **Formatting Guidelines** - Specific formatting rules for a professional ebook (heading hierarchy, paragraph structure)
2. **Style Consistency Check** - Any tone/style issues to fix across chapters
3. **Kindle Formatting Tips** - H1 for chapters, H2 for subheadings, proper line spacing (1.15 or 1.5)
4. **Front Matter** - Draft a title page, copyright page, and table of contents format
5. **Back Matter** - About the author template and call-to-action suggestions
6. **Final Review Checklist** - Proofreading, consistency, and quality checks before publishing

Make the formatting recommendations specific and actionable. The .docx export is handled automatically by this tool.`;

    case 5:
      return `You are a professional book cover designer and marketing expert. Create a comprehensive cover design brief for an AI-generated cover using Nano Banana Pro (Google Gemini image generation):

Book Title: "${data.selectedIdea?.title}"
Subtitle: "${data.selectedIdea?.subtitle}"
Target Audience: "${data.selectedIdea?.targetAudience}"
Genre/Niche: "${data.niche}"

Provide:
1. **Cover Concept** - Detailed visual description (mood, style, imagery, composition) optimized for AI image generation
2. **Color Palette** - Specific hex colors that work for this niche and evoke the right emotions
3. **Typography Direction** - Font style recommendations (bold, serif, sans-serif, etc.) and how the title should be displayed
4. **Art Direction** - Lighting, perspective, depth of field, texture, and visual atmosphere to guide prompt crafting
5. **Composition Guide** - Where the title, subtitle, and key visual elements should be placed on a portrait 9:16 cover
6. **Kindle Specs** - Exact dimensions (1600 x 2560 pixels), file format requirements, and DPI for KDP upload
7. **Design Do's and Don'ts** - Specific to the "${data.niche}" niche and what works on Amazon thumbnails
8. **Competitor Analysis** - How to research similar bestselling covers on Amazon to refine the concept
9. **Post-Generation Tweaks** - Tips for minor edits after AI generation (cropping, contrast, text legibility checks)

Make the design advice specific, actionable, and focused on standing out in the "${data.niche}" niche. Remember: the cover will be generated entirely by AI, so describe the visual concept in vivid, prompt-friendly detail.`;

    case 6:
      return `You are an Amazon KDP publishing expert. Provide a complete step-by-step guide to publishing this book on Amazon Kindle Direct Publishing:

Book Title: "${data.selectedIdea?.title}"
Subtitle: "${data.selectedIdea?.subtitle}"
Target Audience: "${data.selectedIdea?.targetAudience}"
Niche: "${data.niche}"

Note: This app automatically generates the manuscript as a .docx file and the cover as a 1600×2560 JPG via Nano Banana Pro — both ready for KDP upload.

Provide:
1. **KDP Account Setup** - Step-by-step account creation at kdp.amazon.com
2. **Book Details** - How to fill in title, subtitle, author name
3. **Book Description** - Write a compelling 150-word book description using keywords
4. **Keywords Strategy** - 7 high-traffic, low-competition keywords for this book
5. **Category Selection** - 2 best Amazon categories for this book
6. **ISBN** - Free ISBN vs. custom ISBN explanation
7. **Manuscript Upload** - Upload the .docx file generated by this tool directly to KDP
8. **Cover Upload** - Upload the AI-generated cover JPG (1600×2560, already at KDP specs)
9. **Preview** - How to use Kindle Previewer to check layout on different devices
10. **Pricing Tab** - Royalty options explained (35% vs 70%)
11. **Publishing Checklist** - Final review before hitting publish

Make everything specific to "${data.selectedIdea?.title}".`;

    case 7:
      return `You are a book pricing strategist. Develop a comprehensive pricing strategy for:

Book Title: "${data.selectedIdea?.title}"
Niche: "${data.niche}"
Target Audience: "${data.selectedIdea?.targetAudience}"

Provide:
1. **Market Research** - How to find competitor prices for "${data.niche}" ebooks
2. **Recommended Price Point** - Specific price with justification
3. **Royalty Calculation** - Break down earnings at different price points ($0.99, $2.99, $4.99, $9.99)
4. **Launch Strategy** - Introductory pricing plan (first 30 days)
5. **KDP Select vs. Wide** - Recommendation for this book
6. **Countdown Deals** - How and when to use them
7. **Price Testing** - A/B testing approach over 90 days
8. **Bundling Strategy** - Ideas for creating a series or bundle
9. **Permafree Strategy** - If/when to use a free book as lead magnet
10. **Revenue Projections** - Realistic monthly earnings at different price points

Include specific numbers and actionable recommendations.`;

    case 8:
      return `You are a book marketing expert. Create a comprehensive marketing plan for:

Book Title: "${data.selectedIdea?.title}"
Subtitle: "${data.selectedIdea?.subtitle}"
Target Audience: "${data.selectedIdea?.targetAudience}"
Niche: "${data.niche}"

Create:
1. **Amazon A+ Content Description** - 600-word compelling book description with keywords
2. **Social Media Posts** (ready to copy-paste):
   - 3 Twitter/X posts
   - 2 Facebook posts
   - 2 Instagram captions with hashtags
   - 1 LinkedIn post
3. **Amazon Advertising** - Keyword targets for Sponsored Products ads
4. **Email Sequence** (3 emails):
   - Launch announcement email
   - Social proof email (day 7)
   - Last chance email (day 14)
5. **Review Request Template** - Email to get early reviews
6. **Content Marketing** - 5 blog post / YouTube video ideas related to the book
7. **Reddit/Facebook Groups** - Where to promote this book authentically
8. **Launch Week Checklist** - Day-by-day launch plan
9. **BookBub & Promotions** - Sites to submit for free/discounted promotions
10. **Long-term Marketing** - 90-day ongoing marketing strategy

Make all content ready to use immediately, personalized for "${data.selectedIdea?.title}".`;

    default:
      return 'Please provide a valid step number.';
  }
}
