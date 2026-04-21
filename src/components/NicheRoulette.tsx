'use client';

import { useState, useRef } from 'react';
import { CATEGORIES, getWeightedRandomNiche, generateSpinSequence, Niche } from '@/lib/niches';

interface NicheRouletteProps {
  onSelectNiche: (nicheName: string, hook: string) => void;
}

export default function NicheRoulette({ onSelectNiche }: NicheRouletteProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [sequence, setSequence] = useState<Niche[]>([]);
  const [winner, setWinner] = useState<Niche | null>(null);
  const [showResult, setShowResult] = useState(false);
  const slotRef = useRef<HTMLDivElement>(null);

  const itemHeight = 64;

  const spin = () => {
    if (isSpinning) return;

    setShowResult(false);
    setIsSpinning(true);

    const newWinner = getWeightedRandomNiche();
    const newSequence = generateSpinSequence(newWinner, 50);
    setWinner(newWinner);
    setSequence(newSequence);

    if (slotRef.current) {
      slotRef.current.style.transition = 'none';
      slotRef.current.style.transform = `translateY(0px)`;
    }

    setTimeout(() => {
      if (slotRef.current) {
        const targetIndex = newSequence.length - 2;
        const targetY = -(targetIndex * itemHeight);

        slotRef.current.style.transition = 'transform 4s cubic-bezier(0.15, 0.9, 0.25, 1)';
        slotRef.current.style.transform = `translateY(${targetY}px)`;

        setTimeout(() => {
          setIsSpinning(false);
          setShowResult(true);
        }, 4000);
      }
    }, 50);
  };

  const handleUseNiche = () => {
    if (winner) {
      onSelectNiche(winner.name, winner.hook);
    }
  };

  return (
    <div className="bg-eb-surface border border-eb-border rounded-[14px] p-5 mb-4 overflow-hidden relative">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-eb-text font-semibold text-[0.85rem] flex items-center gap-2">
            Ruleta de Nichos Rentables
          </h3>
          <p className="text-eb-muted text-xs mt-1">
            100 nichos probados para España y Latam, ponderados por % de éxito.
          </p>
        </div>
        <button
          onClick={spin}
          disabled={isSpinning}
          className="bg-eb-surface-3 hover:bg-eb-border-2 disabled:opacity-50 text-eb-text font-medium px-4 py-2 rounded-[10px] transition-all border border-eb-border-2 text-sm whitespace-nowrap"
        >
          {isSpinning ? 'Girando...' : (winner ? 'Girar de nuevo' : 'Girar Ruleta')}
        </button>
      </div>

      {/* Slot Machine Window */}
      <div className="relative h-[64px] bg-eb-bg rounded-xl border-t-2 border-b-2 border-eb-border overflow-hidden shadow-inner">
        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-eb-bg to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-eb-bg to-transparent z-10 pointer-events-none" />

        <div className="absolute top-1/2 left-0 right-0 h-px bg-eb-gold/30 z-10 pointer-events-none" />

        {sequence.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-eb-muted text-sm">
            Pulsa el botón para buscar un nicho hiper-rentable
          </div>
        ) : (
          <div ref={slotRef} className="will-change-transform w-full">
            {sequence.map((niche, i) => {
              const cat = CATEGORIES[niche.category];
              return (
                <div
                  key={`${niche.id}-${i}`}
                  className="h-[64px] flex flex-col items-center justify-center text-center px-4 border-b border-eb-bg/50"
                >
                  <p className="font-semibold text-eb-text truncate w-full flex items-center justify-center gap-2">
                    <span className="opacity-70">{cat.emoji}</span> {niche.name}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Result Card */}
      {showResult && winner && (
        <div className="mt-4 animate-fade-in bg-eb-surface-2 rounded-xl p-4 border border-eb-border">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{CATEGORIES[winner.category].emoji}</span>
            <span className="text-xs font-semibold px-2 py-1 rounded bg-eb-surface-3 text-eb-text border border-eb-border">
              {CATEGORIES[winner.category].name}
            </span>
          </div>

          <div className="space-y-3 mt-3">
            <div>
              <p className="text-xs text-eb-muted uppercase tracking-wider font-semibold mb-1">Público Objetivo</p>
              <p className="text-sm text-eb-text">{winner.target}</p>
            </div>
            <div>
              <p className="text-xs text-eb-muted uppercase tracking-wider font-semibold mb-1">Gancho (Hook)</p>
              <p className="text-sm text-eb-blue-lt italic">&quot;{winner.hook}&quot;</p>
            </div>
          </div>

          <button
            onClick={handleUseNiche}
            className="w-full mt-4 bg-eb-green hover:brightness-110 text-white text-sm font-semibold py-2.5 rounded-lg transition-all"
          >
            Usar este nicho
          </button>
        </div>
      )}
    </div>
  );
}
