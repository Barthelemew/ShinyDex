import React, { useState } from 'react';
import { Trash2, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHapticFeedback } from '../../../hooks/useHapticFeedback';
import ConfirmModal from '../../../components/ConfirmModal';

const PokemonDetailModal = ({ pokemon, onClose, onSave, onDelete }) => {
  const { trigger } = useHapticFeedback();
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  
  return (
    <AnimatePresence>
      <div 
        onClick={() => { trigger('LIGHT'); onClose(); }}
        className="fixed inset-0 bg-twilight-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
      >
        <motion.div 
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-twilight-900 w-full max-w-xl max-h-[90vh] rounded-3xl border border-twilight-800 shadow-2xl overflow-y-auto scrollbar-hide"
        >
          <PokemonForm 
            key={selectedEntryId || 'new'} 
            pokemon={pokemon}
            selectedEntryId={selectedEntryId}
            setSelectedEntryId={setSelectedEntryId}
            onClose={onClose}
            onSave={onSave}
            onDelete={onDelete}
            trigger={trigger}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const PokemonForm = ({ pokemon, selectedEntryId, setSelectedEntryId, onClose, onSave, onDelete, trigger }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const currentEntry = selectedEntryId 
    ? pokemon.entries?.find(e => e.id === selectedEntryId) 
    : null;

  const [encounters, setEncounters] = useState(currentEntry?.count || 0);
  const [selectedVersion, setSelectedVersion] = useState(currentEntry?.game_id || '');
  const [method, setMethod] = useState(currentEntry?.method_id || 'Masuda');

  const versions = [
    "Légendes Z-A", "Écarlate", "Violet", "Légendes Arceus", "DEPS", "Épée", "Bouclier", 
    "Let's Go P/E", "Ultra-Soleil", "Ultra-Lune", "Soleil", "Lune", "ROSA", "X", "Y", 
    "Noir 2", "Blanc 2", "Noir", "Blanc", "HGSS", "Platine", "Diamant", "Perle", 
    "RFVF", "Émeraude", "Rubis", "Saphir", "Cristal", "Or", "Argent", "Jaune", "Bleu", "Rouge"
  ];

  const methods = ["Masuda", "Rencontres", "Reset", "Raids", "Hordes", "Chaine", "Éclosion", "Dynamax", "Expédition"];
  const shinySpriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/shiny/${pokemon.pokedexId}.png`;

  const handleSave = () => {
    trigger('SUCCESS');
    onSave(pokemon.id, { 
      id: selectedEntryId,
      encounters, 
      version: selectedVersion, 
      origin: method 
    });
    onClose();
  };

  return (
    <>
      <div className="p-4 sm:p-6 flex flex-col items-center bg-twilight-800/50 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-twilight-400 hover:text-white transition-colors"><X size={20} /></button>
        <img src={shinySpriteUrl} alt={pokemon.name} className="w-20 h-20 sm:w-32 sm:h-32 object-contain" />
        <h2 className="text-xl sm:text-2xl font-black text-white mt-1 sm:mt-2 uppercase italic">{pokemon.name}</h2>
      </div>

      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {pokemon.captured && (
          <div className="space-y-2">
            <label className="text-[9px] sm:text-[10px] font-black text-twilight-500 uppercase tracking-widest">Vos spécimens</label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <button 
                onClick={() => setSelectedEntryId(null)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border flex items-center gap-2 flex-shrink-0 transition-all text-[10px] sm:text-xs ${!selectedEntryId ? 'bg-amber-500 border-amber-500 text-twilight-950' : 'bg-twilight-950 border-twilight-800 text-twilight-400'}`}
              >
                <Plus size={12} /> Nouveau
              </button>
              {pokemon.entries?.map((entry, idx) => (
                <button 
                  key={entry.id}
                  onClick={() => setSelectedEntryId(entry.id)}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border flex-shrink-0 transition-all text-[10px] sm:text-xs ${selectedEntryId === entry.id ? 'bg-white text-twilight-950 border-white' : 'bg-twilight-800 border-twilight-700 text-twilight-500'}`}
                >
                  Shiny n°{idx + 1}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between bg-twilight-950 p-3 sm:p-4 rounded-2xl border border-twilight-800">
          <span className="text-[9px] sm:text-[10px] font-black text-twilight-400 uppercase">Compteur</span>
          <div className="flex items-center gap-4">
            <button onClick={() => setEncounters(Math.max(0, encounters - 1))} className="w-8 h-8 rounded-lg bg-twilight-800">-</button>
            <span className="text-lg sm:text-xl font-black text-amber-500">{encounters}</span>
            <button onClick={() => setEncounters(encounters + 1)} className="w-8 h-8 rounded-lg bg-amber-500 text-twilight-950">+</button>
          </div>
        </div>

        <div>
          <label className="text-[9px] sm:text-[10px] font-black text-twilight-500 uppercase block mb-2">Version</label>
          <div className="flex flex-wrap gap-1.5 sm:gap-2 max-h-20 sm:max-h-24 overflow-y-auto p-1 scrollbar-hide">
            {versions.map(v => (
              <button key={v} onClick={() => setSelectedVersion(v)} className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[8px] sm:text-[9px] font-bold border transition-all ${selectedVersion === v ? 'bg-amber-500 border-amber-500 text-twilight-950' : 'bg-twilight-800 border-twilight-700 text-twilight-400'}`}>{v}</button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[9px] sm:text-[10px] font-black text-twilight-500 uppercase block mb-2">Méthode</label>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {methods.map(m => (
              <button key={m} onClick={() => setMethod(m)} className={`py-1.5 sm:py-2 rounded-lg text-[8px] sm:text-[9px] font-bold border transition-all ${method === m ? 'bg-white text-twilight-950 border-white' : 'bg-twilight-800 border-twilight-700 text-twilight-400'}`}>{m}</button>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-1 sm:pt-2">
          <button 
            onClick={handleSave}
            disabled={!selectedVersion}
            className="flex-1 py-3 sm:py-4 bg-amber-500 text-twilight-950 rounded-xl font-black uppercase text-[10px] sm:text-xs disabled:opacity-30"
          >
            {selectedEntryId ? 'Enregistrer' : 'Valider'}
          </button>
          {selectedEntryId && (
            <button onClick={() => { trigger('MEDIUM'); setShowDeleteConfirm(true); }} className="px-3 sm:px-4 py-3 sm:py-4 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20"><Trash2 size={16} /></button>
          )}
        </div>
      </div>

      <ConfirmModal 
        isOpen={showDeleteConfirm}
        title="Supprimer ?"
        message="Voulez-vous vraiment retirer ce spécimen de votre collection ? Cette action est irréversible."
        confirmText="Supprimer"
        onConfirm={() => { onDelete(selectedEntryId); onClose(); setShowDeleteConfirm(false); }}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};

export default PokemonDetailModal;
