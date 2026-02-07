import { supabase } from '../../../services/supabaseClient';

export const collectionService = {
  async getCollection(userId) {
    const { data, error } = await supabase
      .from('collection')
      .select('*')
      .eq('user_id', userId)
      .limit(5000); // Augmente la limite de 1000 Ã  5000 lignes
    
    if (error) throw error;
    return data;
  },

  async upsertPokemon(pokemonData) {
    const isArray = Array.isArray(pokemonData);
    
    if (isArray) {
      const payload = pokemonData.map(p => {
        const item = { ...p };
        if (!item.id || String(item.id).startsWith('temp-')) delete item.id;
        return item;
      });
      const { data, error } = await supabase.from('collection').upsert(payload).select();
      if (error) throw error;
      return data;
    } else {
      const isNew = !pokemonData.id || String(pokemonData.id).startsWith('temp-');
      const payload = { ...pokemonData };
      if (isNew) delete payload.id;
      const { data, error } = await supabase.from('collection').upsert(payload).select();
      if (error) throw error;
      return data[0];
    }
  },

  async deletePokemon(id, userId) {
    const { error } = await supabase
      .from('collection')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);
    
    if (error) throw error;
    return true;
  }
};
