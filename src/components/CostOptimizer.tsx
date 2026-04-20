'use client';

import { useState } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface StepAssignment {
  model: string;
  thinking: boolean;
  maxTokens: number;
}

export interface ModelConfig {
  assignments: Record<number, string>;
  thinking: Record<number, boolean>;
  maxTokens: Record<number, number>;
  strategyName: string;
}

interface ModelInfo {
  id: string;
  name: string;
  inputCostPer1M: number;
  outputCostPer1M: number;
  quality: number;
  speed: number;
  badge?: string;
}

interface StrategyDef {
  id: string;
  name: string;
  description: string;
  badge?: string;
  savePct?: string;
  steps: Record<number, StepAssignment>;
}

// ─── Model catalogue ─────────────────────────────────────────────────────────

const MODELS: ModelInfo[] = [
  {
    id: 'opus-4.7',
    name: 'Claude Opus 4.7',
    inputCostPer1M: 5,
    outputCostPer1M: 25,
    quality: 10,
    speed: 5,
    badge: 'Best Quality',
  },
  {
    id: 'opus-4.6',
    name: 'Claude Opus 4.6',
    inputCostPer1M: 5,
    outputCostPer1M: 25,
    quality: 9,
    speed: 5,
  },
  {
    id: 'sonnet-4.6',
    name: 'Claude Sonnet 4.6',
    inputCostPer1M: 3,
    outputCostPer1M: 15,
    quality: 8,
    speed: 8,
    badge: 'Recommended',
  },
  {
    id: 'sonnet-4.5',
    name: 'Claude Sonnet 4.5',
    inputCostPer1M: 3,
    outputCostPer1M: 15,
    quality: 7,
    speed: 8,
  },
  {
    id: 'haiku-4.5',
    name: 'Claude Haiku 4.5',
    inputCostPer1M: 1,
    outputCostPer1M: 5,
    quality: 5,
    speed: 10,
    badge: 'Fastest & Cheapest',
  },
];

// ─── Preset strategies ───────────────────────────────────────────────────────

const STRATEGIES: StrategyDef[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'Opus para escritura, Sonnet para estructura y marketing.',
    steps: {
      1: { model: 'haiku-4.5',  thinking: false, maxTokens: 2000 },
      2: { model: 'sonnet-4.6', thinking: false, maxTokens: 8000 },
      3: { model: 'opus-4.7',   thinking: true,  maxTokens: 6000 },
      4: { model: 'haiku-4.5',  thinking: false, maxTokens: 2500 },
      5: { model: 'haiku-4.5',  thinking: false, maxTokens: 3000 },
      6: { model: 'haiku-4.5',  thinking: false, maxTokens: 3500 },
      7: { model: 'sonnet-4.6', thinking: false, maxTokens: 3000 },
      8: { model: 'sonnet-4.6', thinking: false, maxTokens: 5000 },
    },
  },
  {
    id: 'optimized',
    name: 'Optimized',
    description: 'Sonnet para escritura y pasos clave. Gran calidad a menor precio.',
    badge: '-36% coste',
    savePct: '36%',
    steps: {
      1: { model: 'haiku-4.5',  thinking: false, maxTokens: 2000 },
      2: { model: 'sonnet-4.6', thinking: false, maxTokens: 3000 },
      3: { model: 'sonnet-4.6', thinking: true,  maxTokens: 6000 },
      4: { model: 'haiku-4.5',  thinking: false, maxTokens: 2500 },
      5: { model: 'haiku-4.5',  thinking: false, maxTokens: 3000 },
      6: { model: 'haiku-4.5',  thinking: false, maxTokens: 3500 },
      7: { model: 'haiku-4.5',  thinking: false, maxTokens: 3000 },
      8: { model: 'sonnet-4.6', thinking: false, maxTokens: 5000 },
    },
  },
  {
    id: 'budget',
    name: 'Budget',
    description: 'Haiku en todo excepto Sonnet para escritura de capítulos.',
    badge: '-42% coste',
    savePct: '42%',
    steps: {
      1: { model: 'haiku-4.5',  thinking: false, maxTokens: 2000 },
      2: { model: 'haiku-4.5',  thinking: false, maxTokens: 3000 },
      3: { model: 'sonnet-4.6', thinking: false, maxTokens: 6000 },
      4: { model: 'haiku-4.5',  thinking: false, maxTokens: 2500 },
      5: { model: 'haiku-4.5',  thinking: false, maxTokens: 3000 },
      6: { model: 'haiku-4.5',  thinking: false, maxTokens: 3500 },
      7: { model: 'haiku-4.5',  thinking: false, maxTokens: 3000 },
      8: { model: 'haiku-4.5',  thinking: false, maxTokens: 5000 },
    },
  },
  {
    id: 'ultra_budget',
    name: 'Ultra Budget',
    description: 'Todo Haiku — máximo ahorro, generación más rápida.',
    badge: '-75% coste',
    savePct: '75%',
    steps: {
      1: { model: 'haiku-4.5', thinking: false, maxTokens: 2000 },
      2: { model: 'haiku-4.5', thinking: false, maxTokens: 3000 },
      3: { model: 'haiku-4.5', thinking: false, maxTokens: 6000 },
      4: { model: 'haiku-4.5', thinking: false, maxTokens: 2500 },
      5: { model: 'haiku-4.5', thinking: false, maxTokens: 3000 },
      6: { model: 'haiku-4.5', thinking: false, maxTokens: 3500 },
      7: { model: 'haiku-4.5', thinking: false, maxTokens: 3000 },
      8: { model: 'haiku-4.5', thinking: false, maxTokens: 5000 },
    },
  },
];

