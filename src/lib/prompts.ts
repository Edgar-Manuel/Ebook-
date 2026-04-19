import type { BookData } from '@/types';

/**
 * Prompt caching: Step 3 (chapter writing) returns cachedSystem with saga rules
 * and writing guidelines that are identical across all 12 chapters of a book.
 * Anthropic caches this block so calls 2-12 cost only 10% of input for that section.
 */
export interface PromptParts {
  cachedSystem?: string;
  user: string;
}

export function getPrompt(step: number, data: Partial<BookData>): PromptParts {
  switch (step) {
    case 1:
      return { user: `Actúa como un estratega de marketing de contenidos y experto en Amazon Kindle Direct Publishing (KDP) con más de 10 años de experiencia en lanzamientos de "Non-Fiction" Best Sellers.

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
4. KEYWORDS: 7 frases de "cola larga" centradas en la intención de búsqueda de una solución. IMPORTANTE: Prioriza keywords de BAJA COMPETENCIA con tráfico de búsqueda decente (500-3,000 búsquedas/mes). Verificar en Amazon: si los primeros resultados tienen menos de 300 reseñas y no hay bestsellers dominantes, es un buen nicho. Si los primeros resultados tienen 10,000+ reseñas y autores famosos, EVITAR ese keyword. Las keywords son para Amazon (deciden dónde rankea tu libro); la portada es para el comprador (decide si hace clic).
5. CATEGORÍAS: Estrategia de 3 categorías (amplia + media + nicho). La amplia da visibilidad general, la media es tu categoría principal, y la nicho es donde puedes alcanzar top 20 rápidamente y conseguir la etiqueta "Best Seller".
6. TARGET AUDIENCE: Define exactamente quién sufre el problema crónico que resolvemos.
7. ANÁLISIS DE COMPETENCIA: Menciona un "hueco" común que la competencia no cubre (basado en quejas típicas en reseñas) y cómo este libro lo aprovechará.
8. COPYRIGHT: NUNCA sugieras títulos que usen nombres de marcas, empresas, celebridades, personajes de ficción, películas, series de TV, equipos deportivos ni canciones. La infracción de copyright es la razón #1 por la que Amazon cierra cuentas KDP. Todos los títulos deben ser 100% originales y genéricos (sin hacer referencia a propiedad intelectual ajena).
9. VALIDACIÓN DE NICHO: Para cada idea, verifica mentalmente estos indicadores de viabilidad: BSR de competidores < 80,000 (indica 2-5 ventas/día), menos de 50 reseñas en los top 10 (competencia baja), precio promedio > $6.99 (mercado que paga por contenido de valor). Si el nicho no cumple al menos 2 de 3, descártalo.
10. POTENCIAL DE SERIE: Prioriza ideas que puedan expandirse a una serie de 3-5 libros en el mismo nicho. Las series generan un 30-40% de ventas cruzadas (cross-selling) entre volúmenes. Un autor con 10+ libros en el mismo nicho alcanza estatus de "autor de referencia" en ese vertical.

Prioriza soluciones hiper-específicas de "Alto Contenido" (libros largos y de valor real) y rechaza categóricamente ideas orientadas a bajo/medio contenido (nada de agendas, diarios o sudokus, ya que están sobresaturados). El contenido se publicará en España y Latinoamérica, usa un español neutro-profesional.` };

    case 2: {
      const outlineTitle = data.selectedIdea?.title ?? '';
      const isBook2Outline = outlineTitle.toUpperCase().includes('DESPUÉS DEL ESPEJO');
      const isBook3Outline = outlineTitle.toUpperCase().includes('MÁS ALLÁ DEL ESPEJO');

      if (isBook3Outline) {
        return { user: `El siguiente es el índice FINAL APROBADO para el libro 3 de la saga. Genera este outline EXACTO sin modificaciones, en el formato de texto plano indicado.

Título: "${data.selectedIdea?.title}"
Subtítulo: "${data.selectedIdea?.subtitle}"
Autor: ${data.authorName || 'el autor'}

GENERA ESTE OUTLINE EXACTO:

**Introducción: El Paradigma Del Poder Personal**
- Por qué llegaste hasta aquí y qué vas a encontrar
- La diferencia entre sobrevivir y diseñar tu vida
- Cómo usar este manual de operaciones

**Chapter 1: El Vértigo De La Paz**
- Por qué la tranquilidad se siente aburrida al principio
- Recalibrar tu cerebro para la ausencia de drama
- Protocolo para no auto-sabotear la estabilidad

**Chapter 2: Quitarse El Traje De "Sobreviviente"**
- Evitar que el trauma se convierta en tu identidad
- Eres mucho más que lo que te hicieron
- Ejercicio práctico: reescribir tu narrativa actual

**Chapter 3: La Auditoría Del Entorno**
- Análisis implacable de quién ocupa tu tiempo ahora
- Limpiar residuos tóxicos tolerados en el pasado
- Protocolo: el coste de entrada a tu vida

**Chapter 4: La Diferencia Entre Un Límite Y Un Estándar**
- El límite protege de lo malo, el estándar filtra la excelencia
- Cómo definir tus innegociables absolutos
- Ejercicio: mapa estratégico de estándares de alto valor

**Chapter 5: El "Filtro De Paz" Absoluto**
- Si no aporta paz, no entra: regla de oro radical
- Aplicación en citas, trabajo y familia
- Protocolo de evaluación rápida de nuevas personas

**Chapter 6: La Comodidad En La Soledad Elegida**
- Perder definitivamente el miedo a estar solo
- Cuando tu propia compañía es tu zona segura
- El escudo definitivo contra amenazas de abandono

**Chapter 7: El Éxito Que Te Robaron**
- Por qué frenaste tu carrera para no opacar a otros
- Recuperar la ambición profesional y financiera
- La independencia económica como escudo protector

**Chapter 8: Autenticidad Sin Disculpas**
- Dejar de complacer y de leer la habitación
- Hablar y actuar desde tu esencia real
- Asumir que incomodar es una victoria vital

**Chapter 9: Magnetismo Sano**
- Cómo los nuevos estándares alejan a depredadores
- Atraer dinámicas de respeto y madurez emocional
- El cambio radical de frecuencia energética

**Chapter 10: Tribus De Alta Vibración**
- Construir círculos que celebren tus victorias
- Identificar y erradicar la envidia disfrazada de afecto
- Protocolo avanzado de reciprocidad relacional

**Chapter 11: El Radar Infalible**
- Escuchar el "no" de tu cuerpo en los 5 primeros minutos
- Confiar en tu intuición e instinto al 100%
- Tolerancia cero absoluta a banderas rojas evidentes

**Chapter 12: Tu Diseño De Vida Inquebrantable**
- El manifiesto de tu nueva vida elegida
- Mantener este ecosistema protector a largo plazo
- El espejo refleja la vida que construiste desde cero

**Conclusión: El Castillo Protegido**
- Un repaso a tu evolución en los tres volúmenes
- Tus próximos pasos hacia una libertad definitiva
- Tu Opinión Importa (CTA de reseña en Amazon)

Responde SOLO con el esquema estructural, sin explicaciones adicionales.` };
      }

      if (isBook2Outline) {
        // Return the pre-approved outline for Book 2 directly
        return { user: `El siguiente es el índice FINAL APROBADO para el libro 2 de la saga. Genera este outline EXACTO sin modificaciones, en el formato de texto plano indicado.

Título: "${data.selectedIdea?.title}"
Subtítulo: "${data.selectedIdea?.subtitle}"
Autor: ${data.authorName || 'el autor'}

GENERA ESTE OUTLINE EXACTO:

**Introducción: Lo Que Nadie Te Dijo Sobre Sanar**
- Por qué escribí esta guía: mi camino personal con este tema
- Por qué esta guía es diferente a lo que ya leíste
- Cómo usar este libro para obtener el máximo resultado
- Lo que puedes esperar en los próximos capítulos

**Chapter 1: Dónde Estás Ahora Mismo**
- Test: identifica tu fase actual de recuperación
- Las 4 fases de la reconstrucción y por qué no son lineales
- Tu mapa de los próximos 90 días
- El error más común al empezar a sanar

**Chapter 2: Tu Sistema Nervioso Después Del Abuso**
- Resumen breve de cómo el trauma alteró tu biología
- Síntomas físicos que no sabías que eran del trauma
- El primer protocolo de regulación inmediata
- Cuándo el cuerpo sana antes que la mente

**Chapter 3: Desactivar La Mente En Alerta Permanente**
- Por qué sigues esperando que algo malo ocurra
- Protocolo de cinco pasos para salir del modo supervivencia
- Técnicas de regulación para el día a día
- Cómo medir tu progreso semana a semana

**Chapter 4: Romper El Vínculo Que Aún No Has Roto**
- Por qué extrañas a alguien que te hizo daño
- El protocolo de desintoxicación emocional en siete días
- Qué hacer cuando el narcisista reaparece
- Gestionar el duelo sin recaer

**Chapter 5: Reconstruir Tu Identidad Desde Cero**
- Ejercicios progresivos para redescubrir quién eres
- Recuperar tus opiniones, gustos y valores propios
- El diario de identidad: protocolo de 30 días
- Cuando ya no sabes qué quieres: hoja de ruta

**Chapter 6: La Terapia Que Sí Funciona Para Tu Caso**
- Qué enfoques son más efectivos para este tipo de trauma
- Qué enfoques evitar y por qué
- Cómo elegir al profesional adecuado para ti
- Preguntas clave para tu primera sesión

**Chapter 7: Gestionar Las Recaídas Sin Destruir Tu Avance**
- Por qué las recaídas forman parte del proceso
- Protocolo de emergencia cuando quieres volver
- Cómo recuperarte de una recaída en menos de 72 horas
- Construir una red de contención real

**Chapter 8: Relaciones Nuevas Con El Radar Recalibrado**
- Cómo detectar señales de alerta desde el primer contacto
- Por qué proyectas el trauma en personas sanas
- Protocolo para las primeras citas después del abuso
- Cuándo estás realmente listo/a para una nueva relación

**Chapter 9: Situaciones Difíciles Del Día A Día**
- Protocolo para cuando el narcisista sigue en tu vida
- Cómo sobrevivir a reuniones familiares sin desmoronarte
- Gestionar el trabajo y la productividad durante la recuperación
- Ansiedad al despertar: rutina de mañana para días difíciles

**Chapter 10: Sanar Tu Relación Con El Dinero Y El Trabajo**
- Cómo el abuso narcisista afectó tu vida profesional
- Recuperar la seguridad económica y la autoconfianza laboral
- Protocolo para volver a tomar decisiones sin miedo
- Construir independencia real paso a paso

**Chapter 11: El Cuerpo Que Olvidaste Que Tenías**
- Reconectar con tu cuerpo después del trauma
- Movimiento, sueño y alimentación como herramientas de sanación
- Protocolo corporal de recuperación en cuatro semanas
- Cuando el cuerpo guarda lo que la mente no procesó

**Chapter 12: Construir Una Vida Que No Necesite Al Narcisista**
- Diseñar tu nueva identidad con base en valores propios
- Amistades, proyectos y rutinas que sostengan la recuperación
- El protocolo de los 90 días finales
- Cómo saber que ya has cruzado al otro lado

**Conclusión: No Es El Final, Es El Comienzo**
- Lo que lograste al llegar hasta aquí
- El paso siguiente más importante que puedes dar hoy
- Carta del autor al lector
- Tu Opinión Importa (CTA de reseña en Amazon)

Responde SOLO con el esquema estructural, sin explicaciones adicionales.` };
      }

      return { user: `Actúa como un Arquitecto Editorial experto en Amazon KDP. Diseña un índice COMPLETO para este libro.

Título: "${data.selectedIdea?.title}"
Subtítulo: "${data.selectedIdea?.subtitle}"
Descripción: "${data.selectedIdea?.description}"
Audiencia: "${data.selectedIdea?.targetAudience}"
Autor: ${data.authorName || 'el autor'}

ESTRUCTURA OBLIGATORIA:
- Introducción (con historia personal del autor que genere credibilidad)
- 9-12 Capítulos MÍNIMO. Si el título promete una cantidad (ej: "12 juegos", "7 pasos"), el índice DEBE cubrirlos TODOS
- 3-5 Subtítulos CORTOS por capítulo
- Conclusión con llamada a la acción

FORMATO EXACTO (respeta este formato al pie de la letra):
**Chapter 1: [Título atractivo]**
- [Subtítulo corto 1]
- [Subtítulo corto 2]
- [Subtítulo corto 3]

**Chapter 2: [Título atractivo]**
- [Subtítulo corto 1]
- [Subtítulo corto 2]
- [Subtítulo corto 3]

REGLAS CRÍTICAS:
1. CONCISIÓN: Cada subtítulo debe ser UNA FRASE CORTA (máximo 10-12 palabras). NO escribas párrafos ni descripciones largas.
2. COMPLETITUD: Genera TODOS los capítulos prometidos. No te detengas a mitad.
3. NUNCA Spanglish. Todo en español limpio.
4. Cada capítulo = una victoria para el lector. Títulos que prometan avance.
5. Responde SOLO con el esquema estructural, sin explicaciones adicionales.` };
    }

    case 3: {
      const chapterNum = data.currentWritingChapter ?? 1;
      const chapterInfo = data.chapters?.find(c => c.number === chapterNum) || data.chapters?.[chapterNum - 1];
      const chapterTitle = chapterInfo?.title ?? (chapterNum === 0 ? 'Introducción' : chapterNum === 99 ? 'Conclusión' : `Capítulo ${chapterNum}`);
      const subheadings = chapterInfo?.subheadings?.join(', ') ?? '';
      const bookTitle = data.selectedIdea?.title ?? '';

      // Detect Book 2 of the saga
      const isBook2 = bookTitle.toUpperCase().includes('DESPUÉS DEL ESPEJO');
      const isBook3 = bookTitle.toUpperCase().includes('MÁS ALLÁ DEL ESPEJO');
      const isBook4 = bookTitle.toUpperCase().includes('POR QUÉ DIGO QUE SÍ') || bookTitle.toUpperCase().includes('DIGO QUE SI');

      // ── SAGA CONTINUATION RULES ──────────────────────────
      let sagaRules = '';
      if (isBook3) {
        sagaRules = `

REGLAS DE CONTINUACIÓN DE SAGA (LIBRO 3 - MÁS ALLÁ DEL ESPEJO):
Este es el LIBRO 3 y final de tu trilogía.
El lector YA LEYÓ los dos anteriores ("El Espejo Roto" y "Después del Espejo").

LO QUE EL LECTOR YA SABE (TIENES ESTRICTAMENTE PROHIBIDO REPETIRLO):
- Del Libro 1: Qué es el narcisismo, gaslighting, refuerzo intermitente, tipos de narcisistas, máscaras.
- Del Libro 2: Cómo regular el sistema nervioso, terapias de trauma (EMDR, somática), Protocolo ANCLA para recaídas, contacto cero absoluto, fase aguda de ansiedad. NADA de supervivencia.

ESTADO ACTUAL DEL LECTOR Y ENFOQUE DEL LIBRO 3:
- El lector NO es una víctima ni un paciente en rehabilitación. Está en la fase de ESTABILIDAD y PODER PERSONAL.
- El libro trata de la OFENSIVA: pasar de límites defensivos a "Estándares de Alto Valor".
- Foco en diseño de vida: filtrar la excelencia, la independencia radical, ambición, construir el éxito propio y re-activar la intuición sin miedos al sabotaje del aburrimiento.

ESTILO DE REDACCIÓN DEL LIBRO 3:
- Cero condescendencia: No uses tono clínico, paternalista ni fosa positividad. Escribe con la fuerza de un "protocolo de operaciones". Habla de tú a tú.
- Estructura obligatoria: Valida una incomodidad nueva al inicio (ej. "el vértigo de la paz") e IMPERATIVAMENTE termina con un protocolo o ejercicio práctico de alto impacto.
- Usa jerga de empoderamiento: "auditoría del entorno", "costo de entrada", "tribu de alta vibración", "radar infalible", "dieta relacional".`;
      } else if (isBook2) {
        sagaRules = `

REGLAS DE CONTINUACIÓN DE SAGA (CRÍTICAS - APLICAR EN CADA LÍNEA):
Este es el LIBRO 2 de una saga. El libro 1 es "El Espejo Roto: Cómo Recuperar Tu Identidad Después De Vivir Con Un Narcisista". El lector YA LO LEYÓ. No repitas lo que ya sabe.

CONTENIDO QUE EL LIBRO 1 YA CUBRIÓ - PROHIBIDO RE-EXPLICAR:
- Qué es el narcisismo y cómo funciona
- Las máscaras del narcisista
- El gaslighting y cómo distorsiona tu percepción
- La erosión de identidad (el "borrado personal")
- El refuerzo intermitente / analogía de las tragamonedas
- La bioquímica detallada del vínculo (dopamina, cortisol, amígdala, hipocampo)
- La validación del daño ("lo que te pasó fue real")
- Las heridas invisibles (vergüenza tóxica, hipervigilancia, vacío de identidad)
- El duelo del vínculo tóxico
- Límites básicos
- Contacto cero (concepto)

CÓMO REFERENCIAR CONCEPTOS DEL LIBRO 1:
- En UNA FRASE de referencia y avanzar: "Como vimos en El Espejo Roto, [concepto en 1 línea]. Ahora vamos a trabajar con las herramientas para [acción concreta]."
- NUNCA re-explicar un concepto completo del libro 1.
- Máximo 1 referencia al libro 1 por capítulo. No más.

FOCO DEL LIBRO 2:
- Pregunta central: "¿Qué hago ahora?" (no "¿qué me pasó?")
- Tono: práctico, accionable, con protocolos paso a paso
- Cada capítulo: al menos 1 protocolo o ejercicio concreto que el lector pueda aplicar HOY
- Menos reflexión introspectiva, más instrucciones directas
- El lector ya pasó el shock y el reconocimiento. Está en fase de reconstrucción.

TERMINOLOGÍA PROHIBIDA (credibilidad del autor):
- NUNCA uses "clínico/a", "terapéutico/a", "tratamiento", "prescripción" para describir el contenido del libro
- Usa: "práctico/a", "paso a paso", "protocolo", "herramienta", "guía"
- El autor no es terapeuta. El libro no es sustituto de terapia profesional.
- El autor es un guía informado que investigó a fondo, NO un profesional clínico.
- Formato correcto: "El EMDR es un enfoque que ha mostrado resultados positivos en personas con trauma relacional..."
- Formato INCORRECTO: "Como profesionales, recomendamos...", "En mi práctica clínica...", "El tratamiento indicado..."`;
      }

      // ── CHAPTER-SPECIFIC RULES (Book 2, 3 and 4) ──────────────────────────
      let chapterSpecificRules = '';

      if (isBook4) {
        // Enforce different nucleus fears for the practical contexts
        if (chapterNum === 8) {
          chapterSpecificRules = `
REGLA ESPECIAL - CAPÍTULO 8 (Pareja):
Asegúrate de anclar la aplicación práctica de decir "no" en la pareja al MIEDO NUCLEAR de ese ámbito: El miedo al abandono y a no ser suficiente. Explica cómo este miedo profundo es el verdadero motor del fawning en relaciones de pareja, no el amor desinteresado.`;
        } else if (chapterNum === 9) {
          chapterSpecificRules = `
REGLA ESPECIAL - CAPÍTULO 9 (Trabajo):
Asegúrate de anclar la aplicación práctica de decir "no" en el trabajo al MIEDO NUCLEAR de ese ámbito: El miedo a la incompetencia o a perder el sustento. El desarrollo y los guiones para este capítulo deben enmarcar los límites como algo transaccional y profesional, eliminando la culpa por ser un "mal compañero".`;
        } else if (chapterNum === 10) {
          chapterSpecificRules = `
REGLA ESPECIAL - CAPÍTULO 10 (Familia y Amistades):
Asegúrate de anclar la aplicación práctica de decir "no" en la familia al MIEDO NUCLEAR de ese ámbito: El miedo a perder la pertenencia o la lealtad de la "tribu". Subraya que la culpa aquí es profunda y "ancestral", y orienta las herramientas a tolerar esa expulsión imaginaria.`;
        }
      }

      if (isBook3 && chapterNum === 9) {
        chapterSpecificRules = `
REGLA DE ORO ESTRICTA PARA EL CAPÍTULO 9 (Magnetismo sano y frecuencia energética):
Tienes ESTRICTAMENTE PROHIBIDO usar cualquier lenguaje esotérico, místico, New Age, espiritual o pseudocientífico. No hables de "Ley de Atracción", "manifestación", "chakras", "vibrar alto", "energía cuántica" ni del "universo alineándose".

CÓMO DEBES EXPLICARLO (Enfoque de Psicología Conductual):
En los libros de Edgar Manchón, el concepto de "frecuencia energética" y "magnetismo" se explica única y exclusivamente a través de la conducta humana y la psicología clínica/social.

Menciona explícitamente que el "cambio de frecuencia" significa:
1. Lenguaje corporal y comunicación: Caminas, hablas y miras de forma diferente porque ya no tienes miedo al conflicto. Eso lo notan los demás en milisegundos.
2. Repelente de depredadores: Los manipuladores buscan personas complacientes y con límites débiles. Cuando tu "energía" (comportamiento) demuestra que no toleras tonterías y tienes estándares altos, los narcisistas se alejan solos porque eres un objetivo "demasiado difícil y aburrido" para ellos.
3. Atracción de personas sanas: Las personas emocionalmente maduras se sienten atraídas por la coherencia, la responsabilidad afectiva y la gente que sabe decir "no" sin culpa. Eso es el "magnetismo sano".`;
      }

      if (isBook2) {
        if (chapterNum === 0 || chapterTitle.toLowerCase().includes('introducción') || chapterTitle.toLowerCase().includes('lo que nadie')) {
          chapterSpecificRules = `
REGLA ESPECIAL - INTRODUCCIÓN:
La sección sobre el autor debe centrarse en su motivación PERSONAL para escribir el libro y en su experiencia INVESTIGANDO el tema.
NUNCA debe implicar credenciales clínicas, título de terapeuta ni formación en salud mental.
El tono es: "Escribí esto porque lo viví, lo investigué a fondo y quiero compartir lo que aprendí".
NO: "Escribí esto como profesional de la salud mental".
Usa "Por qué escribí esta guía: mi camino personal con este tema" como encabezado, NO "mi camino clínico".`;
        } else if (chapterNum === 2) {
          chapterSpecificRules = `
REGLA ESPECIAL - CAPÍTULO 2:
La sección "Cómo el trauma narcisista altera tu biología" debe ser un RESUMEN de 2-3 párrafos MÁXIMO (menos de 500 palabras).
NO re-desarrollar la teoría de cortisol, amígdala e hipocampo. El lector ya lo leyó en El Espejo Roto.
Formato correcto: 1 párrafo de resumen tipo: "Tu sistema nervioso quedó alterado por el estrés crónico de la relación. Como vimos en El Espejo Roto, la exposición prolongada al abuso emocional cambia la forma en que tu cerebro procesa el peligro, la memoria y la toma de decisiones. Eso no fue tu culpa y -lo más importante- es reversible."
Luego ir DIRECTAMENTE al protocolo de regulación inmediata.
PROPORCIÓN OBLIGATORIA: 20% explicación (resumen breve) / 80% herramientas prácticas (protocolo, ejercicios, pasos concretos).`;
        } else if (chapterNum === 6) {
          chapterSpecificRules = `
REGLA ESPECIAL - CAPÍTULO 6:
Este capítulo orienta al lector sobre enfoques terapéuticos (EMDR, IFS, terapia sensoriomotriz, TCC, etc.).
El tono debe ser el de alguien que INVESTIGÓ estos enfoques y puede guiar al lector, NO el de un profesional que los practica.
Formato correcto: "El EMDR es un enfoque que ha mostrado resultados positivos en personas con trauma relacional. Funciona procesando recuerdos traumáticos mediante estimulación bilateral."
"Al buscar terapeuta, hay señales que indican que estás en buenas manos: [lista]. Y hay señales que indican que deberías buscar a otro profesional: [lista]."
Formato INCORRECTO: "Como profesionales, recomendamos...", "En mi práctica clínica he observado...", "El tratamiento indicado para..."
El autor es un guía informado, no un clínico.`;
        }
      }

      // ── CACHEABLE: stable across all 12 chapter calls of the same book ──
      // Prompt caching: this block is cached by Anthropic. Calls 2-12 pay
      // only 10% of the input cost for this section.
      const cachedSystem = `Actúa como un Escritor Fantasma (Ghostwriter) de élite especializado en libros "Non-Fiction" Best Sellers de Amazon.

CONTEXTO PERSISTENTE DEL LIBRO EN CURSO:
Libro: "${data.selectedIdea?.title}"
${isBook2 || isBook3 ? `Subtítulo: "${data.selectedIdea?.subtitle}"` : ''}
Audiencia (A quién le resolvemos el problema): "${data.selectedIdea?.targetAudience}"
Autor: ${data.authorName || 'el autor'}
${isBook2 ? 'POSICIÓN EN LA SAGA: Libro 2 de la Serie "Reconstrucción Emocional". El Libro 1 ("El Espejo Roto") ya fue publicado y leído por el lector.' : ''}
${isBook3 ? 'POSICIÓN EN LA SAGA: Libro 3 de la Serie "Reconstrucción Emocional". El cierre donde el lector ya está en plena estabilidad y asumiendo su poder personal.' : ''}
${isBook4 ? 'TONO: Práctico, revelador, una "bofetada compasiva" informada por la neurociencia pero escrita en un lenguaje absolutamente cotidiano y táctico.' : ''}
${sagaRules}

REGLAS CRÍTICAS DE PSICOLOGÍA DEL LECTOR Y REDACCIÓN:
- PROFUNDIDAD EXTREMA: No seas superficial. Desarrolla herramientas prácticas, guiones de diálogo interno y escenarios detallados.
- NUNCA uses "Casos Reales" falsos con nombres como "Roberto" o "Camila". Narra historias y simulaciones directas a la acción de la oficina. NO añadas etiquetas prefabricadas como "Ejemplo Representativo:" o "Escenario Práctico:" a las viñetas, eso suena a un disclaimer legal robótico que rompe la magia. Solo intercala y cuenta la historia naturalmente.
- CERO SPANGLISH: No mezclas anglicismos innecesarios si la palabra existe en español (Cero "Róbale su power"). Todo español limpio.
- CERO "YOÍSMO" (Salvo en la Introducción): Si estás escribiendo los capítulos, el LECTOR es el gran protagonista. Haz de espejo para su propia vida.
- Si el área es Dinero o Habilidades, enfócate en lo puramente práctico. Transforma al lector de "no saber" a "saber hacer".
- Usa encabezados H2 (##) para el título del capítulo.
- Usa encabezados H3 (###) para los subtítulos planteados.
- Tono empático, directo, accionable y cero relleno. Cada palabra debe empujar al lector hacia la solución.
- ORIGINALIDAD Y VALOR 100%: Amazon cierra cuentas por contenido duplicado o derechos de autor. Todo el contenido generado debe ser completamente único, original y aportar tanto valor real que las reseñas orgánicas positivas lleguen solas. Cero plagio, cero relleno.
- Idioma: Español neutro y natural (cero lenguaje robótico o traducciones literales del inglés).

REGLAS DE FORMATO KDP (OBLIGATORIAS):
- Guiones: Solo guión simple (-), NUNCA em-dash (—) ni dobles guiones (--)
- Género inclusivo: Siempre "mismo/a", "solo/a", "seguro/a", alternar ejemplos masculinos/femeninos
- Enfoque en presente: Máximo 1 referencia a infancia en TODO el libro, foco en la vida adulta actual (20-45 años)
- Sin artefactos en inglés
- Títulos de capítulo: SIEMPRE "Capítulo X: Título"
- Separadores: Exactamente "---" (tres guiones)

Cada llamada te pedirá escribir UN capítulo concreto siguiendo estas reglas.`;

      // ── DYNAMIC: changes per chapter call ──
      const user = `Escribe ahora el siguiente capítulo siguiendo el contexto persistente y las reglas del sistema.

Sección a escribir: ${chapterNum === 0 ? 'Introducción' : chapterNum === 99 ? 'Conclusión' : `Capítulo ${chapterNum}`}: ${chapterTitle}
Subtítulos a cubrir: ${subheadings}
${chapterSpecificRules}

Escribe AL MENOS 1500 - 2000 palabras para este capítulo. Desarrolla los conceptos con muchísima profundidad.

Escribe el capítulo completo AHORA en formato Markdown (extenso y detallado):`;

      return { cachedSystem, user };
    }

    case 4: {
      const outlineText = data.chapters?.map(c => {
        if (c.number === 0) return `SECCIÓN: Introducción - Título: ${c.title}`;
        if (c.number === 99) return `SECCIÓN: Conclusión - Título: ${c.title}`;
        return `CAPÍTULO ${c.number}: ${c.title}`;
      }).join('\n') ?? '';
      
      const hasIntro = data.chapters?.some(c => c.number === 0);
      const hasConclusion = data.chapters?.some(c => c.number === 99);
      const numRealChapters = data.chapters?.filter(c => c.number > 0 && c.number < 99).length ?? 0;
      
      const structureParts = [];
      if (hasIntro) structureParts.push('una Introducción');
      if (numRealChapters > 0) structureParts.push(`${numRealChapters} capítulos numerados`);
      if (hasConclusion) structureParts.push('una Conclusión');
      const structureDesc = structureParts.join(', ').replace(/, ([^,]*)$/, ' y $1');

      return { user: `Actúa como un maquetador profesional de ebooks y experto en KDP. Revisa y formatea el contenido de este ebook para su publicación en Amazon Kindle.

Libro: "${data.selectedIdea?.title}"
Autor: "${data.authorName}"

ESTRUCTURA REAL DEL LIBRO:
- El libro tiene ${structureDesc || 'varias secciones'}.
- NO INVENTES CAPÍTULOS. NO USES PLACEHOLDERS como "Título del capítulo X".
- USA LOS TÍTULOS REALES QUE TE DOY A CONTINUACIÓN PARA EL ÍNDICE.

ÍNDICE REAL DEL LIBRO (Copia estos títulos tal cual):
${outlineText}

Nota: Esta aplicación exporta automáticamente el libro como un archivo .docx formateado. Basándonos en los requisitos oficiales de Amazon KDP, el formato .docx (Word) es el IDEAL y RECOMENDADO para publicar como "Libro Electrónico (eBook Kindle)", ya que permite que el texto sea "texto ajustable" y se adapte perfectamente a diferentes tamaños de pantalla (a diferencia del PDF, que solo se recomienda si fuera para imprimir en versión "Tapa Blanda"). Tu tarea es proporcionar una guía sobre la estructura visual y de estilo para la versión eBook Kindle.

Proporciona:
1. **Guía de Formato** - Reglas de formato específicas para un ebook profesional (jerarquía de encabezados, estructura de párrafos)
2. **Revisión de Coherencia de Estilo** - Cualquier problema de tono o estilo a corregir en los capítulos
3. **Consejos de Formato para Kindle** - Uso de H1 para capítulos, H2 para subtítulos, espaciado correcto (1.15 o 1.5)
4. **Páginas Iniciales (Front Matter)** - Redacta una página de título (Título, Subtítulo, Autor: ${data.authorName}), página de derechos de autor, y formato del índice
5. **Páginas Finales (Back Matter - CRÍTICO para ventas)** - Plantilla "Acerca del Autor" (${data.authorName}) y sugerencias de llamadas a la acción (Call to Action). IMPORTANTE: NO incluyas ni sugieras poner el correo electrónico (email) del autor en ninguna parte del libro (ni en derechos de autor, ni en contacto, nada). El back matter es ESTRATÉGICO para el negocio KDP. Debe incluir en este orden: a) CTA de reseña en Amazon ("Tu Opinión Importa" - 3-4 líneas pidiendo reseña honesta), b) Página "También del autor" si hay otros libros en la saga (enlace al siguiente libro de la serie), c) CTA de newsletter/lead magnet del autor si lo tiene ("Descarga gratis mi guía sobre [tema]"), d) Acerca del autor (breve, 1 párrafo, sin email).
6. **Checklist de Calidad y Experiencia de Lectura** - Comprobaciones antes de publicar para asegurar que este libro de "Alto Contenido" mantenga al lector enganchado en Kindle o en versión impresa (Tapablanda).

Haz que las recomendaciones de formato sean específicas y procesables. Recuerda escribir ABSOLUTAMENTE TODO EN ESPAÑOL. La exportación a .docx es manejada automáticamente por esta herramienta.` };
    }

    case 5: {
      const bookTitle = data.selectedIdea?.title ?? '';
      const isBook4 = bookTitle.toUpperCase().includes('POR QUÉ DIGO QUE SÍ') || bookTitle.toUpperCase().includes('DIGO QUE SI');

      if (isBook4) {
        return { user: `Actúa como un diseñador de portadas minimalistas y experto en branding tipográfico. Tu objetivo es crear un Brief de diseño para la portada del libro "${data.selectedIdea?.title}".

REQUISITO ABSOLUTO: La portada debe ser 100% TIPOGRÁFICA. 
PROHIBICIÓN TOTAL: No incluyas personajes, figuras humanas, siluetas, cerebros, corazones, paisajes, luces marianas ni elementos esotéricos o místicos.

DIRECCIÓN VISUAL PARA LA IA (Nano Banana Pro):
1. **Fondo:** Color crema satinado o blanco roto mate (estilo libro clásico de psicología). Muy limpio.
2. **Jerarquía Visual:** 
   - Las palabras "SÍ" y "NO" deben ser de un tamaño COLOSAL, ocupando el 70% de la portada.
   - El color de "SÍ" y "NO" debe ser ROJO VIBRANTE / CHILLÓN (#FF0000), tipo señal de prohibición o alerta.
   - El resto del título ("¿POR QUÉ DIGO QUE... CUANDO QUIERO DECIR QUE...") debe ir en una tipografía Sans Serif moderna, pesada y firme, en color negro sólido.
3. **Composición:** Inspiración en el estilo de Herbert Fensterheim. Tipografía masiva que transmita fuerza y autoridad.
4. **Textos secundarios:**
   - Subtítulo: "${data.selectedIdea?.subtitle}" en la parte superior o inferior, fuente pequeña y elegante en negro.
   - Autor: "${data.authorName}" en la parte inferior, centrado, fuente firme en negro.

Escribe el Brief detallando estas instrucciones. Incluye una sección de "LO QUE NO DEBE APARECER" listando siluetas humanas y fondos oscuros.` };
      }

      return { user: `Actúa como un diseñador profesional de portadas de libros y experto en marketing. Crea un documento detallado (Brief) para diseñar una portada generada por IA usando Nano Banana Pro (generación de imágenes con Google Gemini):

Book Title: "${data.selectedIdea?.title}"
Subtitle: "${data.selectedIdea?.subtitle}"
Author: "${data.authorName}"
Target Audience: "${data.selectedIdea?.targetAudience}"
Genre/Niche: "${data.niche}"
${data.coverDesign ? `\nDIRECTRICES DE DISEÑO DEL AUTOR:\n${data.coverDesign}\n` : ''}

Proporciona:
1. **Concepto de la Portada (Empaque Fuerte)** - Descripción visual detallada (estado de ánimo, estilo, imágenes, composición) optimizada para IA. PRINCIPIO CLAVE: La portada NO tiene que ser "bonita" - tiene que decirle al lector ideal "este libro es para ti". Debe parecerse visualmente a otras portadas exitosas del mismo nicho/género para que el comprador la reconozca inmediatamente como relevante. Investiga los bestsellers del nicho "${data.niche}" y usa un estilo visual coherente con lo que ya funciona. En Amazon la gente SÍ juzga el libro por su portada; el diseño debe ser de élite para destacar entre miles de búsquedas.
2. **Paleta de Colores** - Colores hexadecimales específicos que funcionen para este nicho y evoquen las emociones correctas
3. **Dirección Tipográfica** - Recomendaciones de estilo de fuente para "${data.selectedIdea?.title}" y "${data.authorName}"
4. **Dirección de Arte** - Iluminación, perspectiva, profundidad de campo, textura y atmósfera visual para guiar la creación del prompt
5. **Guía de Composición** - Dónde colocar el título, subtítulo y nombre del autor ("${data.authorName}") en una portada vertical 9:16
6. **Especificaciones para Kindle** - Dimensiones exactas (1600 x 2560 píxeles), requisitos de formato de archivo y DPI para subir a KDP
7. **Qué Hacer y Qué No Hacer** - Específico para el nicho "${data.niche}" y lo que funciona en las miniaturas de Amazon
8. **Análisis de la Competencia** - Cómo investigar portadas similares de los más vendidos en Amazon para refinar el concepto
9. **Ajustes Post-Generación** - Consejos para ediciones menores después de la generación por IA (recorte, contraste, comprobación de legibilidad del texto)

Haz que los consejos de diseño sean específicos, procesables y enfocados en destacar en el nicho "${data.niche}". Recuerda: la portada será generada completamente por IA, así que describe el concepto visual con mucho detalle para facilitar la creación del prompt. IMPRESCINDIBLE: ESCRIBE TODO EN ESPAÑOL.` };
    }

    case 6:
      return { user: `Actúa como un Estratega Experto en el Algoritmo de Amazon KDP y Posicionamiento SEO. Tu objetivo no es enseñar a "subir un libro", sino enseñar a "vender una solución".

Recuerda esta premisa vital: "Publicar es algo técnico (darle a un botón), Vender es estratégico. Si solo publicas, eres un subidor de PDFs. Si vendes, creas activos digitales".

Libro: "${data.selectedIdea?.title}"
Subtítulo: "${data.selectedIdea?.subtitle}"
Autor: "${data.authorName}"
Audiencia Objetivo (El cliente): "${data.selectedIdea?.targetAudience}"
Nicho: "${data.niche}"

Nota: La app ya ha autogenerado el documento .docx maquetado y la portada 1600x2560 JPG. Es decir, hemos creado un libro de "Alto Contenido" (no ficción), huyendo de la alta competencia de los libros de bajo contenido. Tu trabajo ahora es ayudarle a dominar el marketplace con lo que llamamos un "Empaque Fuerte".

Genera una guía maestra y estratégica (NO un manual técnico aburrido) con este esquema:

1. **Mentalidad de Venta KDP y Alto Contenido:** Breve recordatorio de que en Amazon vendemos soluciones de alto contenido. El comprador es el protagonista, no el ego del autor. Firma este activo como "${data.authorName}".
2. **CAMBIO CRÍTICO 2024-2026: Del Algoritmo A9 al A10:** Amazon pasó de ranking por keywords (A9) a ranking por RENDIMIENTO REAL del libro (A10). Ahora Amazon evalúa tu libro durante 30 DÍAS COMPLETOS, no solo el pico de lanzamiento. Lo que mide: ventas consistentes diarias (no un solo spike), tasa de conversión de la página del libro, tiempo que los lectores pasan en tu página, reseñas de compras verificadas. Los rankings ahora se actualizan 1 vez al día (no cada hora como antes). Esto significa que ya no puedes "hackear" una ventana horaria. Necesitas rendimiento sostenido.
3. **Validación del Nicho antes de Publicar (Inteligencia de Mercado):** Antes de darle a publicar, el autor DEBE verificar: ¿Hay al menos 3-5 libros autopublicados en el mismo subnicho que facturan $2,000+/mes? ¿Tienen menos de 300 reseñas (competencia manejable)? ¿Fueron publicados en los últimos 12 meses (mercado activo)? Explica que competencia NO es mala - valida que hay demanda real. Si no hay competencia, no hay mercado. Lo peligroso son nichos genéricos saturados (ej: "disciplina", "cómo perder peso"). Lo que buscamos son subnichos específicos con demanda + competencia manejable. Recomienda herramientas como Helium 10 Blackbox para validar BSR promedio, ingresos estimados y competidores.
4. **NUEVAS Reglas de Keywords 2026 (3 errores que DEBES evitar):** a) NO incluir términos de formato ("Kindle", "ebook", "paperback", "tapa blanda") - Amazon los detecta automáticamente. b) NO usar variaciones ortográficas ni errores deliberados - Amazon autocorrige las búsquedas de los usuarios. c) NO repetir palabras que ya están en tu título o subtítulo - Amazon ya las indexó, estás desperdiciando casillas. ENFOQUE CORRECTO: claridad sobre cantidad. Amazon A10 prioriza 1-2 keywords de alta relevancia sobre intentar rankear para 50 términos diferentes. Cada keyword debe ser una frase de cola larga con intención de búsqueda real. Usa el autocompletado de Amazon (escribe una palabra en la barra de búsqueda de Kindle Store y observa las sugerencias).
5. **El Empaque Fuerte (Optimización de Metadatos A10):** Cómo usar las palabras clave exactas que la gente ya está buscando. Dónde colocarlas (Título, Subtítulo, Autor, y en las 7 casillas de backend KDP). REGLAS DE BACKEND KEYWORDS: Amazon te da 7 casillas de keywords. Cada una admite hasta 50 caracteres. NUNCA repitas una palabra entre casillas diferentes (Amazon ya las combina internamente). Usa cada casilla como una frase de cola larga única. El título debe contener keywords de cola larga con intención de compra. Herramientas de SEO recomendadas: Publisher Rocket (para investigación de keywords y categorías específicas de libros - la más precisa para KDP), Helium 10 (para análisis de competencia y BSR), Reedsy (herramienta GRATUITA de formateo profesional), y BookBrush (para mockups y materiales de marketing visual). Recuerda: el título con keywords es para AMAZON (decide dónde rankea tu libro), la portada es para el COMPRADOR (decide si hace clic).
6. **El Gancho de la Descripción:** Amazon ahora tiene un editor visual WYSIWYG para descripciones (ya no necesitas escribir HTML). Crea una descripción de venta KDP usando el formato de EMBUDO DE VENTAS (AIDA), céntrate en el dolor del usuario y no en lo bonito que es el libro. Usa negrita para los tropes/keywords principales. Recuerda: el 90% de los libros que no venden tienen una descripción genérica hecha con IA sin optimizar. Supera eso.
7. **Elección Estratégica de Categorías (Estrategia de 3 Niveles):** Usa 3 categorías con intención diferente: a) AMPLIA: para visibilidad general (ej: "Autoayuda"), b) MEDIA: tu categoría principal donde quieres posicionarte a largo plazo, c) NICHO: categoría hiper-específica donde es matemáticamente alcanzable el top 20 y la etiqueta "Best Seller". NUEVO: usa la herramienta gratuita BKlink para ver TODAS las categorías en las que rankea un libro competidor (no solo las públicas). Si en la primera semana no estás en el top 100 de al menos 1 categoría, CAMBIA de categorías inmediatamente desde tu panel de KDP.
8. **El "Look Inside" = Tu Landing Page:** La función "Mirar dentro" de Amazon es tu landing page real. Los compradores leen las primeras páginas antes de decidir. Tu introducción debe ENGANCHAR en los primeros 3 párrafos: validar el dolor del lector, prometer la transformación y demostrar que el autor sabe de lo que habla. Si pierdes al lector en el "Look Inside", ni la mejor portada ni los mejores ads te salvarán.
9. **Contenido A+ (El factor "Excelencia"):** Describe exactamente qué 3 módulos de Contenido A+ debe añadir para aumentar el valor percibido y la tasa de conversión. Este es un factor clave: los compradores que hacen clic pero NO compran suelen irse por falta de A+ Content profesional, malas reviews o descripciones pobres.
10. **Author Central (10 minutos que duplican ventas a largo plazo):** Configura tu página de autor en Author Central desde el menú Marketing del panel KDP. Cuando los lectores te siguen, Amazon les envía un email automático CADA VEZ que publiques un libro nuevo. Es marketing gratuito de por vida. Incluye en tu bio: tipos de libros que escribes, algo personal, y un CTA para que te sigan.
11. **Compliance 2026 (Proteger tu cuenta):** a) Declaración de IA: OBLIGATORIO declarar si el contenido fue generado o asistido por IA. Ser transparente no perjudica; ocultarlo y ser detectado puede suspender la cuenta. b) Keywords prohibidas: NUNCA uses "bestseller" (salvo badge oficial), "free", "Kindle Unlimited", nombres de otros autores, títulos de otros libros, ni claims no verificables ("premiado"). Amazon suprime libros sin aviso por estas infracciones. c) COPYRIGHT (razón #1 de cierre de cuentas): NUNCA uses en títulos, portadas ni contenido: nombres de marcas/empresas, logos, productos de terceros, nombres de celebridades, personajes ficticios, películas, series, equipos deportivos, canciones ni cualquier propiedad intelectual ajena. Ir siempre a temas genéricos y originales. d) Nota para sellers internacionales: si tu país no aparece en el formulario de KDP, puedes usar un servicio de marketplace payment como Payoneer para recibir pagos via una cuenta bancaria estadounidense y luego transferir a tu moneda local.
12. **Distribución Amplia (Más Allá de Amazon):** Aunque KDP Select (exclusividad Amazon) es ideal al principio por Kindle Unlimited, el autor debe saber que puede expandirse: IngramSpark para libros impresos en librerías físicas y tapas duras (Amazon no ofrece hardcover), Draft2Digital para ebooks en Kobo, Apple Books, Nook, Google Play y bibliotecas. Esto es especialmente valioso cuando ya tienes 3+ libros y quieres maximizar ingresos por múltiples canales.
13. **Checklist Anti-Fracaso antes de Publicar:** Las 12 cosas que debe comprobar con visión de "comprador" antes de darle al botón: portada que diga "este libro es para ti" al lector ideal (no solo bonita), descripción AIDA formateada, keywords de cola larga en backend (7 casillas, max 50 chars, sin repetir palabras entre casillas), 3 categorías estratégicas (amplia + media + nicho), A+ Content profesional, Author Central configurado, back matter estratégico (CTA reseña + siguiente libro + newsletter), "Look Inside" con introducción que enganche en 3 párrafos, declaración de IA correcta, precio de tapa blanda ≥ $9.99 para maximizar regalías del 60% (bajo $13.99 Amazon redujo al 50% en junio 2025), verificación de que el nicho tiene BSR < 80,000 y < 50 reseñas en competidores, plan de serie (siguiente libro en el mismo nicho ya ideado).

Mantén un tono directo, profesional y enfocado al 100% en la rentabilidad y psicología de compra.` };

    case 7:
      return { user: `Actúa como un Experto en Pricing, Psicología de Ventas y Finanzas para infoproductos en Amazon KDP.

Recuerda esta premisa: "Publicar es gratis, pero vender requiere inversión (de tiempo, paciencia o capital). Que sea gratis no significa que sea rentable".

Libro: "${data.selectedIdea?.title}"
Nicho: "${data.niche}"
Audiencia Objetivo: "${data.selectedIdea?.targetAudience}"

Desarrolla una Estrategia de Pricing enfocada en el valor percibido y el compromiso del cliente:

1. **La Psicología del Precio (Sesgo Mental del Comprador):** El comprador de Amazon tiene un sesgo mental: ya sabe cuánto "debería" costar un libro de este nicho. Si el precio está por debajo, desconfía (parece basura). Si está muy por encima, no compra. Explica por qué regalar el libro (0.00€) atrae curiosos sin compromiso, y cómo un precio premium atrae compradores que realmente aplican la solución. Menciona que el precio afecta directamente al CTR de Amazon Ads: un precio mal calibrado hace que la gente vea tu anuncio pero NO haga clic.
2. **Estrategia de Precio en 2 Fases (Algoritmo A10 - 2026):** FASE 1 - LANZAMIENTO ($0.99 durante los primeros 30 días): El objetivo NO es maximizar beneficio por venta, sino maximizar VOLUMEN de compradores. A $0.99 la barrera de compra es mínima. Más compradores = mejor ranking = más visibilidad orgánica = efecto bola de nieve. Además, la mayoría de lectores de no-ficción están en Kindle Unlimited: cuando leen tu libro vía KU, te pagan por páginas leídas (KENP), no por el precio de venta. Un libro de 200 páginas leído completo vía KU genera ~$1, más que la regalía del 35% sobre $0.99. FASE 2 - POST-LANZAMIENTO (a partir del día 31): Subir a $2.99 (activa el tramo de regalías del 70%). Monitorear el sales rank durante 48h. Si el rank se mantiene estable (top 5,000 en tu categoría), testear $3.99 la semana siguiente. IMPORTANTE: Cada cambio de precio es un test A/B. Si las ventas caen, cambia UNA variable a la vez (primero portada, luego precio), nunca ambas. Analiza qué cobran los competidores autopublicados exitosos en el mismo subnicho.
3. **Cálculo de Royalties, Break-Even ACOS y ROI (actualizado 2025-2026):** Desglose matemático COMPLETO. Explica el tramo del 70% vs 35%. CAMBIO JUNIO 2025: Amazon redujo las regalías de libros impresos (tapa blanda) bajo $13.99 del 60% al 50% por costes de impresión crecientes. Esto hace que las ganancias vía Kindle Unlimited (KENP) sean MÁS importantes que nunca. El KDP Select Global Fund alcanzó $53.2M en diciembre 2024 con pagos de ~$0.004-0.005 por página leída. Ejemplo concreto: libro a $6.99 → regalía ~$1.90 → Break-Even ACOS = ($1.90 / $6.99) x 100 = 27%. Esto significa: si tu ACOS en Amazon Ads está por debajo de 27%, estás ganando dinero SOLO con los ads. Pero INCLUSO un ACOS de 50-70% puede ser rentable porque los ads generan ventas orgánicas adicionales (efecto bola de nieve). Calcula cuántas ventas a X€ necesitas para ganar 500€/mes y 1.000€/mes.
4. **Estrategia KDP Select (Kindle Unlimited):** ¿Debe ser exclusivo de Amazon o ir "Wide"? Explica cómo las páginas leídas (KENP) son ingresos adicionales a las ventas directas. En el precio de lanzamiento de $0.99, la regalía del 35% es solo $0.35, pero las lecturas KU de un libro completo de 200+ páginas generan ~$1. Esto significa que KU es tu principal fuente de ingresos durante la fase de lanzamiento.
5. **Inversión Mínima Viable (Nuestra Ventaja Injusta):** Explica que la inversión base para lanzar un buen libro suele ser de $1,000 ($400 escritor, $100 portada, $400 Amazon Ads, $100 herramientas clave). PERO gracias a que nuestro sistema ya le ha creado los textos y la portada gratis 100% original, el autor NO necesita invertir esos $500. IMPORTANTE 2026: NO invertir en Amazon Ads hasta tener al menos 3 libros publicados. Con un solo libro, el coste de adquisición por anuncio raramente se recupera. Con 3+ libros, el "read-through" (lectores que compran los otros libros de la serie) convierte los ads en rentables. Mientras tanto, destinar ~$100 en herramientas (Helium 10 para keywords de cola larga) y enfocarse en la estrategia gratuita de email list + newsletter swaps para el lanzamiento.

Sé claro, emplea números reales y quita la falsa idea de que se puede generar riqueza sin invertir nada en Ads (pero explica CUÁNDO es el momento correcto para invertir).` };

    case 8:
      return { user: `Actúa como un Director de Marketing y Tráfico experto en escalar Libros a Top 100 de Amazon, apoyado en los "4 Pilares del Éxito en KDP".

Recuerda tu mantra: "Publicar es un evento aislado. Vender es un sistema. El libro empieza a vivir el día que le das a publicar, no termina ahí".

CONCEPTO CLAVE QUE DEBES GRABAR EN EL LECTOR: "Amazon Ads NO vende libros. Amazon Ads MUESTRA libros a más gente. El 90% de los libros que no venden es porque el libro es de baja calidad, NO porque los ads estén mal configurados. Si tu libro es bueno, los ads lo escalan. Si es malo, los ads solo queman dinero."

Libro: "${data.selectedIdea?.title}"
Subtítulo: "${data.selectedIdea?.subtitle}"
Audiencia: "${data.selectedIdea?.targetAudience}"
Nicho: "${data.niche}"

Diseña la Arquitectura del Sistema de Ventas (El plan para dejar de ser un creador pasivo y ser un vendedor activo):

CONTEXTO ALGORITMO A10 (2024-2026): Amazon ya no rankea por keywords sino por RENDIMIENTO REAL. Evalúa tu libro durante 30 DÍAS COMPLETOS. Rankings se actualizan 1x/día (no cada hora). Tu estrategia debe crear rendimiento sostenido, no un pico aislado de 3 días.

1. **La Mentalidad Post-Lanzamiento y los 4 Pilares:** Menciona brevemente los 4 pilares: 1. Nicho rentable, 2. Empaque fuerte, 3. Visibilidad (orgánica primero, ads después), 4. Escalabilidad. Analiza: si no hay ventas, ¿es falta de tráfico o falta de conversión? EXPECTATIVAS REALISTAS: Amazon necesita ~30 días para posicionar tu libro en su marketplace. No es como encender un interruptor. Cada libro publicado es como una línea de pesca en el agua que va a pescar para siempre (los libros permanecen en Amazon indefinidamente, sin renovaciones ni mínimos de ventas). El objetivo es tener MUCHAS líneas en el agua. Si pierdes motivación, aléjate 1-2 meses y vuelve a revisar. Probablemente empezarás a ver ventas orgánicas que no esperabas. PRIORIDAD para autores sin audiencia previa: apuntar a keywords de BAJA COMPETENCIA donde tu libro rankee orgánicamente en la primera página sin necesidad de ads. Verificar: si los primeros resultados tienen 10,000+ reseñas y autores bestsellers, es demasiado competitivo. Si tienen menos de 300 reseñas, es un buen objetivo.

2. **ANTES DE PUBLICAR: Construir Tu Audiencia (La Base de Todo):**
   a) **Lead Magnet:** Crear un libro corto GRATUITO (~10,000 palabras) en el mismo nicho que tu libro de pago. Subirlo a BookFunnel para que los lectores lo reciban a cambio de su email. Crear una landing page simple: "Descarga gratis mi guía sobre [tema]".
   b) **Objetivo: 1,500-2,000 suscriptores de email** antes de publicar tu libro de pago. ¿Por qué ese número? Porque desbloquea la estrategia gratuita más potente de KDP: los newsletter swaps.
   c) **3 métodos para crecer la lista:** 1) BookFunnel Group Promos (decenas de autores comparten sus lead magnets mutuamente). 2) Grupos de Facebook de autores para intercambio de listas. 3) Newsletter spots pagados ($10-60 para que autores con listas grandes promocionen tu lead magnet a sus suscriptores).
   d) Sin audiencia previa, dependes 100% de que Amazon te descubra aleatoriamente entre 12 millones de libros. Con audiencia, TÚ controlas tu lanzamiento.

3. **LA SEMANA DE LANZAMIENTO (7 días de ejecución):**
   a) **Newsletter Swaps:** Programa 28 intercambios de boletines durante la semana de lanzamiento (4 por día x 7 días). Cada swap = tú promocionas el libro de otro autor a tu lista, y ese autor promociona tu libro a la suya. Usa la plataforma BookClicker para encontrar partners. Al evaluar partners mira: tamaño de lista (mín. 1,000), open rate (mín. 20%), click-through rate (mín. 6%). Prioriza swaps tipo "solo" (solo tu libro) y "feature" (tu libro primero) sobre "mention" (tu libro entre varios). RESERVA estos swaps 2-4 semanas ANTES del lanzamiento.
   b) **Día 1 - Lanzamiento:** Publicar + enviar email a tu lista propia + 4 newsletter swaps salen ese día + email a tu equipo ARC.
   c) **Días 2-7:** 4 newsletter swaps más cada día. Tráfico constante y sostenido = exactamente lo que el algoritmo A10 recompensa.
   d) **Precio de lanzamiento: $0.99** durante los 30 primeros días (maximizar volumen, no beneficio por venta). KU page reads generan más que la regalía del 35%.

4. **Equipo ARC (Reseñas en 72 horas):**
   2 semanas antes del lanzamiento, enviar un email a tu lista pidiendo 20-30 voluntarios para leer el libro anticipadamente a cambio de una reseña HONESTA en Amazon. Enviarles el libro vía email o BookFunnel. El día de lanzamiento, recordarles que dejen su reseña. Objetivo: 10-20 reseñas verificadas en los primeros 3 días. NUNCA pedir reseñas de 5 estrellas ni decirles qué escribir. Amazon tiene IA que detecta reseñas falsas, incentivadas o coordinadas. Reseñas genuinas de ARC readers están 100% permitidas.

5. **LA VENTANA DE 30 DÍAS (Optimización Post-Lanzamiento):**
   a) **Semana 1:** Monitorear categorías. Usa BKlink (gratis) para ver todas las categorías de un libro competidor. Si no estás en top 100 de al menos 1 categoría, cambia categorías desde tu panel KDP inmediatamente.
   b) **Semanas 2-3:** Testear keywords. Busca cada keyword en Amazon Kindle Store. ¿Tu libro aparece en las primeras páginas? Si no, cambia esa keyword por las frases que ves en títulos de los top 10 de tu categoría.
   c) **Semana 4:** Subir precio a $2.99 (activa regalías del 70%). Si el rank se mantiene estable 48h, testear $3.99.
   d) **Descripción:** Usar el nuevo editor visual WYSIWYG de Amazon para formatear correctamente con negrita, saltos de línea y estructura AIDA.

6. **Amazon Ads (SOLO cuando tengas 3+ libros publicados Y 5+ reseñas):**
   Con un solo libro, los ads raramente son rentables. Con 3+ libros, el read-through (lectores que compran el resto de la serie) convierte los ads en un sistema escalable. REQUISITO PREVIO: espera a tener al menos 5 reseñas verificadas antes de activar ads. Sin reseñas, tu tasa de conversión será muy baja y quemarás presupuesto. Las reseñas son prueba social que cierra la venta.
   a) **Campaña Automática (Día 1 de ads):** advertising.amazon.com. Sponsored Products automática. Presupuesto: $10/día. Puja: $0.15. Estrategia: "Solo reducir" (NUNCA dinámicas). Nombre: "Auto - ${data.selectedIdea?.title} - [fecha]".
   b) **Esperar 5-6 días.** NO tocar nada. Amazon necesita datos.
   c) **Campaña Manual (Día 7+):** Copiar keywords rentables de la automática. 30-50 keywords de cola larga. Usar amplia + frase + exacta. Misma puja, misma estrategia.
   d) **Keywords Negativas:** Revisar y negativizar keywords irrelevantes.
   e) **Escalar gradualmente:** De $10/día a $50 cuando veas retorno positivo. Luego $100, $300 cuando tu catálogo lo sostenga.

7. **Métricas que DEBES Entender (Dashboard de Amazon Ads):**
   - **Impresiones:** Si son bajas: keywords irrelevantes O puja muy baja. Solución: más keywords de cola larga.
   - **CTR:** 0.5-1% = BIEN. >1% = EXCELENTE. <0.3% = PROBLEMA (portada o precio). Test A/B: primero portada, luego precio.
   - **CPC:** España ~$0.25, US ~$0.80-1.10. Ambos rentables si hay read-through.
   - **Tasa de Conversión:** 8-10% = BIEN. 15-20% = EXCELENTE. <3-5% = revisar A+ Content, descripción, reviews.
   - **ACOS:** ACOS bajo break-even = ganancia directa. ACOS 50-70% TAMBIÉN puede ser rentable por ventas orgánicas adicionales que generan los ads (efecto bola de nieve).

8. **Estandarizar la Excelencia (Test A/B a los 14 días):** Si no hay ventas: cambiar UNA variable a la vez. Primero portada (esperar datos). Si no mejora, restaurar portada y cambiar precio. Nunca cambiar ambas a la vez. Revisar: descripción, A+ Content, keywords backend.

9. **El Funnel Externo (Opcional pero escalable):** Cómo usar TikTok, Reels o Shorts hablando SOLO de los problemas del cliente (NO hablando del libro) y mandándolos al link de Amazon. CONSEJO CLAVE: Elige UNA sola plataforma de redes sociales donde tu audiencia objetivo esté y enfócate en ella. No intentes estar en todas. La consistencia en una plataforma supera la presencia mediocre en cinco. Dale al menos 1-2 meses antes de cambiar de estrategia. Los autores más exitosos son los más enfocados, no los que prueban todo.

10. **La Regla de Oro de las Reviews:** La calidad del libro trae reseñas orgánicas + el equipo ARC acelera las primeras. CTA al final del libro. Las reviews afectan directamente la tasa de conversión. Un libro con malas reviews = la gente hace clic pero NO compra.

11. **El Pilar de la Escalabilidad (La Saga y el Efecto Compuesto):** Los ingresos reales vienen de tener 5-10 libros publicados. Cada lanzamiento nuevo impulsa las ventas de los libros anteriores (efecto compuesto). Objetivo: publicar 1 libro/mes para mantener relevancia y momentum. Cómo este libro debe llevar a comprar el siguiente libro dentro de la misma saga/categoría. MODELO VERTICAL DE NICHO: con 10+ libros en el mismo nicho, te conviertes en "autor de referencia" - Amazon empieza a recomendar tus libros automáticamente cuando alguien compra en ese nicho. La serie de 3-5 libros genera un 30-40% de ventas cruzadas entre volúmenes. Menciona Lead Magnets, audiolibros vía ACX, traducciones a otros mercados (inglés, francés, alemán - Amazon tiene múltiples marketplaces), y que el autor conserva el 100% de sus derechos. HERRAMIENTA AVANZADA: Perpetua para automatización de ads cuando tengas un catálogo de 5+ libros (gestiona pujas y presupuestos con IA).
   MÉTRICAS BSR DE REFERENCIA: BSR < 80,000 = 2-5 ventas/día (zona rentable). Objetivo de lanzamiento: BSR < 50,000 en la primera semana. BSR < 10,000 = 20+ ventas/día (territorio de best seller). Monitorea el BSR diariamente durante los 30 primeros días.

Proporciona ejemplos concretos con números reales. Sé directo y accionable.` };

    default:
      return { user: 'Please provide a valid step number.' };
  }
}
