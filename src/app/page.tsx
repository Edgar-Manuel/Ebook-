'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { BookData, BookIdea, Chapter, Step } from '@/types';
import CostOptimizer, { type ModelConfig } from '@/components/CostOptimizer';
import NicheRoulette from '@/components/NicheRoulette';

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
  ideas: [],
  selectedIdea: null,
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

    // Match chapter headings like "**Chapter 1: Title**" or "Chapter 1: Title"
    const chapterMatch =
      trimmed.match(/\*?\*?Chapter\s+(\d+):\s*(.+?)\*?\*?$/i) ??
      trimmed.match(/^#{1,2}\s+Chapter\s+(\d+):\s*(.+)$/i) ??
      trimmed.match(/^(\d+)\.\s+(.+)$/);

    if (chapterMatch) {
      if (currentChapter) chapters.push(currentChapter);
      currentChapter = {
        number: parseInt(chapterMatch[1]),
        title: chapterMatch[2].replace(/\*\*/g, '').trim(),
        subheadings: [],
      };
      continue;
    }

    // Match subheadings: lines starting with "- " or "* "
    if (currentChapter && (trimmed.startsWith('- ') || trimmed.startsWith('* '))) {
      const sub = trimmed.slice(2).replace(/\*\*/g, '').trim();
      if (sub) currentChapter.subheadings.push(sub);
    }
  }

  if (currentChapter) chapters.push(currentChapter);

  // If no chapters parsed, create placeholder chapters
  if (chapters.length === 0) {
    for (let i = 1; i <= 5; i++) {
      chapters.push({
        number: i,
        title: `Chapter ${i}`,
        subheadings: ['Overview', 'Key Points', 'Practical Application'],
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
  const streamRef = useRef<string>('');
  const contentEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    contentEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [streamedText]);

  const generate = useCallback(
    async (overrideData?: Partial<BookData>) => {
      setIsGenerating(true);
      setStreamedText('');
      setError('');
      streamRef.current = '';

      const data = overrideData ? { ...bookData, ...overrideData } : bookData;

      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ step, data, modelConfig }),
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

        // Save to book data
        const finalText = streamRef.current;
        setBookData((prev) => {
          const updated = { ...prev };
          switch (step) {
            case 1:
              updated.ideas = parseIdeasFromText(finalText);
              break;
            case 2:
              updated.outline = finalText;
              updated.chapters = parseOutlineFromText(finalText);
              break;
            case 3: {
              const chNum = prev.currentWritingChapter;
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
        body: JSON.stringify(bookData),
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

  const downloadCover = () => {
    if (!bookData.coverImage) return;
    const link = document.createElement('a');
    const title = bookData.selectedIdea?.title ?? 'cover';
    link.href = `data:image/jpeg;base64,${bookData.coverImage}`;
    link.download = `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-cover.jpg`;
    link.click();
  };

  const exportDocx = async () => {
    setIsExporting(true);
    setExportSuccess(false);
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookData),
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const title = bookData.selectedIdea?.title ?? 'ebook';
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.docx`;
      a.click();
      URL.revokeObjectURL(url);
      setExportSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const completedText =
    step === 1
      ? bookData.ideas.length > 0
        ? streamedText || `Generated ${bookData.ideas.length} ideas`
        : streamedText
      : step === 2
      ? bookData.outline || streamedText
      : step === 3
      ? bookData.writtenChapters[bookData.currentWritingChapter] || streamedText
      : step === 4
      ? bookData.formattedContent || streamedText
      : step === 5
      ? bookData.coverDesign || streamedText
      : step === 6
      ? bookData.kdpSetup || streamedText
      : step === 7
      ? bookData.pricingStrategy || streamedText
      : bookData.marketingContent || streamedText;

  const canProceed = !isGenerating && completedText.length > 100;

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
          <div className="flex items-center gap-3">
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

      {/* Step Progress */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-1 md:gap-2 overflow-x-auto pb-2">
          {STEPS.map((s) => (
            <button
              key={s.number}
              onClick={() => {
                if (s.number <= step) {
                  setStep(s.number as Step);
                  setStreamedText('');
                }
              }}
              className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                s.number === step
                  ? 'step-active text-white'
                  : s.number < step
                  ? 'step-complete text-white opacity-80'
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
                          if (!bookData.writtenChapters[ch.number]) {
                            setBookData((p) => ({ ...p, currentWritingChapter: ch.number }));
                            await generate({ currentWritingChapter: ch.number });
                            await new Promise((r) => setTimeout(r, 500));
                          }
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
                      disabled={isExporting || !bookData.selectedIdea}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      {isExporting ? (
                        <>
                          <span className="animate-spin">⟳</span> Exporting...
                        </>
                      ) : exportSuccess ? (
                        <>✅ Downloaded!</>
                      ) : (
                        <>📥 Export as .DOCX</>
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
                <h3 className="text-slate-300 font-semibold text-sm mb-3">📖 Book Summary</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-slate-500">Title</p>
                    <p className="text-white text-sm font-medium">{bookData.selectedIdea.title}</p>
                  </div>
                  {bookData.selectedIdea.subtitle && (
                    <div>
                      <p className="text-xs text-slate-500">Subtitle</p>
                      <p className="text-slate-300 text-sm">{bookData.selectedIdea.subtitle}</p>
                    </div>
                  )}
                  {bookData.chapters.length > 0 && (
                    <div>
                      <p className="text-xs text-slate-500">Chapters</p>
                      <p className="text-indigo-400 text-sm">{bookData.chapters.length} chapters</p>
                    </div>
                  )}
                  {chaptersWritten > 0 && (
                    <div>
                      <p className="text-xs text-slate-500">Written</p>
                      <p className="text-green-400 text-sm">
                        {chaptersWritten}/{bookData.chapters.length} chapters ✓
                      </p>
                    </div>
                  )}
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
                Next →
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
                        onClick={() =>
                          setBookData((p) => ({ ...p, selectedIdea: idea }))
                        }
                        className={`idea-card border rounded-xl p-4 ${
                          bookData.selectedIdea?.title === idea.title
                            ? 'selected border-indigo-500'
                            : 'border-slate-700/50 bg-slate-800/30'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-indigo-400 font-medium bg-indigo-950/50 px-2 py-0.5 rounded-full">
                                Idea {i + 1}
                              </span>
                              {bookData.selectedIdea?.title === idea.title && (
                                <span className="text-xs text-green-400">✓ Selected</span>
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
                          <div className="flex flex-col items-center justify-center h-64 bg-slate-800/50 rounded-xl border border-yellow-700/30">
                            <div className="text-5xl mb-3 animate-pulse">🍌</div>
                            <p className="text-yellow-400 font-medium">Generating your cover...</p>
                            <p className="text-slate-500 text-sm mt-1">Nano Banana Pro is working its magic</p>
                          </div>
                        ) : bookData.coverImage ? (
                          <div className="flex flex-col items-center gap-3">
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
                        {(completedText || streamedText) && (
                          <div className="mt-6 border-t border-slate-700/50 pt-4">
                            <p className="text-slate-400 text-xs font-medium mb-3">Design Tips & Notes</p>
                          </div>
                        )}
                      </div>
                    )}

                    {completedText || streamedText ? (
                      <div className={isGenerating ? 'streaming-cursor' : ''}>
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
                    ) : null}
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
                  <div className="bg-gradient-to-r from-green-950/50 to-emerald-950/50 border border-green-700/30 rounded-xl p-4">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <p className="text-green-400 font-semibold">🎉 Your ebook is ready!</p>
                        <p className="text-slate-400 text-sm mt-0.5">
                          {chaptersWritten > 0
                            ? `${chaptersWritten} chapters written • Complete .docx ready for Kindle`
                            : 'Export your book outline and structure as .docx'}
                        </p>
                      </div>
                      <button
                        onClick={exportDocx}
                        disabled={isExporting}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2"
                      >
                        {isExporting ? (
                          <>
                            <span className="animate-spin">⟳</span> Exporting...
                          </>
                        ) : exportSuccess ? (
                          <>✅ Download Again</>
                        ) : (
                          <>📥 Download .DOCX</>
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
  );
}
