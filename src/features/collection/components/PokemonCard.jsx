import { motion } from 'framer-motion';
import { CheckCircle2, Ban } from 'lucide-react';

export default function PokemonCard({ pokemon, viewMode, isSelected, onClick }) {
  const vId = pokemon.pokedexId || pokemon.id;
  const imgId = pokemon.apiId || vId;
  const sUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/${imgId}.png`;
  const rUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${imgId}.png`;

  const trainer = pokemon.trainer;

  const getVersionColor = (version) => {
    if (!version) return 'text-amber-500/80';
    const v = version.toLowerCase();
    if (v.includes('violet')) return 'text-violet-400';
    if (v.includes('écarlate') || v.includes('scarlet')) return 'text-red-500';
    if (v.includes('go')) return 'text-cyan-400';
    if (v.includes('épée') || v.includes('sword')) return 'text-cyan-400';
    if (v.includes('bouclier') || v.includes('shield')) return 'text-magenta-500';
    if (v.includes('diamant') || v.includes('diamond')) return 'text-blue-300';
    if (v.includes('perle') || v.includes('pearl')) return 'text-pink-300';
    if (v.includes('platine') || v.includes('platinum')) return 'text-gray-300';
    if (v.includes('or') || v.includes('gold')) return 'text-yellow-400';
    if (v.includes('argent') || v.includes('silver')) return 'text-slate-300';
    if (v.includes('cristal') || v.includes('crystal')) return 'text-blue-200';
    if (v.includes('rubis') || v.includes('ruby')) return 'text-red-600';
    if (v.includes('saphir') || v.includes('sapphire')) return 'text-blue-600';
    if (v.includes('émeraude') || v.includes('emerald')) return 'text-green-500';
    if (v.includes('noir') || v.includes('black')) return 'text-gray-900';
    if (v.includes('blanc') || v.includes('white')) return 'text-gray-100';
    if (v.includes('soleil') || v.includes('sun')) return 'text-orange-400';
    if (v.includes('lune') || v.includes('moon')) return 'text-indigo-300';
    return 'text-amber-500/80';
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onClick}
        className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer border transition-all ${
          isSelected ? 'border-gold-champagne bg-gold-champagne/10 shadow-[0_0_15px_rgba(247,231,206,0.2)]' :
          pokemon.captured 
          ? 'bg-twilight-800 border-amber-500/40 shadow-lg' 
          : 'bg-twilight-900/50 border-twilight-800 hover:border-twilight-700'
        }`}
      >
        <div className="w-16 h-16 flex-shrink-0 bg-twilight-950 rounded-xl p-1 relative">
          <img 
            src={pokemon.captured ? sUrl : rUrl} 
            alt={pokemon.name}
            className={`w-full h-full object-contain ${!pokemon.captured && !isSelected && 'opacity-30 grayscale'}`}
            onError={(e) => { e.target.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'; }}
          />
          {isSelected && (
            <div className="absolute inset-0 flex items-center justify-center bg-gold-champagne/20 rounded-xl">
              <CheckCircle2 size={24} className="text-gold-champagne" />
            </div>
          )}
          {trainer && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border border-twilight-800 overflow-hidden bg-twilight-900 shadow-lg">
              {trainer.avatar_url ? (
                <img src={trainer.avatar_url} alt={trainer.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[8px] font-black text-white bg-twilight-700 uppercase">
                  {trainer.username.slice(0, 1)}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-twilight-600">#{String(vId).padStart(3, '0')}</span>
            <h3 className={`font-black uppercase italic truncate ${isSelected ? 'text-gold-champagne' : pokemon.captured ? 'text-gold-champagne' : 'text-twilight-400'}`}>
              {pokemon.name}
            </h3>
            {pokemon.shinyLocked && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-[7px] font-black uppercase tracking-tighter italic">
                <Ban size={8} /> Shiny Lock
              </span>
            )}
          </div>
          {pokemon.captured && (
            <div className="flex flex-wrap gap-2 mt-1">
              <span className={`text-[9px] font-black uppercase tracking-tighter italic ${getVersionColor(pokemon.details?.version)}`}>
                {pokemon.details?.version !== 'Multi-ajout' && pokemon.details?.version}
              </span>
              {trainer && (
                <span className="text-[9px] font-black text-twilight-500 uppercase tracking-tighter italic">
                  par {trainer.username}
                </span>
              )}
            </div>
          )}
        </div>
        {(pokemon.captured || isSelected) && (
          <div className="flex flex-col items-end gap-1">
            <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-gold-champagne' : 'bg-amber-500'} shadow-[0_0_10px_rgba(245,158,11,0.5)]`}></div>
            {pokemon.captured && pokemon.details?.encounters > 0 && (
              <span className="text-[10px] font-black text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-lg border border-amber-400/20 italic tabular-nums">
                {pokemon.details.encounters} {pokemon.details.encounters > 1 ? 'rencontres' : 'rencontre'}
              </span>
            )}
            {pokemon.totalCount > 1 && (
              <span className="bg-amber-500 text-twilight-950 text-[10px] font-black px-1.5 rounded-md italic">x{pokemon.totalCount}</span>
            )}
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={onClick}
      className={`group relative p-2 sm:p-3 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-300 border ${
        isSelected ? 'border-gold-champagne bg-gold-champagne/10 shadow-[0_0_20px_rgba(247,231,206,0.2)] scale-[1.02]' :
        pokemon.captured 
        ? 'bg-twilight-800 border-amber-500/40 shadow-lg' 
        : 'bg-twilight-800/30 border-twilight-800 hover:border-twilight-700'
      }`}
    >
      {pokemon.totalCount > 1 && (
        <div className="absolute top-2 left-2 z-10 bg-amber-500 text-twilight-950 text-[8px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg italic shadow-lg">
          x{pokemon.totalCount}
        </div>
      )}
      {pokemon.shinyLocked && (
        <div className="absolute top-2 right-2 z-10 text-red-500 bg-red-500/10 p-1 rounded-full border border-red-500/20 backdrop-blur-sm" title="Shiny Lock">
          <Ban size={12} />
        </div>
      )}
      <div className="aspect-square flex items-center justify-center mb-1 sm:mb-2 p-1 sm:p-2 relative">
        <img 
          src={pokemon.captured ? sUrl : rUrl} 
          alt={pokemon.name}
          loading="lazy"
          className={`w-full h-full object-contain transition-all duration-500 ${
            !pokemon.captured && !isSelected
            ? 'opacity-30 grayscale group-hover:grayscale-0 group-hover:opacity-100' 
            : 'drop-shadow-[0_5px_15px_rgba(255,255,255,0.15)]'
          }`}
          onError={(e) => { e.target.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png'; }}
        />
        {isSelected && (
          <div className="absolute top-0 right-0 p-1">
            <CheckCircle2 size={16} sm:size={18} className="text-gold-champagne fill-twilight-900" />
          </div>
        )}
        {trainer && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-twilight-800 overflow-hidden bg-twilight-900 shadow-lg z-20">
            {trainer.avatar_url ? (
              <img src={trainer.avatar_url} alt={trainer.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[6px] sm:text-[8px] font-black text-white bg-twilight-700 uppercase">
                {trainer.username?.slice(0, 1)}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="text-center">
        <p className={`font-black text-[9px] sm:text-[11px] truncate uppercase tracking-tighter ${
          isSelected ? 'text-gold-champagne' : pokemon.captured ? 'text-amber-400' : 'text-twilight-400'
        }`}>
          {pokemon.name}
        </p>
        <p className="text-[8px] sm:text-[9px] text-twilight-600 font-mono font-bold italic leading-none">#{String(vId).padStart(3, '0')}</p>
        {pokemon.captured && (
          <div className="mt-1 flex flex-col items-center">
             <span className={`text-[7px] sm:text-[8px] font-black uppercase tracking-tighter italic leading-none ${getVersionColor(pokemon.details?.version)}`}>
              {pokemon.details?.version !== 'Multi-ajout' && pokemon.details?.version}
            </span>
            {pokemon.details?.encounters > 0 && (
              <span className="text-[6px] sm:text-[7px] font-bold text-twilight-500 uppercase tracking-widest mt-0.5">
                {pokemon.details.encounters} rencontres
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
