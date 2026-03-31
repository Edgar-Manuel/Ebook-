// ─── Niche Roulette Data ─────────────────────────────────────────────────────
// 100 nichos rentables para España y Latinoamérica, ponderados por probabilidad
// de éxito según demanda, competencia y facilidad de producción con IA.

export type NicheCategoryId = 'salud' | 'dinero' | 'psicologia' | 'productividad' | 'lifestyle';

export interface NicheCategory {
  id: NicheCategoryId;
  name: string;
  emoji: string;
  weight: number; // 0-100 — probabilidad relativa
  color: string;  // Tailwind color class
}

export interface Niche {
  id: number;
  name: string;
  category: NicheCategoryId;
  target: string;
  hook: string;
}

export const CATEGORIES: Record<NicheCategoryId, NicheCategory> = {
  salud:          { id: 'salud',          name: 'Salud y Biohacking',       emoji: '🧠', weight: 30, color: 'text-emerald-400' },
  dinero:         { id: 'dinero',         name: 'Dinero e IA',              emoji: '💰', weight: 25, color: 'text-yellow-400' },
  psicologia:     { id: 'psicologia',     name: 'Psicología y Relaciones',  emoji: '💜', weight: 20, color: 'text-purple-400' },
  productividad:  { id: 'productividad',  name: 'Productividad y Carrera',  emoji: '🎯', weight: 15, color: 'text-sky-400' },
  lifestyle:      { id: 'lifestyle',      name: 'Hobbies y Lifestyle',      emoji: '🌿', weight: 10, color: 'text-orange-400' },
};

