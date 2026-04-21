'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { insforge } from '@/lib/insforge';
import type { BookData, BookIdea, Chapter, Step } from '@/types';
import CostOptimizer, { type ModelConfig } from '@/components/CostOptimizer';
import NicheRoulette from '@/components/NicheRoulette';
import { postProcessBookText } from '@/lib/postprocess';

const STEPS = [
  { number: 1, title: 'Ideas',      sub: 'Genera y elige tu libro',   desc: 'Generate profitable book ideas with AI' },
  { number: 2, title: 'Estructura', sub: 'Índice y capítulos',        desc: 'Create detailed chapter structure' },
  { number: 3, title: 'Escritura',  sub: 'IA redacta cada capítulo',  desc: 'AI writes each chapter' },
  { number: 4, title: 'Formato',    sub: 'Prepara el documento',      desc: 'Format for Kindle publishing' },
  { number: 5, title: 'Portada',    sub: 'Diseño con IA',             desc: 'AI generates your cover with Nano Banana Pro' },
  { number: 6, title: 'KDP Setup',  sub: 'Publicación en Amazon',     desc: 'Amazon Kindle setup guide' },
  { number: 7, title: 'Precios',    sub: 'Estrategia de royalties',   desc: 'Pricing strategy & royalties' },
  { number: 8, title: 'Marketing',  sub: 'Plan de lanzamiento',       desc: 'Marketing & promotion plan' },
];

// ─── SVG Icons ──────────────────────────────────────────────────────────────

function SvgIcon({ name, size = 16, color = 'currentColor' }: { name: string; size?: number; color?: string }) {
  const icons: Record<string, React.ReactNode> = {
    book: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
    bulb: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 018.91 14"/></svg>,
    list: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
    pen: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>,
    file: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    image: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
    amazon: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>,
    tag: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
    horn: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    trash: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>,
    library: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>,
    settings: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
    download: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    dice: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2" ry="2"/><circle cx="8" cy="8" r="1" fill={color}/><circle cx="16" cy="8" r="1" fill={color}/><circle cx="12" cy="12" r="1" fill={color}/><circle cx="8" cy="16" r="1" fill={color}/><circle cx="16" cy="16" r="1" fill={color}/></svg>,
  };
  return <>{icons[name] || null}</>;
}

const initialBookData: BookData = {
  niche: '',
  interests: '',
  authorName: 'Edgar Manchón',
  ideas: [],
  allIdeas: [],
  selectedIdea: null,
  savedIdeas: [
    {
      title: 'DESPUÉS DEL ESPEJO: LA GUÍA PRÁCTICA PARA SANAR EL TRAUMA PSICOLÓGICO DE UNA RELACIÓN NARCISISTA',
      subtitle: 'Un protocolo paso a paso para reconstruir tu salud mental después del abuso emocional',
      description: 'Guía práctica de sanación post-narcisista con protocolos paso a paso, ejercicios aplicables y herramientas de reconstrucción emocional. Libro 2 de la saga, continuación directa de El Espejo Roto.',
      targetAudience: 'Personas 6-24 meses post-ruptura narcisista, lectores de El Espejo Roto que buscan el siguiente paso, víctimas de abuso emocional de larga duración buscando herramientas prácticas de reconstrucción',
    },
    {
      title: 'EL ESPEJO ROTO: CÓMO RECUPERAR TU IDENTIDAD DESPUÉS DE VIVIR CON UN NARCISISTA',
      subtitle: 'Una guía de reconstrucción psicológica paso a paso para restaurar tu autoestima, establecer límites inquebrantables y prosperar después del abuso',
      description: 'Reconstrucción profunda de identidad después del abuso narcisista con ejercicios prácticos y estrategias de límites.',
      targetAudience: 'Mujeres adultas que reconocen patrones narcisistas en su padre/madre, víctimas de abuso emocional buscando reconstrucción profunda, coaches y terapeutas',
    },
    {
      title: 'MÁS ALLÁ DEL ESPEJO: LA GUÍA AVANZADA PARA DISEÑAR UNA VIDA DE LIBERTAD',
      subtitle: 'Establece estándares de alto valor y no vuelvas a perderte nunca más',
      description: 'Cierre de trilogía. Manual de operaciones post-trauma diseñado para quienes ya sanaron. Transforma límites de supervivencia en estrategias de éxito, magnetismo sano, excelencia relacional e independencia radical.',
      targetAudience: 'Supervivientes de abuso emocional en fase de estabilidad. Lectores de los dos volúmenes anteriores que quieren herramientas ofensivas para consolidar estándares altos.',
    },
    {
      title: '¿POR QUÉ DIGO QUE SÍ CUANDO QUIERO DECIR QUE NO?',
      subtitle: 'Descubre por qué tu amabilidad es en realidad miedo y cómo dejar de complacer a los demás sin sentir culpa',
      description: 'El manual definitivo para desmontar la complacencia crónica (people-pleasing). Descubre cómo el miedo al rechazo activa la respuesta de adulación (fawning), llevándote a acumular una deuda secreta de resentimiento. Incluye protocolos tácticos para tolerar la abstinencia de validación y poner límites sanos.',
      targetAudience: 'Personas de 25 a 50 años, empáticas pero con baja tolerancia al conflicto. Funcionan como el sostén emocional de su entorno, arrastran agotamiento crónico y suelen explotar tras acumular meses de "síes" falsos.',
    },
  ],
  outline: '',
  chapters: [],
  writtenChapters: {},
  currentWritingChapter: 1,
  formattedContent: '',
  coverDesign: '',
  coverImage: null,
  coverPrompt: '',
  kdpSetup: '',
  pricingStrategy: '',
  marketingContent: '',
  marketingAssets: {},
  library: [],
};

function parseIdeasFromText(text: string): BookIdea[] {
  const ideas: BookIdea[] = [];
  const blocks = text.split(/\*\*Idea\s+\d+:/i).filter((b) => b.trim());

  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    const titleMatch = lines[0].match(/\*\*(.+?)\*\*/);
    const title = titleMatch
      ? titleMatch[1].trim()
      : lines[0].replace(/\*\*/g, '').trim();

    const subtitleMatch = lines.find((l) => /subt[ií]tulo:/i.test(l));
    const subtitle = subtitleMatch
      ? subtitleMatch.replace(/subt[ií]tulo:\s*/i, '').replace(/\*\*/g, '')
      : '';

    const descMatch = lines.find((l) => /descripci[oó]n:/i.test(l));
    const description = descMatch
      ? descMatch.replace(/descripci[oó]n:\s*/i, '').replace(/\*\*/g, '')
      : lines.slice(1, 3).join(' ');

    const audienceMatch = lines.find((l) => /target audience:|audiencia/i.test(l));
    const targetAudience = audienceMatch
      ? audienceMatch.replace(/target audience:\s*/i, '').replace(/audiencia[^:]*:\s*/i, '').replace(/\*\*/g, '')
      : 'Lectores generales';
      
    const keywordsMatch = lines.find((l) => /amazon keywords:/i.test(l));
    const amazonKeywords = keywordsMatch
      ? keywordsMatch.replace(/amazon keywords:\s*/i, '').replace(/\*\*/g, '').split(',').map(k => k.trim())
      : undefined;

    const categoriesMatch = lines.find((l) => /categor[ií]as sugeridas:/i.test(l));
    const suggestedCategories = categoriesMatch
      ? categoriesMatch.replace(/categor[ií]as sugeridas:\s*/i, '').replace(/\*\*/g, '').split(',').map(c => c.trim())
      : undefined;

    const toneMatch = lines.find((l) => /tono:/i.test(l));
    const tone = toneMatch
      ? toneMatch.replace(/tono:\s*/i, '').replace(/\*\*/g, '')
      : undefined;

    if (title && title.length > 3) {
      ideas.push({ title, subtitle, description, targetAudience, amazonKeywords, suggestedCategories, tone });
    }
  }

  // Fallback: if no structured ideas, split by numbered list
  if (ideas.length === 0) {
    const numbered = text.split(/\n(?=\d+\.)/).filter((b) => b.trim());
    for (const block of numbered.slice(0, 5)) {
      const firstLine = block.split('\n')[0].replace(/^\d+\.\s*/, '').replace(/\*\*/g, '').trim();
      if (firstLine.length > 3) {
        ideas.push({
          title: firstLine,
          subtitle: '',
          description: block.split('\n').slice(1, 3).join(' '),
          targetAudience: 'Lectores generales',
        });
      }
    }
  }

  return ideas.slice(0, 5);
}

function parseOutlineFromText(text: string): Chapter[] {
  const chapters: Chapter[] = [];
  const lines = text.split('\n');
  let currentChapter: Chapter | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    const chapterMatch =
      trimmed.match(/\*?\*?(?:Chapter|Cap[ií]tulo)\s+(\d+)[:.]?\s*(.+?)\*?\*?$/i) ??
      trimmed.match(/^#{1,3}\s+(?:Chapter|Cap[ií]tulo)\s+(\d+)[:.]?\s*(.+)$/i) ??
      trimmed.match(/^(\d+)\.\s+(.+)$/);

    const intMatch = trimmed.match(/\*?\*?(?:Introducci[oó]n|Introduction)(?:[:.-]\s*(.+?))?\*?\*?$/i);
    const concMatch = trimmed.match(/\*?\*?(?:Conclusi[oó]n|Conclusion)(?:[:.-]\s*(.+?))?\*?\*?$/i);

    if (chapterMatch) {
      // If we found a new chapter, push the previous one
      if (currentChapter) chapters.push(currentChapter);
      
      currentChapter = {
        number: parseInt(chapterMatch[1]),
        title: chapterMatch[2].replace(/\*\*/g, '').trim(),
        subheadings: [],
      };
      continue;
    } else if (intMatch) {
      if (currentChapter) chapters.push(currentChapter);
      currentChapter = {
        number: 0,
        title: 'Introducción' + (intMatch[1] ? `: ${intMatch[1].replace(/\*\*/g, '').trim()}` : ''),
        subheadings: [],
      };
      continue;
    } else if (concMatch) {
      if (currentChapter) chapters.push(currentChapter);
      currentChapter = {
        number: 99,
        title: 'Conclusión' + (concMatch[1] ? `: ${concMatch[1].replace(/\*\*/g, '').trim()}` : ''),
        subheadings: [],
      };
      continue;
    }

    // Match subheadings: lines starting with "- ", "* ", "  -", etc.
    if (currentChapter && (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• '))) {
      const sub = trimmed.slice(2).replace(/\*\*/g, '').trim();
      if (sub && sub.length > 2) {
        currentChapter.subheadings.push(sub);
      }
    }
  }

  if (currentChapter) chapters.push(currentChapter);

  // If no chapters parsed, try a simpler numbered list split
  if (chapters.length === 0) {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      const numMatch = line.match(/^(\d+)[\.\)]\s+(.+)$/);
      if (numMatch) {
        chapters.push({
          number: parseInt(numMatch[1]),
          title: numMatch[2].replace(/\*\*/g, '').trim(),
          subheadings: ['Introducción', 'Desarrollo del tema', 'Puntos clave'],
        });
      }
    }
  }

  // Final fallback: if still zero, create 10 placeholder chapters (since the prompt asks for 7-10)
  if (chapters.length === 0) {
    for (let i = 1; i <= 10; i++) {
      chapters.push({
        number: i,
        title: `Capítulo ${i}`,
        subheadings: ['Introducción', 'Contenido estratégico', 'Resumen práctico'],
      });
    }
  }

  return chapters;
}

