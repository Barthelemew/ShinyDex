import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Lock, Star, ArrowLeft } from 'lucide-react';
import { useAchievements } from '../hooks/useAchievements';

export default function AchievementsGallery({ userId, onBack }) {
  const { achievements, isLoading } = useAchievements(userId);

  if (isLoading) return <div className="p-8 text-center text-twilight-500 animate-pulse font-black uppercase tracking-widest">Chargement des succès...</div>;

  return (
    <div className="min-h-screen bg-twilight-950 p-4 pb-24">
      <div className="max-w-4xl mx-auto space-y-8">
        <button onClick={onBack} className="flex items-center gap-2 text-twilight-400 hover:text-white uppercase font-black text-xs tracking-widest transition-colors">
          <ArrowLeft size={16} /> Retour au Pokédex
        </button>

        <div className="bg-twilight-900 border border-twilight-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gold-champagne rounded-xl flex items-center justify-center shadow-lg">
              <Trophy size={24} className="text-twilight-950" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter uppercase italic text-white">
              Galerie des <span className="text-gold-champagne">Succès</span>
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((ach, index) => {
              const isLocked = !ach.unlocked;
              const isSecret = ach.secret && isLocked;

              return (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={ach.id}
                  className={`relative p-6 rounded-3xl border transition-all flex gap-4 ${
                    isLocked 
                    ? 'bg-twilight-950/50 border-twilight-800 opacity-60 grayscale' 
                    : 'bg-twilight-800 border-gold-champagne/30 shadow-xl grayscale-0'
                  }`}
                >
                  <div className={`w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center text-3xl ${isLocked ? 'bg-twilight-900' : 'bg-gold-champagne/10'}`}>
                    {isSecret ? <Lock size={24} className="text-twilight-700" /> : ach.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className={`font-black uppercase italic truncate ${isLocked ? 'text-twilight-500' : 'text-white'}`}>
                        {isSecret ? 'Succès Secret' : ach.title}
                      </h3>
                      {ach.unlocked && <Star size={14} className="text-gold-champagne fill-current" />}
                    </div>
                    <p className="text-[10px] font-bold text-twilight-600 uppercase tracking-widest mt-1">
                      {isSecret ? '???' : ach.description}
                    </p>
                    {ach.unlockedAt && (
                      <p className="text-[8px] font-black text-gold-champagne/50 uppercase tracking-tighter mt-2">
                        Débloqué le {new Date(ach.unlockedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