export const NICHES: Niche[] = [
  // ─── SALUD Y BIOHACKING (30 nichos) ──────────────────────────────────────
  { id: 1,  category: 'salud', name: 'Cortisol y Estrés Crónico',         target: 'Adultos 30-55 con estrés laboral',               hook: 'Por qué estás agotado aunque duermas 8 horas' },
  { id: 2,  category: 'salud', name: 'Ayuno de Dopamina',                 target: 'Jóvenes 18-35 adictos al móvil',                  hook: 'Recupera tu concentración en 7 días sin apps' },
  { id: 3,  category: 'salud', name: 'Protocolo de Sueño Profundo',       target: 'Profesionales con insomnio',                      hook: 'Duerme como un niño sin pastillas ni suplementos' },
  { id: 4,  category: 'salud', name: 'Salud Hormonal Femenina (SOP)',     target: 'Mujeres 25-45 con desajustes hormonales',          hook: 'El plan que tu ginecólogo no te dio' },
  { id: 5,  category: 'salud', name: 'Longevidad Celular',                target: 'Adultos +40 interesados en antiaging',             hook: 'La ciencia real detrás de vivir más y mejor' },
  { id: 6,  category: 'salud', name: 'Dieta Antiinflamatoria',            target: 'Personas con dolor crónico o autoinmunes',         hook: 'Reduce la inflamación desde tu plato en 21 días' },
  { id: 7,  category: 'salud', name: 'Salud Intestinal (SIBO)',           target: 'Personas con problemas digestivos crónicos',       hook: 'Tu segundo cerebro está saboteando tu salud' },
  { id: 8,  category: 'salud', name: 'Biohacking para Mujeres',          target: 'Mujeres 30-50 interesadas en optimización',        hook: 'Hackea tu biología según tu ciclo menstrual' },
  { id: 9,  category: 'salud', name: 'Nootrópicos Naturales',             target: 'Estudiantes y profesionales de alto rendimiento',  hook: '10 sustancias legales que potencian tu cerebro' },
  { id: 10, category: 'salud', name: 'Movilidad para Oficinistas',        target: 'Trabajadores sedentarios con dolor de espalda',    hook: 'Elimina el dolor de espalda en 15 min al día' },
  { id: 11, category: 'salud', name: 'Menopausia y Alimentación',         target: 'Mujeres 45-60 en transición hormonal',             hook: 'Come según tu nueva realidad hormonal' },
  { id: 12, category: 'salud', name: 'Ayuno Intermitente Avanzado',       target: 'Personas que ya conocen el ayuno básico',          hook: 'Más allá del 16:8 — protocolos que realmente funcionan' },
  { id: 13, category: 'salud', name: 'Desintoxicación Digital',           target: 'Familias y adolescentes hiperconectados',          hook: '30 días para recuperar tu vida real' },
  { id: 14, category: 'salud', name: 'Tiroides y Metabolismo',            target: 'Personas con hipotiroidismo o metabolismo lento',  hook: 'Por qué no adelgazas aunque comas poco' },
  { id: 15, category: 'salud', name: 'Respiración y Nervio Vago',         target: 'Personas con ansiedad y estrés',                  hook: 'Calma tu sistema nervioso en 5 minutos' },
  { id: 16, category: 'salud', name: 'Dieta Cetogénica Hispana',          target: 'Hispanos que quieren hacer keto con comida local', hook: 'Keto con tortillas, aguacate y sazón latino' },
  { id: 17, category: 'salud', name: 'Resistencia a la Insulina',         target: 'Prediabéticos y personas con sobrepeso',           hook: 'Revierte la prediabetes antes de que sea tarde' },
  { id: 18, category: 'salud', name: 'HIIT en Casa sin Equipamiento',     target: 'Personas sin tiempo ni dinero para gimnasio',      hook: 'Transforma tu cuerpo en 20 minutos al día' },
  { id: 19, category: 'salud', name: 'Antiaging Natural',                 target: 'Mujeres y hombres +35 conscientes de su edad',     hook: 'Los 12 hábitos que retrasan el envejecimiento' },
  { id: 20, category: 'salud', name: 'Nutrición para el Cerebro',         target: 'Profesionales que notan declive cognitivo',        hook: 'Alimenta tu cerebro para pensar más rápido' },
  { id: 21, category: 'salud', name: 'Inflamación Silenciosa',            target: 'Adultos con fatiga crónica sin diagnóstico',       hook: 'La epidemia invisible que nadie te cuenta' },
  { id: 22, category: 'salud', name: 'Protocolo Inmunológico',            target: 'Personas que se enferman con frecuencia',          hook: 'Blindar tu sistema inmune de forma natural' },
  { id: 23, category: 'salud', name: 'Dolor Crónico sin Fármacos',        target: 'Personas con fibromialgia o dolor persistente',    hook: 'Vive sin dolor sin depender de ibuprofeno' },
  { id: 24, category: 'salud', name: 'Microbioma y Probióticos',          target: 'Personas interesadas en salud digestiva',          hook: 'Tus bacterias deciden tu peso y tu humor' },
  { id: 25, category: 'salud', name: 'Hidratación Celular',               target: 'Deportistas y personas con piel seca/envejecida',  hook: 'No basta con beber agua — hidrátate de verdad' },
  { id: 26, category: 'salud', name: 'Suplementación Inteligente',        target: 'Personas confundidas por el exceso de suplementos', hook: 'Los únicos 5 suplementos que realmente necesitas' },
  { id: 27, category: 'salud', name: 'Yoga Terapéutico',                  target: 'Personas con lesiones o movilidad reducida',       hook: 'Yoga adaptado para cuerpos reales' },
  { id: 28, category: 'salud', name: 'Pérdida de Peso Hormonal',          target: 'Mujeres +35 que no logran adelgazar',              hook: 'No es lo que comes, son tus hormonas' },
  { id: 29, category: 'salud', name: 'Recetas Funcionales en 15 min',     target: 'Personas ocupadas que quieren comer sano',         hook: 'Comida que cura, lista en un cuarto de hora' },
  { id: 30, category: 'salud', name: 'Salud Masculina después de los 40', target: 'Hombres +40 con baja energía o testosterona',      hook: 'Tu cuerpo cambió — tu rutina también debería' },

  // ─── DINERO E IA (25 nichos) ──────────────────────────────────────────────
  { id: 31, category: 'dinero', name: 'Prompts para Copywriting',          target: 'Copywriters y marketers digitales',                hook: 'Escribe textos que venden en la mitad de tiempo' },
  { id: 32, category: 'dinero', name: 'Automatización con IA',             target: 'Emprendedores que quieren escalar',                hook: 'Haz en 1 hora lo que antes tardabas un día' },
  { id: 33, category: 'dinero', name: 'Micro-SaaS para Principiantes',     target: 'Programadores y no-coders ambiciosos',             hook: 'Crea tu propio software y cobra suscripciones' },
  { id: 34, category: 'dinero', name: 'Inversión en ETFs desde Cero',      target: 'Jóvenes 25-40 que quieren invertir',               hook: 'Invierte como los ricos sin ser millonario' },
  { id: 35, category: 'dinero', name: 'Side Hustles con IA',               target: 'Empleados que buscan ingresos extra',              hook: '7 negocios que puedes empezar hoy con ChatGPT' },
  { id: 36, category: 'dinero', name: 'Agencia de Contenido con IA',       target: 'Freelancers que quieren escalar a agencia',        hook: 'Monta una agencia de marketing con 2 herramientas' },
  { id: 37, category: 'dinero', name: 'Ventas por WhatsApp Business',      target: 'Pequeños comerciantes y vendedores',               hook: 'Convierte chats en ventas con este sistema' },
  { id: 38, category: 'dinero', name: 'Finanzas para Freelancers',         target: 'Autónomos sin control de sus finanzas',            hook: 'Deja de vivir mes a mes siendo tu propio jefe' },
  { id: 39, category: 'dinero', name: 'Airbnb Arbitrage',                  target: 'Inversores inmobiliarios sin capital inicial',      hook: 'Gana con Airbnb sin ser dueño de una propiedad' },
  { id: 40, category: 'dinero', name: 'Cripto-Seguridad Básica',           target: 'Personas con cripto que temen perderlo todo',       hook: 'Protege tu inversión de los 5 hackeos más comunes' },
  { id: 41, category: 'dinero', name: 'Prompt Engineering Avanzado',       target: 'Profesionales tech y early adopters',               hook: 'Domina la IA que dominará tu industria' },
  { id: 42, category: 'dinero', name: 'IA para tu Profesión',              target: 'Abogados, contadores, arquitectos, médicos',       hook: 'Tu competencia ya usa IA — tú todavía no' },
  { id: 43, category: 'dinero', name: 'Ingresos Pasivos Digitales',        target: 'Personas que quieren libertad financiera',          hook: 'Gana dinero mientras duermes (de verdad)' },
  { id: 44, category: 'dinero', name: 'Trading Algorítmico Básico',        target: 'Traders novatos interesados en automatización',     hook: 'Deja que un bot opere por ti las 24 horas' },
  { id: 45, category: 'dinero', name: 'Dropshipping con IA en 2026',       target: 'Emprendedores que quieren tienda online',           hook: 'Vende sin stock usando IA para encontrar ganadores' },
  { id: 46, category: 'dinero', name: 'Email Marketing Automatizado',      target: 'Negocios online que no usan email',                hook: 'El canal que convierte 40x más que Instagram' },
  { id: 47, category: 'dinero', name: 'WordPress con IA',                  target: 'Bloggers y dueños de webs',                        hook: 'Crea una web profesional en un fin de semana' },
  { id: 48, category: 'dinero', name: 'Diseño Gráfico con IA',             target: 'Freelancers creativos y community managers',        hook: 'Diseña como un profesional sin saber diseñar' },
  { id: 49, category: 'dinero', name: 'YouTube Shorts sin Cámara',         target: 'Creadores de contenido introvertidos',              hook: 'Monetiza YouTube sin mostrar tu cara' },
  { id: 50, category: 'dinero', name: 'Amazon FBA para Hispanos',          target: 'Emprendedores en Latam que quieren vender en USA',  hook: 'Vende en Amazon USA desde cualquier país' },
  { id: 51, category: 'dinero', name: 'Monetizar TikTok',                  target: 'Creadores con seguidores que no monetizan',         hook: 'Tus vídeos valen más de lo que crees' },
  { id: 52, category: 'dinero', name: 'Impresión bajo Demanda',            target: 'Diseñadores y emprendedores creativos',             hook: 'Vende camisetas y tazas sin invertir un euro' },
  { id: 53, category: 'dinero', name: 'Consultoría Digital desde Casa',    target: 'Profesionales expertos sin clientes online',        hook: 'Cobra por lo que ya sabes desde tu sofá' },
  { id: 54, category: 'dinero', name: 'Declarar Criptomonedas en España',  target: 'Inversores crypto en España',                      hook: 'Evita multas de Hacienda con esta guía paso a paso' },
  { id: 55, category: 'dinero', name: 'Crear Apps sin Código',             target: 'Emprendedores no técnicos con ideas',               hook: 'Tu idea de app hecha realidad sin programar' },

  // ─── PSICOLOGÍA Y RELACIONES (20 nichos) ──────────────────────────────────
  { id: 56, category: 'psicologia', name: 'Detectar Narcisistas',              target: 'Víctimas de abuso emocional',                 hook: 'Las 15 señales que estás ignorando' },
  { id: 57, category: 'psicologia', name: 'Apego Ansioso',                     target: 'Personas con miedo al abandono en pareja',     hook: 'Por qué amas demasiado y cómo parar' },
  { id: 58, category: 'psicologia', name: 'Comunicación Asertiva',             target: 'Personas que no saben decir que no',           hook: 'Di lo que piensas sin sentirte culpable' },
  { id: 59, category: 'psicologia', name: 'Paternidad Positiva',               target: 'Padres y madres de niños 2-12 años',          hook: 'Educa sin gritar y sin perder los nervios' },
  { id: 60, category: 'psicologia', name: 'Lenguaje Corporal en Negocios',     target: 'Vendedores y profesionales corporativos',      hook: 'Lee a tu cliente antes de que abra la boca' },
  { id: 61, category: 'psicologia', name: 'Superar Rupturas',                  target: 'Personas recién separadas o divorciadas',      hook: 'De la ruptura a la reconstrucción en 30 días' },
  { id: 62, category: 'psicologia', name: 'Estoicismo Moderno',                target: 'Hombres 25-45 buscando filosofía práctica',    hook: 'Marco Aurelio tenía tu mismo problema' },
  { id: 63, category: 'psicologia', name: 'Carisma y Habilidades Sociales',    target: 'Introvertidos que quieren conectar mejor',     hook: 'Cómo caer bien sin fingir ser otro' },
  { id: 64, category: 'psicologia', name: 'Mindfulness para Ansiedad',         target: 'Personas con ansiedad que no quieren fármacos', hook: 'Calma tu mente en 10 minutos al día' },
  { id: 65, category: 'psicologia', name: 'Límites con la Familia',            target: 'Adultos con familias tóxicas o invasivas',     hook: 'Quiérelos sin que te destruyan' },
  { id: 66, category: 'psicologia', name: 'Inteligencia Emocional Práctica',   target: 'Líderes y profesionales en equipos',           hook: 'Las emociones que te hacen ganar o perder' },
  { id: 67, category: 'psicologia', name: 'Dependencia Emocional',             target: 'Personas que no pueden estar solas',            hook: 'Aprende a estar bien contigo mismo primero' },
  { id: 68, category: 'psicologia', name: 'Autoestima para Mujeres',           target: 'Mujeres 25-50 con baja autovaloración',        hook: 'Deja de pedir permiso para existir' },
  { id: 69, category: 'psicologia', name: 'Psicología Oscura (Defensa)',       target: 'Personas que quieren detectar manipulación',    hook: 'Las técnicas de manipulación que usan contra ti' },
  { id: 70, category: 'psicologia', name: 'Gestión de la Ira',                 target: 'Personas con explosiones emocionales',          hook: 'Deja de arrepentirte de lo que dices enfadado' },
  { id: 71, category: 'psicologia', name: 'Relaciones de Pareja Sanas',        target: 'Parejas en crisis o que quieren mejorar',       hook: 'El manual que no te dieron al empezar a convivir' },
  { id: 72, category: 'psicologia', name: 'Crianza Respetuosa',                target: 'Padres jóvenes que rechazan el autoritarismo',  hook: 'Educa con firmeza sin perder la conexión' },
  { id: 73, category: 'psicologia', name: 'Soledad en la Era Digital',         target: 'Adultos que se sienten solos pese a las redes', hook: 'Rodeado de likes pero vacío por dentro' },
  { id: 74, category: 'psicologia', name: 'Trauma y Sanación',                 target: 'Personas con traumas de la infancia',           hook: 'Lo que te pasó no fue tu culpa — pero sanarlo sí es tu decisión' },
  { id: 75, category: 'psicologia', name: 'Persuasión Ética',                  target: 'Vendedores, líderes y negociadores',            hook: 'Convence sin presionar usando la ciencia del sí' },

  // ─── PRODUCTIVIDAD Y CARRERA (15 nichos) ──────────────────────────────────
  { id: 76, category: 'productividad', name: 'Gestión del Tiempo con Notion',    target: 'Profesionales desorganizados',               hook: 'Tu día tiene las mismas 24h que el de Elon Musk' },
  { id: 77, category: 'productividad', name: 'Oratoria para Tímidos',            target: 'Profesionales que temen hablar en público',   hook: 'Habla con seguridad aunque te tiemblen las piernas' },
  { id: 78, category: 'productividad', name: 'Liderazgo Remoto',                 target: 'Managers de equipos distribuidos',             hook: 'Lidera sin microgestionar desde un Zoom' },
  { id: 79, category: 'productividad', name: 'Trabajo Profundo (Deep Work)',     target: 'Profesionales creativos y del conocimiento',   hook: 'Haz en 4 horas lo que otros en 8' },
  { id: 80, category: 'productividad', name: 'Marca Personal en LinkedIn',       target: 'Profesionales que buscan visibilidad',         hook: 'De perfil invisible a referente de tu sector' },
  { id: 81, category: 'productividad', name: 'Preparar Oposiciones',             target: 'Opositores en España',                         hook: 'El sistema que aprueba: técnicas y planificación' },
  { id: 82, category: 'productividad', name: 'Lectura Rápida',                   target: 'Estudiantes y autodidactas',                   hook: 'Lee 3 libros por semana y recuerda lo importante' },
  { id: 83, category: 'productividad', name: 'Networking Estratégico',            target: 'Emprendedores y profesionales ambiciosos',     hook: 'Tu red de contactos vale más que tu CV' },
  { id: 84, category: 'productividad', name: 'Resiliencia Laboral',               target: 'Empleados quemados por el burnout',            hook: 'No renuncies todavía — recupérate primero' },
  { id: 85, category: 'productividad', name: 'Reinvención Profesional',           target: 'Profesionales +40 que quieren cambiar',        hook: 'Nunca es tarde para ser lo que debiste ser' },
  { id: 86, category: 'productividad', name: 'Productividad para TDAH',           target: 'Adultos diagnosticados o que sospechan TDAH',  hook: 'Tu cerebro no está roto — solo necesita otro sistema' },
  { id: 87, category: 'productividad', name: 'Escribir Mejor en 30 Días',        target: 'Profesionales que escriben mal los emails',     hook: 'Un email bien escrito vale más que una reunión' },
  { id: 88, category: 'productividad', name: 'Negociar tu Sueldo',               target: 'Empleados que llevan años sin aumento',         hook: 'Palabras exactas para pedir más dinero sin miedo' },
  { id: 89, category: 'productividad', name: 'Transición de Carrera +40',        target: 'Profesionales en reconversión laboral',         hook: 'Cambia de profesión sin volver a la universidad' },
  { id: 90, category: 'productividad', name: 'Trabajo Remoto Internacional',     target: 'Nómadas digitales y profesionales bilingües',   hook: 'Cobra en dólares viviendo en España o Latam' },

  // ─── HOBBIES Y LIFESTYLE (10 nichos) ──────────────────────────────────────
  { id: 91,  category: 'lifestyle', name: 'Huertos Urbanos',                target: 'Urbanitas con balcón o terraza',                   hook: 'Cultiva tus propias verduras en 1 metro cuadrado' },
  { id: 92,  category: 'lifestyle', name: 'Recetas Airfryer Saludables',    target: 'Familias que compraron una freidora de aire',       hook: '50 recetas rápidas que no sabías que podías hacer' },
  { id: 93,  category: 'lifestyle', name: 'Educación Canina Positiva',      target: 'Dueños de perros con problemas de conducta',        hook: 'Tu perro no es malo — solo necesita entenderte' },
  { id: 94,  category: 'lifestyle', name: 'Fotografía con Móvil',           target: 'Instagramers y vendedores online',                  hook: 'Fotos profesionales con el móvil que ya tienes' },
  { id: 95,  category: 'lifestyle', name: 'Viajes Solo/a Económicos',       target: 'Adultos que quieren viajar pero no tienen compañía', hook: 'El mundo es más seguro de lo que te contaron' },
  { id: 96,  category: 'lifestyle', name: 'Minimalismo Digital',            target: 'Personas abrumadas por la tecnología',              hook: 'Menos apps, más vida real' },
  { id: 97,  category: 'lifestyle', name: 'Yoga en Casa (30 min)',          target: 'Personas que no quieren ir al gimnasio',             hook: 'Flexibilidad y calma sin salir de tu salón' },
  { id: 98,  category: 'lifestyle', name: 'Panadería Artesanal en Casa',   target: 'Amantes de la cocina y el pan casero',               hook: 'Masa madre, hogaza perfecta y sin amasadora' },
  { id: 99,  category: 'lifestyle', name: 'Organización del Hogar Pro',     target: 'Familias con casas pequeñas desordenadas',           hook: 'Marie Kondo era solo el principio' },
  { id: 100, category: 'lifestyle', name: 'Jardines Verticales',            target: 'Urbanitas con poco espacio verde',                   hook: 'Transforma un muro en un jardín vivo' },
];

