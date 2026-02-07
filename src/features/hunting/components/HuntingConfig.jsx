import React, { useState } from 'react';
import { useHuntingStore } from '../../../store/huntingStore';
import { useUserStore } from '../../../store/userStore';
import { useTeam } from '../../collaboration/hooks/useTeam';
import { realtimeService } from '../../collaboration/services/realtimeService';
import { supabase } from '../../../services/supabaseClient';
import { Zap, Play, Search, ArrowLeft, Users } from 'lucide-react';
import pokemonData from '../../collection/data/pokemon_data.json';
import probData from '../data/probabilities.json';

export default function HuntingConfig({ onBack, userId }) {
  const { startSession } = useHuntingStore();
  const { team } = useTeam(userId);
  const { profile } = useUserStore();
  const [search, setSearch] = useState('');
  const [selectedPkmn, setSelectedPkmn] = useState(null);
  const [selectedGame, setSelectedGame] = useState('Écarlate/Violet');
  const [selectedMethod, setSelectedMethod] = useState('Masuda');
  const [hasCharm, setHasCharm] = useState(false);
  const [isGroupHunt, setIsGroupHunt] = useState(false);
  const [modifiers, setModifiers] = useState({
    sandwichLvl: 0,
    researchLevel: 'base',
    massiveOutbreak: false
  });

  const filteredPokemon = pokemonData
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 10);

  const gameData = probData.games[selectedGame] || {};

  const handleStart = () => {
    if (!selectedPkmn) return;
    
    const config = {
      pokemonId: selectedPkmn.id, // Utiliser l'ID texte unique
      pokemonName: selectedPkmn.name,
      gameId: selectedGame,
      methodId: selectedMethod,
      hasCharm,
      modifiers,
      isGroupHunt: isGroupHunt && !!team,
      teamId: team?.id
    };

    if (config.isGroupHunt) {
      const channel = supabase.channel(`team:${team.id}`);
      realtimeService.broadcastHuntStart(channel, {
        ...config,
        trainerId: userId,
        trainerName: profile?.username || 'Un dresseur'
      });
    }

    startSession(config);
    onBack(); 
  };

  return (
    <div className="min-h-screen bg-twilight-950 p-4 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        <button onClick={onBack} className="flex items-center gap-2 text-twilight-400 hover:text-white uppercase font-black text-xs tracking-widest transition-colors">
          <ArrowLeft size={16} /> Retour
        </button>

        <div className="bg-twilight-900 border border-twilight-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl">
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Zap size={20} sm:size={24} className="text-twilight-950 fill-current" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tighter uppercase italic text-white">
              Nouveau <span className="text-amber-500">Compteur</span>
            </h1>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {team && (
              <div 
                className={`flex items-center gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl cursor-pointer transition-all border ${isGroupHunt ? 'bg-amber-500/10 border-amber-500' : 'bg-twilight-950 border-twilight-800'}`}
                onClick={() => setIsGroupHunt(!isGroupHunt)}
              >
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center ${isGroupHunt ? 'bg-amber-500 text-twilight-950' : 'bg-twilight-800 text-twilight-500'}`}>
                  <Users size={16} sm:size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] sm:text-xs font-black text-white uppercase italic">Session de Groupe</p>
                  <p className="text-[8px] sm:text-[9px] font-bold text-twilight-500 uppercase tracking-widest">Partager avec {team.name}</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-twilight-300 text-[8px] sm:text-[10px] uppercase font-black mb-2 ml-1 tracking-widest">Pokémon Cible</label>
              <div className="relative mb-3 sm:mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-twilight-500" size={14} />
                <input
                  type="text"
                  placeholder="Chercher..."
                  className="w-full pl-9 pr-3 py-2 sm:py-3 rounded-xl bg-twilight-950 border border-twilight-800 text-white outline-none focus:border-amber-500 transition-all font-bold text-xs sm:text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 sm:gap-2">
                {filteredPokemon.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPkmn(p)}
                    className={`p-1.5 sm:p-2 rounded-xl border transition-all flex flex-col items-center gap-1 ${
                      selectedPkmn?.id === p.id 
                      ? 'bg-amber-500/20 border-amber-500 shadow-lg' 
                      : 'bg-twilight-950 border-twilight-800 hover:border-twilight-700'
                    }`}
                  >
                    <img 
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${p.pokedexId}.png`} 
                      alt={p.name}
                      className="w-10 h-10 sm:w-14 sm:h-14 object-contain"
                      onError={(e) => { e.target.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png' }}
                    />
                    <span className="text-[7px] sm:text-[8px] font-black uppercase truncate w-full text-center text-twilight-300">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-twilight-300 text-[8px] sm:text-[10px] uppercase font-black mb-1 ml-1 tracking-widest">Jeu</label>
                <select 
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl bg-twilight-950 border border-twilight-800 text-white text-xs sm:text-sm outline-none focus:border-amber-500 font-bold appearance-none"
                  value={selectedGame}
                  onChange={(e) => setSelectedGame(e.target.value)}
                >
                  {Object.keys(probData.games).map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-twilight-300 text-[8px] sm:text-[10px] uppercase font-black mb-1 ml-1 tracking-widest">Méthode</label>
                <select 
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 rounded-xl bg-twilight-950 border border-twilight-800 text-white text-xs sm:text-sm outline-none focus:border-amber-500 font-bold appearance-none"
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                >
                  {Object.keys(probData.methods).map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-1 gap-2 sm:space-y-2">
              <div className="flex items-center gap-2 p-3 bg-twilight-950 border border-twilight-800 rounded-xl cursor-pointer" onClick={() => setHasCharm(!hasCharm)}>
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${hasCharm ? 'bg-amber-500 border-amber-500' : 'border-twilight-700'}`}>
                  {hasCharm && <Zap size={12} className="text-twilight-950 fill-current" />}
                </div>
                <span className="text-[8px] sm:text-[10px] font-bold text-twilight-300 uppercase tracking-widest">Charme</span>
              </div>

              {gameData.has_sandwich && (
                <div className="flex items-center gap-2 p-3 bg-twilight-950 border border-twilight-800 rounded-xl">
                  <select 
                    className="w-full bg-twilight-900 border border-twilight-700 text-amber-500 text-[8px] sm:text-xs font-black p-1 rounded"
                    value={modifiers.sandwichLvl}
                    onChange={(e) => setModifiers({...modifiers, sandwichLvl: parseInt(e.target.value)})}
                  >
                    <option value={0}>Sandwich: Aucun</option>
                    <option value={3}>Sandwich: Niv.3</option>
                  </select>
                </div>
              )}
            </div>

            <button
              onClick={handleStart}
              disabled={!selectedPkmn}
              className="w-full py-4 sm:py-5 bg-amber-500 text-twilight-950 rounded-xl sm:rounded-2xl font-black uppercase italic tracking-tighter hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-amber-500/10 disabled:opacity-50 flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              <Play size={18} sm:size={20} fill="currentColor" /> Lancer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}