function renderAIContent(text: string): React.ReactNode {
  return text.split('\n').map((line, i) => {
    const trimmed = line.trim();
    if (!trimmed) return <br key={i} />;

    if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
      return (
        <h2 key={i} className="font-serif text-eb-gold-lt font-semibold text-lg mt-5 mb-2">
          {trimmed.replace(/^#+\s/, '')}
        </h2>
      );
    }
    if (trimmed.startsWith('### ')) {
      return (
        <h3 key={i} className="font-serif text-eb-blue-lt font-semibold mt-4 mb-1">
          {trimmed.replace(/^#+\s/, '')}
        </h3>
      );
    }
    if (trimmed.startsWith('#### ')) {
      return (
        <h4 key={i} className="text-eb-blue-lt font-semibold mt-3 mb-1 text-sm">
          {trimmed.replace(/^#+\s/, '')}
        </h4>
      );
    }
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.match(/^\d+\.\s/)) {
      return (
        <li key={i} className="ml-5 mb-1 text-eb-text list-disc text-[0.925rem] leading-relaxed">
          {trimmed.replace(/^[-*]\s/, '').replace(/^\d+\.\s/, '')}
        </li>
      );
    }

    const parts = trimmed.split(/(\*\*.*?\*\*)/g);
    return (
      <p key={i} className="mb-2 text-eb-text leading-[1.8] text-[0.925rem]">
        {parts.map((part, j) =>
          part.startsWith('**') && part.endsWith('**') ? (
            <strong key={j} className="text-[#e8edf5] font-semibold">
              {part.slice(2, -2)}
            </strong>
          ) : (
            part
          )
        )}
      </p>
    );
  });
}

export default function Home() {
  const [phase, setPhase] = useState<'setup' | 'wizard'>('setup');
  const [modelConfig, setModelConfig] = useState<ModelConfig | null>(null);
  const [step, setStep] = useState<Step>(1);
  const [bookData, setBookData] = useState<BookData>(initialBookData);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamedText, setStreamedText] = useState('');
  const [error, setError] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [coverError, setCoverError] = useState('');
  const [isGeneratingMarketing, setIsGeneratingMarketing] = useState(false);
  const [marketingError, setMarketingError] = useState('');
  const [pubFormats, setPubFormats] = useState<{ ebook: boolean; paperback: boolean }>({ ebook: true, paperback: false });
  const streamRef = useRef<string>('');
  const contentEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(false);

  const [isLoaded, setIsLoaded] = useState(false);

  // Persistence: Load from localStorage
  useEffect(() => {
    if (isLoaded) return;

    const savedData = localStorage.getItem('ebook_ai_data');
    const savedStep = localStorage.getItem('ebook_ai_step');
    const savedConfig = localStorage.getItem('ebook_ai_config');
    const savedPhase = localStorage.getItem('ebook_ai_phase');

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Restore images from separate localStorage key
        let restoredCoverImage: string | null = null;
        let restoredMarketingAssets: Record<string, string> = {};
        try {
          const savedImages = localStorage.getItem('ebook_ai_images');
          if (savedImages) {
            const imgs = JSON.parse(savedImages);
            restoredCoverImage = imgs.coverImage || null;
            restoredMarketingAssets = imgs.marketingAssets || {};
          }
        } catch (e) {
          console.warn('Failed to restore images from localStorage', e);
        }
        // Merge with initialBookData to ensure new properties like 'library' exist
        
        // ── One-time migration: fix Book 2 title (CLÍNICA → PRÁCTICA) ──
        const migrateIdea = (idea: BookIdea): BookIdea => {
          if (idea.title?.includes('GUÍA CLÍNICA') && idea.title?.includes('DESPUÉS DEL ESPEJO')) {
            return {
              ...idea,
              title: idea.title.replace('GUÍA CLÍNICA', 'GUÍA PRÁCTICA'),
              subtitle: idea.subtitle?.replace('protocolo terapéutico', 'protocolo') ?? idea.subtitle,
              description: idea.description?.replace(/clínica/gi, 'práctica').replace(/terapia profesional adaptadas/gi, 'reconstrucción emocional') ?? idea.description,
            };
          }
          return idea;
        };
        let migratedSavedIdeas = (parsed.savedIdeas && parsed.savedIdeas.length > 0)
          ? parsed.savedIdeas.map(migrateIdea)
          : [...initialBookData.savedIdeas];
          
        // Merge any new hardcoded default ideas (like Book 3) that are missing from localStorage
        for (const defaultIdea of initialBookData.savedIdeas) {
          if (!migratedSavedIdeas.some((idea: any) => idea.title === defaultIdea.title)) {
            migratedSavedIdeas.push(defaultIdea);
          }
        }

        const migratedSelectedIdea = parsed.selectedIdea ? migrateIdea(parsed.selectedIdea) : null;

        setBookData({
          ...initialBookData,
          ...parsed,
          // Ensure arrays are initialized if missing
          library: parsed.library || [],
          allIdeas: parsed.allIdeas || [],
          savedIdeas: migratedSavedIdeas,
          selectedIdea: migratedSelectedIdea,
          writtenChapters: parsed.writtenChapters || {},
          // Restore images
          coverImage: restoredCoverImage,
          marketingAssets: restoredMarketingAssets,
        });
      } catch (e) {
        console.error('Failed to load book data', e);
      }
    }
    
    if (savedStep) {
      const s = parseInt(savedStep);
      console.log('Restoring step:', s);
      setStep(s as Step);
    }

    if (savedConfig) {
      try {
        setModelConfig(JSON.parse(savedConfig));
      } catch (e) {
        console.error('Failed to load config', e);
      }
    }
    if (savedPhase === 'wizard') setPhase('wizard');
    
    setIsLoaded(true);
  }, [isLoaded]);

  // Persistence: Save to localStorage (only after initialized)
  useEffect(() => {
    if (!isLoaded) return;
    if (bookData !== initialBookData) {
      try {
        // Save main data WITHOUT images and library (keeps under 5MB quota)
        const dataToSave = {
          ...bookData,
          library: [],
          coverImage: null,
          marketingAssets: {},
        };
        localStorage.setItem('ebook_ai_data', JSON.stringify(dataToSave));
      } catch (e) {
        console.warn('LocalStorage quota exceeded for main data.', e);
      }

      // Save images in a separate key (cover + A+ assets)
      try {
        const hasImages = bookData.coverImage || Object.keys(bookData.marketingAssets).length > 0;
        if (hasImages) {
          const imageData = {
            coverImage: bookData.coverImage,
            marketingAssets: bookData.marketingAssets,
          };
          localStorage.setItem('ebook_ai_images', JSON.stringify(imageData));
        }
      } catch (e) {
        console.warn('LocalStorage quota exceeded for images. Images are backed up in InsForge Cloud.', e);
      }
    }
  }, [bookData, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('ebook_ai_step', step.toString());
  }, [step]);

  useEffect(() => {
    if (modelConfig) {
      localStorage.setItem('ebook_ai_config', JSON.stringify(modelConfig));
    }
  }, [modelConfig]);

  useEffect(() => {
    try {
      localStorage.setItem('ebook_ai_phase', phase);
    } catch (e) {}
  }, [phase]);

  const resetProject = () => {
    if (confirm('¿Estás seguro de que quieres borrar este proyecto y empezar de cero? Se mantendrá tu Biblioteca de libros finalizados pero perderás el progreso del libro actual.')) {
      const { library, savedIdeas, allIdeas } = bookData;
      setBookData({ ...initialBookData, library, savedIdeas, allIdeas });
      setStep(1);
      setStreamedText('');
      localStorage.removeItem('ebook_ai_data');
      localStorage.removeItem('ebook_ai_step');
    }
  };

  const saveToLibrary = async () => {
    if (!bookData.selectedIdea) return;

    // Snapshot all generated data explicitly to avoid missing fields
    const snapshot: BookData = {
      ...bookData,
      // Ensure step 6/7/8 data is captured even if user is still on a step
      kdpSetup: bookData.kdpSetup || '',
      pricingStrategy: bookData.pricingStrategy || '',
      marketingContent: bookData.marketingContent || '',
      // Clean up non-serializable/large fields for library entry
      library: [],
    };

    // Full row with all columns (requires migration to have run)
    const fullRow = {
      niche: snapshot.niche,
      interests: snapshot.interests,
      author_name: snapshot.authorName,
      selected_idea: snapshot.selectedIdea,
      outline: snapshot.outline,
      chapters: snapshot.chapters,
      written_chapters: snapshot.writtenChapters,
      cover_design: snapshot.coverDesign || null,
      cover_image: null, // Too large for DB — stored in Storage
      cover_prompt: snapshot.coverPrompt,
      kdp_setup: snapshot.kdpSetup || null,
      pricing_strategy: snapshot.pricingStrategy || null,
      marketing_content: snapshot.marketingContent || null,
      marketing_assets: {}, // Too large for DB — stored in Storage
    };

    // Minimal row (only original columns, always works)
    const minimalRow = {
      niche: snapshot.niche,
      interests: snapshot.interests,
      author_name: snapshot.authorName,
      selected_idea: snapshot.selectedIdea,
      outline: snapshot.outline,
      chapters: snapshot.chapters,
      written_chapters: snapshot.writtenChapters,
      cover_prompt: snapshot.coverPrompt,
    };

    // Add to local library immediately (keeps all rich data including steps 6/7/8)
    setBookData(prev => ({
      ...prev,
      library: [...prev.library, snapshot]
    }));

    try {
      // Try full row first (works after migration)
      let { error } = await insforge.database.from('books').insert([fullRow]);

      // If column doesn't exist, fallback to minimal row
      if (error?.code === 'PGRST204') {
        console.warn('Full save failed, trying minimal columns...');
        const res = await insforge.database.from('books').insert([minimalRow]);
        error = res.error;
      }

      if (error) throw error;
      alert('¡Libro guardado en tu Biblioteca Cloud de InsForge!');
    } catch (err) {
      const msg = err instanceof Error ? err.message : typeof err === 'object' ? JSON.stringify(err) : String(err);
      console.error('Cloud save failed:', msg);
      alert(`Error guardando en la nube: ${msg}\nSe guardará localmente.`);
    }
  };

  const [viewingLibraryBook, setViewingLibraryBook] = useState<BookData | null>(null);
  const [headerPanel, setHeaderPanel] = useState<'library' | 'nextBooks' | 'ideas' | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);

  // Cloud Sync: Fetch library from InsForge
  useEffect(() => {
    const fetchLibraryFromCloud = async () => {
      try {
        const { data, error } = await insforge.database
          .from('books')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          const cloudBooks = data.map((row: Record<string, unknown>) => ({
            ...initialBookData,
            niche: (row.niche as string) || '',
            interests: (row.interests as string) || '',
            authorName: (row.author_name as string) || '',
            selectedIdea: row.selected_idea as BookIdea,
            outline: (row.outline as string) || '',
            chapters: (row.chapters as Chapter[]) || [],
            writtenChapters: (row.written_chapters as Record<number, string>) || {},
            coverDesign: (row.cover_design as string) || '',
            coverPrompt: (row.cover_prompt as string) || '',
            kdpSetup: (row.kdp_setup as string) || '',
            pricingStrategy: (row.pricing_strategy as string) || '',
            marketingContent: (row.marketing_content as string) || '',
          }));

          // Merge with local library: prefer local data (richer) over cloud data (may lack columns)
          setBookData(prev => {
            const localByTitle = new Map(
              prev.library.map(b => [b.selectedIdea?.title || '', b])
            );
            const merged: BookData[] = cloudBooks.map(cloudBook => {
              const title = cloudBook.selectedIdea?.title || '';
              const localBook = localByTitle.get(title);
              if (localBook) {
                // Keep local version if it has richer data (e.g. steps 6/7/8 filled)
                return {
                  ...cloudBook,
                  kdpSetup: localBook.kdpSetup || cloudBook.kdpSetup,
                  pricingStrategy: localBook.pricingStrategy || cloudBook.pricingStrategy,
                  marketingContent: localBook.marketingContent || cloudBook.marketingContent,
                  writtenChapters: Object.keys(localBook.writtenChapters || {}).length > Object.keys(cloudBook.writtenChapters || {}).length
                    ? localBook.writtenChapters : cloudBook.writtenChapters,
                };
              }
              return cloudBook;
            });
            // Add any local-only books that aren't in the cloud
            for (const [title, localBook] of Array.from(localByTitle)) {
              if (!cloudBooks.some(cb => (cb.selectedIdea?.title || '') === title)) {
                merged.push(localBook as BookData);
              }
            }
            return { ...prev, library: merged };
          });
        }
      } catch (err) {
        console.error('Failed to fetch from InsForge', err);
      }
    };

    const fetchIdeasFromCloud = async () => {
      try {
        const { data, error } = await insforge.database
          .from('ideas')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          const cloudSaved = data.filter(r => r.is_next_book).map(r => r.idea as BookIdea);
          const cloudAll = data.map(r => r.idea as BookIdea);

          setBookData(prev => ({
            ...prev,
            // Merge cloud ideas with local, avoiding duplicates by title
            savedIdeas: mergeIdeasByTitle(prev.savedIdeas, cloudSaved),
            allIdeas: mergeIdeasByTitle(prev.allIdeas, cloudAll),
          }));
        }
      } catch (err) {
        console.error('Failed to fetch ideas from InsForge', err);
      }
    };

    if (isLoaded) {
      fetchLibraryFromCloud();
      fetchIdeasFromCloud();
    }
  }, [isLoaded]);

  // Auto-recovery: ensure hardcoded default ideas are always present in the state
  useEffect(() => {
    if (!isLoaded) return;
    setBookData(prev => {
      let changed = false;
      const newSaved = [...prev.savedIdeas];
      for (const defaultIdea of initialBookData.savedIdeas) {
        if (!newSaved.some(idea => idea.title === defaultIdea.title)) {
          newSaved.push(defaultIdea);
          changed = true;
        }
      }
      return changed ? { ...prev, savedIdeas: newSaved } : prev;
    });
  }, [isLoaded]);

  useEffect(() => {
    if (autoScroll) {
      contentEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [streamedText, autoScroll]);

  // Helper: merge ideas arrays avoiding duplicates by title
  const mergeIdeasByTitle = (existing: BookIdea[], incoming: BookIdea[]): BookIdea[] => {
    const titles = new Set(existing.map(i => i.title));
    return [...existing, ...incoming.filter(i => !titles.has(i.title))];
  };

  // Cloud Sync: Save ideas to InsForge whenever they change
  const prevIdeasRef = useRef<string>('');
  useEffect(() => {
    if (!isLoaded) return;
    const key = JSON.stringify({ savedIdeas: bookData.savedIdeas, allIdeas: bookData.allIdeas });
    if (key === prevIdeasRef.current) return;
    prevIdeasRef.current = key;

    const syncIdeasToCloud = async () => {
      try {
        // Upsert all ideas: each idea is a row with is_next_book flag
        const rows = bookData.allIdeas.map(idea => ({
          title: idea.title,
          idea,
          is_next_book: bookData.savedIdeas.some(s => s.title === idea.title),
        }));

        // Also include savedIdeas that aren't in allIdeas (manually added)
        const allTitles = new Set(bookData.allIdeas.map(i => i.title));
        for (const idea of bookData.savedIdeas) {
          if (!allTitles.has(idea.title)) {
            rows.push({ title: idea.title, idea, is_next_book: true });
          }
        }

        if (rows.length === 0) return;

        // Delete existing and re-insert (simple sync)
        await insforge.database.from('ideas').delete().neq('title', '');
        const { error } = await insforge.database.from('ideas').insert(rows);
        if (error) console.error('Ideas cloud sync error:', error);
      } catch (err) {
        console.error('Ideas cloud sync failed:', err);
      }
    };

    syncIdeasToCloud();
  }, [bookData.savedIdeas, bookData.allIdeas, isLoaded]);

  const generate = useCallback(
    async (overrideData?: Partial<BookData>) => {
      setIsGenerating(true);
      setStreamedText('');
      setError('');
      streamRef.current = '';

      // Hack para obtener el estado MÁS RECIENTE de React en closures en bucle
      const latestData = await new Promise<BookData>((resolve) => {
        setBookData((prev) => {
          resolve(prev);
          return prev;
        });
      });

      const data = overrideData ? { ...latestData, ...overrideData } : latestData;

      // Strip heavy fields not needed by the API to avoid edge 128KB body limit
      const { writtenChapters, formattedContent, library, coverImage, marketingAssets, ...lightData } = data;

      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ step, data: lightData, modelConfig }),
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No reader');

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const payload = line.slice(6);
            if (payload === '[DONE]') continue;

            try {
              const parsed = JSON.parse(payload);
              if (parsed.error) throw new Error(parsed.error);
              if (parsed.text) {
                streamRef.current += parsed.text;
                setStreamedText(streamRef.current);
              }
            } catch (e) {
              if (e instanceof SyntaxError) continue;
              throw e;
            }
          }
        }

        // Save to book data — apply post-processing to chapter text
        const rawText = streamRef.current;
        const finalText = step === 3 ? postProcessBookText(rawText) : rawText;
        setBookData((prev) => {
          const updated = { ...prev };
          switch (step) {
            case 1: {
              const newIdeas = parseIdeasFromText(finalText);
              updated.ideas = newIdeas;
              // Auto-accumulate: add new ideas avoiding duplicates by title
              const existingTitles = new Set(prev.allIdeas.map(i => i.title));
              const unique = newIdeas.filter(i => !existingTitles.has(i.title));
              updated.allIdeas = [...prev.allIdeas, ...unique];
              break;
            }
            case 2:
              updated.outline = finalText;
              updated.chapters = parseOutlineFromText(finalText);
              break;
            case 3: {
              const chNum = overrideData?.currentWritingChapter ?? prev.currentWritingChapter;
              updated.writtenChapters = { ...prev.writtenChapters, [chNum]: finalText };
              break;
            }
            case 4:
              updated.formattedContent = finalText;
              break;
            case 5:
              updated.coverDesign = finalText;
              break;
            case 6:
              updated.kdpSetup = finalText;
              break;
            case 7:
              updated.pricingStrategy = finalText;
              break;
            case 8:
              updated.marketingContent = finalText;
              break;
          }
          return updated;
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Generation failed');
      } finally {
        setIsGenerating(false);
      }
    },
    [step, bookData]
  );

  if (phase === 'setup') {
    return (
      <CostOptimizer
        onConfirm={(config) => {
          setModelConfig(config);
          setPhase('wizard');
        }}
      />
    );
  }

  const generateCover = async () => {
    setIsGeneratingCover(true);
    setCoverError('');
    try {
      const response = await fetch('/api/cover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedIdea: bookData.selectedIdea,
          niche: bookData.niche,
          authorName: bookData.authorName,
          coverDesign: bookData.coverDesign,
        }),
      });
      const result = await response.json();
      if (!response.ok || result.error) {
        throw new Error(result.error ?? 'Cover generation failed');
      }
      setBookData((prev) => ({
        ...prev,
        coverImage: result.image,
        coverPrompt: result.prompt,
      }));
    } catch (err) {
      setCoverError(err instanceof Error ? err.message : 'Cover generation failed');
    } finally {
      setIsGeneratingCover(false);
    }
  };

  const generateMarketingPack = async () => {
    if (!bookData.coverImage || !bookData.selectedIdea) return;
    setIsGeneratingMarketing(true);
    setMarketingError('');
    
    try {
      const types = ['comparison', 'authority', 'method'];
      const newAssets: Record<string, string> = { ...bookData.marketingAssets };
      
      for (const type of types) {
        const response = await fetch('/api/marketing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: bookData.selectedIdea.title,
            authorName: bookData.authorName,
            coverImage: bookData.coverImage,
            type
          }),
        });
        
        const result = await response.json();
        if (!response.ok || result.error) throw new Error(result.error || `Error generating ${type}`);
        newAssets[type] = result.image;
        
        // Update state progressively
        setBookData(prev => ({
          ...prev,
          marketingAssets: { ...newAssets }
        }));
      }
    } catch (err) {
      setMarketingError(err instanceof Error ? err.message : 'Marketing pack failed');
    } finally {
      setIsGeneratingMarketing(false);
    }
  };

  const downloadCover = async () => {
    if (!bookData.coverImage) return;
    
    try {
      // Robust strip of data URL prefixes if they exist
      const base64Data = bookData.coverImage.replace(/^data:image\/[a-z]+;base64,/, '');
      
      // Use a more modern and safer conversion
      const sliceSize = 512;
      const byteCharacters = atob(base64Data);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      
      const blob = new Blob(byteArrays, { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const title = bookData.selectedIdea?.title ?? 'cover';
      const safeTitle = title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/gi, '-').toLowerCase();
      const fileName = `${safeTitle}-portada.jpg`;
      
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      // Guardado silencioso de la portada en InsForge Storage
      try {
        await insforge.storage.from('ebooks').remove(fileName).catch(() => {});
        const { error: storageError } = await insforge.storage
          .from('ebooks')
          .upload(fileName, blob);

        if (storageError) {
          console.error('Storage upload error (cover):', storageError.message);
        } else {
          console.log(`Portada ${fileName} guardada permanentemente en la nube.`);
        }
      } catch (uploadErr) {
        console.error('Failed to sync cover to InsForge Storage', uploadErr);
      }
    } catch (err) {
      console.error('Download failed', err);
      setCoverError('Failed to prepare download. Please try again.');
    }
  };

  const exportDocxForMode = async (mode: 'ebook' | 'paperback') => {
    const { coverImage, library, marketingAssets, ideas, savedIdeas, ...exportData } = bookData;
    const response = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...exportData, mode }),
    });

    if (!response.ok) throw new Error('Export failed');

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const title = bookData.selectedIdea?.title ?? 'ebook';
    const safeTitle = title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const suffix = mode === 'paperback' ? '_TB' : '_EB';
    const fileName = `${safeTitle}${suffix}.docx`;

    a.href = url;
    a.setAttribute('download', fileName);
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);

    // Cloud backup (delete old then upload to avoid duplicates)
    try {
      await insforge.storage.from('ebooks').remove(fileName).catch(() => {});
      const { error: storageError } = await insforge.storage
        .from('ebooks')
        .upload(fileName, blob);
      if (storageError) console.error('Storage upload error:', storageError.message);
      else console.log(`${fileName} guardado en la nube.`);
    } catch (uploadErr) {
      console.error('Failed to sync to InsForge Storage', uploadErr);
    }
  };

  const exportDocx = async () => {
    setIsExporting(true);
    setExportSuccess(false);
    try {
      if (pubFormats.ebook) await exportDocxForMode('ebook');
      // Delay between downloads so the browser doesn't block the second one
      if (pubFormats.ebook && pubFormats.paperback) {
        await new Promise(r => setTimeout(r, 1500));
      }
      if (pubFormats.paperback) await exportDocxForMode('paperback');
      setExportSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const exportKdpStrategy = () => {
    if (!bookData.selectedIdea) return;
    
    const content = `=========================================
ESTRATEGIA MAESTRA AMAZON KDP
=========================================

Libro: ${bookData.selectedIdea.title}
Subtítulo: ${bookData.selectedIdea.subtitle}
Autor: ${bookData.authorName || 'Autor'}

=========================================
1. KDP SETUP (Metadatos y Empaque)
=========================================
${bookData.kdpSetup || 'No generado'}

=========================================
2. PRICING (Psicología de Precios)
=========================================
${bookData.pricingStrategy || 'No generado'}

=========================================
3. MARKETING Y TRÁFICO
=========================================
${bookData.marketingContent || 'No generado'}
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeTitle = bookData.selectedIdea.title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/gi, '-').toLowerCase();
    
    link.href = url;
    link.setAttribute('download', `${safeTitle}-estrategia-amazon-kdp.txt`);
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const completedText =
    step === 1
      ? bookData.ideas.length > 0
        ? streamedText || `Generated ${bookData.ideas.length} ideas`
        : streamedText
      : step === 2
      ? bookData.outline || streamedText
      : step === 3
      ? bookData.writtenChapters[bookData.currentWritingChapter] || streamedText || bookData.outline
      : step === 4
      ? bookData.formattedContent || streamedText
      : step === 5
      ? bookData.coverDesign || streamedText
      : step === 6
      ? bookData.kdpSetup || streamedText
      : step === 7
      ? bookData.pricingStrategy || streamedText
      : bookData.marketingContent || streamedText;

  const canProceed =
    !isGenerating &&
    (step >= 6 ||
    (step === 5
      ? !!bookData.coverImage || (bookData.coverDesign && bookData.coverDesign.length > 50)
      : completedText && completedText.length > 100));

  // Calculate the furthest step the user has reached based on existing data
  const furthestStep: Step = (() => {
    if (bookData.marketingContent) return 8;
    if (bookData.pricingStrategy) return 7;
    if (bookData.kdpSetup) return 6;
    if (bookData.coverImage || bookData.coverDesign) return 5;
    if (bookData.formattedContent) return 4;
    if (Object.keys(bookData.writtenChapters ?? {}).length > 0) return 3;
    if (bookData.outline || (bookData.chapters?.length > 0)) return 2;
    if (bookData.selectedIdea) return 1;
    return 1;
  })() as Step;

  console.log('[debug] step:', step, 'furthestStep:', furthestStep, 'writtenChapters keys:', Object.keys(bookData.writtenChapters ?? {}), 'chapters:', bookData.chapters?.length, 'selectedIdea:', !!bookData.selectedIdea);

  const goNext = () => {
    if (step < 8) {
      setStep((s) => (s + 1) as Step);
      setStreamedText('');
    }
  };

  const goPrev = () => {
    if (step > 1) {
      setStep((s) => (s - 1) as Step);
      setStreamedText('');
    }
  };

  const chaptersWritten = Object.keys(bookData.writtenChapters).length;
  const totalChapters = bookData.chapters.length;

  return (
    <div className="flex h-screen overflow-hidden font-sans bg-eb-bg">
      {/* ─── Sidebar ─── */}
      <aside className="w-60 flex-shrink-0 bg-eb-surface border-r border-eb-border flex flex-col h-full overflow-y-auto">
        <div className="px-6 py-5 border-b border-eb-border flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-eb-gold-dim to-eb-gold flex items-center justify-center">
            <SvgIcon name="book" size={15} color="#fff"/>
          </div>
          <div className="font-serif text-base font-semibold text-eb-text">EbookAI</div>
        </div>
        {bookData.selectedIdea && (
          <div className="px-5 py-3.5 border-b border-eb-border">
            <div className="text-[0.65rem] text-eb-muted uppercase tracking-widest mb-1">Libro actual</div>
            <div className="text-[0.8rem] text-eb-gold-lt font-serif font-semibold leading-tight">
              {bookData.selectedIdea.title.length > 40 ? bookData.selectedIdea.title.slice(0, 40) + '…' : bookData.selectedIdea.title}
            </div>
          </div>
        )}
        <div className="py-3 flex-1">
          {STEPS.map((s) => {
            const done = s.number < step;
            const active = s.number === step;
            const locked = s.number > Math.max(step, furthestStep);
            return (
              <button key={s.number} onClick={() => { if (!locked) { setStep(s.number as Step); setStreamedText(''); } }}
                className={`w-full text-left px-5 py-2.5 flex items-center gap-3 transition-all font-sans border-l-2 border-none ${active ? 'bg-eb-gold/[0.08] !border-l-eb-gold' : '!border-l-transparent'} ${locked ? 'opacity-35 cursor-default' : 'cursor-pointer'}`}
                style={{ borderLeft: active ? '2px solid #c8963a' : '2px solid transparent' }}>
                <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[0.7rem] font-semibold ${done ? 'bg-eb-green text-white' : active ? 'bg-eb-gold text-[#0a0600]' : 'bg-eb-surface-2 border border-eb-border-2 text-eb-muted'}`}>
                  {done ? <SvgIcon name="check" size={11} color="#fff"/> : s.number}
                </div>
                <div>
                  <div className={`text-[0.825rem] ${active ? 'font-semibold text-eb-gold-lt' : done ? 'text-eb-text' : 'text-eb-muted'}`}>{s.title}</div>
                  <div className="text-[0.7rem] text-eb-muted-2 mt-px">{s.sub}</div>
                </div>
              </button>
            );
          })}
        </div>
        <div className="px-5 py-4 border-t border-eb-border flex flex-col gap-1.5">
          <button onClick={() => setHeaderPanel(headerPanel === 'library' ? null : 'library')}
            className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-[0.78rem] text-eb-muted hover:bg-eb-surface-2 transition-colors w-full text-left font-sans bg-transparent border-none cursor-pointer">
            <SvgIcon name="library" size={14}/> Biblioteca
            {bookData.library.length > 0 && <span className="ml-auto text-[9px] font-bold bg-eb-gold/20 text-eb-gold rounded-full w-4 h-4 flex items-center justify-center">{bookData.library.length}</span>}
          </button>
          <button onClick={() => setPhase('setup')}
            className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-[0.78rem] text-eb-muted hover:bg-eb-surface-2 transition-colors w-full text-left font-sans bg-transparent border-none cursor-pointer">
            <SvgIcon name="settings" size={14}/> Configuración
          </button>
          <button onClick={resetProject}
            className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-[0.78rem] text-[#b04040] hover:bg-red-950/40 transition-colors w-full text-left font-sans bg-transparent border-none cursor-pointer">
            <SvgIcon name="trash" size={14} color="#b04040"/> Nuevo proyecto
          </button>
        </div>
      </aside>

      {/* ─── Main ─── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="border-b border-eb-border px-7 py-3.5 flex items-center justify-between bg-eb-surface flex-shrink-0">
          <div className="text-[0.8rem] text-eb-muted">
            {STEPS[step - 1]?.title} · {STEPS[step - 1]?.sub}
          </div>
          <div className="flex gap-2 items-center">
            {step > 1 && <button onClick={goPrev} className="px-3 py-1.5 text-xs rounded-lg bg-transparent hover:bg-eb-surface-2 text-eb-muted hover:text-eb-text transition-colors font-sans font-medium border-none cursor-pointer">← Anterior</button>}
            {step < 8 && <button onClick={goNext} disabled={step < 6 && !canProceed} className="px-3 py-1.5 text-xs rounded-xl bg-eb-gold hover:bg-eb-gold-lt text-[#0a0600] font-sans font-medium border-none cursor-pointer disabled:opacity-40 transition-colors">Continuar →</button>}
          </div>
        </div>

      {/* Header Dropdown Panels */}
      {headerPanel && (
        <div className="border-b border-eb-border bg-eb-surface/95 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-5 py-4">
            {/* Ideas Panel */}
            {headerPanel === 'ideas' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-eb-gold-lt font-semibold text-sm flex items-center gap-2">
                    <SvgIcon name="bulb" size={14} color="#e8b85a"/> Todas las Ideas Generadas
                  </h3>
                  <span className="text-eb-muted text-xs">{bookData.allIdeas.length} ideas guardadas</span>
                </div>
                {bookData.allIdeas.length === 0 ? (
                  <p className="text-eb-muted text-xs">Genera ideas en el Step 1 y se guardarán aquí automáticamente.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                    {bookData.allIdeas.map((idea, idx) => (
                      <div key={idx} className="bg-eb-surface-2 border border-eb-border rounded-lg p-3">
                        <input
                          type="text"
                          value={idea.title}
                          onChange={(e) => setBookData((p) => ({
                            ...p,
                            allIdeas: p.allIdeas.map((s, i) => i === idx ? { ...s, title: e.target.value } : s)
                          }))}
                          className="w-full bg-transparent border-none text-eb-text text-xs font-semibold focus:outline-none focus:bg-eb-surface-3 rounded px-1 -mx-1"
                        />
                        <input
                          type="text"
                          value={idea.subtitle}
                          onChange={(e) => setBookData((p) => ({
                            ...p,
                            allIdeas: p.allIdeas.map((s, i) => i === idx ? { ...s, subtitle: e.target.value } : s)
                          }))}
                          className="w-full bg-transparent border-none text-eb-muted text-[10px] mt-1 focus:outline-none focus:bg-eb-surface-3 rounded px-1 -mx-1"
                          placeholder="Añadir subtítulo..."
                        />
                        <div className="flex gap-1.5 mt-2">
                          {!bookData.savedIdeas.some(s => s.title === idea.title) ? (
                            <button
                              onClick={() => setBookData((p) => ({ ...p, savedIdeas: [...p.savedIdeas, idea] }))}
                              className="text-[9px] font-bold bg-eb-gold hover:brightness-110 text-[#0a0600] px-2 py-1 rounded transition-colors"
                            >
                              + Próximo Libro
                            </button>
                          ) : (
                            <span className="text-[9px] font-bold text-eb-gold bg-eb-gold/10 border border-eb-gold/20 px-2 py-1 rounded">GUARDADO</span>
                          )}
                          <button
                            onClick={() => setBookData((p) => ({ ...p, allIdeas: p.allIdeas.filter((_, i) => i !== idx) }))}
                            className="text-[9px] font-bold bg-eb-surface-3 hover:bg-red-900/50 hover:text-red-300 text-eb-muted px-2 py-1 rounded transition-colors"
                          >
                            Borrar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Library Panel */}
            {headerPanel === 'library' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-eb-blue-lt font-semibold text-sm flex items-center gap-2">
                    <SvgIcon name="library" size={14} color="#7aadde"/> Biblioteca de Libros
                  </h3>
                  <span className="text-eb-muted text-xs">{bookData.library.length} libros</span>
                </div>
                {bookData.library.length === 0 ? (
                  <p className="text-eb-muted text-xs">Tus libros finalizados aparecerán aquí.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                    {bookData.library.map((libBook, idx) => (
                      <button
                        key={idx}
                        onClick={() => { setViewingLibraryBook(libBook); setHeaderPanel(null); }}
                        className="text-left bg-eb-surface-2 border border-eb-border rounded-lg p-3 hover:border-eb-border-2 transition-colors"
                      >
                        <p className="text-eb-text text-xs font-semibold truncate">{libBook.selectedIdea?.title}</p>
                        <p className="text-eb-muted text-[10px] mt-1">{libBook.authorName}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Next Books Panel */}
            {headerPanel === 'nextBooks' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-eb-gold-lt font-semibold text-sm flex items-center gap-2">
                    <SvgIcon name="book" size={14} color="#e8b85a"/> Próximos Libros (Saga)
                  </h3>
                  <span className="text-eb-muted text-xs">{bookData.savedIdeas.length} pendientes</span>
                </div>
                {bookData.savedIdeas.length === 0 ? (
                  <p className="text-eb-muted text-xs">Guarda ideas como &quot;Próximo Libro&quot; y aparecerán aquí.</p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {bookData.savedIdeas.map((idea, idx) => (
                      <div key={idx} className="bg-eb-surface-2 border border-eb-border rounded-lg p-3">
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            value={idea.title}
                            onChange={(e) => setBookData((p) => ({
                              ...p,
                              savedIdeas: p.savedIdeas.map((s, i) => i === idx ? { ...s, title: e.target.value } : s)
                            }))}
                            className="w-full bg-eb-surface-3 border border-eb-border rounded px-2 py-1 text-eb-text text-xs font-semibold focus:outline-none focus:border-eb-gold"
                            placeholder="Título del libro"
                          />
                          <input
                            type="text"
                            value={idea.subtitle}
                            onChange={(e) => setBookData((p) => ({
                              ...p,
                              savedIdeas: p.savedIdeas.map((s, i) => i === idx ? { ...s, subtitle: e.target.value } : s)
                            }))}
                            className="w-full bg-eb-surface-3 border border-eb-border rounded px-2 py-1 text-eb-muted text-[10px] focus:outline-none focus:border-eb-gold"
                            placeholder="Subtítulo"
                          />
                        </div>
                        <div className="flex gap-1.5 mt-2">
                          <button
                            onClick={() => {
                              const { library, savedIdeas: current, allIdeas } = bookData;
                              const savedIdeas = current.filter((_, i) => i !== idx);
                              setBookData({
                                ...initialBookData,
                                library,
                                savedIdeas,
                                allIdeas,
                                selectedIdea: { ...idea },
                                niche: idea.title,
                              });
                              setStep(2);
                              setHeaderPanel(null);
                            }}
                            className="text-[9px] font-bold bg-eb-gold hover:brightness-110 text-[#0a0600] px-2 py-1 rounded transition-colors"
                          >
                            Empezar Libro
                          </button>
                          <button
                            onClick={() => setBookData((p) => ({ ...p, savedIdeas: p.savedIdeas.filter((_, i) => i !== idx) }))}
                            className="text-[9px] font-bold bg-eb-surface-3 hover:bg-red-900/50 hover:text-red-300 text-eb-muted px-2 py-1 rounded transition-colors"
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}


      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-7 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1 space-y-4">
            {/* Step Card */}
            <div className="bg-eb-surface border border-eb-border rounded-[14px] p-5 animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-eb-surface-2 border border-eb-border flex items-center justify-center">
                  <SvgIcon name={['','bulb','list','pen','file','image','amazon','tag','horn'][step]} size={20} color="#c8963a"/>
                </div>
                <div>
                  <h2 className="text-eb-text font-bold text-base">{STEPS[step - 1].title}</h2>
                  <p className="text-eb-muted text-xs">{STEPS[step - 1].desc}</p>
                </div>
              </div>

              {/* Step-specific inputs */}
              {step === 1 && (
                <div className="space-y-3">
                  <NicheRoulette 
                    onSelectNiche={(niche, hook) => setBookData((p) => ({ ...p, niche, interests: hook }))} 
                  />
                  <div>
                    <label className="text-eb-muted text-xs font-medium mb-1.5 block">
                      Nicho / Tema
                    </label>
                    <input
                      type="text"
                      value={bookData.niche}
                      onChange={(e) => setBookData((p) => ({ ...p, niche: e.target.value }))}
                      placeholder="Ej: Finanzas personales, Fitness, Productividad"
                      className="w-full bg-eb-surface-2 border border-eb-border rounded-lg px-3 py-2.5 text-eb-text placeholder-eb-muted-2 text-sm focus:outline-none focus:border-eb-gold transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-eb-muted text-xs font-medium mb-1.5 block">
                      Tus Intereses / Habilidades
                    </label>
                    <textarea
                      value={bookData.interests}
                      onChange={(e) =>
                        setBookData((p) => ({ ...p, interests: e.target.value }))
                      }
                      placeholder="Ej: Sé sobre presupuestos, inversión básica, negocios..."
                      rows={3}
                      className="w-full bg-eb-surface-2 border border-eb-border rounded-lg px-3 py-2.5 text-eb-text placeholder-eb-muted-2 text-sm focus:outline-none focus:border-eb-gold transition-colors resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-eb-muted text-xs font-medium mb-1.5 block">
                      Autor / Seudónimo
                    </label>
                    <input
                      type="text"
                      value={bookData.authorName || ''}
                      onChange={(e) => setBookData((p) => ({ ...p, authorName: e.target.value }))}
                      placeholder="Ej: Edgar Manchón"
                      className="w-full bg-eb-surface-2 border border-eb-border rounded-lg px-3 py-2.5 text-eb-text placeholder-eb-muted-2 text-sm focus:outline-none focus:border-eb-gold transition-colors"
                    />
                  </div>
                  <button
                    onClick={() => generate()}
                    disabled={isGenerating || !bookData.niche}
                    className="w-full bg-eb-gold hover:bg-eb-gold-lt disabled:opacity-50 disabled:cursor-not-allowed text-[#0a0600] font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    {isGenerating ? (
                      <>
                        <span className="animate-spin">⟳</span> Generando...
                      </>
                    ) : (
                      <><SvgIcon name="bulb" size={14} color="#0a0600"/> Generar Ideas de Libro</>
                    )}
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3">
                  {bookData.selectedIdea ? (
                    <div className="bg-eb-gold/[0.06] border border-eb-gold/20 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-eb-muted uppercase tracking-wider">Título</span>
                        <button
                          onClick={() => setEditingTitle(!editingTitle)}
                          className="text-eb-muted hover:text-eb-gold text-xs transition-colors flex items-center gap-1"
                          title="Editar título y subtítulo"
                        >
                          {editingTitle ? <><SvgIcon name="check" size={10}/> Listo</> : <><SvgIcon name="pen" size={10}/> Editar</>}
                        </button>
                      </div>
                      {editingTitle ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={bookData.selectedIdea.title}
                            onChange={(e) => setBookData(prev => ({
                              ...prev,
                              selectedIdea: prev.selectedIdea ? { ...prev.selectedIdea, title: e.target.value } : null
                            }))}
                            className="w-full bg-eb-surface-2 border border-eb-gold/30 rounded-lg px-3 py-2 text-eb-gold-lt text-sm font-semibold focus:outline-none focus:border-eb-gold"
                          />
                          <input
                            type="text"
                            value={bookData.selectedIdea.subtitle || ''}
                            onChange={(e) => setBookData(prev => ({
                              ...prev,
                              selectedIdea: prev.selectedIdea ? { ...prev.selectedIdea, subtitle: e.target.value } : null
                            }))}
                            placeholder="Subtítulo"
                            className="w-full bg-eb-surface-2 border border-eb-border rounded-lg px-3 py-1.5 text-eb-muted text-xs focus:outline-none focus:border-eb-gold"
                          />
                        </div>
                      ) : (
                        <>
                          <p className="text-eb-gold-lt font-semibold text-sm">
                            {bookData.selectedIdea.title}
                          </p>
                          <p className="text-eb-muted text-xs mt-1">
                            {bookData.selectedIdea.subtitle}
                          </p>
                        </>
                      )}
                    </div>
                  ) : (
                    <p className="text-eb-gold text-sm">
                      Selecciona una idea en el Paso 1 primero
                    </p>
                  )}
                  <button
                    onClick={() => generate()}
                    disabled={isGenerating || !bookData.selectedIdea}
                    className="w-full bg-eb-gold hover:bg-eb-gold-lt disabled:opacity-50 disabled:cursor-not-allowed text-[#0a0600] font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    {isGenerating ? (
                      <>
                        <span className="animate-spin">⟳</span> Creando Estructura...
                      </>
                    ) : (
                      <><SvgIcon name="list" size={14} color="#0a0600"/> Generar Estructura</>
                    )}
                  </button>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-3">
                  <div className="bg-eb-surface-2 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-eb-text text-xs font-medium">Progreso</span>
                      <span className="text-eb-gold text-xs">
                        {chaptersWritten}/{totalChapters || '?'} capítulos
                      </span>
                    </div>
                    {totalChapters > 0 && (
                      <div className="h-1.5 bg-eb-surface-3 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-eb-gold rounded-full transition-all"
                          style={{ width: `${(chaptersWritten / totalChapters) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {bookData.chapters.length > 0 && (
                    <div>
                      <label className="text-eb-muted text-xs font-medium mb-2 block">
                        Seleccionar capítulo
                      </label>
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {bookData.chapters.map((ch) => (
                          <button
                            key={ch.number}
                            onClick={() =>
                              setBookData((p) => ({
                                ...p,
                                currentWritingChapter: ch.number,
                              }))
                            }
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                              bookData.currentWritingChapter === ch.number
                                ? 'bg-eb-gold/20 text-eb-gold-lt border border-eb-gold/30'
                                : 'bg-eb-surface-2 text-eb-text hover:bg-eb-surface-3 border border-transparent'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              {bookData.writtenChapters[ch.number] ? (
                                <SvgIcon name="check" size={11} color="#3a9e76"/>
                              ) : (
                                <span className="text-eb-muted-2">○</span>
                              )}
                              Cap.{ch.number}: {ch.title}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => generate()}
                    disabled={isGenerating || bookData.chapters.length === 0}
                    className="w-full bg-eb-gold hover:bg-eb-gold-lt disabled:opacity-50 disabled:cursor-not-allowed text-[#0a0600] font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    {isGenerating ? (
                      <>
                        <span className="animate-spin">⟳</span> Escribiendo...
                      </>
                    ) : (
                      <><SvgIcon name="pen" size={14} color="#0a0600"/> Escribir {bookData.currentWritingChapter === 0 ? 'Introducción' : bookData.currentWritingChapter === 99 ? 'Conclusión' : `Capítulo ${bookData.currentWritingChapter}`}</>
                    )}
                  </button>

                  {bookData.chapters.length > 0 && chaptersWritten < bookData.chapters.length && (
                    <button
                      onClick={async () => {
                        for (const ch of bookData.chapters) {
                          const fresh = await new Promise<BookData>(r => setBookData(p => { r(p); return p; }));
                          if (fresh.writtenChapters[ch.number]) continue;
                          setBookData((p) => ({ ...p, currentWritingChapter: ch.number }));
                          await generate({ currentWritingChapter: ch.number });
                        }
                      }}
                      disabled={isGenerating}
                      className="w-full bg-eb-surface-3 hover:bg-eb-border text-eb-text text-sm py-2.5 rounded-lg transition-all border border-eb-border disabled:opacity-50"
                    >
                      Escribir todos los capítulos restantes
                    </button>
                  )}
                </div>
              )}

              {step >= 4 && step <= 8 && (
                <div className="space-y-3">
                  {bookData.selectedIdea && (
                    <div className="bg-eb-gold/[0.06] border border-eb-gold/20 rounded-lg p-3">
                      <p className="text-eb-gold-lt font-semibold text-sm truncate">
                        {bookData.selectedIdea.title}
                      </p>
                    </div>
                  )}

                  {step === 5 && (
                    <>
                      <div className="bg-eb-surface-2 border border-eb-border rounded-lg p-3 text-xs text-eb-muted space-y-1">
                        <p className="text-eb-text font-medium flex items-center gap-1.5"><SvgIcon name="image" size={12} color="#e8b85a"/> Nano Banana Pro</p>
                        <p>Genera tu portada como JPG real 1600×2560 — lista para KDP.</p>
                        <p className="text-eb-muted-2">Requiere <code className="text-eb-gold">GOOGLE_API_KEY</code> en .env</p>
                      </div>
                      <button
                        onClick={generateCover}
                        disabled={isGeneratingCover || !bookData.selectedIdea}
                        className="w-full bg-eb-gold hover:bg-eb-gold-lt disabled:opacity-50 disabled:cursor-not-allowed text-[#0a0600] font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
                      >
                        {isGeneratingCover ? (
                          <>
                            <span className="animate-spin">⟳</span> Generando portada...
                          </>
                        ) : bookData.coverImage ? (
                          <><SvgIcon name="image" size={14} color="#0a0600"/> Regenerar Portada</>
                        ) : (
                          <><SvgIcon name="image" size={14} color="#0a0600"/> Generar Portada con Nano Banana Pro</>
                        )}
                      </button>
                      {bookData.coverImage && (
                        <button
                          onClick={downloadCover}
                          className="w-full bg-eb-green hover:brightness-110 text-white font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
                        >
                          <SvgIcon name="download" size={14}/> Descargar Portada JPG (1600×2560)
                        </button>
                      )}
                      {coverError && (
                        <div className="bg-red-950/50 border border-red-700/30 rounded-lg p-3">
                          <p className="text-red-400 text-xs">{coverError}</p>
                        </div>
                      )}
                      <div className="border-t border-eb-border pt-3">
                        <p className="text-eb-muted text-xs mb-2">También obtener brief de diseño:</p>
                      </div>
                    </>
                  )}

                  <button
                    onClick={() => generate()}
                    disabled={isGenerating}
                    className="w-full bg-eb-gold hover:bg-eb-gold-lt disabled:opacity-50 disabled:cursor-not-allowed text-[#0a0600] font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    {isGenerating ? (
                      <>
                        <span className="animate-spin">⟳</span> Generando...
                      </>
                    ) : (
                      <>
                        <SvgIcon name={step === 4 ? 'file' : step === 5 ? 'image' : step === 6 ? 'amazon' : step === 7 ? 'tag' : 'horn'} size={14} color="#0a0600"/>
                        {' '}Generar{' '}
                        {step === 4
                          ? 'Guía de Formato'
                          : step === 5
                          ? 'Tips de Diseño'
                          : step === 6
                          ? 'Guía KDP'
                          : step === 7
                          ? 'Estrategia de Precios'
                          : 'Plan de Marketing'}
                      </>
                    )}
                  </button>
                  {step === 8 && (
                    <button
                      onClick={exportDocx}
                      disabled={isExporting || !bookData.selectedIdea || (!pubFormats.ebook && !pubFormats.paperback)}
                      className="w-full bg-eb-green hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      {isExporting ? (
                        <>
                          <span className="animate-spin">⟳</span> Exportando...
                        </>
                      ) : exportSuccess ? (
                        <><SvgIcon name="check" size={14}/> Descargado!</>
                      ) : (
                        <><SvgIcon name="download" size={14}/> Exportar .DOCX</>
                      )}
                    </button>
                  )}
                </div>
              )}

              {error && (
                <div className="mt-3 bg-red-950/50 border border-red-700/30 rounded-lg p-3">
                  <p className="text-red-400 text-xs">{error}</p>
                </div>
              )}
            </div>

            {/* Book Summary Card */}
            {bookData.selectedIdea && (
              <div className="bg-eb-surface border border-eb-border rounded-[14px] p-5">
                <h3 className="text-eb-text font-semibold text-[0.85rem] mb-3 flex items-center gap-2">
                  <SvgIcon name="book" size={14} color="#7aadde"/> Resumen Actual
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-[10px] text-eb-muted uppercase tracking-wider">Título</p>
                    <p className="text-eb-text text-sm font-medium">{bookData.selectedIdea.title}</p>
                  </div>
                  {bookData.selectedIdea.subtitle && (
                    <div>
                      <p className="text-[10px] text-eb-muted uppercase tracking-wider">Subtítulo</p>
                      <p className="text-eb-muted text-sm">{bookData.selectedIdea.subtitle}</p>
                    </div>
                  )}
                  {bookData.chapters.length > 0 && (
                    <div>
                      <p className="text-[10px] text-eb-muted uppercase tracking-wider">Capítulos</p>
                      <p className="text-eb-gold text-sm">{bookData.chapters.length} capítulos</p>
                    </div>
                  )}
                  {chaptersWritten > 0 && (
                    <div>
                      <p className="text-[10px] text-eb-muted uppercase tracking-wider">Escritos</p>
                      <p className="text-eb-green text-sm flex items-center gap-1">
                        {chaptersWritten}/{bookData.chapters.length} capítulos <SvgIcon name="check" size={11} color="#3a9e76"/>
                      </p>
                    </div>
                  )}
                </div>
                {(!bookData.chapters || bookData.chapters.length === 0) && (
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        setStep(2);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full px-4 py-2 bg-eb-gold hover:bg-eb-gold-lt text-[#0a0600] text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <SvgIcon name="list" size={14} color="#0a0600"/> Continuar a Crear Estructura
                    </button>
                  </div>
                )}
                {bookData.chapters?.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {step !== furthestStep && (
                      <button
                        onClick={() => {
                          setStep(furthestStep);
                          setStreamedText('');
                        }}
                        className="w-full px-4 py-2 bg-eb-gold hover:bg-eb-gold-lt text-[#0a0600] text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                      >
                        Continuar donde lo dejaste
                        <span className="text-xs opacity-75">
                          (Paso {furthestStep}: {STEPS[furthestStep - 1]?.title})
                        </span>
                      </button>
                    )}
                    {step !== 3 && chaptersWritten < bookData.chapters.length && (
                      <button
                        onClick={() => {
                          setStep(3);
                          setStreamedText('');
                        }}
                        className="w-full px-4 py-2 bg-eb-surface-3 hover:bg-eb-border text-eb-text text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 border border-eb-border"
                      >
                        Ir a escribir capítulos
                        <span className="text-xs opacity-75">
                          ({chaptersWritten}/{bookData.chapters.length})
                        </span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Library / Created Books Card */}
            {bookData.library.length > 0 && (
              <div className="bg-eb-surface border border-eb-border rounded-[14px] p-5 animate-fade-in">
                <h3 className="text-eb-green font-semibold text-[0.85rem] mb-3 flex items-center gap-2">
                  <SvgIcon name="library" size={14} color="#3a9e76"/> Biblioteca de Libros
                </h3>
                <div className="space-y-2">
                  {bookData.library.map((libBook, idx) => (
                    <div key={idx} className="bg-eb-surface-2 border border-eb-border rounded-lg p-3 relative group transition-all hover:border-eb-border-2 cursor-pointer"
                         onClick={() => setViewingLibraryBook(libBook)}>
                      <p className="text-eb-text text-xs font-semibold pr-6 line-clamp-1">{libBook.selectedIdea?.title}</p>
                      <p className="text-eb-muted text-[10px] mt-1">{libBook.authorName}</p>
                      <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <SvgIcon name="book" size={12} color="#3a9e76"/>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Saved Ideas Card */}
            {bookData.savedIdeas.length > 0 && (
              <div className="bg-eb-surface border border-eb-border rounded-[14px] p-5 animate-fade-in">
                <h3 className="text-eb-gold font-semibold text-[0.85rem] mb-3 flex items-center gap-2">
                  <SvgIcon name="book" size={14} color="#c8963a"/> Próximos Libros
                </h3>
                <div className="space-y-2">
                  {bookData.savedIdeas.map((idea, idx) => (
                    <div key={idx} className="bg-eb-surface-2 border border-eb-border rounded-lg p-3 relative group transition-all hover:border-eb-border-2">
                      <p className="text-eb-text text-xs font-semibold pr-6">{idea.title}</p>
                      <p className="text-eb-muted text-[10px] mt-1 line-clamp-2">{idea.description}</p>
                      <button
                        onClick={() => setBookData(p => ({
                          ...p,
                          savedIdeas: p.savedIdeas.filter((_, i) => i !== idx)
                        }))}
                        className="absolute top-2 right-2 text-eb-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Quitar"
                      >
                        <SvgIcon name="trash" size={11}/>
                      </button>
                      <div className="mt-2 flex justify-end">
                        <button
                          onClick={() => {
                            setStep(2);
                            setStreamedText('');
                            setBookData(prev => ({
                              ...initialBookData,
                              niche: prev.niche,
                              interests: prev.interests,
                              authorName: prev.authorName,
                              library: prev.library,
                              savedIdeas: prev.savedIdeas.filter((_, i) => i !== idx),
                              selectedIdea: idea,
                            }));
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="text-[10px] bg-eb-gold/10 hover:bg-eb-gold hover:text-[#0a0600] border border-eb-gold/30 text-eb-gold px-3 py-1 rounded-md transition-all font-medium flex items-center gap-1"
                          title="Empieza a escribir este libro ahora mismo"
                        >
                          Empezar Libro
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Content */}
          <div className="lg:col-span-2">
            <div className="bg-eb-surface border border-eb-border rounded-[14px] min-h-[600px] flex flex-col">
              {/* Content Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-eb-border">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isGenerating ? 'bg-eb-green animate-pulse' : 'bg-eb-muted-2'
                    }`}
                  />
                  <span className="text-eb-muted text-xs">
                    {isGenerating ? 'IA generando...' : 'Contenido IA'}
                  </span>
                </div>
                {completedText && !isGenerating && (
                  <span className="text-eb-muted-2 text-xs">
                    {completedText.length.toLocaleString()} caracteres
                  </span>
                )}
              </div>

              {/* Content Area */}
              <div className="flex-1 p-6 overflow-y-auto max-h-[700px]">
                {/* Step 1: Show ideas as cards */}
                {step === 1 && bookData.ideas.length > 0 && !isGenerating ? (
                  <div className="space-y-3 animate-fade-in">
                    <p className="text-eb-muted text-sm mb-4">
                      Selecciona una idea para continuar:
                    </p>
                    {bookData.ideas.map((idea, i) => (
                      <div
                        key={i}
                        className={`idea-card border rounded-xl p-4 transition-all relative ${
                          bookData.selectedIdea?.title === idea.title
                            ? 'selected'
                            : 'border-eb-border bg-eb-surface-2'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 cursor-pointer" onClick={() => {
                            if (bookData.selectedIdea?.title !== idea.title) {
                              setBookData((p) => ({
                                ...p,
                                selectedIdea: idea,
                                outline: '',
                                chapters: [],
                                writtenChapters: {},
                                formattedContent: '',
                                coverDesign: '',
                                coverImage: null,
                                coverPrompt: '',
                                kdpSetup: '',
                                pricingStrategy: '',
                                marketingContent: ''
                              }));
                            }
                          }}>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-eb-gold font-medium bg-eb-gold/10 px-2 py-0.5 rounded-full">
                                Idea {i + 1}
                              </span>
                              {bookData.selectedIdea?.title === idea.title && (
                                <span className="text-xs text-eb-green flex items-center gap-1"><SvgIcon name="check" size={10} color="#3a9e76"/> Seleccionada</span>
                              )}
                              {bookData.savedIdeas.some(s => s.title === idea.title) && (
                                <span className="text-xs text-eb-gold-lt">En lista &quot;Próximo Libro&quot;</span>
                              )}
                            </div>
                            <h3 className="text-eb-text font-semibold">{idea.title}</h3>
                            {idea.subtitle && (
                              <p className="text-eb-gold-lt text-sm mt-0.5">{idea.subtitle}</p>
                            )}
                            <p className="text-eb-muted text-sm mt-1.5">{idea.description}</p>
                            {idea.targetAudience && (
                              <p className="text-eb-muted text-xs mt-1.5">
                                {idea.targetAudience}
                              </p>
                            )}
                            {idea.suggestedCategories && idea.suggestedCategories.length > 0 && (
                              <p className="text-eb-muted text-xs mt-1.5">
                                {idea.suggestedCategories.join(', ')}
                              </p>
                            )}
                            {idea.amazonKeywords && idea.amazonKeywords.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                          {idea.amazonKeywords.map((kw, idx) => (
                                <span key={idx} className="bg-eb-surface-3 text-eb-text text-[10px] px-2 py-0.5 rounded-full border border-eb-border">
                                  {kw}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          {bookData.selectedIdea?.title !== idea.title && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setBookData((p) => ({
                                  ...p,
                                  selectedIdea: idea,
                                  outline: '',
                                  chapters: [],
                                  writtenChapters: {},
                                  formattedContent: '',
                                  coverDesign: '',
                                  coverImage: null,
                                  coverPrompt: '',
                                  kdpSetup: '',
                                  pricingStrategy: '',
                                  marketingContent: ''
                                }));
                              }}
                              className="text-[10px] font-bold bg-eb-gold hover:bg-eb-gold-lt text-[#0a0600] px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                            >
                              SELECCIONAR
                            </button>
                          )}

                          {!bookData.savedIdeas.some(s => s.title === idea.title) ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setBookData((p) => ({ ...p, savedIdeas: [...p.savedIdeas, idea] }));
                              }}
                              className="text-[10px] font-bold bg-eb-surface-3 hover:bg-eb-border text-eb-text px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap border border-eb-border"
                            >
                              PRÓXIMO LIBRO
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold text-center text-eb-gold bg-eb-gold/10 border border-eb-gold/20 px-3 py-1.5 rounded-lg">
                              GUARDADO
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    ))}
                    {bookData.selectedIdea && (
                      <button
                        onClick={() => {
                          setStep(2);
                          setStreamedText('');
                        }}
                        className="w-full bg-eb-gold hover:bg-eb-gold-lt text-[#0a0600] font-semibold py-2.5 rounded-lg mt-2 transition-all text-sm"
                      >
                        Continuar con &quot;{bookData.selectedIdea.title.length > 40 ? bookData.selectedIdea.title.slice(0, 40) + '…' : bookData.selectedIdea.title}&quot; →
                      </button>
                    )}
                  </div>
                ) : (
                  /* Default: show streaming/static text + cover preview for step 5 */
                  <div className="ai-content">
                    {/* Step 5: cover image preview */}
                    {step === 5 && (bookData.coverImage || isGeneratingCover) && (
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-eb-gold-lt font-semibold text-sm flex items-center gap-1.5"><SvgIcon name="image" size={14} color="#e8b85a"/> Nano Banana Pro — Portada Generada</span>
                          {bookData.coverImage && (
                            <span className="text-eb-muted text-xs">1600×2560 · JPG para KDP</span>
                          )}
                        </div>
                        {isGeneratingCover ? (
                          <div key="cover-loading" className="flex flex-col items-center justify-center h-64 bg-eb-surface-2 rounded-xl border border-eb-gold/20">
                            <div className="mb-3 animate-pulse"><SvgIcon name="image" size={48} color="#c8963a"/></div>
                            <p className="text-eb-gold font-medium">Generando portada...</p>
                            <p className="text-eb-muted text-sm mt-1">Nano Banana Pro está trabajando</p>
                          </div>
                        ) : bookData.coverImage ? (
                          <div key="cover-display" className="flex flex-col items-center gap-3">
                            <div className="relative w-full max-w-[220px] mx-auto">
                              <div className="aspect-[9/16] rounded-xl overflow-hidden shadow-2xl shadow-eb-gold-dim/30 border border-eb-gold/20">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={`data:image/jpeg;base64,${bookData.coverImage}`}
                                  alt="Generated book cover"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                            {bookData.coverPrompt && (
                              <details className="w-full">
                                <summary className="text-eb-muted text-xs cursor-pointer hover:text-eb-text">
                                  Ver prompt de imagen
                                </summary>
                                <p className="text-eb-muted text-xs mt-2 bg-eb-surface-2 rounded-lg p-3 leading-relaxed">
                                  {bookData.coverPrompt}
                                </p>
                              </details>
                            )}
                            <button
                              onClick={downloadCover}
                              className="w-full bg-eb-green hover:brightness-110 text-white font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
                            >
                              <SvgIcon name="download" size={14}/> Descargar Portada (1600×2560 JPG)
                            </button>
                          </div>
                        ) : null}
                        {bookData.coverImage && (
                          <div className="mt-8 border-t border-eb-border pt-8 animate-fade-in">
                            <div className="flex items-center justify-between mb-6">
                              <div>
                                <h4 className="text-eb-text font-bold text-base mb-1">Amazon KDP A+ Content Pack</h4>
                                <p className="text-eb-muted text-xs">3 Módulos Premium · 1940×1200 px (Retina 2x) · RGB · Amazon Compliance</p>
                              </div>
                              <button
                                onClick={generateMarketingPack}
                                disabled={isGeneratingMarketing}
                                className="bg-eb-gold hover:bg-eb-gold-lt disabled:opacity-50 text-[#0a0600] font-bold px-5 py-2 rounded-lg transition-all flex items-center gap-2 text-sm"
                              >
                                {isGeneratingMarketing ? <span className="animate-spin text-lg">⟳</span> : <SvgIcon name="horn" size={14} color="#0a0600"/>}
                                {isGeneratingMarketing ? 'Generando Pack...' : 'Generar Marketing Pack'}
                              </button>
                            </div>

                            {marketingError && <p className="text-red-400 text-sm mb-4">{marketingError}</p>}

                            <div className="grid grid-cols-1 gap-5">
                              {[
                                { type: 'comparison', label: 'Módulo 1: Antes vs. Después', desc: 'Gancho emocional — el lector se identifica con el dolor y ve la transformación' },
                                { type: 'authority', label: 'Módulo 2: Autoridad del Autor', desc: 'Credibilidad editorial — mockup 3D del libro con firma personal' },
                                { type: 'method', label: 'Módulo 3: Metodología / Proceso', desc: 'Infografía de las 4 fases — transforma características en beneficios' },
                              ].map(({ type, label, desc }) => (
                                <div key={type} className="bg-eb-surface-2 border border-eb-border rounded-xl p-4 transition-all hover:border-eb-border-2 overflow-hidden">
                                  <div className="flex items-center justify-between mb-2">
                                    <div>
                                      <span className="text-xs font-bold uppercase tracking-wider text-eb-gold">{label}</span>
                                      <p className="text-[11px] text-eb-muted mt-0.5">{desc}</p>
                                    </div>
                                    {bookData.marketingAssets[type] && (
                                      <button
                                        onClick={() => {
                                          const blob = new Blob([Buffer.from(bookData.marketingAssets[type], 'base64')], { type: 'image/jpeg' });
                                          const url = URL.createObjectURL(blob);
                                          const link = document.createElement('a');
                                          link.href = url;
                                          link.download = `${bookData.selectedIdea?.title}-Aplus-${type}-2x.jpg`;
                                          link.click();
                                        }}
                                        className="text-xs bg-eb-surface-3 hover:bg-eb-border px-3 py-1 rounded-lg text-eb-text border border-eb-border"
                                      >
                                        <span className="flex items-center gap-1"><SvgIcon name="download" size={11}/> 2x JPG</span>
                                      </button>
                                    )}
                                  </div>

                                  <div className="aspect-[970/600] w-full bg-eb-bg rounded-xl overflow-hidden border border-eb-border flex items-center justify-center relative">
                                    {bookData.marketingAssets[type] ? (
                                      <img src={`data:image/jpeg;base64,${bookData.marketingAssets[type]}`} alt={`A+ ${label}`} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="text-eb-muted-2 flex flex-col items-center gap-2">
                                        <SvgIcon name="image" size={28} color="#36485e"/>
                                        <span className="text-xs">Sin generar</span>
                                      </div>
                                    )}
                                    {isGeneratingMarketing && !bookData.marketingAssets[type] && (
                                      <div className="absolute inset-0 bg-eb-bg/60 backdrop-blur-sm flex items-center justify-center">
                                        <div className="animate-pulse text-eb-gold font-bold text-sm">Generando pieza...</div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {(completedText || streamedText) && (
                          <div className="mt-8 border-t border-eb-border pt-6">
                            <p className="text-eb-muted text-xs font-medium mb-3">Guía de Diseño para Amazon</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 8 Content Rendering (Same as default) */}
                    {step === 8 ? (
                      isGenerating ? (
                        <div className="streaming-cursor">
                          {renderAIContent(streamedText)}
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex justify-end gap-3 mb-4">
                            <button
                              onClick={saveToLibrary}
                              className="bg-eb-green hover:brightness-110 text-white font-bold py-2 px-5 rounded-lg transition-all flex items-center gap-2 text-sm"
                            >
                              <SvgIcon name="library" size={14}/> Finalizar y Guardar en Biblioteca
                            </button>
                          </div>
                          {renderAIContent(completedText)}
                        </div>
                      )
                    ) : (
                      completedText || streamedText ? (
                        <div key="ai-content-area" className={isGenerating ? 'streaming-cursor' : ''}>
                          {isGenerating && (
                            <div className="sticky top-4 z-10 flex justify-end mb-4">
                              <button
                                onClick={() => setAutoScroll(!autoScroll)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium shadow-md transition-all flex items-center gap-2 ${
                                  autoScroll
                                    ? 'bg-eb-gold/90 text-[#0a0600] hover:bg-eb-gold-lt'
                                    : 'bg-eb-surface-3/90 text-eb-text hover:bg-eb-border'
                                }`}
                              >
                                {autoScroll ? 'Auto-scroll ON' : 'Auto-scroll OFF'}
                              </button>
                            </div>
                          )}
                          {renderAIContent(isGenerating ? streamedText : completedText)}
                        </div>
                      ) : step !== 5 || (!bookData.coverImage && !isGeneratingCover) ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                          <div className="mb-4 opacity-20"><SvgIcon name={['','bulb','list','pen','file','image','amazon','tag','horn'][step]} size={48} color="#5e7291"/></div>
                          <p className="text-eb-muted text-base font-medium font-serif">
                            {STEPS[step - 1].title}
                          </p>
                          <p className="text-eb-muted-2 text-sm mt-2">
                            {step === 1
                              ? 'Introduce tu nicho y pulsa "Generar Ideas" para empezar'
                              : step === 2
                              ? 'Pulsa "Generar Estructura" para crear el índice'
                              : step === 3
                              ? 'Selecciona un capítulo y pulsa "Escribir" para generar contenido'
                              : step === 5
                              ? 'Pulsa "Generar Portada" para crear tu portada con Nano Banana Pro'
                              : `Pulsa "Generar ${STEPS[step - 1].title}" para continuar`}
                          </p>
                        </div>
                      ) : null
                    )}
                    <div ref={contentEndRef} />
                  </div>
                )}
              </div>

              {step === 3 && Object.keys(bookData.writtenChapters).length > 0 && (
                <div className="p-4 border-t border-eb-border">
                  <p className="text-eb-muted text-xs mb-2">Capítulos escritos:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.keys(bookData.writtenChapters).map((num) => (
                      <button
                        key={num}
                        onClick={() => {
                          setBookData((p) => ({
                            ...p,
                            currentWritingChapter: parseInt(num),
                          }));
                          setStreamedText('');
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          bookData.currentWritingChapter === parseInt(num)
                            ? 'bg-eb-gold/20 text-eb-gold-lt border border-eb-gold/30'
                            : 'bg-eb-surface-2 text-eb-text hover:bg-eb-surface-3 border border-eb-border'
                        }`}
                      >
                        {num === '0' ? 'Intro' : num === '99' ? 'Concl' : `Cap.${num}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 8 && bookData.selectedIdea && (
                <div className="p-5 border-t border-eb-border">
                  <div className="bg-eb-green/[0.08] border border-eb-green/20 rounded-xl p-4 space-y-4">
                    <div>
                      <p className="text-eb-green font-semibold text-sm flex items-center gap-1.5"><SvgIcon name="check" size={14} color="#3a9e76"/> Tu ebook está listo!</p>
                      <p className="text-eb-muted text-xs mt-0.5">
                        {chaptersWritten > 0
                          ? `${chaptersWritten} capítulos escritos — .docx listo para Amazon KDP`
                          : 'Exporta tu libro como .docx'}
                      </p>
                    </div>

                    <div className="bg-eb-surface-2 border border-eb-border rounded-lg p-3 space-y-2">
                      <p className="text-eb-text font-semibold text-xs">Formato de publicación:</p>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pubFormats.ebook}
                          onChange={(e) => setPubFormats(prev => ({ ...prev, ebook: e.target.checked }))}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-xs text-eb-text">Ebook (libro electrónico Kindle)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pubFormats.paperback}
                          onChange={(e) => setPubFormats(prev => ({ ...prev, paperback: e.target.checked }))}
                          className="w-4 h-4 rounded"
                        />
                        <span className="text-xs text-eb-text">Tapa blanda (libro impreso)</span>
                      </label>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={exportKdpStrategy}
                        className="bg-eb-surface-3 hover:bg-eb-border border border-eb-border text-eb-text font-medium px-4 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 flex-1 sm:flex-none whitespace-nowrap text-xs"
                      >
                        <SvgIcon name="file" size={12}/> Datos KDP (TXT)
                      </button>
                      <button
                        onClick={exportDocx}
                        disabled={isExporting || (!pubFormats.ebook && !pubFormats.paperback)}
                        className="bg-eb-green hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-5 py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 flex-1 sm:flex-none whitespace-nowrap text-xs"
                      >
                        {isExporting ? (
                          <>
                            <span className="animate-spin">⟳</span> Exportando...
                          </>
                        ) : !pubFormats.ebook && !pubFormats.paperback ? (
                          <>Selecciona al menos un formato</>
                        ) : exportSuccess ? (
                          <><SvgIcon name="check" size={12}/> Descargar de nuevo</>
                        ) : pubFormats.ebook && pubFormats.paperback ? (
                          <><SvgIcon name="download" size={12}/> Descargar Ebook + Tapa blanda</>
                        ) : pubFormats.ebook ? (
                          <><SvgIcon name="download" size={12}/> Descargar Ebook (.docx)</>
                        ) : (
                          <><SvgIcon name="download" size={12}/> Descargar Tapa blanda (.docx)</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      </div>

      {/* Library View Modal */}
      {viewingLibraryBook && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-eb-surface border border-eb-border w-full max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl">
            <div className="px-6 py-5 border-b border-eb-border flex items-center justify-between">
              <div>
                <h2 className="text-eb-text font-bold text-lg font-serif">{viewingLibraryBook.selectedIdea?.title}</h2>
                <p className="text-eb-muted text-xs mt-1">Datos de publicación para Amazon KDP</p>
              </div>
              <button
                onClick={() => setViewingLibraryBook(null)}
                className="text-eb-muted hover:text-eb-text p-2 transition-colors"
              >
                <SvgIcon name="trash" size={16}/>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-eb-bg/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-4">
                  <div className="bg-eb-surface p-4 rounded-xl border border-eb-border">
                    <h3 className="text-eb-gold text-xs font-semibold mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                      <SvgIcon name="amazon" size={12} color="#c8963a"/> KDP Setup (Paso 6)
                    </h3>
                    <div className="text-eb-text text-xs whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                      {viewingLibraryBook.kdpSetup || "Sin datos guardados"}
                    </div>
                  </div>
                  <div className="bg-eb-surface p-4 rounded-xl border border-eb-border">
                    <h3 className="text-eb-gold-lt text-xs font-semibold mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                      <SvgIcon name="tag" size={12} color="#e8b85a"/> Precios (Paso 7)
                    </h3>
                    <div className="text-eb-text text-xs whitespace-pre-wrap leading-relaxed">
                      {viewingLibraryBook.pricingStrategy || "Sin datos guardados"}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-eb-surface p-4 rounded-xl border border-eb-border">
                    <h3 className="text-eb-blue-lt text-xs font-semibold mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                      <SvgIcon name="horn" size={12} color="#7aadde"/> Marketing (Paso 8)
                    </h3>
                    <div className="text-eb-text text-xs whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                      {viewingLibraryBook.marketingContent || "Sin datos guardados"}
                    </div>
                  </div>
                  {viewingLibraryBook.coverImage && (
                    <div className="bg-eb-surface p-4 rounded-xl border border-eb-border">
                      <h3 className="text-eb-green text-xs font-semibold mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                        <SvgIcon name="image" size={12} color="#3a9e76"/> Portada
                      </h3>
                      <div className="aspect-[9/16] w-32 rounded-lg overflow-hidden border border-eb-border mx-auto">
                        <img src={`data:image/jpeg;base64,${viewingLibraryBook.coverImage}`} alt="Cover" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-eb-border text-center">
              <p className="text-eb-muted-2 text-[10px]">EbookAI · Usa estos datos para completar tu ficha en Amazon KDP.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
