/**
 * Traite les fichiers CSV pour la collection ShinyDex.
 */
export const csvProcessor = {
  /**
   * Parse un contenu CSV en tableau d'objets.
   */
  parse(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const results = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const entry = {};
      headers.forEach((header, index) => {
        entry[header] = values[index];
      });
      
      // Validation minimale
      if (entry.pokemon_id) {
        results.push({
          pokemon_id: entry.pokemon_id,
          game_id: entry.game_id || 'Inconnu',
          method_id: entry.method_id || 'Masuda',
          count: parseInt(entry.count) || 0,
          is_shiny: entry.is_shiny === 'true' || entry.is_shiny === '1' || true
        });
      }
    }
    return results;
  },

  /**
   * Convertit un tableau d'objets en chaîne CSV.
   */
  stringify(data) {
    const headers = ['pokemon_id', 'game_id', 'method_id', 'count', 'is_shiny'];
    const rows = data.map(entry => [
      entry.pokemon_id,
      entry.game_id,
      entry.method_id,
      entry.count,
      entry.is_shiny
    ].join(','));

    return [headers.join(','), ...rows].join('\n');
  },

  /**
   * Télécharge le contenu CSV sous forme de fichier.
   */
  download(csvText, filename = 'shinydex-export.csv') {
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
};