const STEP_TOKEN_ESTIMATES: Record<number, { input: number; output: number }> = {
  1: { input: 500,  output: 1800 },
  2: { input: 800,  output: 2500 },
  3: { input: 1200, output: 5500 },
  4: { input: 2000, output: 2000 },
  5: { input: 1000, output: 2500 },
  6: { input: 1200, output: 3000 },
  7: { input: 1500, output: 2500 },
  8: { input: 2000, output: 4500 },
};

function calcCost(
  steps: Record<number, StepAssignment>,
  chaptersPerBook: number,
  ebooksPerMonth: number
): number {
  let costPerBook = 0;
  for (let s = 1; s <= 8; s++) {
    const assignment = steps[s];
    const model = MODELS.find((m) => m.id === assignment.model) ?? MODELS[3];
    const tokens = STEP_TOKEN_ESTIMATES[s];
    const repeats = s === 3 ? chaptersPerBook : 1;
    const inputCost  = (tokens.input  / 1_000_000) * model.inputCostPer1M  * repeats;
    const outputCost = (tokens.output / 1_000_000) * model.outputCostPer1M * repeats;
    costPerBook += inputCost + outputCost;
  }
  return costPerBook * ebooksPerMonth;
}

// ─── SVG Icons ──────────────────────────────────────────────────────────────

function BookIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
    </svg>
  );
}

