import { create } from 'zustand';
import { supabase } from '../services/supabaseClient';

export const useUserStore = create((set) => ({
  profile: null,
  loading: false,
  fetchProfile: async (userId) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (!error && data) {
      set({ profile: data, loading: false });
    } else {
      // Si le profil n'existe pas encore, on le créera au besoin
      set({ loading: false });
    }
  },
  updateProfile: async (userId, updates) => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: userId, ...updates, updated_at: new Date() })
      .select()
      .single();
    
    if (!error && data) {
      set({ profile: data, loading: false });
      return { success: true };
    }
    set({ loading: false });
    return { success: false, error };
  }
}));
