import React, { useState, useEffect } from 'react';
import { useHuntingStore } from '../../../store/huntingStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, X, Sparkles, Trophy, BookOpen, ArrowLeft } from 'lucide-react';
import { useHapticFeedback } from '../../../hooks/useHapticFeedback';
import ConfirmModal from '../../../components/ConfirmModal';
import { calculateCurrentRate, calculateCumulativeProbability, calculateLuckFactor } from '../logic/probabilityEngine';
import { realtimeService } from '../../collaboration/services/realtimeService';
import { supabase } from '../../../services/supabaseClient';
import guidesData from '../data/guides.json';

export default function HuntingSession({ onFound, userId, onNewHunt }) {
  const { sessions, activeSessionId, setActiveSession, incrementCount, decrementCount, stopSession, getActiveSession, updatePartnerCount } = useHuntingStore();
  const activeSession = getActiveSession();
  const { trigger } = useHapticFeedback();
  const [showGuide, setShowGuide] = useState(false);
  const [showStopConfirm, setShowStopConfirm] = useState(false);

  // GESTION DU TEMPS RÉEL (REALTIME)
  useEffect(() => {
    if (!activeSession || !activeSession.isGroupHunt || !activeSession.teamId) return;

    const channel = supabase.channel(`team:${activeSession.teamId}`);
    
    const sub = channel
      .on('broadcast', { event: 'increment' }, ({ payload }) => {
        if (payload.userId !== userId) {
          updatePartnerCount(activeSession.id, payload.userId, payload.count);
        }
      })
      .subscribe();

    console.log('Realtime sub active:', !!sub);

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeSession?.id, activeSession?.isGroupHunt, activeSession?.teamId, userId, updatePartnerCount, activeSession]);

  if (!activeSession) return null;

  // CALCULS
  const partnerTotal = Object.values(activeSession.partnerCounts || {}).reduce((a, b) => a + b, 0);
  const totalCount = (activeSession.count || 0) + partnerTotal;

  const currentRate = calculateCurrentRate(activeSession);
  const cumulativeProb = calculateCumulativeProbability(currentRate, totalCount);
  const luckFactor = calculateLuckFactor(currentRate, totalCount);
  const tips = guidesData.methods[activeSession.methodId]?.tips || [];

  const getLuckColor = (factor) => {
    if (factor < 0.5) return 'text-green-400';
    if (factor < 1) return 'text-gold-champagne';
    if (factor < 1.5) return 'text-orange-400';
    return 'text-red-500';
  };

  const handleIncrement = (e) => {
    e?.stopPropagation();
    trigger('MEDIUM');
    incrementCount();

    if (activeSession.isGroupHunt && activeSession.teamId) {
      const channel = supabase.channel(`team:${activeSession.teamId}`);
      realtimeService.broadcastIncrement(channel, userId, (activeSession.count || 0) + 1);
    }
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    trigger('LIGHT');
    decrementCount();
  };

  const handleFound = (e) => {
    e.stopPropagation();
    trigger('SUCCESS');
    onFound(activeSession);
  };

  const toggleGuide = (e) => {
    e.stopPropagation();
    trigger('LIGHT');
    setShowGuide(!showGuide);
  };

  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/${activeSession.pokemonId}.png`;
  const normalSpriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${activeSession.pokemonId}.png`;

  return (
    <div className="min-h-screen bg-twilight-950 flex flex-col items-center justify-start p-4 relative overflow-y-auto select-none pt-4">
      {/* BARRE DE NAVIGATION SUPÉRIEURE */}
      <div className="w-full max-w-2xl mb-6 z-20 flex items-center gap-4">
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('nav-to-dex'))}
          className="p-3 bg-twilight-900 border border-twilight-800 text-twilight-400 hover:text-white rounded-2xl transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-widest"
          title="Retour au Pokédex"
        >
          <ArrowLeft size={18} /> <span className="hidden sm:inline">Pokédex</span>
        </button>

        <div className="flex-1 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {sessions.map(s => (
            <button
              key={s.id}
              onClick={() => { trigger('LIGHT'); setActiveSession(s.id); }}
              className={`flex-shrink-0 px-4 py-3 rounded-2xl border transition-all flex items-center gap-3 ${
                activeSessionId === s.id 
                ? 'bg-amber-500 border-amber-500 text-twilight-950 shadow-lg' 
                : 'bg-twilight-900 border-twilight-800 text-twilight-500 hover:border-twilight-700'
              }`}
            >
              <div className="flex -space-x-3">
                <img 
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${s.pokemonId}.png`} 
                  alt=""
                  className="w-8 h-8 object-contain opacity-50"
                  onError={(e) => { e.target.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'; }}
                />
                <img 
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/${s.pokemonId}.png`} 
                  alt=""
                  className="w-8 h-8 object-contain relative z-10"
                  onError={(e) => { e.target.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'; }}
                />
              </div>
              <div className="text-left hidden md:block">
                <p className="text-[10px] font-black uppercase tracking-tighter leading-none">{s.pokemonName}</p>
                <p className="text-[8px] font-bold opacity-70">{s.count} rencontres</p>
              </div>
            </button>
          ))}
          {sessions.length < 10 && (
            <button 
              onClick={onNewHunt}
              className="flex-shrink-0 w-12 h-12 rounded-2xl border border-dashed border-twilight-700 flex items-center justify-center text-twilight-500 hover:text-white hover:border-twilight-500 transition-all"
            >
              <Plus size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-500 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gold-champagne blur-[120px] rounded-full animate-pulse"></div>
      </div>

      <motion.div 
        key={activeSessionId}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl z-10"
      >
        <div 
          onClick={handleIncrement}
          className="bg-twilight-900 border border-twilight-800 rounded-[3rem] p-8 shadow-2xl relative overflow-hidden active:scale-[0.99] transition-transform cursor-pointer"
        >
          <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
            <button 
              onClick={(e) => { e.stopPropagation(); trigger('MEDIUM'); setShowStopConfirm(true); }}
              className="p-3 bg-twilight-950/50 hover:bg-twilight-950 text-twilight-500 hover:text-white rounded-2xl transition-colors"
            >
              <X size={24} />
            </button>
            <div className="flex items-center gap-2">
              {activeSession.isGroupHunt && (
                <div className="flex -space-x-2 mr-2">
                  <div className="w-8 h-8 rounded-full border-2 border-twilight-900 bg-amber-500 flex items-center justify-center text-[10px] font-black text-twilight-900">
                    {Object.keys(activeSession.partnerCounts || {}).length + 1}
                  </div>
                </div>
              )}
              <button 
                onClick={toggleGuide}
                className={`p-3 rounded-2xl transition-colors ${showGuide ? 'bg-gold-champagne text-twilight-950' : 'bg-twilight-950/50 text-twilight-400 hover:text-white'}`}
                title="Conseils de shasse"
              >
                <BookOpen size={24} />
              </button>
              <span className="text-[10px] font-black bg-twilight-950/50 text-twilight-400 px-4 py-2 rounded-xl uppercase tracking-[0.2em] backdrop-blur-md border border-twilight-800 flex items-center">
                {activeSession.gameId}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center pt-8">
            <AnimatePresence mode="wait">
              {!showGuide ? (
                <motion.div
                  key="stats"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center w-full"
                >
                  <div className="relative mb-4 sm:mb-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 w-full px-2 sm:px-4">
                    <div className="flex flex-col items-center gap-2 sm:gap-4 bg-twilight-900/40 p-3 sm:p-6 rounded-2xl sm:rounded-[2.5rem] border border-twilight-800/50 flex-1 w-full sm:w-auto">
                      <span className="text-[8px] sm:text-[10px] font-black text-twilight-500 uppercase tracking-widest">Original</span>
                      <motion.img 
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        src={normalSpriteUrl} 
                        alt="Normal"
                        className="w-32 h-32 sm:w-64 sm:h-64 object-contain opacity-80"
                        onError={(e) => { e.target.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'; }}
                      />
                    </div>
                    
                    <div className="flex flex-col items-center gap-2 sm:gap-4 bg-amber-500/5 p-3 sm:p-6 rounded-2xl sm:rounded-[2.5rem] border border-amber-500/20 flex-1 w-full sm:w-auto">
                      <span className="text-[8px] sm:text-[10px] font-black text-amber-500 uppercase tracking-widest">Chromatique</span>
                      <motion.img 
                        animate={{ 
                          y: [0, -5, 0],
                          scale: [1, 1.02, 1]
                        }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        src={spriteUrl} 
                        alt={activeSession.pokemonName}
                        className="relative w-40 h-40 sm:w-64 sm:h-64 object-contain drop-shadow-[0_0_30px_rgba(245,158,11,0.3)]"
                        onError={(e) => { e.target.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'; }}
                      />
                    </div>
                  </div>

                  <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tighter uppercase italic mb-4 sm:mb-8">
                    {activeSession.pokemonName}
                  </h2>

                  <div className="relative flex flex-col items-center mb-4 sm:mb-8 text-center">
                    <span className="text-7xl sm:text-9xl font-black text-white tabular-nums tracking-tighter leading-none">
                      {activeSession.isGroupHunt ? totalCount : activeSession.count}
                    </span>
                    <span className="text-[10px] sm:text-[12px] font-black text-twilight-500 uppercase tracking-[0.5em] mt-2 sm:mt-4">
                      {activeSession.isGroupHunt ? 'Total' : 'Rencontres'}
                    </span>
                  </div>

                  <div className="w-full bg-twilight-950/50 border border-twilight-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-8">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-[8px] sm:text-[9px] font-black text-twilight-600 uppercase tracking-widest">Chance</span>
                      <span className={`text-xs sm:text-sm font-black italic ${getLuckColor(luckFactor)}`}>x{luckFactor}</span>
                    </div>
                    <div className="h-1.5 sm:h-2 bg-twilight-900 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(luckFactor * 50, 100)}%` }}
                        className={`h-full ${parseFloat(luckFactor) > 1 ? 'bg-red-500' : 'bg-gold-champagne'}`}
                      ></motion.div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full mb-4 sm:mb-8">
                    <div className="bg-twilight-950/50 border border-twilight-800 p-2.5 sm:p-4 rounded-2xl sm:rounded-3xl text-center">
                      <span className="block text-[8px] sm:text-[9px] font-black text-twilight-600 uppercase tracking-widest mb-0.5">Taux</span>
                      <span className="text-sm sm:text-xl font-black text-gold-champagne italic">1/{currentRate}</span>
                    </div>
                    <div className="bg-twilight-950/50 border border-twilight-800 p-2.5 sm:p-4 rounded-2xl sm:rounded-3xl text-center">
                      <span className="block text-[8px] sm:text-[9px] font-black text-twilight-600 uppercase tracking-widest mb-0.5">Probabilité</span>
                      <span className="text-sm sm:text-xl font-black text-amber-500 italic">{cumulativeProb}%</span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="guide"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="w-full py-8"
                >
                  <h3 className="text-2xl font-black text-gold-champagne uppercase italic mb-6 flex items-center gap-3">
                    <BookOpen size={24} /> Guide : {activeSession.methodId}
                  </h3>
                  
                  <div className="space-y-4">
                    {tips.map((tip, index) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        key={index} 
                        className="bg-twilight-950/50 border border-twilight-800 p-5 rounded-2xl flex gap-4"
                      >
                        <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0 border border-amber-500/20">
                          <span className="text-amber-500 font-black text-xs">{index + 1}</span>
                        </div>
                        <p className="text-twilight-300 text-sm font-bold leading-relaxed">{tip}</p>
                      </motion.div>
                    ))}
                    {tips.length === 0 && (
                      <p className="text-twilight-500 italic text-center py-12 font-bold">Aucun conseil spécifique pour cette méthode.</p>
                    )}
                  </div>

                  <button 
                    onClick={toggleGuide}
                    className="mt-8 w-full py-4 bg-twilight-800 hover:bg-twilight-700 text-twilight-400 rounded-2xl font-black uppercase text-xs tracking-widest transition-all"
                  >
                    Retour aux compteurs
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-4 w-full">
              <button 
                onClick={handleDecrement}
                className="flex-1 py-6 bg-twilight-950 hover:bg-twilight-800 text-twilight-500 rounded-[2rem] border border-twilight-800 transition-all active:scale-90 flex items-center justify-center gap-2"
              >
                <Minus size={24} /> <span className="font-black text-xs uppercase tracking-widest">-1</span>
              </button>

              <button 
                onClick={handleFound}
                className="flex-[2] py-6 bg-gradient-to-br from-amber-400 to-orange-600 text-twilight-950 rounded-[2rem] font-black text-sm uppercase italic tracking-widest shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <Sparkles size={24} className="fill-current" /> Pokémon Trouvé !
              </button>
            </div>
          </div>
        </div>
      </motion.div>

            <div className="mt-8 flex items-center gap-3 text-twilight-600 font-bold text-[10px] uppercase tracking-[0.3em] pb-12">

              <Trophy size={16} />

              <span>Calculateur Expert Actif</span>

            </div>

      

            <ConfirmModal 

              isOpen={showStopConfirm}

              title="Abandonner ?"

              message={`Êtes-vous sûr de vouloir arrêter la chasse de ${activeSession.pokemonName} ? Toute progression non sauvegardée sera perdue.`}

              confirmText="Abandonner"

              onConfirm={() => { stopSession(); setShowStopConfirm(false); }}

              onCancel={() => setShowStopConfirm(false)}

            />

          </div>

        );

      }

      