function CheckIcon({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function PenIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#0a0600" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
    </svg>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface CostOptimizerProps {
  onConfirm: (config: ModelConfig) => void;
}

export default function CostOptimizer({ onConfirm }: CostOptimizerProps) {
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('optimized');
  const [customSteps, setCustomSteps] = useState<Record<number, StepAssignment>>(
    () => ({ ...STRATEGIES[0].steps })
  );
  const [chaptersPerBook, setChaptersPerBook] = useState(8);
  const [ebooksPerMonth, setEbooksPerMonth] = useState(2);

  const isCustom = selectedStrategyId === 'custom';
  const selectedStrategy = STRATEGIES.find((s) => s.id === selectedStrategyId);
  const activeSteps = isCustom ? customSteps : (selectedStrategy?.steps ?? STRATEGIES[0].steps);
  const activeCost = calcCost(activeSteps, chaptersPerBook, ebooksPerMonth);

  const handleConfirm = () => {
    const config: ModelConfig = {
      assignments: Object.fromEntries(
        Object.entries(activeSteps).map(([k, v]) => [Number(k), v.model])
      ),
      thinking: Object.fromEntries(
        Object.entries(activeSteps).map(([k, v]) => [Number(k), v.thinking])
      ),
      maxTokens: Object.fromEntries(
        Object.entries(activeSteps).map(([k, v]) => [Number(k), v.maxTokens])
      ),
      strategyName: isCustom ? 'Custom' : (selectedStrategy?.name ?? 'Default'),
    };
    onConfirm(config);
  };

  const FEATURES = [
    'Generación de ideas rentables con datos reales de KDP',
    'Escritura de capítulos con Claude Opus / Sonnet',
    'Portada profesional con Nano Banana Pro',
    'Estrategia de marketing y lanzamiento incluida',
  ];

  return (
    <div className="min-h-screen flex flex-col bg-eb-bg font-sans">
      {/* Top bar */}
      <div className="border-b border-eb-border px-8 py-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-eb-gold-dim to-eb-gold flex items-center justify-center">
          <BookIcon />
        </div>
        <div>
          <div className="font-serif text-[1.1rem] font-semibold text-eb-text tracking-tight">EbookAI</div>
          <div className="text-[0.7rem] text-eb-muted tracking-widest uppercase">by Edgar Manchón</div>
        </div>
      </div>

      <div className="flex-1 flex items-stretch overflow-hidden">
        {/* Left panel — decorative */}
        <div className="w-[420px] flex-shrink-0 bg-eb-surface border-r border-eb-border px-12 py-16 flex flex-col justify-center relative overflow-hidden hidden lg:flex">
          {/* BG grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, #c8963a 0px, #c8963a 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #c8963a 0px, #c8963a 1px, transparent 1px, transparent 40px)',
            }}
          />
          <div className="relative">
            <div className="inline-block bg-eb-gold/10 border border-eb-gold/25 rounded-lg px-3 py-1 mb-6 text-[0.7rem] font-semibold text-eb-gold tracking-widest uppercase">
              Automated Publishing
            </div>
            <h1 className="font-serif text-[2.8rem] font-bold leading-[1.15] text-eb-text mb-5 tracking-tight">
              De idea<br/><em className="text-eb-gold italic">a best-seller</em><br/>en horas.
            </h1>
            <p className="text-[0.95rem] text-eb-muted leading-relaxed mb-9">
              8 pasos guiados por IA para escribir, formatear, diseñar y lanzar tu ebook en Amazon KDP.
            </p>
            <div className="flex flex-col gap-3">
              {FEATURES.map((f, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-eb-gold/15 border border-eb-gold/30 flex items-center justify-center flex-shrink-0 mt-0.5 text-eb-gold">
                    <CheckIcon size={10} />
                  </div>
                  <span className="text-[0.85rem] text-eb-muted leading-snug">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel — strategy */}
        <div className="flex-1 px-14 py-12 overflow-y-auto">
          <h2 className="font-serif text-[1.6rem] font-semibold mb-1.5 tracking-tight text-eb-text">
            Elige tu estrategia de modelos
          </h2>
          <p className="text-sm text-eb-muted mb-8">
            Cada paso del proceso usa un modelo diferente. Elige según tu balance calidad/coste.
          </p>

          {/* Strategy cards */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {STRATEGIES.map((s) => {
              const sel = selectedStrategyId === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedStrategyId(s.id)}
                  className={`text-left p-[18px] rounded-[14px] transition-all font-sans ${
                    sel
                      ? 'border-[1.5px] border-eb-gold bg-eb-gold/[0.06]'
                      : 'border border-eb-border bg-eb-surface hover:border-eb-border-2'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[0.9rem] font-semibold ${sel ? 'text-eb-gold-lt' : 'text-eb-text'}`}>
                      {s.name}
                    </span>
                    {s.badge && (
                      <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded-full bg-eb-green/15 text-eb-green border border-eb-green/30">
                        {s.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[0.8rem] text-eb-muted leading-snug">{s.description}</p>
                  <div className={`mt-3 text-[1.1rem] font-bold ${sel ? 'text-eb-gold' : 'text-eb-text'}`}>
                    ~${(calcCost(s.steps, ebooksPerMonth, chaptersPerBook / 8 * ebooksPerMonth) / ebooksPerMonth * ebooksPerMonth).toFixed(2)}
                    <span className="text-[0.7rem] font-normal text-eb-muted ml-1">/mes</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom option */}
          <button
            onClick={() => setSelectedStrategyId('custom')}
            className={`w-full text-left p-4 rounded-[14px] mb-8 transition-all font-sans ${
              isCustom
                ? 'border-[1.5px] border-eb-gold bg-eb-gold/[0.06]'
                : 'border border-eb-border bg-eb-surface hover:border-eb-border-2'
            }`}
          >
            <span className={`text-[0.9rem] font-semibold ${isCustom ? 'text-eb-gold-lt' : 'text-eb-text'}`}>
              Custom
            </span>
            <p className="text-[0.8rem] text-eb-muted mt-1">Elige un modelo diferente para cada paso manualmente.</p>
          </button>

          {/* Custom step editor */}
          {isCustom && (
            <div className="bg-eb-surface border border-eb-border rounded-[14px] p-5 mb-8">
              <h3 className="text-eb-text font-semibold mb-4 text-sm">Asignación por paso</h3>
              <div className="space-y-3">
                {([1,2,3,4,5,6,7,8] as const).map((s) => {
                  const labels: Record<number,string> = {1:'Ideas',2:'Estructura',3:'Escritura',4:'Formato',5:'Portada',6:'KDP Setup',7:'Precios',8:'Marketing'};
                  return (
                    <div key={s} className="flex items-center gap-3">
                      <span className="text-eb-muted text-sm w-24 flex-shrink-0">{labels[s]}</span>
                      <select
                        value={customSteps[s]?.model ?? 'haiku-4.5'}
                        onChange={(e) => setCustomSteps((prev) => ({ ...prev, [s]: { ...prev[s], model: e.target.value } }))}
                        className="flex-1 bg-eb-surface-2 border border-eb-border rounded-lg px-3 py-1.5 text-eb-text text-sm focus:outline-none focus:border-eb-gold"
                      >
                        {MODELS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                      {(customSteps[s]?.model === 'opus-4.6' || customSteps[s]?.model === 'sonnet-4.6') && (
                        <label className="flex items-center gap-1.5 text-xs text-eb-muted whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={customSteps[s]?.thinking ?? false}
                            onChange={(e) => setCustomSteps((prev) => ({ ...prev, [s]: { ...prev[s], thinking: e.target.checked } }))}
                          />
                          Thinking
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sliders */}
          <div className="bg-eb-surface border border-eb-border rounded-[14px] px-6 py-5 mb-8 grid grid-cols-2 gap-5">
            {[
              { label: 'Capítulos por libro', val: chaptersPerBook, set: setChaptersPerBook, min: 4, max: 20 },
              { label: 'Ebooks por mes', val: ebooksPerMonth, set: setEbooksPerMonth, min: 1, max: 20 },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-[0.8rem] mb-2">
                  <span className="text-eb-muted">{s.label}</span>
                  <span className="text-eb-gold font-semibold">{s.val}</span>
                </div>
                <input
                  type="range"
                  min={s.min}
                  max={s.max}
                  value={s.val}
                  onChange={(e) => s.set(+e.target.value)}
                  className="w-full"
                />
              </div>
            ))}
          </div>

          {/* Start button */}
          <button
            onClick={handleConfirm}
            className="w-full py-4 rounded-[14px] border-none bg-eb-gold text-[#0a0600] font-sans text-base font-bold cursor-pointer tracking-tight transition-colors hover:bg-eb-gold-lt flex items-center justify-center gap-2.5"
          >
            <PenIcon />
            Comenzar a crear mi ebook
            <span className="font-normal opacity-70 text-sm">
              ({isCustom ? 'Custom' : selectedStrategy?.name})
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
