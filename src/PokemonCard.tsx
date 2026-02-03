import { useState, useEffect } from 'react';
import type { PokemonBasic } from './types';

interface PokemonCardProps {
  pokemon: PokemonBasic;
  isCaught: boolean;
  isShiny: boolean;
  onToggle: () => void;
  onToggleShiny: () => void;
  onOpenDetails: () => void;
}

const TYPE_COLORS: Record<string, string> = {
  normal: 'bg-neutral-400', fire: 'bg-red-500', water: 'bg-blue-500',
  electric: 'bg-yellow-400', grass: 'bg-green-500', ice: 'bg-cyan-300',
  fighting: 'bg-red-700', poison: 'bg-purple-500', ground: 'bg-amber-600',
  flying: 'bg-indigo-400', psychic: 'bg-pink-500', bug: 'bg-lime-500',
  rock: 'bg-yellow-700', ghost: 'bg-purple-800', dragon: 'bg-indigo-700',
  steel: 'bg-zinc-400', fairy: 'bg-pink-300',
};

export function PokemonCard({ 
  pokemon, isCaught, isShiny, onToggle, onToggleShiny, onOpenDetails 
}: PokemonCardProps) {
  const [types, setTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const imageUrl = isShiny 
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${pokemon.id}.png`
    : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;

  useEffect(() => {
    fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}`)
      .then((res) => res.json())
      .then((data) => {
        // TÄMÄ OLI AIEMMIN (t: any) -> NYT KORJATTU
        const typeNames = data.types.map((t: { type: { name: string } }) => t.type.name);
        setTypes(typeNames);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [pokemon.id]);

  return (
    <div
      onClick={onOpenDetails}
      className={`
        relative cursor-pointer p-3 rounded-xl border-2 transition-all duration-300 transform hover:scale-105
        flex flex-col items-center justify-between shadow-sm group min-h-[160px]
        dark:bg-slate-800 dark:border-slate-700
        ${isCaught 
          ? 'bg-white border-blue-500 dark:border-blue-500 opacity-100 ring-2 ring-blue-100 dark:ring-blue-900' 
          : 'bg-white border-transparent opacity-60 grayscale hover:opacity-100 hover:grayscale-0'
        }
      `}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onToggleShiny(); }}
        className={`absolute top-2 left-2 p-1 rounded-full transition-colors z-20 
          ${isShiny ? 'text-yellow-400 hover:text-yellow-500' : 'text-gray-300 hover:text-yellow-400 dark:text-slate-600'}
        `}
        title="Toggle Shiny"
      >
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </button>

      <button
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center border transition-colors z-20
          ${isCaught 
            ? 'bg-blue-500 border-blue-600' 
            : 'bg-gray-100 border-gray-300 hover:bg-gray-200 dark:bg-slate-700 dark:border-slate-600 dark:hover:bg-slate-600'}
        `}
      >
        {isCaught && (
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <img
        src={imageUrl}
        alt={pokemon.name}
        className="w-20 h-20 md:w-24 md:h-24 object-contain z-10 transition-transform group-hover:scale-110 mb-2"
        loading="lazy"
      />

      <div className="text-center w-full">
        <span className="font-bold text-slate-700 dark:text-slate-200 capitalize text-sm block leading-tight">
          {pokemon.name}
        </span>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono block mb-2">
          #{String(pokemon.id).padStart(4, '0')}
        </span>

        <div className="flex justify-center gap-1 flex-wrap">
          {loading ? (
            <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          ) : (
            types.map((type) => (
              <span
                key={type}
                className={`${TYPE_COLORS[type] || 'bg-gray-400'} text-white text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider shadow-sm border border-black/5`}
              >
                {type}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}