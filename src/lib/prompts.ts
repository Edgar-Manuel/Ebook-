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

REGLAS DE GENERACIÓN (Basadas en Motivaciones Reales de Compra en Amazon):
1. TÍTULO: Debe atacar un dolor ESPECÍFICO y URGENTE, enseñar una habilidad concreta o vender esperanza. Huye de lo genérico (ej. mal: "Consejos de Vida", bien: "Superar la Ansiedad Social en 30 días").
2. SUBTÍTULO: Debe expandir la promesa del título y mencionar a quién va dirigido. Si el libro tiene potencial para ser un REGALO ideal, insinúalo sutilmente.
3. DESCRIPCIÓN (AIDA): El lector es el protagonista. Empieza con su dolor/frustración. Explica la transformación (de no saber a saber).
4. KEYWORDS: 7 frases de "cola larga" centradas en la intención de búsqueda de una solución.
5. CATEGORÍAS: 2 categorías nicho hiper-específicas.
6. TARGET AUDIENCE: Define exactamente quién sufre el problema crónico que resolvemos.

Prioriza soluciones hiper-específicas y evita libros genéricos. El contenido se publicará en España y Latinoamérica, usa un español neutro-profesional.`;

    case 2:
      return `Actúa como un Arquitecto Editorial experto en Psicología del Consumidor para Amazon KDP. El objetivo de este esquema no es volcar información, es diseñar un viaje de TRANSFORMACIÓN para el lector.

Título: "${data.selectedIdea?.title}"
Subtítulo: "${data.selectedIdea?.subtitle}"
Descripción: "${data.selectedIdea?.description}"
Audiencia Objetivo (El Cliente): "${data.selectedIdea?.targetAudience}"

Diseña un índice completo con:
- Introducción (Conectando con el dolor/problema del usuario, sin hablar de ti desde el ego)
- 7-10 Capítulos (El puente lógico desde su problema actual hasta la solución)
- 3-5 Subtítulos por capítulo
- Conclusión (Llamada a la acción final)

Formatea cada capítulo usando esta estructura exacta:
**Chapter [N]: [TÍTULO DEL CAPÍTULO QUE PROMETA UN AVANCE]**
- [Subtítulo accionable 1]
- [Subtítulo accionable 2]
- [Subtítulo accionable 3]

Regla de oro: No hagas un índice técnico y aburrido. El lector compra "el dejar de sufrir un problema" o "el aprender una habilidad nueva". Cada capítulo debe sentirse como una pequeña victoria para el comprador. Responde exclusivamente con el esquema estructural en español.`;

    case 3: {
      const chapterNum = data.currentWritingChapter ?? 1;
      const chapterInfo = data.chapters?.[chapterNum - 1];
      const chapterTitle = chapterInfo?.title ?? `Capítulo ${chapterNum}`;
      const subheadings = chapterInfo?.subheadings?.join(', ') ?? '';

      return `Actúa como un Escritor Fantasma (Ghostwriter) de élite especializado en libros "Non-Fiction" Best Sellers de Amazon.

Libro: "${data.selectedIdea?.title}"
Audiencia (A quién le resolvemos el problema): "${data.selectedIdea?.targetAudience}"

Capítulo a escribir: ${chapterNum}: ${chapterTitle}
Subtítulos a cubrir: ${subheadings}

