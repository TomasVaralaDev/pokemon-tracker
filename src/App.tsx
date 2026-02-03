import { useState, useEffect, useRef } from 'react';
import type { PokemonBasic, UserCollection } from './types';
import { PokemonCard } from './PokemonCard';
import { PokemonModal } from './PokemonModal';
import { Toast } from './Toast';
import { StatsModal } from './StatsModal';

// --- FIREBASE IMPORTS ---
import { auth, googleProvider, db } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
// KORJAUS 1: Lisätty 'type' importtiin
import type { User } from 'firebase/auth'; 
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

const GENERATIONS = [
  { id: 0, name: 'All', start: 1, end: 1025 },
  { id: 1, name: 'Gen 1', start: 1, end: 151 },
  { id: 2, name: 'Gen 2', start: 152, end: 251 },
  { id: 3, name: 'Gen 3', start: 252, end: 386 },
  { id: 4, name: 'Gen 4', start: 387, end: 493 },
  { id: 5, name: 'Gen 5', start: 494, end: 649 },
  { id: 6, name: 'Gen 6', start: 650, end: 721 },
  { id: 7, name: 'Gen 7', start: 722, end: 809 },
  { id: 8, name: 'Gen 8', start: 810, end: 905 },
  { id: 9, name: 'Gen 9', start: 906, end: 1025 },
];

const ITEMS_PER_PAGE = 50;

type FilterMode = 'all' | 'caught' | 'missing' | 'shiny';
type SortOrder = 'id-asc' | 'id-desc' | 'name-asc' | 'name-desc';

