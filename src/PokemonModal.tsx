import { useState, useEffect } from 'react';

interface ModalProps {
  pokemonId: number | null;
  onClose: () => void;
}

interface PokemonDetails {
  name: string;
  height: number;
  weight: number;
  types: { type: { name: string; url: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
}

interface EvolutionNode {
  species_name: string;
  min_level: number | null;
  trigger_name: string | null;
  item: string | null;
  evolves_to: EvolutionNode[];
  species_url: string;
}

interface RawEvolutionLink {
  species: { name: string; url: string };
  evolution_details: {
    min_level: number | null;
    trigger: { name: string } | null;
    item: { name: string } | null;
  }[];
  evolves_to: RawEvolutionLink[];
}

// UUSI: Rajapinta tyyppidatalle (poistaa 'any'-virheen laskennasta)
interface TypeData {
  damage_relations: {
    double_damage_from: { name: string }[];
    half_damage_from: { name: string }[];
    no_damage_from: { name: string }[];
  };
}

interface PokemonSpecies {
  flavor_text_entries: {
    flavor_text: string;
    language: { name: string };
  }[];
  pokedex_numbers: {
    entry_number: number;
    pokedex: { name: string };
  }[];
  generation: { name: string };
  evolution_chain: { url: string };
}

const cleanName = (name: string) => {
  return name.replace('extended-', '').replace('original-', '').replace('-', ' ');
};

const getIdFromUrl = (url: string) => url.split('/').filter(Boolean).pop();

// --- STATS CONFIG ---
const STAT_COLORS: Record<string, string> = {
  hp: 'bg-green-500',
  attack: 'bg-red-500',
  defense: 'bg-blue-500',
  'special-attack': 'bg-pink-500',
  'special-defense': 'bg-purple-500',
  speed: 'bg-cyan-500',
};

const STAT_NAMES: Record<string, string> = {
  hp: 'HP',
  attack: 'ATK',
  defense: 'DEF',
  'special-attack': 'SpA',
  'special-defense': 'SpD',
  speed: 'SPD',
};

function EvoChain({ chain }: { chain: EvolutionNode }) {
  const id = getIdFromUrl(chain.species_url);
  
  return (
    <div className="flex flex-row items-center gap-2 md:gap-4">
       <div className="flex flex-col items-center min-w-[80px]">
        <img 
          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`} 
          alt={chain.species_name}
          className="w-16 h-16 object-contain"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        /> 
         <span className="capitalize font-bold text-sm text-slate-700 dark:text-slate-200 text-center leading-tight">
           {chain.species_name}
         </span>
       </div>
       
       {chain.evolves_to.length > 0 && (
         <div className="flex flex-col gap-2"> 
           {chain.evolves_to.map((next, i) => (
             <div key={i} className="flex flex-row items-center">
               <div className="flex flex-col items-center px-1 md:px-2">
                 <span className="text-slate-400 text-lg dark:text-slate-500">→</span>
                 <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono text-center leading-none max-w-[60px]">
                   {next.min_level ? `Lvl ${next.min_level}` : next.item ? 'Item' : next.trigger_name ? cleanName(next.trigger_name) : ''}
                 </span>
               </div>
               <EvoChain chain={next} />
             </div>
           ))}
         </div>
       )}
    </div>
  );
}

export function PokemonModal({ pokemonId, onClose }: ModalProps) {
  const [details, setDetails] = useState<PokemonDetails | null>(null);
  const [species, setSpecies] = useState<PokemonSpecies | null>(null);
  const [evoChain, setEvoChain] = useState<EvolutionNode | null>(null);
  const [weaknesses, setWeaknesses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const TYPE_COLORS: Record<string, string> = {
    normal: 'bg-neutral-400', fire: 'bg-red-500', water: 'bg-blue-500',
    electric: 'bg-yellow-400', grass: 'bg-green-500', ice: 'bg-cyan-300',
    fighting: 'bg-red-700', poison: 'bg-purple-500', ground: 'bg-amber-600',
    flying: 'bg-indigo-400', psychic: 'bg-pink-500', bug: 'bg-lime-500',
    rock: 'bg-yellow-700', ghost: 'bg-purple-800', dragon: 'bg-indigo-700',
    steel: 'bg-zinc-400', fairy: 'bg-pink-300',
  };

  useEffect(() => {
    if (!pokemonId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Basic Data
        const basicRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        const basicData = await basicRes.json();
        setDetails(basicData);

        // 2. Type Weakness Calculation
        // KORJAUS 1: Määritellään 't'
        const typePromises = basicData.types.map((t: { type: { url: string } }) => fetch(t.type.url).then(res => res.json()));
        const typeDatas = await Promise.all(typePromises);

        // Lasketaan kertoimet kaikille 18 tyypille
        const damageRelations: Record<string, number> = {};
        
        // KORJAUS 2: Käytetään TypeData-rajapintaa 'any':n sijaan
        typeDatas.forEach((typeData: TypeData) => {
           typeData.damage_relations.double_damage_from.forEach((t) => {
             damageRelations[t.name] = (damageRelations[t.name] || 1) * 2;
           });
           typeData.damage_relations.half_damage_from.forEach((t) => {
             damageRelations[t.name] = (damageRelations[t.name] || 1) * 0.5;
           });
           typeData.damage_relations.no_damage_from.forEach((t) => {
             damageRelations[t.name] = (damageRelations[t.name] || 1) * 0;
           });
        });

        const weakList = Object.keys(damageRelations).filter(type => (damageRelations[type] || 0) > 1);
        setWeaknesses(weakList);

        // 3. Species Data
        const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`);
        const speciesData = await speciesRes.json();
        setSpecies(speciesData);

        // 4. Evolution Chain
        if (speciesData.evolution_chain?.url) {
            const evoRes = await fetch(speciesData.evolution_chain.url);
            const evoData = await evoRes.json();
            
            const parseChain = (chain: RawEvolutionLink): EvolutionNode => ({
                species_name: chain.species.name,
                species_url: chain.species.url,
                min_level: chain.evolution_details[0]?.min_level || null,
                trigger_name: chain.evolution_details[0]?.trigger?.name || null,
                item: chain.evolution_details[0]?.item?.name || null,
                evolves_to: chain.evolves_to.map(parseChain)
            });
            
            setEvoChain(parseChain(evoData.chain));
        } else {
            setEvoChain(null);
        }

        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, [pokemonId]);

  if (!pokemonId) return null;

  const description = species?.flavor_text_entries.find(
    (entry) => entry.language.name === 'en'
  )?.flavor_text.replace(/\f/g, ' ');

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-slate-700 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 transition z-10"
        >
          <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
          </div>
        ) : details && species ? (
          <div className="p-6">
            <div className="text-center mb-6 border-b dark:border-slate-700 pb-6 border-gray-100">
              <img 
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`} 
                alt={details.name}
                className="w-48 h-48 mx-auto mb-4 drop-shadow-md"
              />
              <h2 className="text-3xl font-bold capitalize text-slate-800 dark:text-white">{details.name}</h2>
              <p className="text-slate-400 font-mono text-sm">#{String(pokemonId).padStart(4, '0')}</p>
              
              <div className="flex justify-center gap-2 mt-3">
                {details.types.map((t: { type: { name: string } }) => (
                   <span 
                    key={t.type.name}
                    className={`${TYPE_COLORS[t.type.name] || 'bg-gray-400'} text-white px-3 py-1 rounded-full text-sm font-bold uppercase`}
                   >
                     {t.type.name}
                   </span>
                ))}
              </div>

              <p className="mt-4 text-slate-600 dark:text-slate-300 italic leading-relaxed">
                "{description || 'No description available.'}"
              </p>
            </div>

            {/* BASE STATS */}
            <div className="mb-6">
              <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-3 text-sm uppercase tracking-wide">Base Stats</h3>
              <div className="space-y-2">
                {details.stats.map(stat => (
                  <div key={stat.stat.name} className="flex items-center gap-3 text-xs md:text-sm">
                    <span className="w-10 font-bold text-slate-500 dark:text-slate-400 uppercase text-right">
                      {STAT_NAMES[stat.stat.name]}
                    </span>
                    <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${STAT_COLORS[stat.stat.name] || 'bg-slate-500'}`} 
                        style={{ width: `${Math.min((stat.base_stat / 255) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="w-8 font-bold text-slate-700 dark:text-slate-200 text-left">
                      {stat.base_stat}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* WEAKNESSES */}
            {weaknesses.length > 0 && (
               <div className="mb-6">
                 <h3 className="font-bold text-slate-700 dark:text-slate-200 mb-3 text-sm uppercase tracking-wide">Weak Against</h3>
                 <div className="flex flex-wrap gap-2">
                   {weaknesses.map(type => (
                     <span 
                       key={type}
                       className={`${TYPE_COLORS[type] || 'bg-gray-400'} text-white px-3 py-1 rounded-full text-xs font-bold uppercase`}
                     >
                       {type}
                     </span>
                   ))}
                 </div>
               </div>
            )}

            {/* EVOLUTION CHAIN */}
            {evoChain && (
                <div className="mb-6 bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl">
                    <h3 className="text-center font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase text-xs tracking-wider">Evolution Chain</h3>
                    <div className="flex justify-center overflow-x-auto pb-2">
                       <EvoChain chain={evoChain} />
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
               <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-xl text-center">
                 <span className="block text-xs text-slate-400 dark:text-slate-400 uppercase font-bold">Height</span>
                 <span className="text-lg font-semibold text-slate-700 dark:text-white">{details.height / 10} m</span>
               </div>
               <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-xl text-center">
                 <span className="block text-xs text-slate-400 dark:text-slate-400 uppercase font-bold">Weight</span>
                 <span className="text-lg font-semibold text-slate-700 dark:text-white">{details.weight / 10} kg</span>
               </div>
               <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded-xl text-center col-span-2">
                 <span className="block text-xs text-slate-400 dark:text-slate-400 uppercase font-bold">Generation</span>
                 <span className="text-lg font-semibold text-slate-700 dark:text-white capitalize">
                   {species.generation.name.replace('generation-', 'Gen ')}
                 </span>
               </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/30 p-5 rounded-xl border border-blue-100 dark:border-blue-800">
              <h3 className="font-bold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2 text-sm uppercase tracking-wide">
                Appears in Regional Dexes:
              </h3>
              <div className="flex flex-wrap gap-2">
                {species.pokedex_numbers.map((entry, i) => (
                   entry.pokedex.name !== 'national' && (
                    <span 
                      key={i} 
                      className="px-3 py-1 bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-700 text-xs rounded-full capitalize font-semibold shadow-sm"
                    >
                      {cleanName(entry.pokedex.name)}
                    </span>
                   )
                ))}
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <a 
                href={`https://bulbapedia.bulbagarden.net/wiki/${details.name}_(Pok%C3%A9mon)`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline text-sm font-medium"
              >
                Full details on Bulbapedia &rarr;
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}