// ─── Weighted random selection ──────────────────────────────────────────────

const categoryWeights: { id: NicheCategoryId; cumWeight: number }[] = (() => {
  const cats = Object.values(CATEGORIES);
  let cum = 0;
  return cats.map((c) => {
    cum += c.weight;
    return { id: c.id, cumWeight: cum };
  });
})();

export function getWeightedRandomNiche(): Niche {
  const roll = Math.random() * 100;
  let catId: NicheCategoryId = 'salud';
  for (const cw of categoryWeights) {
    if (roll < cw.cumWeight) {
      catId = cw.id;
      break;
    }
  }
  const pool = NICHES.filter((n) => n.category === catId);
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Generates a spin sequence for the slot machine animation.
 * The sequence is a list of random niches ending with the winner
 * placed at a position that will be centered in the viewport.
 */
export function generateSpinSequence(winner: Niche, totalItems: number = 45): Niche[] {
  const otherNiches = NICHES.filter((n) => n.id !== winner.id);
  const sequence: Niche[] = [];

  // Fill with random niches
  for (let i = 0; i < totalItems - 2; i++) {
    sequence.push(otherNiches[Math.floor(Math.random() * otherNiches.length)]);
  }

  // Winner at second-to-last position (will be centered)
  sequence.push(winner);

  // One more random item after the winner
  sequence.push(otherNiches[Math.floor(Math.random() * otherNiches.length)]);

  return sequence;
}