function App() {
  const [pokemons, setPokemons] = useState<PokemonBasic[]>([]);
  const [selectedGen, setSelectedGen] = useState(GENERATIONS[0]);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('id-asc');
  
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  const [selectedPokemonId, setSelectedPokemonId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' } | null>(null);
  const [showStats, setShowStats] = useState(false);

  // --- USER STATE ---
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [collection, setCollection] = useState<UserCollection>(() => {
    const saved = localStorage.getItem('poke-collection');
    return saved ? JSON.parse(saved) : {};
  });

  const [loading, setLoading] = useState(true);

  // --- KORJAUS 2: SIIRRETTY TÄMÄ FUNKTIO YLÖS (ennen useEffectejä) ---
  const showToastMsg = (msg: string, type: 'success' | 'info' = 'success') => {
    setToast({ message: msg, type });
  };

  // --- 1. FIREBASE AUTH LISTENER ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      
      // Jos kirjaudutaan ULOS, palataan paikalliseen dataan
      if (!currentUser) {
        const saved = localStorage.getItem('poke-collection');
        setCollection(saved ? JSON.parse(saved) : {});
        showToastMsg('Logged out - Switched to local data', 'info');
      }
    });
    return () => unsubscribe();
  }, []);

  // --- 2. FIREBASE DATA SYNC (REALTIME) ---
  useEffect(() => {
    if (!user) return;

    const unsubFirestore = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.collection) {
           setCollection(data.collection);
        }
      } else {
        // Jos käyttäjällä ei ole dataa, tallennetaan nykyinen (local) data
        if (Object.keys(collection).length > 0) {
           setDoc(doc(db, 'users', user.uid), { collection }, { merge: true });
           showToastMsg('Local data synced to cloud!', 'success');
        }
      }
    }, (error) => {
      console.error("Firestore error:", error);
      showToastMsg('Error syncing data', 'info');
    });

    return () => unsubFirestore();
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps
  // (Poistettu collection dependency loopin estämiseksi)

  // --- 3. HELPER: SAVE DATA ---
  const saveCollection = async (newCollection: UserCollection) => {
    setCollection(newCollection); 

    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), { collection: newCollection }, { merge: true });
      } catch (e) {
        console.error("Save error:", e);
        showToastMsg('Error saving to cloud', 'info');
      }
    } else {
      localStorage.setItem('poke-collection', JSON.stringify(newCollection));
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      showToastMsg('Logged in successfully!');
    } catch (error) {
      console.error(error);
      showToastMsg('Login failed', 'info');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  // --- NORMAL EFFECTS ---
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' || (e.ctrlKey && e.key === 'k')) && !selectedPokemonId) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        if (selectedPokemonId) setSelectedPokemonId(null);
        else if (showStats) setShowStats(false);
        else if (searchTerm) setSearchTerm('');
      }
    };
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 300) {
        setVisibleCount(prev => prev + ITEMS_PER_PAGE);
      }
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [selectedPokemonId, showStats, searchTerm]);

  useEffect(() => {
    fetch('https://pokeapi.co/api/v2/pokemon?limit=1025')
      .then(res => res.json())
      .then(data => {
        const formatted = data.results.map((p: { name: string; url: string }, index: number) => ({
          name: p.name,
          url: p.url,
          id: index + 1
        }));
        setPokemons(formatted);
        setLoading(false);
      });
  }, []);

  const handleGenChange = (gen: typeof GENERATIONS[0]) => {
    setSelectedGen(gen);
    setFilterMode('all'); 
    setSortOrder('id-asc');
    setVisibleCount(ITEMS_PER_PAGE);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleCaught = (id: number) => {
    const isCaught = collection[id]?.caught;
    const newCol = { ...collection, [id]: { ...collection[id], caught: !isCaught } };
    
    saveCollection(newCol); 
    
    if (!isCaught) {
       const name = pokemons[id-1]?.name;
       showToastMsg(`Caught ${name || 'Pokemon'}!`);
    }
  };

  const toggleShiny = (id: number) => {
    const isShiny = collection[id]?.shiny;
    const newCol = { ...collection, [id]: { ...collection[id], shiny: !isShiny } };
    
    saveCollection(newCol); 

    if (!isShiny) showToastMsg(`Marked as Shiny!`, 'info');
  };

  const handleBulkAction = (action: 'catch' | 'release') => {
    if (action === 'release') {
      if (!window.confirm(`Clear all marks for ${searchTerm ? 'search' : selectedGen.name}?`)) return;
    }
    const newCol = { ...collection };
    filteredPokemons.forEach(p => { newCol[p.id] = { ...newCol[p.id], caught: action === 'catch' }; });
    
    saveCollection(newCol); 
    
    showToastMsg(action === 'catch' ? 'Marked all as caught!' : 'Cleared marks!', 'info');
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const handleExport = () => {
    const dataStr = JSON.stringify(collection, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pokedex-backup-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToastMsg('Backup downloaded!', 'info');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string);
        if (window.confirm("Overwrite current collection?")) {
          saveCollection(json); 
          showToastMsg('Collection loaded successfully!');
        }
      } catch { alert("Invalid file."); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filteredPokemons = (() => {
    const list = searchTerm 
      ? pokemons.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      : pokemons.filter(p => p.id >= selectedGen.start && p.id <= selectedGen.end);

    let filtered = list;
    if (filterMode === 'caught') filtered = list.filter(p => collection[p.id]?.caught);
    if (filterMode === 'missing') filtered = list.filter(p => !collection[p.id]?.caught);
    if (filterMode === 'shiny') filtered = list.filter(p => collection[p.id]?.shiny);

    return [...filtered].sort((a, b) => {
      if (sortOrder === 'id-desc') return b.id - a.id;
      if (sortOrder === 'name-asc') return a.name.localeCompare(b.name);
      if (sortOrder === 'name-desc') return b.name.localeCompare(a.name);
      return a.id - b.id;
    });
  })();

  const suggestions = searchTerm.length >= 2 
    ? pokemons.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 5) 
    : [];

  const visiblePokemons = filteredPokemons.slice(0, visibleCount);
  
  const totalCaughtCount = pokemons.filter(p => collection[p.id]?.caught).length;
  const totalShinyCount = pokemons.filter(p => collection[p.id]?.shiny).length;
  const baseListForStats = searchTerm 
    ? pokemons.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : pokemons.filter(p => p.id >= selectedGen.start && p.id <= selectedGen.end);
  const caughtInView = baseListForStats.filter(p => collection[p.id]?.caught).length;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors duration-300 p-4 md:p-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER: LOGIN & DARKMODE */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
           {/* LEFT: Stats & Login */}
           <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
              <button onClick={() => setShowStats(true)} className="p-2 px-3 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 font-bold text-sm flex items-center gap-2">
                 📊 <span className="hidden sm:inline">Stats</span>
              </button>

              {/* LOGIN BUTTON */}
              {!authLoading && (
                user ? (
                  <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-800">
                    <img src={user.photoURL || ''} alt="User" className="w-6 h-6 rounded-full" />
                    <span className="text-xs font-bold text-blue-800 dark:text-blue-300 hidden sm:inline">{user.displayName?.split(' ')[0]}</span>
                    <button onClick={handleLogout} className="text-xs text-red-500 hover:underline font-semibold ml-1">Log Out</button>
                  </div>
                ) : (
                  <button onClick={handleLogin} className="p-2 px-4 rounded-full bg-slate-800 dark:bg-white text-white dark:text-slate-900 font-bold text-sm hover:scale-105 transition-transform flex items-center gap-2 shadow-lg">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.761L12.545,10.239z"/></svg>
                    Sign In
                  </button>
                )
              )}
           </div>
          
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight text-center flex-1 order-first md:order-none">
            Pokémon Tracker
          </h1>
          
          {/* RIGHT: Dark Mode */}
          <div className="w-full md:w-auto flex justify-end">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-yellow-400 hover:scale-110 transition">
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {!loading && (
          <div className="max-w-2xl mx-auto mb-8 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
             <div className="flex justify-between items-end mb-2">
              <span className="font-bold text-slate-700 dark:text-slate-200">National Dex</span>
              <span className="text-slate-500 dark:text-slate-400 font-mono">
                {totalCaughtCount} / {pokemons.length} <span className="text-green-600 dark:text-green-400 font-bold">({pokemons.length > 0 ? Math.round((totalCaughtCount/pokemons.length)*100) : 0}%)</span>
              </span>
            </div>
            <div className="h-6 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden border border-slate-200 dark:border-slate-600 relative">
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-700" style={{ width: `${(totalCaughtCount / pokemons.length) * 100}%` }} />
            </div>
          </div>
        )}

        <div className="max-w-md mx-auto mb-4 relative" ref={searchContainerRef}>
          <input 
            ref={searchInputRef}
            type="text" placeholder="Search (Press '/')" 
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-blue-500 outline-none shadow-sm"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">✖</button>}
          
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl z-50 overflow-hidden">
              {suggestions.map(p => (
                <div key={p.id} onClick={() => { setSearchTerm(p.name); setShowSuggestions(false); }} className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer flex items-center gap-3 border-b border-slate-50 dark:border-slate-700">
                  <img src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${p.id}.png`} alt="" className="w-8 h-8" />
                  <span className="capitalize text-slate-700 dark:text-slate-200">{p.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-6">
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as SortOrder)} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white py-2 px-4 rounded-lg font-bold shadow-sm cursor-pointer">
             <option value="id-asc">Lowest #</option>
             <option value="id-desc">Highest #</option>
             <option value="name-asc">A-Z</option>
             <option value="name-desc">Z-A</option>
          </select>
          <div className="flex gap-2 flex-wrap justify-center">
            {(['all', 'caught', 'missing', 'shiny'] as FilterMode[]).map(mode => (
              <button key={mode} onClick={() => setFilterMode(mode)} className={`px-4 py-2 rounded-lg text-sm font-bold capitalize border ${filterMode === mode ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-100' : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'}`}>
                {mode}
              </button>
            ))}
          </div>
        </div>

        {!searchTerm && (
          <div className="flex flex-wrap justify-center gap-2 mb-6 sticky top-2 z-20 bg-slate-100/95 dark:bg-slate-900/95 p-3 rounded-xl backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-sm">
            {GENERATIONS.map(gen => (
              <button key={gen.id} onClick={() => handleGenChange(gen)} className={`px-4 py-1.5 rounded-full text-sm font-bold ${selectedGen.id === gen.id ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-900 shadow-md' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600'}`}>
                {gen.name}
              </button>
            ))}
          </div>
        )}

        {!loading && (
           <div className="mb-8 text-center">
             <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
               {searchTerm ? `Found: "${searchTerm}"` : `${selectedGen.name} Progress`}
             </span>
             <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full max-w-xs mx-auto mt-2 mb-4 overflow-hidden">
               <div className="bg-green-500 h-full transition-all duration-500" style={{ width: baseListForStats.length > 0 ? `${(caughtInView / baseListForStats.length) * 100}%` : '0%' }} />
             </div>
             <div className="flex justify-center gap-4 text-sm">
                <button onClick={() => handleBulkAction('catch')} className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">Mark All Found</button>
                <span className="text-slate-300">|</span>
                <button onClick={() => handleBulkAction('release')} className="text-red-500 dark:text-red-400 hover:underline font-semibold">Clear All</button>
             </div>
             <p className="text-xs text-slate-400 mt-2">{caughtInView} / {baseListForStats.length}</p>
           </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 pb-20">
            {visiblePokemons.map(poke => (
              <PokemonCard
                key={poke.id}
                pokemon={poke}
                isCaught={!!collection[poke.id]?.caught}
                isShiny={!!collection[poke.id]?.shiny}
                onToggle={() => toggleCaught(poke.id)}
                onToggleShiny={() => toggleShiny(poke.id)}
                onOpenDetails={() => setSelectedPokemonId(poke.id)}
              />
            ))}
             {visiblePokemons.length === 0 && <div className="col-span-full text-center py-10 text-slate-400">No Pokémon found</div>}
          </div>
        )}
        
        {!loading && visibleCount < filteredPokemons.length && <div className="text-center py-8 text-slate-400 animate-pulse">Scroll for more...</div>}

        <PokemonModal pokemonId={selectedPokemonId} onClose={() => setSelectedPokemonId(null)} key={selectedPokemonId} />
        {showStats && <StatsModal totalPokemon={pokemons.length} totalCaught={totalCaughtCount} totalShiny={totalShinyCount} generations={GENERATIONS} collection={collection} onClose={() => setShowStats(false)} />}

        {showScrollTop && (
          <button onClick={scrollToTop} className="fixed bottom-20 right-6 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 z-40 transition-all animate-bounce">
            ⬆️
          </button>
        )}

        <div className="fixed bottom-0 left-0 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur border-t border-slate-200 dark:border-slate-800 p-3 flex justify-center gap-4 text-sm z-30">
           <button onClick={handleExport} className="text-slate-600 dark:text-slate-400 hover:text-blue-600 font-semibold">Export Data</button>
           <span>|</span>
           <button onClick={() => fileInputRef.current?.click()} className="text-slate-600 dark:text-slate-400 hover:text-blue-600 font-semibold">Import Data</button>
           <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" style={{ display: 'none' }} />
        </div>
      </div>
    </div>
  );
}

export default App;