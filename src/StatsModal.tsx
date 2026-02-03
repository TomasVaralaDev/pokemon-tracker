// Käytetään 'import type', jotta käännösvaiheessa tämä poistetaan (optimointi)
import type { UserCollection } from './types';

// Määrittelee mitä tietoja tämä modaali tarvitsee toimiakseen
interface StatsModalProps {
  totalPokemon: number;
  totalCaught: number;
  totalShiny: number;
  generations: { id: number; name: string; start: number; end: number }[];
  collection: UserCollection; // Käyttäjän keräämät tiedot (mitkä on napattu)
  onClose: () => void;        // Funktio modaalin sulkemiseen
}

export function StatsModal({ totalPokemon, totalCaught, totalShiny, generations, collection, onClose }: StatsModalProps) {
  return (
    // --- TAUSTA (Backdrop) ---
    // Tummennettu tausta, joka peittää koko ruudun. Klikkaus sulkee modaalin.
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      
      {/* --- MODAALI-IKKUNA --- */}
      {/* stopPropagation estää modaalin sulkeutumisen, jos klikataan sen sisälle */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative" onClick={e => e.stopPropagation()}>
        
        {/* Sulkemisnappi (X) oikeassa yläkulmassa */}
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <h2 className="text-3xl font-bold mb-6 text-slate-800 dark:text-white text-center">Collection Stats</h2>

        {/* --- YLÄOSA: YHTEENVETO (Grid) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Kortti 1: Yhteensä napattu */}
          <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl text-center border border-blue-100 dark:border-blue-800">
            <span className="block text-3xl font-bold text-blue-600 dark:text-blue-400">{totalCaught}</span>
            <span className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase">Total Caught</span>
          </div>
          
          {/* Kortti 2: Yhteensä Shinyja */}
          <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-xl text-center border border-yellow-100 dark:border-yellow-800">
            <span className="block text-3xl font-bold text-yellow-600 dark:text-yellow-400">{totalShiny}</span>
            <span className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase">Total Shinies</span>
          </div>
          
          {/* Kortti 3: Kokonaisprosentti */}
          <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-xl text-center border border-green-100 dark:border-green-800">
            <span className="block text-3xl font-bold text-green-600 dark:text-green-400">
              {/* Lasketaan prosentti ja varmistetaan ettei jaeta nollalla */}
              {totalPokemon > 0 ? Math.round((totalCaught / totalPokemon) * 100) : 0}%
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase">Completion</span>
          </div>
        </div>

        {/* --- ALAOSA: GENERAATIOT --- */}
        <h3 className="text-xl font-bold mb-4 text-slate-700 dark:text-slate-200">Progress by Generation</h3>
        <div className="space-y-4">
          {/* Suodatetaan pois "All" (id 0) ja käydään läpi jokainen Gen (1-9) */}
          {generations.filter(g => g.id !== 0).map(gen => {
            
            // --- LOGIIKKA: Lasketaan yksittäisen generaation tilanne lennosta ---
            let genTotal = 0;
            let genCaught = 0;
            // Käydään läpi ID:t generaation alusta loppuun (esim. 1-151)
            for (let i = gen.start; i <= gen.end; i++) {
              genTotal++;
              // Tarkistetaan onko käyttäjällä tämä ID tallessa
              if (collection[i]?.caught) genCaught++;
            }
            const percent = genTotal > 0 ? Math.round((genCaught / genTotal) * 100) : 0;

            // --- UI: Yksi rivi per generaatio ---
            return (
              <div key={gen.id} className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg flex items-center gap-4">
                {/* Nimi (Gen 1) */}
                <span className="w-16 font-bold text-slate-600 dark:text-slate-300">{gen.name}</span>
                
                {/* Palkki (Progress Bar) */}
                <div className="flex-1 h-3 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${percent}%` }} />
                </div>
                
                {/* Teksti (50/151 (33%)) */}
                <span className="text-sm font-mono text-slate-500 dark:text-slate-400 w-24 text-right">
                  {genCaught}/{genTotal} ({percent}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}