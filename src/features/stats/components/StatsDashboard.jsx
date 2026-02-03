import React, { useMemo, useState } from 'react';
import { ArrowLeft, Trophy, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
// Chart imports removed as unused for now


export default function StatsDashboard({ fullCollection, onBack }) {
  const [methodFilter, setMethodFilter] = useState('all');

  const stats = useMemo(() => {
    const total = fullCollection.length;
    const filtered = methodFilter === 'all' 
      ? fullCollection 
      : fullCollection.filter(p => p.details?.origin === methodFilter);
    
    const captured = filtered.filter(p => p.captured).length;
    const percent = total > 0 ? ((captured / total) * 100).toFixed(1) : 0;

    // Stats par génération
    const gens = {};
    const getGenId = (id) => {
      const n = parseInt(id);
      if (n <= 151) return 1;
      if (n <= 251) return 2;
      if (n <= 386) return 3;
      if (n <= 493) return 4;
      if (n <= 649) return 5;
      if (n <= 721) return 6;
      if (n <= 809) return 7;
      if (n <= 905) return 8;
      return 9;
    };

    fullCollection.forEach(p => {
      const g = getGenId(p.pokedexId || p.id);
      if (!gens[g]) gens[g] = { total: 0, captured: 0 };
      gens[g].total++;
      if (p.captured && (methodFilter === 'all' || p.details?.origin === methodFilter)) {
        gens[g].captured++;
      }
    });

    // Stats par méthode (pour le filtre)
    const methods = {};
    fullCollection.forEach(p => {
      if (p.captured && p.details?.origin) {
        methods[p.details.origin] = (methods[p.details.origin] || 0) + 1;
      }
    });

    return { total, captured, percent, gens, methods };
  }, [fullCollection, methodFilter]);

  return (
    <div className="min-h-screen bg-twilight-950 p-4 pb-24">
      <div className="max-w-4xl mx-auto space-y-8">
        <button onClick={onBack} className="flex items-center gap-2 text-twilight-400 hover:text-white uppercase font-black text-xs tracking-widest transition-colors">
          <ArrowLeft size={16} /> Retour au Pokédex
        </button>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Main Card */}
          <div className="flex-1 bg-twilight-900 border border-twilight-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Trophy size={120} className="text-gold-champagne" />
            </div>
            
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] block mb-2 text-center md:text-left">Progression Globale</span>
            <div className="flex flex-col items-center md:items-start">
              <h2 className="text-7xl font-black text-white tracking-tighter mb-4 italic">
                {stats.percent}<span className="text-3xl text-gold-champagne">%</span>
              </h2>
              <p className="text-twilight-400 font-bold uppercase text-xs tracking-widest">
                {stats.captured} Pokémon trouvés sur {stats.total}
              </p>
            </div>

            <div className="mt-8 h-3 bg-twilight-950 rounded-full overflow-hidden border border-twilight-800">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${stats.percent}%` }}
                className="h-full bg-gradient-to-r from-amber-500 to-orange-600 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
              ></motion.div>
            </div>
          </div>

          {/* Filters Card */}
          <div className="w-full md:w-72 bg-twilight-900 border border-twilight-800 rounded-[2.5rem] p-8 shadow-2xl">
            <h3 className="text-xs font-black text-white uppercase italic mb-6 flex items-center gap-2">
              <Filter size={16} className="text-gold-champagne" /> Filtres
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[9px] font-black text-twilight-500 uppercase tracking-widest mb-2 ml-1">Méthode de shasse</label>
                <select 
                  className="w-full bg-twilight-950 border border-twilight-800 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-amber-500 transition-all appearance-none"
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                >
                  <option value="all">Toutes les méthodes</option>
                  {Object.keys(stats.methods).map(m => (
                    <option key={m} value={m}>{m} ({stats.methods[m]})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Generations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(stats.gens).map(([gen, data]) => {
            const p = ((data.captured / data.total) * 100).toFixed(1);
            return (
              <motion.div 
                whileHover={{ scale: 1.02 }}
                key={gen} 
                className="bg-twilight-900 border border-twilight-800 rounded-3xl p-6 shadow-xl"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[9px] font-black text-twilight-500 uppercase tracking-widest">Génération</span>
                    <h4 className="text-2xl font-black text-white italic">GEN {gen}</h4>
                  </div>
                  <span className="text-lg font-black text-gold-champagne">{p}%</span>
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-1.5 bg-twilight-950 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: `${p}%` }}></div>
                  </div>
                  <span className="text-[10px] font-bold text-twilight-400 tabular-nums">{data.captured}/{data.total}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