Escribe aproximadamente 700-1000 palabras para este capítulo. REGLAS CRÍTICAS DE PSICOLOGÍA DEL LECTOR:
- EVITA el "Yoísmo". No centres la historia en ti. El LECTOR es el protagonista. Haz de espejo para su propia vida y problemas.
- Si el área es Salud, enfócate en vender "Esperanza", no un ensayo médico denso.
- Si el área es Dinero o Habilidades, enfócate en lo puramente práctico. Transforma al lector de "no saber" a "saber hacer".
- Usa encabezados H2 (##) para el título del capítulo.
- Usa encabezados H3 (###) para los subtítulos.
- Tono empático, directo, accionable y cero relleno.
- Idioma: Español neutro y natural (cero lenguaje robótico).

Escribe el capítulo completo ahora usando formato Markdown:`;
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
      return `Actúa como un Estratega Experto en el Algoritmo de Amazon KDP y Posicionamiento SEO. Tu objetivo no es enseñar a "subir un libro", sino enseñar a "vender una solución".
      
Recuerda esta premisa vital: "Publicar es algo técnico (darle a un botón), Vender es estratégico. Si solo publicas, eres un subidor de PDFs. Si vendes, creas activos digitales".

Libro: "${data.selectedIdea?.title}"
Subtítulo: "${data.selectedIdea?.subtitle}"
Audiencia Objetivo (El cliente): "${data.selectedIdea?.targetAudience}"
Nicho: "${data.niche}"

Nota: La app ya ha autogenerado el documento .docx maquetado y la portada 1600x2560 JPG. Tu trabajo ahora es dominar el marketplace.

Genera una guía maestra y estratégica (NO un manual técnico aburrido) con este esquema:

1. **Mentalidad de Venta KDP:** Breve recordatorio de que en Amazon vendemos soluciones, no libros. El comprador es el protagonista, no el ego del autor.
2. **Optimización Extrema de Metadatos:** Cómo usar las palabras clave exactas que la gente ya está buscando. Dónde colocarlas (Título, Subtítulo, backend KDP).
3. **El Gancho de la Descripción (HTML):** Crea una descripción de venta KDP en formato HTML (con <b>, <h2>). Usa AIDA, céntrate en el dolor del usuario y no en lo bonito que es el libro.
4. **Elección Estratégica de Categorías:** Cómo elegir categorías donde es matemáticamente más fácil conseguir la etiqueta de "Best Seller".
5. **Contenido A+ (El factor "Excelencia"):** Por qué hoy en día ser amateur no funciona. Describe exactamente qué 3 módulos de Contenido A+ debe añadir para aumentar el valor percibido.
6. **Checklist Anti-Fracaso antes de Publicar:** Las 3 cosas que debe comprobar con visión de "comprador" antes de darle al botón de publicar.

Mantén un tono directo, profesional y enfocado al 100% en la rentabilidad y psicología de compra.`;

    case 7:
      return `Actúa como un Experto en Pricing, Psicología de Ventas y Finanzas para infoproductos en Amazon KDP.
      
Recuerda esta premisa: "Publicar es gratis, pero vender requiere inversión (de tiempo, paciencia o capital). Que sea gratis no significa que sea rentable".

Libro: "${data.selectedIdea?.title}"
Nicho: "${data.niche}"
Audiencia Objetivo: "${data.selectedIdea?.targetAudience}"

Desarrolla una Estrategia de Pricing enfocada en el valor percibido y el compromiso del cliente:

1. **La Psicología del Precio:** Por qué regalar el libro (0.00€) atrae a curiosos sin compromiso, mientras que un precio premium atrae a compradores dispuestos a aplicar la solución.
2. **El Precio Óptimo (Valor Percibido):** Recomienda el precio de lanzamiento y el precio final (ej. 2.99€ -> 7.99€ o 9.99€) justificando por qué este libro soluciona un problema que vale ese dinero.
3. **Cálculo de Royalties Realista:** Desglose matemático. ¿Cuántas ventas a X€ necesitas para ganar 1.000€/mes? (Explica el tramo del 70% vs 35% de Amazon).
4. **Estrategia KDP Select (Kindle Unlimited):** ¿Debe ser exclusivo de Amazon o ir "Wide"? Explica cómo las páginas leídas (KENP) también son ventas.
5. **Inversión Mínima Viable:** Un presupuesto hiper-realista. Si va a gastar 50€-100€ en Amazon Ads para iniciar la rueda del algoritmo, ¿cómo calcular el ACOS y el punto de equilibrio?

Sé claro, emplea números reales y quita la falsa idea de que se puede hacer riqueza de la noche a la mañana sin gastar un centavo.`;

    case 8:
      return `Actúa como un Director de Marketing y Tráfico experto en escalar Libros a Top 100 de Amazon.
      
Recuerda tu mantra: "Publicar es un evento aislado. Vender es un sistema. El libro empieza a vivir el día que le das a publicar, no termina ahí".

Libro: "${data.selectedIdea?.title}"
Subtítulo: "${data.selectedIdea?.subtitle}"
Audiencia: "${data.selectedIdea?.targetAudience}"
Nicho: "${data.niche}"

Diseña la Arquitectura del Sistema de Ventas (El plan para dejar de ser un creador pasivo y ser un vendedor activo):

1. **La Mentalidad Post-Lanzamiento:** Analiza y no supongas. Explica cómo interpretar si el problema de que no haya ventas es "Falta de Tráfico" (no lo ve nadie) o "Falta de Conversión" (lo ven pero no compran por mala portada/precio).
2. **Sistema de Tráfico 1: Amazon Ads (El combustible):** Cómo crear la primera campaña de Sponsored Products automática y una manual targeting a los ASINs de 3 competidores directos.
3. **Estandarizar la Excelencia:** Qué debe revisar y modificar a los 14 días si no hay ventas (Test A/B de portada, ajuste de título/subtítulo, mejora de la descripción).
4. **El Funnel Externo (Opcional pero escalable):** Cómo usar TikTok, Reels o Shorts hablando *solo de los problemas del cliente* (NO hablando del libro) y mandándolos al link de Amazon.
5. **La Regla de Oro de las Reviews:** Una estrategia ética pero agresiva para conseguir las primeras 5-10 reseñas (que son la barrera mágica para activar el algoritmo orgánico de KDP).
6. **Construyendo tu Propiedad Editorial:** Cómo este libro debe llevar a un Lead Magnet o a comprar tu siguiente libro dentro de la misma categoría.

Proporciona ejemplos de posts reales y accionables orientados a que el comprador sienta que el libro de la competencia no es tan bueno como este.`;

    default:
      return 'Please provide a valid step number.';
  }
}
