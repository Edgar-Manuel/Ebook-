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
- Introducción (Conectando de inmediato con el dolor del usuario. Además asume que el autor es ${data.authorName || 'el autor'}. Usa esta sección para construir una Fuerte Introducción Personal: cuenta una historia experta y vulnerable que justifique por qué el lector debe confiar ciegamente en este libro. Debes mostrar credibilidad experiencial).
- 7-10 Capítulos (El puente lógico desde su problema actual hasta la solución)
- 3-5 Subtítulos por capítulo
- Conclusión (Llamada a la acción final)

REGLA: NUNCA uses Spanglish en los títulos o subtítulos (ej: "Róbale Todo Su Power"). Si el libro es en español, todo de forma pulcra en español.

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

Escribe AL MENOS 1500 - 2000 palabras para este capítulo. Desarrolla los conceptos con muchísima profundidad.
REGLAS CRÍTICAS DE PSICOLOGÍA DEL LECTOR Y REDACCIÓN:
- PROFUNDIDAD EXTREMA: No seas superficial. Desarrolla herramientas prácticas, guiones de diálogo interno y escenarios detallados.
- NUNCA uses "Casos Reales" falsos con nombres como "Roberto" o "Camila". Narra historias y simulaciones directas a la acción de la oficina. NO añadas etiquetas prefabricadas como "Ejemplo Representativo:" o "Escenario Práctico:" a las viñetas, eso suena a un disclaimer legal robótico que rompe la magia. Solo intercala y cuenta la historia naturalmente.
- CERO SPANGLISH: No mezclas anglicismos innecesarios si la palabra existe en español (Cero "Róbale su power"). Todo español limpio.
- CERO "YOÍSMO" (Salvo en la Introducción): Si estás escribiendo los capítulos, el LECTOR es el gran protagonista. Haz de espejo para su propia vida.
- Si el área es Dinero o Habilidades, enfócate en lo puramente práctico. Transforma al lector de "no saber" a "saber hacer".
- Usa encabezados H2 (##) para el título del capítulo.
- Usa encabezados H3 (###) para los subtítulos planteados.
- Tono empático, directo, accionable y cero relleno. Cada palabra debe empujar al lector hacia la solución.
- Idioma: Español neutro y natural (cero lenguaje robótico o traducciones literales del inglés).

Escribe el capítulo completo AHORA en formato Markdown (extenso y detallado):`;
    }

    case 4:
      return `Actúa como un maquetador profesional de ebooks. Revisa y formatea el contenido de este ebook para su publicación en Amazon Kindle.

Libro: "${data.selectedIdea?.title}"
Autor: "${data.authorName}"

Resumen del contenido actual: El libro tiene ${data.chapters?.length ?? 0} capítulos que cubren ${data.selectedIdea?.description}

Nota: Esta aplicación exporta automáticamente el libro como un archivo .docx formateado listo para subir a Kindle. Tu tarea es proporcionar una guía sobre la estructura del contenido y estilo.

Proporciona:
1. **Guía de Formato** - Reglas de formato específicas para un ebook profesional (jerarquía de encabezados, estructura de párrafos)
2. **Revisión de Coherencia de Estilo** - Cualquier problema de tono o estilo a corregir en los capítulos
3. **Consejos de Formato para Kindle** - Uso de H1 para capítulos, H2 para subtítulos, espaciado correcto (1.15 o 1.5)
4. **Páginas Iniciales (Front Matter)** - Redacta una página de título (Título, Subtítulo, Autor: ${data.authorName}), página de derechos de autor, y formato del índice
5. **Páginas Finales (Back Matter)** - Plantilla "Acerca del Autor" (${data.authorName}) y sugerencias de llamadas a la acción (Call to Action). IMPORTANTE: NO incluyas ni sugieras poner el correo electrónico (email) del autor en ninguna parte del libro (ni en derechos de autor, ni en contacto, nada).
6. **Checklist de Revisión Final** - Comprobaciones de calidad, corrección y coherencia antes de publicar

Haz que las recomendaciones de formato sean específicas y procesables. Recuerda escribir ABSOLUTAMENTE TODO EN ESPAÑOL. La exportación a .docx es manejada automáticamente por esta herramienta.`;

    case 5:
      return `Actúa como un diseñador profesional de portadas de libros y experto en marketing. Crea un documento detallado (Brief) para diseñar una portada generada por IA usando Nano Banana Pro (generación de imágenes con Google Gemini):

Book Title: "${data.selectedIdea?.title}"
Subtitle: "${data.selectedIdea?.subtitle}"
Author: "${data.authorName}"
Target Audience: "${data.selectedIdea?.targetAudience}"
Genre/Niche: "${data.niche}"

Proporciona:
1. **Concepto de la Portada** - Descripción visual detallada (estado de ánimo, estilo, imágenes, composición) optimizada para la generación de imágenes por IA
2. **Paleta de Colores** - Colores hexadecimales específicos que funcionen para este nicho y evoquen las emociones correctas
3. **Dirección Tipográfica** - Recomendaciones de estilo de fuente para "${data.selectedIdea?.title}" y "${data.authorName}"
4. **Dirección de Arte** - Iluminación, perspectiva, profundidad de campo, textura y atmósfera visual para guiar la creación del prompt
5. **Guía de Composición** - Dónde colocar el título, subtítulo y nombre del autor ("${data.authorName}") en una portada vertical 9:16
6. **Especificaciones para Kindle** - Dimensiones exactas (1600 x 2560 píxeles), requisitos de formato de archivo y DPI para subir a KDP
7. **Qué Hacer y Qué No Hacer** - Específico para el nicho "${data.niche}" y lo que funciona en las miniaturas de Amazon
8. **Análisis de la Competencia** - Cómo investigar portadas similares de los más vendidos en Amazon para refinar el concepto
9. **Ajustes Post-Generación** - Consejos para ediciones menores después de la generación por IA (recorte, contraste, comprobación de legibilidad del texto)

Haz que los consejos de diseño sean específicos, procesables y enfocados en destacar en el nicho "${data.niche}". Recuerda: la portada será generada completamente por IA, así que describe el concepto visual con mucho detalle para facilitar la creación del prompt. IMPRESCINDIBLE: ESCRIBE TODO EN ESPAÑOL.`;

    case 6:
      return `Actúa como un Estratega Experto en el Algoritmo de Amazon KDP y Posicionamiento SEO. Tu objetivo no es enseñar a "subir un libro", sino enseñar a "vender una solución".
      
Recuerda esta premisa vital: "Publicar es algo técnico (darle a un botón), Vender es estratégico. Si solo publicas, eres un subidor de PDFs. Si vendes, creas activos digitales".

Libro: "${data.selectedIdea?.title}"
Subtítulo: "${data.selectedIdea?.subtitle}"
Autor: "${data.authorName}"
Audiencia Objetivo (El cliente): "${data.selectedIdea?.targetAudience}"
Nicho: "${data.niche}"

Nota: La app ya ha autogenerado el documento .docx maquetado y la portada 1600x2560 JPG. Tu trabajo ahora es dominar el marketplace.

Genera una guía maestra y estratégica (NO un manual técnico aburrido) con este esquema:

1. **Mentalidad de Venta KDP:** Breve recordatorio de que en Amazon vendemos soluciones, no libros. El comprador es el protagonista, no el ego del autor. No obstante, firma este activo como "${data.authorName}".
2. **Optimización Extrema de Metadatos:** Cómo usar las palabras clave exactas que la gente ya está buscando. Dónde colocarlas (Título, Subtítulo, Autor: "${data.authorName}", backend KDP).
3. **El Gancho de la Descripción (HTML):** Crea una descripción de venta KDP en formato HTML (con <b>, <h2>). Usa AIDA, céntrate en el dolor del usuario y no en lo bonito que es el libro.
4. **Elección Estratégica de Categorías:** Cómo elegir categorías donde es matemáticamente más fácil conseguir la etiqueta de "Best Seller".
5. **Contenido A+ (El factor "Excelencia"):** Por qué hoy en día ser amateur no funciona. Describe exactamente qué 3 módulos de Contenido A+ debe añadir para aumentar el valor percibido.
6. **Checklist Anti-Fracaso antes de Publicar:** Las 3 cosas que debe comprobar con visión de "comprador" antes de darle al botón de publicar. Asegúrate de que el nombre del autor "${data.authorName}" esté bien escrito en todos los campos.

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
