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
      pokemonId: selectedPkmn.pokedexId || selectedPkmn.id,
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
    onBack(); // Retourne à la vue des sessions actives ou au Dex
  };

  return (
    <div className="min-h-screen bg-twilight-950 p-4 pb-24">
      <div className="max-w-2xl mx-auto space-y-6">
        <button onClick={onBack} className="flex items-center gap-2 text-twilight-400 hover:text-white uppercase font-black text-xs tracking-widest transition-colors">
          <ArrowLeft size={16} /> Retour
        </button>

        <div className="bg-twilight-900 border border-twilight-800 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Zap size={24} className="text-twilight-950 fill-current" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter uppercase italic text-white">
              Nouveau <span className="text-amber-500">Compteur</span>
            </h1>
          </div>

          <div className="space-y-6">
            {/* Group Hunt Option */}
            {team && (
              <div 
                className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all border ${isGroupHunt ? 'bg-amber-500/10 border-amber-500' : 'bg-twilight-950 border-twilight-800'}`}
                onClick={() => setIsGroupHunt(!isGroupHunt)}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isGroupHunt ? 'bg-amber-500 text-twilight-950' : 'bg-twilight-800 text-twilight-500'}`}>
                  <Users size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black text-white uppercase italic">Session de Groupe</p>
                  <p className="text-[9px] font-bold text-twilight-500 uppercase tracking-widest">Partager le compteur avec {team.name}</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isGroupHunt ? 'border-amber-500 bg-amber-500' : 'border-twilight-700'}`}>
                  {isGroupHunt && <div className="w-2 h-2 bg-twilight-900 rounded-full" />}
                </div>
              </div>
            )}

            {/* Pokemon Selection */}
            <div>
              <label className="block text-twilight-300 text-[10px] uppercase font-black mb-2 ml-1 tracking-widest">Pokémon Cible</label>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-twilight-500" size={16} />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-twilight-950 border border-twilight-800 text-white outline-none focus:border-amber-500 transition-all font-bold text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {filteredPokemon.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPkmn(p)}
                    className={`p-2 rounded-xl border transition-all flex flex-col items-center gap-1 ${
                      selectedPkmn?.id === p.id 
                      ? 'bg-amber-500/20 border-amber-500 shadow-lg shadow-amber-500/10 scale-105' 
                      : 'bg-twilight-950 border-twilight-800 hover:border-twilight-700'
                    }`}
                  >
                    <img 
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${p.pokedexId}.png`} 
                      alt={p.name}
                      className="w-14 h-14 object-contain drop-shadow-md"
                      onError={(e) => { e.target.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png' }}
                    />
                    <span className="text-[8px] font-black uppercase truncate w-full text-center text-twilight-300">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-twilight-300 text-[10px] uppercase font-black mb-2 ml-1 tracking-widest">Jeu</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl bg-twilight-950 border border-twilight-800 text-white outline-none focus:border-amber-500 font-bold appearance-none"
                  value={selectedGame}
                  onChange={(e) => setSelectedGame(e.target.value)}
                >
                  {Object.keys(probData.games).map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-twilight-300 text-[10px] uppercase font-black mb-2 ml-1 tracking-widest">Méthode</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl bg-twilight-950 border border-twilight-800 text-white outline-none focus:border-amber-500 font-bold appearance-none"
                  value={selectedMethod}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                >
                  {Object.keys(probData.methods).map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Contextual Modifiers */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-twilight-950 border border-twilight-800 rounded-2xl cursor-pointer" onClick={() => setHasCharm(!hasCharm)}>
                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${hasCharm ? 'bg-amber-500 border-amber-500' : 'border-twilight-700'}`}>
                  {hasCharm && <Zap size={14} className="text-twilight-950 fill-current" />}
                </div>
                <span className="text-[10px] font-bold text-twilight-300 uppercase tracking-widest">Charme Chroma</span>
              </div>

              {gameData.has_sandwich && (
                <div className="flex items-center gap-3 p-4 bg-twilight-950 border border-twilight-800 rounded-2xl">
                  <label className="text-[10px] font-bold text-twilight-300 uppercase tracking-widest flex-1">Aura Brillance (Sandwich)</label>
                  <select 
                    className="bg-twilight-900 border border-twilight-700 text-amber-500 text-xs font-black p-1 rounded"
                    value={modifiers.sandwichLvl}
                    onChange={(e) => setModifiers({...modifiers, sandwichLvl: parseInt(e.target.value)})}
                  >
                    <option value={0}>Aucun</option>
                    <option value={3}>Niveau 3</option>
                  </select>
                </div>
              )}

              {gameData.has_research && (
                <>
                  <div className="flex items-center gap-3 p-4 bg-twilight-950 border border-twilight-800 rounded-2xl">
                    <label className="text-[10px] font-bold text-twilight-300 uppercase tracking-widest flex-1">Niveau Recherche</label>
                    <select 
                      className="bg-twilight-900 border border-twilight-700 text-amber-500 text-xs font-black p-1 rounded"
                      value={modifiers.researchLevel}
                      onChange={(e) => setModifiers({...modifiers, researchLevel: e.target.value})}
                    >
                      <option value="base">Basique</option>
                      <option value="completed">Complété (10)</option>
                      <option value="perfect">Parfait</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-twilight-950 border border-twilight-800 rounded-2xl cursor-pointer" onClick={() => setModifiers({...modifiers, massiveOutbreak: !modifiers.massiveOutbreak})}>
                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${modifiers.massiveOutbreak ? 'bg-amber-500 border-amber-500' : 'border-twilight-700'}`}>
                      {modifiers.massiveOutbreak && <Zap size={14} className="text-twilight-950 fill-current" />}
                    </div>
                    <span className="text-[10px] font-bold text-twilight-300 uppercase tracking-widest">Mégapparitions / Apparitions Massives</span>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleStart}
              disabled={!selectedPkmn}
              className="w-full py-5 bg-amber-500 text-twilight-950 rounded-2xl font-black uppercase italic tracking-tighter hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-amber-500/10 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Play size={20} fill="currentColor" /> Lancer la Shasse
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
