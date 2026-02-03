import React, { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import { csvProcessor } from '../logic/csvProcessor';
import { useHapticFeedback } from '../../../hooks/useHapticFeedback';

export default function ImportExportActions({ collection, onImport }) {
  const { trigger } = useHapticFeedback();
  const fileInputRef = useRef(null);

  const handleExport = () => {
    trigger('MEDIUM');
    const csv = csvProcessor.stringify(collection);
    csvProcessor.download(csv, `shinydex-export-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleImportClick = () => {
    trigger('LIGHT');
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const data = csvProcessor.parse(text);
      if (data.length > 0) {
        if (window.confirm(`Importer ${data.length} Pokémon dans votre collection ?`)) {
          trigger('SUCCESS');
          await onImport(data);
          alert('Importation réussie !');
        }
      } else {
        alert('Le fichier CSV semble vide ou mal formé.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  return (
    <div className="flex items-center gap-2">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".csv" 
        className="hidden" 
      />
      
      <button 
        onClick={handleExport}
        className="flex items-center gap-2 px-3 py-2 bg-twilight-800 hover:bg-twilight-700 border border-twilight-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-twilight-400 transition-all"
        title="Exporter en CSV"
      >
        <Download size={14} /> <span className="hidden sm:inline">Export</span>
      </button>

      <button 
        onClick={handleImportClick}
        className="flex items-center gap-2 px-3 py-2 bg-twilight-800 hover:bg-gold-champagne/10 border border-twilight-700 hover:border-gold-champagne/30 rounded-xl text-[10px] font-black uppercase tracking-widest text-twilight-400 hover:text-gold-champagne transition-all"
        title="Importer un CSV"
      >
        <Upload size={14} /> <span className="hidden sm:inline">Import</span>
      </button>
    </div>
  );
}
