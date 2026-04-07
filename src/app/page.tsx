'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { insforge } from '@/lib/insforge';
import type { BookData, BookIdea, Chapter, Step } from '@/types';
import CostOptimizer, { type ModelConfig } from '@/components/CostOptimizer';
import NicheRoulette from '@/components/NicheRoulette';
import { postProcessBookText } from '@/lib/postprocess';

const STEPS = [
  { number: 1, title: 'Book Ideas', icon: '💡', desc: 'Generate profitable book ideas with AI' },
  { number: 2, title: 'Outline', icon: '📋', desc: 'Create detailed chapter structure' },
  { number: 3, title: 'Write Book', icon: '✍️', desc: 'AI writes each chapter' },
  { number: 4, title: 'Format', icon: '📄', desc: 'Format for Kindle publishing' },
  { number: 5, title: 'Cover Design', icon: '🎨', desc: 'AI generates your cover with Nano Banana Pro' },
  { number: 6, title: 'KDP Setup', icon: '📚', desc: 'Amazon Kindle setup guide' },
  { number: 7, title: 'Pricing', icon: '💰', desc: 'Pricing strategy & royalties' },
  { number: 8, title: 'Marketing', icon: '📣', desc: 'Marketing & promotion plan' },
];

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

    // Match chapter headings like "**Chapter 1: Title**", "**Capítulo 1: Título**", "Chapter 1: Title", etc.
    const chapterMatch =
      trimmed.match(/\*?\*?(?:Chapter|Cap[ií]tulo)\s+(\d+)[:.]?\s*(.+?)\*?\*?$/i) ??
      trimmed.match(/^#{1,3}\s+(?:Chapter|Cap[ií]tulo)\s+(\d+)[:.]?\s*(.+)$/i) ??
      trimmed.match(/^(\d+)\.\s+(.+)$/);

    if (chapterMatch) {
      // If we found a new chapter, push the previous one
      if (currentChapter) chapters.push(currentChapter);
      
      currentChapter = {
        number: parseInt(chapterMatch[1]),
        title: chapterMatch[2].replace(/\*\*/g, '').trim(),
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
        <h2 key={i} className="text-indigo-300 font-bold text-xl mt-4 mb-2">
          {trimmed.replace(/^#+\s/, '')}
        </h2>
      );
    }
    if (trimmed.startsWith('### ')) {
      return (
        <h3 key={i} className="text-purple-300 font-semibold text-lg mt-3 mb-1">
          {trimmed.replace(/^#+\s/, '')}
        </h3>
      );
    }
    if (trimmed.startsWith('#### ')) {
      return (
        <h4 key={i} className="text-sky-300 font-semibold mt-2 mb-1">
          {trimmed.replace(/^#+\s/, '')}
        </h4>
      );
    }
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.match(/^\d+\.\s/)) {
      return (
        <li key={i} className="ml-4 mb-1 text-slate-300 list-disc">
          {trimmed.replace(/^[-*]\s/, '').replace(/^\d+\.\s/, '')}
        </li>
      );
    }

    // Bold text
    const parts = trimmed.split(/(\*\*.*?\*\*)/g);
    return (
      <p key={i} className="mb-2 text-slate-300 leading-relaxed">
        {parts.map((part, j) =>
          part.startsWith('**') && part.endsWith('**') ? (
            <strong key={j} className="text-white font-semibold">
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
        setBookData({
          ...initialBookData,
          ...parsed,
          // Ensure arrays are initialized if missing
          library: parsed.library || [],
          allIdeas: parsed.allIdeas || [],
          // Merge savedIdeas: keep defaults if localStorage has none
          savedIdeas: (parsed.savedIdeas && parsed.savedIdeas.length > 0)
            ? parsed.savedIdeas
            : initialBookData.savedIdeas,
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

  useEffect(() => {
    contentEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [streamedText]);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/20 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl">
              📖
            </div>
            <div>
              <h1 className="text-white font-bold text-lg gradient-text">EbookAI</h1>
              <p className="text-slate-500 text-xs">Automated Ebook Creator</p>
            </div>
          </div>
          {bookData.selectedIdea && (
            <div className="hidden md:flex items-center gap-2 bg-slate-800/50 rounded-xl px-4 py-2">
              <span className="text-slate-400 text-xs">Working on:</span>
              <span className="text-indigo-300 text-sm font-medium truncate max-w-xs">
                {bookData.selectedIdea.title}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setHeaderPanel(headerPanel === 'ideas' ? null : 'ideas')}
              title="Ideas guardadas"
              className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs transition-all border ${headerPanel === 'ideas' ? 'bg-amber-900/40 text-amber-300 border-amber-700/50' : 'bg-slate-800/50 text-slate-400 border-transparent hover:bg-slate-700/50'}`}
            >
              <span>💡</span>
              <span className="hidden sm:inline">Ideas</span>
              {bookData.allIdeas.length > 0 && (
                <span className="bg-amber-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{bookData.allIdeas.length}</span>
              )}
            </button>
            <button
              onClick={() => setHeaderPanel(headerPanel === 'library' ? null : 'library')}
              title="Biblioteca de libros"
              className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs transition-all border ${headerPanel === 'library' ? 'bg-indigo-900/40 text-indigo-300 border-indigo-700/50' : 'bg-slate-800/50 text-slate-400 border-transparent hover:bg-slate-700/50'}`}
            >
              <span>🏛️</span>
              <span className="hidden sm:inline">Biblioteca</span>
              {bookData.library.length > 0 && (
                <span className="bg-indigo-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{bookData.library.length}</span>
              )}
            </button>
            <button
              onClick={() => setHeaderPanel(headerPanel === 'nextBooks' ? null : 'nextBooks')}
              title="Próximos libros"
              className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs transition-all border ${headerPanel === 'nextBooks' ? 'bg-purple-900/40 text-purple-300 border-purple-700/50' : 'bg-slate-800/50 text-slate-400 border-transparent hover:bg-slate-700/50'}`}
            >
              <span>📚</span>
              <span className="hidden sm:inline">Próximos</span>
              {bookData.savedIdeas.length > 0 && (
                <span className="bg-purple-600 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">{bookData.savedIdeas.length}</span>
              )}
            </button>
            <div className="w-px h-5 bg-slate-700/50 mx-1" />
            <button
              onClick={resetProject}
              title="New Project"
              className="bg-slate-800/50 hover:bg-red-900/30 hover:text-red-400 rounded-xl px-3 py-1.5 text-xs text-slate-400 transition-all border border-transparent hover:border-red-900/50"
            >
              <span>🗑️</span>
              <span className="hidden sm:inline"> Reset</span>
            </button>
            {modelConfig && (
              <button
                onClick={() => setPhase('setup')}
                title="Change strategy"
                className="hidden md:flex items-center gap-1.5 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl px-3 py-1.5 text-xs text-slate-400 transition-colors"
              >
                <span>⚙️</span>
                <span>{modelConfig.strategyName}</span>
              </button>
            )}
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <span>Step {step}</span>
              <span className="text-slate-600">/</span>
              <span>8</span>
            </div>
          </div>
        </div>
      </header>

      {/* Header Dropdown Panels */}
      {headerPanel && (
        <div className="border-b border-slate-800/50 bg-slate-900/95 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-4">
            {/* Ideas Panel */}
            {headerPanel === 'ideas' && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-amber-300 font-semibold text-sm flex items-center gap-2">
                    <span>💡</span> Todas las Ideas Generadas
                  </h3>
                  <span className="text-slate-500 text-xs">{bookData.allIdeas.length} ideas guardadas</span>
                </div>
                {bookData.allIdeas.length === 0 ? (
                  <p className="text-slate-500 text-xs">Genera ideas en el Step 1 y se guardarán aquí automáticamente.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                    {bookData.allIdeas.map((idea, idx) => (
                      <div key={idx} className="bg-slate-800/60 border border-slate-700/40 rounded-lg p-3">
                        <input
                          type="text"
                          value={idea.title}
                          onChange={(e) => setBookData((p) => ({
                            ...p,
                            allIdeas: p.allIdeas.map((s, i) => i === idx ? { ...s, title: e.target.value } : s)
                          }))}
                          className="w-full bg-transparent border-none text-white text-xs font-semibold focus:outline-none focus:bg-slate-900/60 rounded px-1 -mx-1"
                        />
                        <input
                          type="text"
                          value={idea.subtitle}
                          onChange={(e) => setBookData((p) => ({
                            ...p,
                            allIdeas: p.allIdeas.map((s, i) => i === idx ? { ...s, subtitle: e.target.value } : s)
                          }))}
                          className="w-full bg-transparent border-none text-slate-400 text-[10px] mt-1 focus:outline-none focus:bg-slate-900/60 rounded px-1 -mx-1"
                          placeholder="Añadir subtítulo..."
                        />
                        <div className="flex gap-1.5 mt-2">
                          {!bookData.savedIdeas.some(s => s.title === idea.title) ? (
                            <button
                              onClick={() => setBookData((p) => ({ ...p, savedIdeas: [...p.savedIdeas, idea] }))}
                              className="text-[9px] font-bold bg-purple-700 hover:bg-purple-600 text-white px-2 py-1 rounded transition-colors"
                            >
                              + Próximo Libro
                            </button>
                          ) : (
                            <span className="text-[9px] font-bold text-purple-400 bg-purple-950/30 border border-purple-900/50 px-2 py-1 rounded">GUARDADO</span>
                          )}
                          <button
                            onClick={() => setBookData((p) => ({ ...p, allIdeas: p.allIdeas.filter((_, i) => i !== idx) }))}
                            className="text-[9px] font-bold bg-slate-700 hover:bg-red-900/50 hover:text-red-300 text-slate-400 px-2 py-1 rounded transition-colors"
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
                  <h3 className="text-indigo-300 font-semibold text-sm flex items-center gap-2">
                    <span>🏛️</span> Biblioteca de Libros
                  </h3>
                  <span className="text-slate-500 text-xs">{bookData.library.length} libros</span>
                </div>
                {bookData.library.length === 0 ? (
                  <p className="text-slate-500 text-xs">Tus libros finalizados aparecerán aquí.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                    {bookData.library.map((libBook, idx) => (
                      <button
                        key={idx}
                        onClick={() => { setViewingLibraryBook(libBook); setHeaderPanel(null); }}
                        className="text-left bg-slate-800/60 border border-slate-700/40 rounded-lg p-3 hover:border-indigo-700/50 transition-colors"
                      >
                        <p className="text-white text-xs font-semibold truncate">{libBook.selectedIdea?.title}</p>
                        <p className="text-slate-500 text-[10px] mt-1">{libBook.authorName}</p>
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
                  <h3 className="text-purple-300 font-semibold text-sm flex items-center gap-2">
                    <span>📚</span> Próximos Libros (Saga)
                  </h3>
                  <span className="text-slate-500 text-xs">{bookData.savedIdeas.length} pendientes</span>
                </div>
                {bookData.savedIdeas.length === 0 ? (
                  <p className="text-slate-500 text-xs">Guarda ideas como &quot;Próximo Libro&quot; y aparecerán aquí.</p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {bookData.savedIdeas.map((idea, idx) => (
                      <div key={idx} className="bg-slate-800/60 border border-slate-700/40 rounded-lg p-3">
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            value={idea.title}
                            onChange={(e) => setBookData((p) => ({
                              ...p,
                              savedIdeas: p.savedIdeas.map((s, i) => i === idx ? { ...s, title: e.target.value } : s)
                            }))}
                            className="w-full bg-slate-900/60 border border-slate-600/40 rounded px-2 py-1 text-white text-xs font-semibold focus:outline-none focus:border-purple-500"
                            placeholder="Título del libro"
                          />
                          <input
                            type="text"
                            value={idea.subtitle}
                            onChange={(e) => setBookData((p) => ({
                              ...p,
                              savedIdeas: p.savedIdeas.map((s, i) => i === idx ? { ...s, subtitle: e.target.value } : s)
                            }))}
                            className="w-full bg-slate-900/60 border border-slate-600/40 rounded px-2 py-1 text-slate-400 text-[10px] focus:outline-none focus:border-purple-500"
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
                            className="text-[9px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded transition-colors"
                          >
                            Empezar Libro
                          </button>
                          <button
                            onClick={() => setBookData((p) => ({ ...p, savedIdeas: p.savedIdeas.filter((_, i) => i !== idx) }))}
                            className="text-[9px] font-bold bg-slate-700 hover:bg-red-900/50 hover:text-red-300 text-slate-400 px-2 py-1 rounded transition-colors"
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

      {/* Step Progress */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-1 md:gap-2 overflow-x-auto pb-2">
          {STEPS.map((s) => (
            <button
              key={s.number}
              onClick={() => {
                if (s.number <= Math.max(step, furthestStep)) {
                  setStep(s.number as Step);
                  setStreamedText('');
                }
              }}
              className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                s.number === step
                  ? 'step-active text-white'
                  : s.number <= furthestStep
                  ? 'step-complete text-white opacity-80 cursor-pointer'
                  : 'bg-slate-800/50 text-slate-500'
              }`}
            >
              <span>{s.icon}</span>
              <span className="hidden sm:inline">{s.title}</span>
              <span className="sm:hidden">{s.number}</span>
            </button>
          ))}
        </div>
        {/* Progress bar */}
        <div className="mt-3 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${((step - 1) / 7) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1 space-y-4">
            {/* Step Card */}
            <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-6 animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{STEPS[step - 1].icon}</span>
                <div>
                  <h2 className="text-white font-bold text-lg">{STEPS[step - 1].title}</h2>
                  <p className="text-slate-400 text-sm">{STEPS[step - 1].desc}</p>
                </div>
              </div>

              {/* Step-specific inputs */}
              {step === 1 && (
                <div className="space-y-3">
                  <NicheRoulette 
                    onSelectNiche={(niche, hook) => setBookData((p) => ({ ...p, niche, interests: hook }))} 
                  />
                  <div>
                    <label className="text-slate-300 text-sm font-medium mb-1 block">
                      Niche / Topic
                    </label>
                    <input
                      type="text"
                      value={bookData.niche}
                      onChange={(e) => setBookData((p) => ({ ...p, niche: e.target.value }))}
                      placeholder="e.g., Personal Finance, Fitness, Productivity"
                      className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 text-sm font-medium mb-1 block">
                      Your Interests / Skills
                    </label>
                    <textarea
                      value={bookData.interests}
                      onChange={(e) =>
                        setBookData((p) => ({ ...p, interests: e.target.value }))
                      }
                      placeholder="e.g., I know about budgeting, investing basics, side hustles..."
                      rows={3}
                      className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 text-sm font-medium mb-1 block">
                      Autor / Seudónimo
                    </label>
                    <input
                      type="text"
                      value={bookData.authorName || ''}
                      onChange={(e) => setBookData((p) => ({ ...p, authorName: e.target.value }))}
                      placeholder="e.g., Edgar Manchón"
                      className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <button
                    onClick={() => generate()}
                    disabled={isGenerating || !bookData.niche}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <span className="animate-spin">⟳</span> Generating...
                      </>
                    ) : (
                      <>💡 Generate Book Ideas</>
                    )}
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3">
                  {bookData.selectedIdea ? (
                    <div className="bg-indigo-950/50 border border-indigo-700/30 rounded-xl p-3">
                      <p className="text-indigo-300 font-semibold text-sm">
                        {bookData.selectedIdea.title}
                      </p>
                      <p className="text-slate-400 text-xs mt-1">
                        {bookData.selectedIdea.subtitle}
                      </p>
                    </div>
                  ) : (
                    <p className="text-yellow-400 text-sm">
                      ⚠️ Please select a book idea from Step 1 first
                    </p>
                  )}
                  <button
                    onClick={() => generate()}
                    disabled={isGenerating || !bookData.selectedIdea}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <span className="animate-spin">⟳</span> Creating Outline...
                      </>
                    ) : (
                      <>📋 Generate Outline</>
                    )}
                  </button>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-3">
                  <div className="bg-slate-800/50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-300 text-sm font-medium">Progress</span>
                      <span className="text-indigo-400 text-sm">
                        {chaptersWritten}/{totalChapters || '?'} chapters
                      </span>
                    </div>
                    {totalChapters > 0 && (
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                          style={{ width: `${(chaptersWritten / totalChapters) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {bookData.chapters.length > 0 && (
                    <div>
                      <label className="text-slate-300 text-sm font-medium mb-2 block">
                        Select Chapter to Write
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
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              {bookData.writtenChapters[ch.number] ? (
                                <span className="text-green-400">✓</span>
                              ) : (
                                <span className="text-slate-500">○</span>
                              )}
                              Ch.{ch.number}: {ch.title}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => generate()}
                    disabled={isGenerating || bookData.chapters.length === 0}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <span className="animate-spin">⟳</span> Writing Chapter...
                      </>
                    ) : (
                      <>✍️ Write Chapter {bookData.currentWritingChapter}</>
                    )}
                  </button>

                  {bookData.chapters.length > 0 && chaptersWritten < bookData.chapters.length && (
                    <button
                      onClick={async () => {
                        for (const ch of bookData.chapters) {
                          // Re-read fresh state before each chapter
                          const fresh = await new Promise<BookData>(r => setBookData(p => { r(p); return p; }));
                          if (fresh.writtenChapters[ch.number]) continue;
                          setBookData((p) => ({ ...p, currentWritingChapter: ch.number }));
                          // generate() already awaits the full stream completion
                          await generate({ currentWritingChapter: ch.number });
                        }
                      }}
                      disabled={isGenerating}
                      className="w-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-slate-200 text-sm py-2.5 rounded-xl transition-all"
                    >
                      ⚡ Write All Remaining Chapters
                    </button>
                  )}
                </div>
              )}

              {step >= 4 && step <= 8 && (
                <div className="space-y-3">
                  {bookData.selectedIdea && (
                    <div className="bg-indigo-950/50 border border-indigo-700/30 rounded-xl p-3">
                      <p className="text-indigo-300 font-semibold text-sm truncate">
                        {bookData.selectedIdea.title}
                      </p>
                    </div>
                  )}

                  {/* Step 5 extra: AI cover generation with Nano Banana Pro */}
                  {step === 5 && (
                    <>
                      <div className="bg-slate-800/60 border border-slate-600/40 rounded-xl p-3 text-xs text-slate-400 space-y-1">
                        <p className="text-slate-300 font-medium">🍌 Nano Banana Pro</p>
                        <p>Generates your cover as a real 1600×2560 JPG — ready for KDP upload.</p>
                        <p className="text-slate-500">Requires <code className="text-indigo-400">GOOGLE_API_KEY</code> in .env</p>
                      </div>
                      <button
                        onClick={generateCover}
                        disabled={isGeneratingCover || !bookData.selectedIdea}
                        className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        {isGeneratingCover ? (
                          <>
                            <span className="animate-spin">⟳</span> Generating Cover...
                          </>
                        ) : bookData.coverImage ? (
                          <>🍌 Regenerate Cover</>
                        ) : (
                          <>🍌 Generate Cover with Nano Banana Pro</>
                        )}
                      </button>
                      {bookData.coverImage && (
                        <button
                          onClick={downloadCover}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                          📥 Download Cover JPG (1600×2560)
                        </button>
                      )}
                      {coverError && (
                        <div className="bg-red-950/50 border border-red-700/30 rounded-xl p-3">
                          <p className="text-red-400 text-xs">❌ {coverError}</p>
                        </div>
                      )}
                      <div className="border-t border-slate-700/50 pt-3">
                        <p className="text-slate-500 text-xs mb-2">Also get design brief text:</p>
                      </div>
                    </>
                  )}

                  <button
                    onClick={() => generate()}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <span className="animate-spin">⟳</span> Generating...
                      </>
                    ) : (
                      <>
                        {STEPS[step - 1].icon} Generate{' '}
                        {step === 4
                          ? 'Format Guide'
                          : step === 5
                          ? 'Design Tips'
                          : step === 6
                          ? 'KDP Guide'
                          : step === 7
                          ? 'Pricing Strategy'
                          : 'Marketing Plan'}
                      </>
                    )}
                  </button>
                  {step === 8 && (
                    <button
                      onClick={exportDocx}
                      disabled={isExporting || !bookData.selectedIdea || (!pubFormats.ebook && !pubFormats.paperback)}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      {isExporting ? (
                        <>
                          <span className="animate-spin">⟳</span> Exportando...
                        </>
                      ) : exportSuccess ? (
                        <>✅ Descargado!</>
                      ) : (
                        <>📥 Exportar .DOCX</>
                      )}
                    </button>
                  )}
                </div>
              )}

              {error && (
                <div className="mt-3 bg-red-950/50 border border-red-700/30 rounded-xl p-3">
                  <p className="text-red-400 text-sm">❌ {error}</p>
                </div>
              )}
            </div>

            {/* Book Summary Card */}
            {bookData.selectedIdea && (
              <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-5">
                <h3 className="text-slate-300 font-semibold text-sm mb-3">📖 Resumen Actual</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-slate-500">Título</p>
                    <p className="text-white text-sm font-medium">{bookData.selectedIdea.title}</p>
                  </div>
                  {bookData.selectedIdea.subtitle && (
                    <div>
                      <p className="text-xs text-slate-500">Subtítulo</p>
                      <p className="text-slate-300 text-sm">{bookData.selectedIdea.subtitle}</p>
                    </div>
                  )}
                  {bookData.chapters.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500">Capítulos</p>
                      <p className="text-indigo-400 text-sm">{bookData.chapters.length} capítulos</p>
                    </div>
                  )}
                  {chaptersWritten > 0 && (
                    <div>
                      <p className="text-xs text-slate-500">Escritos</p>
                      <p className="text-green-400 text-sm">
                        {chaptersWritten}/{bookData.chapters.length} capítulos ✓
                      </p>
                    </div>
                  )}
                </div>
                {/* Quick navigation buttons when there's progress */}
                {bookData.chapters?.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {step !== furthestStep && (
                      <button
                        onClick={() => {
                          setStep(furthestStep);
                          setStreamedText('');
                        }}
                        className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2"
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
                        className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2"
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
              <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-5 animate-fade-in mt-4">
                <h3 className="text-green-400 font-semibold text-sm mb-3 flex items-center gap-2">
                  <span>🏛️</span> Biblioteca de Libros
                </h3>
                <div className="space-y-3">
                  {bookData.library.map((libBook, idx) => (
                    <div key={idx} className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-3 relative group transition-all hover:bg-slate-800/60 cursor-pointer"
                         onClick={() => setViewingLibraryBook(libBook)}>
                      <p className="text-white text-xs font-semibold pr-6 line-clamp-1">{libBook.selectedIdea?.title}</p>
                      <p className="text-slate-500 text-[10px] mt-1">{libBook.authorName}</p>
                      <div className="absolute top-2 right-2 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        👁️
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Saved Ideas Card */}
            {bookData.savedIdeas.length > 0 && (
              <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-5 animate-fade-in">
                <h3 className="text-indigo-400 font-semibold text-sm mb-3 flex items-center gap-2">
                  <span>📚</span> Próximos Libros
                </h3>
                <div className="space-y-3">
                  {bookData.savedIdeas.map((idea, idx) => (
                    <div key={idx} className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-3 relative group transition-all hover:bg-slate-800/60">
                      <p className="text-white text-xs font-semibold pr-6">{idea.title}</p>
                      <p className="text-slate-500 text-[10px] mt-1 line-clamp-2">{idea.description}</p>
                      <button
                        onClick={() => setBookData(p => ({
                          ...p,
                          savedIdeas: p.savedIdeas.filter((_, i) => i !== idx)
                        }))}
                        className="absolute top-2 right-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove"
                      >
                        ✕
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
                          className="text-[10px] bg-indigo-600/20 hover:bg-indigo-600 hover:border-indigo-500 border border-indigo-500/30 text-indigo-300 hover:text-white px-3 py-1 rounded-md transition-all font-medium flex items-center gap-1"
                          title="Empieza a escribir este libro ahora mismo"
                        >
                          <span>🚀</span> Empezar Libro
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3">
              <button
                onClick={goPrev}
                disabled={step === 1}
                className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 font-medium py-3 rounded-xl transition-all"
              >
                ← Back
              </button>
              <button
                onClick={goNext}
                disabled={step === 8 || !canProceed}
                className="flex-1 bg-gradient-to-r from-indigo-600/80 to-purple-600/80 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-30 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-all"
              >
                {step >= 6 && (!completedText || completedText.length < 50) ? 'Skip Step →' : 'Next →'}
              </button>
            </div>
          </div>

          {/* Right Panel - Content */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl min-h-[600px] flex flex-col">
              {/* Content Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      isGenerating ? 'bg-green-400 animate-pulse' : 'bg-slate-600'
                    }`}
                  />
                  <span className="text-slate-400 text-sm">
                    {isGenerating ? 'AI is generating...' : 'AI Output'}
                  </span>
                </div>
                {completedText && !isGenerating && (
                  <span className="text-slate-500 text-xs">
                    {completedText.length.toLocaleString()} characters
                  </span>
                )}
              </div>

              {/* Content Area */}
              <div className="flex-1 p-6 overflow-y-auto max-h-[700px]">
                {/* Step 1: Show ideas as cards */}
                {step === 1 && bookData.ideas.length > 0 && !isGenerating ? (
                  <div className="space-y-3 animate-fade-in">
                    <p className="text-slate-400 text-sm mb-4">
                      Select a book idea to continue:
                    </p>
                    {bookData.ideas.map((idea, i) => (
                      <div
                        key={i}
                        className={`idea-card border rounded-xl p-4 transition-all relative ${
                          bookData.selectedIdea?.title === idea.title
                            ? 'selected border-indigo-500 bg-indigo-950/20'
                            : 'border-slate-700/50 bg-slate-800/30'
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
                              <span className="text-xs text-indigo-400 font-medium bg-indigo-950/50 px-2 py-0.5 rounded-full">
                                Idea {i + 1}
                              </span>
                              {bookData.selectedIdea?.title === idea.title && (
                                <span className="text-xs text-green-400">✓ Seleccionada para ahora</span>
                              )}
                              {bookData.savedIdeas.some(s => s.title === idea.title) && (
                                <span className="text-xs text-purple-400">★ En la lista "Próximo Libro"</span>
                              )}
                            </div>
                            <h3 className="text-white font-semibold">{idea.title}</h3>
                            {idea.subtitle && (
                              <p className="text-indigo-300 text-sm mt-0.5">{idea.subtitle}</p>
                            )}
                            <p className="text-slate-400 text-sm mt-1.5">{idea.description}</p>
                            {idea.targetAudience && (
                              <p className="text-slate-500 text-xs mt-1.5">
                                👥 {idea.targetAudience}
                              </p>
                            )}
                            {idea.suggestedCategories && idea.suggestedCategories.length > 0 && (
                              <p className="text-slate-500 text-xs mt-1.5">
                                📚 {idea.suggestedCategories.join(', ')}
                              </p>
                            )}
                            {idea.amazonKeywords && idea.amazonKeywords.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                          {idea.amazonKeywords.map((kw, idx) => (
                                <span key={idx} className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full border border-slate-700/50">
                                  {kw}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Save button or selected indicator */}
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
                              className="text-[10px] font-bold bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                            >
                              ESTE AHORA
                            </button>
                          )}
                          
                          {!bookData.savedIdeas.some(s => s.title === idea.title) ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setBookData((p) => ({ ...p, savedIdeas: [...p.savedIdeas, idea] }));
                              }}
                              className="text-[10px] font-bold bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                            >
                              METER EN PRÓXIMO LIBRO
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold text-center text-purple-400 bg-purple-950/30 border border-purple-900/50 px-3 py-1.5 rounded-lg">
                              GUARDADO✓
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
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-3 rounded-xl mt-2 hover:opacity-90 transition-opacity"
                      >
                        Continue with "{bookData.selectedIdea.title}" →
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
                          <span className="text-yellow-400 font-semibold text-sm">🍌 Nano Banana Pro — Generated Cover</span>
                          {bookData.coverImage && (
                            <span className="text-slate-500 text-xs">1600×2560 · Kindle-ready JPG</span>
                          )}
                        </div>
                        {isGeneratingCover ? (
                          <div key="cover-loading" className="flex flex-col items-center justify-center h-64 bg-slate-800/50 rounded-xl border border-yellow-700/30">
                            <div className="text-5xl mb-3 animate-pulse">🍌</div>
                            <p className="text-yellow-400 font-medium">Generating your cover...</p>
                            <p className="text-slate-500 text-sm mt-1">Nano Banana Pro is working its magic</p>
                          </div>
                        ) : bookData.coverImage ? (
                          <div key="cover-display" className="flex flex-col items-center gap-3">
                            {/* Aspect-ratio preview (9:16 portrait) */}
                            <div className="relative w-full max-w-[220px] mx-auto">
                              <div className="aspect-[9/16] rounded-xl overflow-hidden shadow-2xl shadow-yellow-900/30 border border-yellow-700/20">
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
                                <summary className="text-slate-500 text-xs cursor-pointer hover:text-slate-400">
                                  View image prompt
                                </summary>
                                <p className="text-slate-500 text-xs mt-2 bg-slate-800/50 rounded-lg p-3 leading-relaxed">
                                  {bookData.coverPrompt}
                                </p>
                              </details>
                            )}
                            <button
                              onClick={downloadCover}
                              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                            >
                              📥 Download Cover (1600×2560 JPG)
                            </button>
                          </div>
                        ) : null}
                        {bookData.coverImage && (
                          <div className="mt-8 border-t border-slate-700/50 pt-8 animate-fade-in">
                            <div className="flex items-center justify-between mb-6">
                              <div>
                                <h4 className="text-white font-bold text-lg mb-1">🚀 Amazon KDP A+ Content Pack</h4>
                                <p className="text-slate-400 text-sm">3 Módulos Premium · 1940×1200 px (Retina 2x) · RGB · Amazon Compliance</p>
                              </div>
                              <button
                                onClick={generateMarketingPack}
                                disabled={isGeneratingMarketing}
                                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-900/20 flex items-center gap-2"
                              >
                                {isGeneratingMarketing ? <span className="animate-spin text-lg">⟳</span> : <span>✨</span>}
                                {isGeneratingMarketing ? 'Generando Pack...' : 'Generar Marketing Pack'}
                              </button>
                            </div>

                            {marketingError && <p className="text-red-400 text-sm mb-4">❌ {marketingError}</p>}

                            <div className="grid grid-cols-1 gap-6">
                              {[
                                { type: 'comparison', label: 'Módulo 1: Antes vs. Después', desc: 'Gancho emocional — el lector se identifica con el dolor y ve la transformación' },
                                { type: 'authority', label: 'Módulo 2: Autoridad del Autor', desc: 'Credibilidad editorial — mockup 3D del libro con firma personal' },
                                { type: 'method', label: 'Módulo 3: Metodología / Proceso', desc: 'Infografía de las 4 fases — transforma características en beneficios' },
                              ].map(({ type, label, desc }) => (
                                <div key={type} className="bg-slate-800/40 border border-slate-700/30 rounded-2xl p-4 transition-all hover:bg-slate-800/60 overflow-hidden">
                                  <div className="flex items-center justify-between mb-2">
                                    <div>
                                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">{label}</span>
                                      <p className="text-[11px] text-slate-500 mt-0.5">{desc}</p>
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
                                        className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded-lg text-slate-300"
                                      >
                                        📥 Descargar 2x JPG
                                      </button>
                                    )}
                                  </div>
                                  
                                  <div className="aspect-[970/600] w-full bg-slate-900/80 rounded-xl overflow-hidden border border-slate-700/50 flex items-center justify-center relative">
                                    {bookData.marketingAssets[type] ? (
                                      <img src={`data:image/jpeg;base64,${bookData.marketingAssets[type]}`} alt={`A+ ${label}`} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="text-slate-700 flex flex-col items-center gap-2">
                                        <div className="text-3xl">🖼️</div>
                                        <span className="text-xs">Sin generar</span>
                                      </div>
                                    )}
                                    {isGeneratingMarketing && !bookData.marketingAssets[type] && (
                                      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center">
                                        <div className="animate-pulse text-indigo-400 font-bold">Generando pieza...</div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {(completedText || streamedText) && (
                          <div className="mt-8 border-t border-slate-700/50 pt-6">
                            <p className="text-slate-400 text-xs font-medium mb-3">Guía de Diseño para Amazon</p>
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
                              className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-xl transition-all shadow-lg shadow-green-900/20 flex items-center gap-2"
                            >
                              <span>🏛️</span> Finalizar y Guardar en Biblioteca
                            </button>
                          </div>
                          {renderAIContent(completedText)}
                        </div>
                      )
                    ) : (
                      completedText || streamedText ? (
                        <div key="ai-content-area" className={isGenerating ? 'streaming-cursor' : ''}>
                          {renderAIContent(isGenerating ? streamedText : completedText)}
                        </div>
                      ) : step !== 5 || (!bookData.coverImage && !isGeneratingCover) ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center">
                          <div className="text-6xl mb-4 opacity-30">{STEPS[step - 1].icon}</div>
                          <p className="text-slate-500 text-lg font-medium">
                            {STEPS[step - 1].title}
                          </p>
                          <p className="text-slate-600 text-sm mt-2">
                            {step === 1
                              ? 'Enter your niche and click "Generate Book Ideas" to start'
                              : step === 2
                              ? 'Click "Generate Outline" to create your book structure'
                              : step === 3
                              ? 'Select a chapter and click "Write Chapter" to generate content'
                              : step === 5
                              ? 'Click "Generate Cover" to create your cover with Nano Banana Pro'
                              : `Click "Generate ${STEPS[step - 1].title}" to continue`}
                          </p>
                        </div>
                      ) : null
                    )}
                    <div ref={contentEndRef} />
                  </div>
                )}
              </div>

              {/* Step 3: Chapter navigation tabs */}
              {step === 3 && Object.keys(bookData.writtenChapters).length > 0 && (
                <div className="p-4 border-t border-slate-700/50">
                  <p className="text-slate-400 text-xs mb-2">Written chapters:</p>
                  <div className="flex flex-wrap gap-2">
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
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                          bookData.currentWritingChapter === parseInt(num)
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        Ch.{num} ✓
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Export area in step 8 */}
              {step === 8 && bookData.selectedIdea && (
                <div className="p-5 border-t border-slate-700/50">
                  <div className="bg-gradient-to-r from-green-950/50 to-emerald-950/50 border border-green-700/30 rounded-xl p-4 space-y-4">
                    <div>
                      <p className="text-green-400 font-semibold">🎉 Tu ebook está listo!</p>
                      <p className="text-slate-400 text-sm mt-0.5">
                        {chaptersWritten > 0
                          ? `${chaptersWritten} capítulos escritos - .docx listo para Amazon KDP`
                          : 'Exporta tu libro como .docx'}
                      </p>
                    </div>

                    {/* Publication format selector */}
                    <div className="bg-slate-800/60 border border-slate-700/40 rounded-lg p-3 space-y-2">
                      <p className="text-slate-300 font-semibold text-sm">Formato de publicación:</p>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pubFormats.ebook}
                          onChange={(e) => setPubFormats(prev => ({ ...prev, ebook: e.target.checked }))}
                          className="w-4 h-4 rounded border-gray-300 accent-green-500"
                        />
                        <span className="text-sm text-slate-300">Ebook (libro electrónico Kindle)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pubFormats.paperback}
                          onChange={(e) => setPubFormats(prev => ({ ...prev, paperback: e.target.checked }))}
                          className="w-4 h-4 rounded border-gray-300 accent-green-500"
                        />
                        <span className="text-sm text-slate-300">Tapa blanda (libro impreso)</span>
                      </label>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      <button
                        onClick={exportKdpStrategy}
                        className="bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 text-white font-medium px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2 flex-1 sm:flex-none whitespace-nowrap"
                      >
                        📋 Datos KDP (TXT)
                      </button>
                      <button
                        onClick={exportDocx}
                        disabled={isExporting || (!pubFormats.ebook && !pubFormats.paperback)}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 flex-1 sm:flex-none whitespace-nowrap"
                      >
                        {isExporting ? (
                          <>
                            <span className="animate-spin">⟳</span> Exportando...
                          </>
                        ) : !pubFormats.ebook && !pubFormats.paperback ? (
                          <>Selecciona al menos un formato</>
                        ) : exportSuccess ? (
                          <>✅ Descargar de nuevo</>
                        ) : pubFormats.ebook && pubFormats.paperback ? (
                          <>📥 Descargar Ebook + Tapa blanda</>
                        ) : pubFormats.ebook ? (
                          <>📥 Descargar Ebook (.docx)</>
                        ) : (
                          <>📥 Descargar Tapa blanda (.docx)</>
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

      {/* Library View Modal */}
      {viewingLibraryBook && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div>
                <h2 className="text-white font-bold text-xl">{viewingLibraryBook.selectedIdea?.title}</h2>
                <p className="text-slate-400 text-sm">Reviewing setup data for publication</p>
              </div>
              <button 
                onClick={() => setViewingLibraryBook(null)}
                className="text-slate-400 hover:text-white p-2"
              >
                ✕ Close
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-950/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <h3 className="text-indigo-400 text-sm font-semibold mb-2">📋 KDP Setup (Step 6)</h3>
                    <div className="text-slate-300 text-xs whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                      {viewingLibraryBook.kdpSetup || "No data saved"}
                    </div>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <h3 className="text-yellow-500 text-sm font-semibold mb-2">💰 Pricing Strategy (Step 7)</h3>
                    <div className="text-slate-300 text-xs whitespace-pre-wrap leading-relaxed">
                      {viewingLibraryBook.pricingStrategy || "No data saved"}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                    <h3 className="text-orange-500 text-sm font-semibold mb-2">📣 Marketing Content (Step 8)</h3>
                    <div className="text-slate-300 text-xs whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                      {viewingLibraryBook.marketingContent || "No data saved"}
                    </div>
                  </div>
                  {viewingLibraryBook.coverImage && (
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                      <h3 className="text-green-500 text-sm font-semibold mb-2">🖼️ Book Cover</h3>
                      <div className="aspect-[9/16] w-32 rounded-lg overflow-hidden border border-slate-700 mx-auto">
                        <img src={`data:image/jpeg;base64,${viewingLibraryBook.coverImage}`} alt="Cover" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-800 bg-slate-900/50 text-center">
              <p className="text-slate-500 text-[10px]">EbookAI Library System — Use these details to fill your Amazon KDP listing.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
