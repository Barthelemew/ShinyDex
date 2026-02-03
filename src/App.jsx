import React, { useState, useEffect, useMemo, useRef } from 'react';
import Fuse from 'fuse.js';
import confetti from 'canvas-confetti';
import { useQueryClient } from '@tanstack/react-query';
import { Search, Zap, LogOut, User, LayoutGrid, List, SquareStack, BarChart3, Users, Trophy, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PokemonDetailModal from './features/collection/components/PokemonDetailModal';
import staticData from './features/collection/data/pokemon_data.json';
import { useAuth } from './features/auth/useAuth';
import AuthForm from './features/auth/AuthForm';
import { useUserStore } from './store/userStore';
import { useUIStore } from './store/uiStore';
import ProfileSettings from './features/profile/ProfileSettings';
import { useCollection } from './features/collection/hooks/useCollection';
import { useTeam } from './features/collaboration/hooks/useTeam';
import { useTeamCollection } from './features/collaboration/hooks/useTeamCollection';
import PokemonCard from './features/collection/components/PokemonCard';
import ImportExportActions from './features/collection/components/ImportExportActions';
import SyncStatus from './components/SyncStatus';
import Toast from './components/Toast';
import { useHuntingStore } from './store/huntingStore';
import HuntingConfig from './features/hunting/components/HuntingConfig';
import HuntingSession from './features/hunting/components/HuntingSession';
import TeamManager from './features/collaboration/components/TeamManager';
import StatsDashboard from './features/stats/components/StatsDashboard';
import AchievementsGallery from './features/achievements/components/AchievementsGallery';
import { realtimeService } from './features/collaboration/services/realtimeService';

function App() {
  const { user, loading: authLoading, session: authSession } = useAuth();
  const queryClient = useQueryClient();
  const { viewMode, toggleViewMode, selectionMode, setSelectionMode, selectedIds, toggleIdSelection, clearSelection } = useUIStore();
  const { fetchProfile } = useUserStore();
  const { sessions, startSession, stopSession, getActiveSession } = useHuntingStore();
  
  const [view, setView] = useState('dex');
  const [dexMode, setDexMode] = useState('personal');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPokemonId, setSelectedPokemonId] = useState(null);
  const [toast, setToast] = useState(null);
  const [isOffline] = useState(!navigator.onLine);
  const [displayLimit, setDisplayLimit] = useState(100);
  const [showAuth, setShowAuth] = useState(false);
  const [isConfiguringNewHunt, setIsConfiguringNewHunt] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const { collection: dbCollection, upsertPokemon, deletePokemon, importCollection, isSyncing } = useCollection(user?.id);
  const { team } = useTeam(user?.id);
  const { teamCollection } = useTeamCollection(team?.id);

  useEffect(() => {
    if (authSession) queryClient.setQueryData(['auth-session'], authSession);
  }, [authSession, queryClient]);

  useEffect(() => {
    if (user) fetchProfile(user.id);
  }, [user, fetchProfile]);

  useEffect(() => {
    const handleScroll = () => {
      // Infinite scroll
      if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 200) {
        setDisplayLimit(prev => prev + 100);
      }
      // Show/Hide Scroll to top
      setShowScrollTop(window.scrollY > 1000);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!user || !team) return;
    const channel = realtimeService.subscribeToTeam(team.id, (event, payload) => {
      if (event === 'shared_hunt_started') {
        const active = getActiveSession();
        if (active || payload.trainerId === user.id) return;
        setToast({
          message: `${payload.trainerName} lance une session !`,
          type: 'info',
          duration: 8000,
          onAction: () => {
            startSession({ ...payload, isGroupHunt: true, teamId: team.id });
            setView('hunting');
          }
        });
      }
      if (event === 'shiny_found') {
        if (payload.userId === user.id) return;
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        setToast({ message: `INCROYABLE ! ${payload.trainerName} a trouvé ${payload.pokemonName} !`, type: 'success' });
      }
    });
    return () => { channel.unsubscribe(); };
  }, [user, team, startSession, getActiveSession]);

  useEffect(() => {
    const handleNav = () => setView('dex');
    window.addEventListener('nav-to-dex', handleNav);
    return () => window.removeEventListener('nav-to-dex', handleNav);
  }, []);

  const fullCollection = useMemo(() => {
    const activeDbCollection = dexMode === 'personal' ? dbCollection : teamCollection;
    return staticData.map(p => {
      const entries = activeDbCollection.filter(d => d.pokemon_id === p.id);
      const isCaptured = entries.length > 0;
      
      // Déterminer la génération
      const n = parseInt(p.pokedexId || p.id);
      let gen = 9;
      if (n <= 151) gen = 1;
      else if (n <= 251) gen = 2;
      else if (n <= 386) gen = 3;
      else if (n <= 493) gen = 4;
      else if (n <= 649) gen = 5;
      else if (n <= 721) gen = 6;
      else if (n <= 809) gen = 7;
      else if (n <= 905) gen = 8;

      return { 
        ...p, 
        gen,
        captured: isCaptured,
        totalCount: entries.length,
        entries: entries,
        details: isCaptured ? {
          encounters: entries.reduce((sum, e) => sum + (e.count || 0), 0),
          version: entries[0].game_id,
          origin: entries[0].method_id
        } : null
      };
    });
  }, [dbCollection, teamCollection, dexMode]);

  const liveSelectedPokemon = useMemo(() => {
    return selectedPokemonId ? fullCollection.find(p => p.id === selectedPokemonId) : null;
  }, [selectedPokemonId, fullCollection]);

  const fuse = useMemo(() => new Fuse(fullCollection, { keys: ['name', 'pokedexId'], threshold: 0.3 }), [fullCollection]);
  
  const displayedPokemon = useMemo(() => {
    const results = searchQuery ? fuse.search(searchQuery).map(res => res.item) : fullCollection;
    return results.slice(0, displayLimit);
  }, [searchQuery, fuse, fullCollection, displayLimit]);

  // Groupement par génération pour les bandeaux
  const pokemonByGen = useMemo(() => {
    const groups = {};
    displayedPokemon.forEach(p => {
      if (!groups[p.gen]) groups[p.gen] = [];
      groups[p.gen].push(p);
    });
    return groups;
  }, [displayedPokemon]);

  const handleLogout = async () => {
    const {supabase} = await import('./services/supabaseClient');
    await supabase.auth.signOut();
  };

  const handleRestrictedAction = (targetView) => {
    if (!user) {
      setToast({ message: "Connectez-vous !", type: 'info' });
      setShowAuth(true);
    } else if (targetView) {
      setView(targetView);
    }
  };

  const handleBulkAdd = async () => {
    if (selectedIds.length === 0) return;
    const dataToImport = selectedIds.map(id => ({ pokemon_id: id, is_shiny: true, count: 0, game_id: 'Multi-ajout', method_id: 'Manuel' }));
    try {
      await importCollection(dataToImport);
      setToast({ message: `${selectedIds.length} Pokémon ajoutés !`, type: 'success' });
      setSelectionMode(false);
      clearSelection();
      confetti({ particleCount: 100, origin: { y: 0.8 } });
    } catch (err) {
      console.error(err);
      setToast({ message: 'Erreur lors de l\'ajout.', type: 'error' });
    }
  };

  const mainContent = () => {
    if (authLoading) return <div className="min-h-screen bg-twilight-950 flex items-center justify-center text-amber-500 font-black tracking-tighter italic animate-pulse">CHARGEMENT SHINYDEX...</div>;
    if (showAuth && !user) return <AuthForm onBack={() => setShowAuth(false)} />;

    if (view === 'hunting' && user) {
      if (sessions.length > 0 && !isConfiguringNewHunt) {
        return (
          <HuntingSession 
            userId={user.id}
            onNewHunt={() => setIsConfiguringNewHunt(true)}
            onFound={async (session) => {
              upsertPokemon({ pokemon_id: session.pokemonId, is_shiny: true, count: session.count, game_id: session.gameId, method_id: session.methodId });
              confetti({ particleCount: 200, spread: 90 });
              setToast({ message: `${session.pokemonName} trouvé !`, type: 'success' });
              stopSession(session.id);
              if (sessions.length <= 1) setView('dex');
            }} 
          />
        );
      }
      return <HuntingConfig onBack={() => { if (sessions.length > 0) setIsConfiguringNewHunt(false); else setView('dex'); }} userId={user.id} />;
    }

    if (view === 'profile' && user) return <ProfileSettings userId={user.id} onBack={() => setView('dex')} />;
    if (view === 'stats' && user) return <StatsDashboard fullCollection={fullCollection} onBack={() => setView('dex')} />;
    if (view === 'achievements' && user) return <AchievementsGallery userId={user.id} onBack={() => setView('dex')} />;
    if (view === 'collaboration' && user) return (
      <div className="min-h-screen bg-twilight-950 p-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <button onClick={() => setView('dex')} className="flex items-center gap-2 text-twilight-400 hover:text-white uppercase font-black text-xs transition-colors mb-4"><Zap size={16} /> Retour</button>
          <TeamManager userId={user.id} onToast={setToast} />
        </div>
      </div>
    );

    return (
      <div className="max-w-7xl mx-auto p-4 space-y-6 sm:space-y-8">
        {/* BARRE D'ACTIONS (IMPORT/EXPORT + VIEW TOGGLE) */}
        <div className="flex flex-col gap-4 bg-twilight-900/50 p-4 sm:p-6 rounded-3xl sm:rounded-[2rem] border border-twilight-800 shadow-xl backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
              <button onClick={toggleViewMode} className="shrink-0 flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-twilight-800 border border-twilight-700 rounded-xl sm:rounded-2xl hover:border-amber-500 transition-all font-black uppercase text-[9px] sm:text-[10px] tracking-widest text-twilight-300">
                {viewMode === 'grid' ? <><List size={16} /> Liste</> : <><LayoutGrid size={16} /> Grille</>}
              </button>
              <div className="h-6 w-px bg-twilight-800 hidden sm:block"></div>
              <ImportExportActions collection={dbCollection} onImport={importCollection} />
            </div>

            {user && team && (
              <div className="flex bg-twilight-950 p-1 rounded-xl border border-twilight-800 shrink-0">
                <button onClick={() => setDexMode('personal')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${dexMode === 'personal' ? 'bg-amber-500 text-twilight-950' : 'text-twilight-500'}`}>Moi</button>
                <button onClick={() => setDexMode('team')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${dexMode === 'team' ? 'bg-amber-500 text-twilight-950' : 'text-twilight-500'}`}>Équipe</button>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-1 w-full sm:max-w-xs sm:ml-auto">
             <div className="flex justify-between w-full text-[10px] font-black uppercase tracking-widest italic">
               <span className="text-twilight-500">Progression {dexMode === 'personal' ? 'Perso' : 'Équipe'}</span>
               <span className="text-amber-500">{fullCollection.filter(p => p.captured).length} / {fullCollection.length}</span>
             </div>
             <div className="w-full h-1.5 bg-twilight-950 rounded-full overflow-hidden border border-twilight-800">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${(fullCollection.filter(p => p.captured).length / fullCollection.length) * 100}%` }}
                 className="h-full bg-gradient-to-r from-amber-500 to-orange-600 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
               />
             </div>
          </div>
        </div>

        {/* LISTE DES POKEMON AVEC GÉNÉRATIONS */}
        <div className="space-y-12 pb-32">
          {Object.entries(pokemonByGen).sort((a, b) => a[0] - b[0]).map(([gen, pokemons]) => (
            <div key={gen} className="space-y-6">
              <div className="sticky top-[57px] sm:top-[73px] z-30 py-4 -mx-4 px-4 bg-twilight-950/80 backdrop-blur-md border-y border-twilight-800/50 flex items-center justify-between">
                <h2 className="text-xl sm:text-3xl font-black text-white italic uppercase tracking-tighter">
                  Génération <span className="text-amber-500">{gen}</span>
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-amber-500/20 to-transparent ml-8 hidden md:block"></div>
                <span className="text-[10px] font-black text-twilight-600 uppercase tracking-widest ml-4">
                  {pokemons.filter(p => p.captured).length} / {pokemons.length} capturés
                </span>
              </div>

              <div className={`grid gap-2 sm:gap-4 ${viewMode === 'grid' ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
                {pokemons.map((p) => (
                  <PokemonCard 
                    key={p.id} 
                    pokemon={p} 
                    viewMode={viewMode} 
                    isSelected={selectedIds.includes(p.id)} 
                    selectionMode={selectionMode} 
                    onClick={() => { if (!user) handleRestrictedAction(); else if (selectionMode) toggleIdSelection(p.id); else setSelectedPokemonId(p.id); }} 
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-twilight-950 text-white font-sans selection:bg-amber-500">
      <div className="sticky top-0 z-40 bg-twilight-900/95 backdrop-blur-md border-b border-twilight-800 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-2 sm:py-3 flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0" onClick={() => { setView('dex'); setIsConfiguringNewHunt(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-400 to-orange-600 rounded-lg sm:rounded-xl flex items-center justify-center"><Zap size={20} className="text-twilight-950 fill-current" /></div>
            <h1 className="text-lg sm:text-2xl font-black tracking-tighter uppercase italic leading-none">SHINY<span className="text-amber-500">DEX</span></h1>
          </div>
          
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-twilight-500" size={16} />
            <input type="text" placeholder="Chercher..." className="w-full pl-9 pr-3 py-2 sm:py-3 rounded-xl bg-twilight-800/50 border border-twilight-700 outline-none focus:border-amber-500 font-bold text-xs sm:text-sm" onChange={(e) => setSearchQuery(e.target.value)} />
          </div>

          <div className="hidden sm:flex items-center gap-2">
            {user && <SyncStatus isSyncing={isSyncing} isOffline={isOffline} />}
            <button onClick={() => user ? setSelectionMode(!selectionMode) : handleRestrictedAction()} className={`p-3 rounded-xl border transition-all ${selectionMode ? 'bg-amber-500 text-twilight-950' : 'bg-twilight-800 border-twilight-700'}`} title="Multi-sélection"><SquareStack size={20} /></button>
            <button onClick={() => handleRestrictedAction('achievements')} className={`p-3 rounded-xl border transition-all ${view === 'achievements' ? 'bg-amber-500 text-twilight-950' : 'bg-twilight-800 border-twilight-700'}`} title="Succès"><Trophy size={20} /></button>
            <button onClick={() => handleRestrictedAction('stats')} className={`p-3 rounded-xl border transition-all ${view === 'stats' ? 'bg-amber-500 text-twilight-950' : 'bg-twilight-800 border-twilight-700'}`} title="Stats"><BarChart3 size={20} /></button>
            <button onClick={() => handleRestrictedAction('collaboration')} className={`p-3 rounded-xl border transition-all ${view === 'collaboration' ? 'bg-amber-500 text-twilight-950' : 'bg-twilight-800 border-twilight-700'}`} title="Équipe"><Users size={20} /></button>
            <button onClick={() => handleRestrictedAction('hunting')} className={`p-3 rounded-xl border transition-all ${view === 'hunting' ? 'bg-amber-500 text-twilight-950' : 'bg-twilight-800 border-twilight-700'}`} title="Compteur"><Zap size={20} className={sessions.length > 0 ? 'animate-pulse fill-current' : ''} /></button>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <button onClick={() => setView('profile')} className="p-2 sm:p-3 bg-twilight-800 border border-twilight-700 rounded-lg sm:rounded-xl hover:text-amber-500"><User size={18} /></button>
            ) : (
              <button onClick={() => setShowAuth(true)} className="px-4 py-2 sm:px-6 sm:py-3 bg-amber-500 text-twilight-950 rounded-lg sm:rounded-xl font-black uppercase text-[10px] sm:text-xs">Connexion</button>
            )}
          </div>
        </div>
      </div>

      {mainContent()}

      {/* BOUTON SCROLL TO TOP */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-24 right-8 z-50 p-4 bg-amber-500 text-twilight-950 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all"
          >
            <ChevronUp size={24} strokeWidth={3} />
          </motion.button>
        )}
      </AnimatePresence>

      {liveSelectedPokemon && (
        <PokemonDetailModal 
          pokemon={liveSelectedPokemon} 
          onClose={() => setSelectedPokemonId(null)} 
          onSave={(pokemonId, details) => {
            upsertPokemon({ id: details.id, pokemon_id: pokemonId, is_shiny: true, count: details.encounters, game_id: details.version, method_id: details.origin });
            setToast({ message: "Enregistré !", type: 'success' });
          }}
          onDelete={(entryId) => { deletePokemon(entryId); setSelectedPokemonId(null); }}
        />
      )}

      <AnimatePresence>
        {selectionMode && selectedIds.length > 0 && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="fixed bottom-24 left-0 right-0 z-[60] p-4 flex justify-center">
            <div className="bg-twilight-900 border border-amber-500/50 rounded-3xl px-8 py-6 shadow-2xl flex items-center gap-8 backdrop-blur-xl">
              <p className="text-3xl font-black text-white italic">{selectedIds.length}</p>
              <div className="flex gap-3">
                <button onClick={clearSelection} className="px-6 py-3 bg-twilight-800 text-twilight-400 rounded-2xl font-black uppercase text-xs">Annuler</button>
                <button onClick={handleBulkAdd} className="px-8 py-3 bg-amber-500 text-twilight-950 rounded-2xl font-black uppercase text-xs shadow-xl">Ajouter ✨</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BOTTOM NAVIGATION MOBILE */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-twilight-900/90 backdrop-blur-xl border-t border-twilight-800 px-6 py-3 flex justify-between items-center shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        <button onClick={() => { setView('dex'); setIsConfiguringNewHunt(false); }} className={`flex flex-col items-center gap-1 ${view === 'dex' ? 'text-amber-500' : 'text-twilight-500'}`}>
          <LayoutGrid size={20} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Dex</span>
        </button>
        <button onClick={() => handleRestrictedAction('hunting')} className={`flex flex-col items-center gap-1 ${view === 'hunting' ? 'text-amber-500' : 'text-twilight-500'}`}>
          <Zap size={20} className={sessions.length > 0 ? 'animate-pulse fill-current' : ''} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Compteur</span>
        </button>
        <button onClick={() => handleRestrictedAction('stats')} className={`flex flex-col items-center gap-1 ${view === 'stats' ? 'text-amber-500' : 'text-twilight-500'}`}>
          <BarChart3 size={20} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Stats</span>
        </button>
        <button onClick={() => handleRestrictedAction('collaboration')} className={`flex flex-col items-center gap-1 ${view === 'collaboration' ? 'text-amber-500' : 'text-twilight-500'}`}>
          <Users size={20} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Équipe</span>
        </button>
        <button onClick={() => user ? setSelectionMode(!selectionMode) : handleRestrictedAction()} className={`flex flex-col items-center gap-1 ${selectionMode ? 'text-amber-500' : 'text-twilight-500'}`}>
          <SquareStack size={20} />
          <span className="text-[9px] font-black uppercase tracking-tighter">Sél.</span>
        </button>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

export default App;
