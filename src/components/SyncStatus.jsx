import React from 'react';
import { Cloud, CloudOff, RefreshCw } from 'lucide-react';

const SyncStatus = ({ isSyncing, isOffline }) => {
  if (isOffline) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-full text-red-400" title="Mode Hors-ligne">
        <CloudOff size={14} />
        <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">Hors-ligne</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all border ${
      isSyncing 
      ? 'bg-gold-champagne/10 border-gold-champagne/30 text-gold-champagne' 
      : 'bg-twilight-800 border-twilight-700 text-twilight-500'
    }`}>
      {isSyncing ? (
        <RefreshCw size={14} className="animate-spin" />
      ) : (
        <Cloud size={14} />
      )}
      <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">
        {isSyncing ? 'Synchronisation' : 'À jour'}
      </span>
    </div>
  );
};

export default SyncStatus;
