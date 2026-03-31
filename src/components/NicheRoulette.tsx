'use client';

import { useState, useRef, useEffect } from 'react';
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

  // Height of a single slot item (to calculate scroll position)
  const itemHeight = 64; 

  const spin = () => {
    if (isSpinning) return;
    
    setShowResult(false);
    setIsSpinning(true);
    
    // Pick winner and generate sequence
    const newWinner = getWeightedRandomNiche();
    const newSequence = generateSpinSequence(newWinner, 50); // 50 items for a long spin
    setWinner(newWinner);
    setSequence(newSequence);
    
    // Reset scroll position immediately
    if (slotRef.current) {
      slotRef.current.style.transition = 'none';
      slotRef.current.style.transform = `translateY(0px)`;
    }

    // Trigger animation in next frame
    setTimeout(() => {
      if (slotRef.current) {
        // Calculate the target scroll position.
        // We want the winner to be centered. The winner is the second-to-last item.
        const targetIndex = newSequence.length - 2;
        const targetY = -(targetIndex * itemHeight);
        
        // Use a cubic-bezier for a slot-machine-like easing (starts fast, slows down)
        slotRef.current.style.transition = 'transform 4s cubic-bezier(0.15, 0.9, 0.25, 1)';
        slotRef.current.style.transform = `translateY(${targetY}px)`;
        
        // Wait for animation to finish
        setTimeout(() => {
          setIsSpinning(false);
          setShowResult(true);
        }, 4000); // matches the CSS transition duration
      }
    }, 50);
  };

  const handleUseNiche = () => {
    if (winner) {
      onSelectNiche(winner.name, winner.hook);
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-700/50 rounded-2xl p-5 mb-6 overflow-hidden relative">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-semibold flex items-center gap-2">
            🎰 Ruleta de Nichos Rentables
          </h3>
          <p className="text-slate-400 text-xs mt-1">
            100 nichos probados para España y Latam, ponderados por % de éxito.
          </p>
        </div>
        <button
          onClick={spin}
          disabled={isSpinning}
          className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-medium px-4 py-2 rounded-xl transition-all border border-slate-600/50 text-sm whitespace-nowrap"
        >
          {isSpinning ? 'Girando...' : (winner ? 'Girar de nuevo' : 'Girar Ruleta')}
        </button>
      </div>

      {/* Slot Machine Window */}
      <div className="relative h-[64px] bg-slate-950 rounded-xl border-t-2 border-b-2 border-slate-800 overflow-hidden shadow-inner">
        {/* Gradient overlays to create depth */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-slate-950 to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-slate-950 to-transparent z-10 pointer-events-none" />
        
        {/* Center highlight line */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-indigo-500/30 z-10 pointer-events-none" />
        
        {sequence.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm">
            Pulsa el botón para buscar un nicho hiper-rentable
          </div>
        ) : (
          <div ref={slotRef} className="will-change-transform w-full">
            {sequence.map((niche, i) => {
              const cat = CATEGORIES[niche.category];
              return (
                <div 
                  key={`${niche.id}-${i}`} 
                  className="h-[64px] flex flex-col items-center justify-center text-center px-4 border-b border-slate-900/50"
                >
                  <p className="font-semibold text-white truncate w-full flex items-center justify-center gap-2">
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
        <div className="mt-4 animate-fade-in bg-slate-800/40 rounded-xl p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{CATEGORIES[winner.category].emoji}</span>
            <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-900 text-slate-300 border border-slate-700">
              {CATEGORIES[winner.category].name}
            </span>
          </div>
          
          <div className="space-y-3 mt-3">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Público Objetivo</p>
              <p className="text-sm text-slate-300">{winner.target}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Gancho (Hook)</p>
              <p className="text-sm text-indigo-300 italic">"{winner.hook}"</p>
            </div>
          </div>
          
          <button
            onClick={handleUseNiche}
            className="w-full mt-4 bg-gradient-to-r from-emerald-600/90 to-teal-600/90 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold py-2.5 rounded-lg transition-all"
          >
            ✓ Usar este nicho
          </button>
        </div>
      )}
    </div>
  );
}
