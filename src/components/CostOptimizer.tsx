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
  quality: number; // 1-10
  speed: number;   // 1-10
  badge?: string;
}

interface StrategyDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  badge?: string;
  badgeColor?: string;
  steps: Record<number, StepAssignment>;
}

// ─── Model catalogue ─────────────────────────────────────────────────────────

const MODELS: ModelInfo[] = [
  {
    id: 'opus-4.6',
    name: 'Claude Opus 4.6',
    inputCostPer1M: 15,
    outputCostPer1M: 75,
    quality: 10,
    speed: 5,
    badge: 'Best Quality',
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
    inputCostPer1M: 0.8,
    outputCostPer1M: 4,
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
    description: 'Balanced quality — the original smart routing config',
    icon: '⚖️',
    steps: {
      1: { model: 'haiku-4.5',  thinking: false, maxTokens: 2000 },
      2: { model: 'sonnet-4.6', thinking: false, maxTokens: 16000 },
      3: { model: 'opus-4.6',   thinking: true,  maxTokens: 6000 },
      4: { model: 'haiku-4.5',  thinking: false, maxTokens: 2500 },
      5: { model: 'haiku-4.5',  thinking: false, maxTokens: 3000 },
      6: { model: 'haiku-4.5',  thinking: false, maxTokens: 3500 },
      7: { model: 'sonnet-4.6', thinking: false, maxTokens: 3000 },
      8: { model: 'sonnet-4.6', thinking: false, maxTokens: 5000 },
    },
  },
  {
    id: 'optimized',
    name: 'Optimized (~60% savings)',
    description: 'Great quality at reduced cost — Sonnet for chapter writing',
    icon: '💡',
    badge: '~60% cheaper',
    badgeColor: 'text-green-400 bg-green-950/50 border-green-700/30',
    steps: {
      1: { model: 'haiku-4.5',  thinking: false, maxTokens: 2000 },
      2: { model: 'sonnet-4.5', thinking: false, maxTokens: 16000 },
      3: { model: 'sonnet-4.6', thinking: true,  maxTokens: 6000 },
      4: { model: 'haiku-4.5',  thinking: false, maxTokens: 2500 },
      5: { model: 'haiku-4.5',  thinking: false, maxTokens: 3000 },
      6: { model: 'haiku-4.5',  thinking: false, maxTokens: 3500 },
      7: { model: 'haiku-4.5',  thinking: false, maxTokens: 3000 },
      8: { model: 'sonnet-4.5', thinking: false, maxTokens: 5000 },
    },
  },
  {
    id: 'budget',
    name: 'Budget',
    description: 'Haiku for most steps, Sonnet only for heavy writing',
    icon: '💰',
    badge: '~80% cheaper',
    badgeColor: 'text-yellow-400 bg-yellow-950/50 border-yellow-700/30',
    steps: {
      1: { model: 'haiku-4.5',  thinking: false, maxTokens: 2000 },
      2: { model: 'haiku-4.5',  thinking: false, maxTokens: 3000 },
      3: { model: 'sonnet-4.5', thinking: false, maxTokens: 6000 },
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
    description: 'All Haiku — maximum savings, fastest generation',
    icon: '🪙',
    badge: '~90% cheaper',
    badgeColor: 'text-orange-400 bg-orange-950/50 border-orange-700/30',
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

const STEP_LABELS: Record<number, string> = {
  1: 'Book Ideas',
  2: 'Outline',
  3: 'Write Chapters',
  4: 'Format',
  5: 'Cover Design',
  6: 'KDP Setup',
  7: 'Pricing',
  8: 'Marketing',
};

// Rough token estimates per step (input + output combined)
const STEP_TOKEN_ESTIMATES: Record<number, { input: number; output: number }> = {
  1: { input: 500,  output: 1800 },
  2: { input: 800,  output: 10000 },
  3: { input: 1200, output: 5500 }, // per chapter, multiplied by chapters
  4: { input: 2000, output: 2000 },
  5: { input: 1000, output: 2500 },
  6: { input: 1200, output: 3000 },
  7: { input: 1500, output: 2500 },
  8: { input: 2000, output: 4500 },
};

// ─── Helper: calculate cost for a strategy ───────────────────────────────────

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

// ─── QualityBar ──────────────────────────────────────────────────────────────

function QualityBar({ value, max = 10 }: { value: number; max?: number }) {
  const pct = (value / max) * 100;
  const color =
    value >= 8 ? 'bg-green-500' : value >= 6 ? 'bg-yellow-500' : 'bg-orange-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-slate-400 text-xs w-4 text-right">{value}</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface CostOptimizerProps {
  onConfirm: (config: ModelConfig) => void;
}

export default function CostOptimizer({ onConfirm }: CostOptimizerProps) {
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('default');
  const [customSteps, setCustomSteps] = useState<Record<number, StepAssignment>>(
    () => ({ ...STRATEGIES[0].steps })
  );
  const [chaptersPerBook, setChaptersPerBook] = useState(8);
  const [ebooksPerMonth, setEbooksPerMonth] = useState(2);

  const isCustom = selectedStrategyId === 'custom';
  const selectedStrategy = STRATEGIES.find((s) => s.id === selectedStrategyId);
  const activeSteps = isCustom ? customSteps : (selectedStrategy?.steps ?? STRATEGIES[0].steps);

  const defaultCost = calcCost(STRATEGIES[0].steps, chaptersPerBook, ebooksPerMonth);
  const activeCost  = calcCost(activeSteps, chaptersPerBook, ebooksPerMonth);
  const savings     = defaultCost > 0 ? ((defaultCost - activeCost) / defaultCost) * 100 : 0;

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/20 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl mx-auto mb-4">
            📖
          </div>
          <h1 className="text-white font-bold text-3xl mb-2">EbookAI</h1>
          <p className="text-slate-400">Choose your AI model strategy before we begin</p>
        </div>

        {/* Strategy cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {STRATEGIES.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedStrategyId(s.id)}
              className={`text-left p-4 rounded-2xl border transition-all ${
                selectedStrategyId === s.id
                  ? 'border-indigo-500 bg-indigo-950/40'
                  : 'border-slate-700/50 bg-slate-900/60 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{s.icon}</span>
                {selectedStrategyId === s.id && (
                  <span className="text-xs text-indigo-400 font-medium bg-indigo-950 border border-indigo-700/50 px-2 py-0.5 rounded-full">
                    Selected
                  </span>
                )}
              </div>
              <p className="text-white font-semibold text-sm">{s.name}</p>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">{s.description}</p>
              {s.badge && (
                <span
                  className={`inline-block mt-2 text-xs font-medium border px-2 py-0.5 rounded-full ${
                    s.badgeColor ?? 'text-slate-300 bg-slate-800 border-slate-600'
                  }`}
                >
                  {s.badge}
                </span>
              )}
            </button>
          ))}

          {/* Custom card */}
          <button
            onClick={() => setSelectedStrategyId('custom')}
            className={`text-left p-4 rounded-2xl border transition-all ${
              selectedStrategyId === 'custom'
                ? 'border-indigo-500 bg-indigo-950/40'
                : 'border-slate-700/50 bg-slate-900/60 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🎛️</span>
              {selectedStrategyId === 'custom' && (
                <span className="text-xs text-indigo-400 font-medium bg-indigo-950 border border-indigo-700/50 px-2 py-0.5 rounded-full">
                  Selected
                </span>
              )}
            </div>
            <p className="text-white font-semibold text-sm">Custom</p>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">
              Pick a different model for each step manually
            </p>
          </button>
        </div>

        {/* Custom step editor */}
        {isCustom && (
          <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-4">Per-step model assignment</h3>
            <div className="space-y-3">
              {([1, 2, 3, 4, 5, 6, 7, 8] as const).map((s) => (
                <div key={s} className="flex items-center gap-3">
                  <span className="text-slate-400 text-sm w-28 flex-shrink-0">
                    {STEP_LABELS[s]}
                  </span>
                  <select
                    value={customSteps[s]?.model ?? 'haiku-4.5'}
                    onChange={(e) =>
                      setCustomSteps((prev) => ({
                        ...prev,
                        [s]: { ...prev[s], model: e.target.value },
                      }))
                    }
                    className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-indigo-500"
                  >
                    {MODELS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  {(customSteps[s]?.model === 'opus-4.6' ||
                    customSteps[s]?.model === 'sonnet-4.6') && (
                    <label className="flex items-center gap-1.5 text-xs text-slate-400 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={customSteps[s]?.thinking ?? false}
                        onChange={(e) =>
                          setCustomSteps((prev) => ({
                            ...prev,
                            [s]: { ...prev[s], thinking: e.target.checked },
                          }))
                        }
                        className="accent-indigo-500"
                      />
                      Thinking
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cost estimator + sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sliders */}
          <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-5 space-y-5">
            <h3 className="text-white font-semibold">Usage estimate</h3>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Chapters per book</span>
                <span className="text-indigo-400 font-medium">{chaptersPerBook}</span>
              </div>
              <input
                type="range"
                min={4}
                max={20}
                value={chaptersPerBook}
                onChange={(e) => setChaptersPerBook(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-400">Ebooks per month</span>
                <span className="text-indigo-400 font-medium">{ebooksPerMonth}</span>
              </div>
              <input
                type="range"
                min={1}
                max={20}
                value={ebooksPerMonth}
                onChange={(e) => setEbooksPerMonth(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>

          {/* Cost summary */}
          <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-5">
            <h3 className="text-white font-semibold mb-4">Estimated monthly cost</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <span className="text-slate-400 text-sm">Default (reference)</span>
                <span className="text-slate-300 font-mono">${defaultCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-slate-400 text-sm">
                  {isCustom ? 'Custom' : (selectedStrategy?.name ?? 'Selected')}
                </span>
                <span className="text-white font-mono font-bold text-xl">
                  ${activeCost.toFixed(2)}
                </span>
              </div>
              {savings > 0 && (
                <div className="flex justify-between items-center bg-green-950/40 border border-green-700/30 rounded-xl px-3 py-2">
                  <span className="text-green-400 text-sm">You save</span>
                  <span className="text-green-400 font-bold">
                    ${(defaultCost - activeCost).toFixed(2)} ({savings.toFixed(0)}%)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Step-by-step model table */}
        <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-5">
          <h3 className="text-white font-semibold mb-4">Model assignment per step</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-700/50">
                  <th className="pb-2 pr-4 font-medium">Step</th>
                  <th className="pb-2 pr-4 font-medium">Model</th>
                  <th className="pb-2 pr-4 font-medium">Quality</th>
                  <th className="pb-2 font-medium">Thinking</th>
                </tr>
              </thead>
              <tbody>
                {([1, 2, 3, 4, 5, 6, 7, 8] as const).map((s) => {
                  const assignment = activeSteps[s];
                  const model = MODELS.find((m) => m.id === assignment.model);
                  return (
                    <tr key={s} className="border-b border-slate-800/50 last:border-0">
                      <td className="py-2 pr-4 text-slate-300">{STEP_LABELS[s]}</td>
                      <td className="py-2 pr-4 text-indigo-300 font-medium">
                        {model?.name ?? assignment.model}
                      </td>
                      <td className="py-2 pr-4 w-32">
                        <QualityBar value={model?.quality ?? 5} />
                      </td>
                      <td className="py-2">
                        {assignment.thinking ? (
                          <span className="text-purple-400 text-xs">✦ on</span>
                        ) : (
                          <span className="text-slate-600 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Confirm button */}
        <button
          onClick={handleConfirm}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 rounded-2xl transition-all text-lg flex items-center justify-center gap-3"
        >
          <span>🚀</span>
          Start Creating My Ebook
          <span className="text-sm font-normal text-indigo-200 ml-1">
            ({isCustom ? 'Custom' : selectedStrategy?.name})
          </span>
        </button>
      </div>
    </div>
  );
}
