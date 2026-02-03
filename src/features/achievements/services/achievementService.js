import { supabase } from '../../../services/supabaseClient';

export const achievementService = {
  /**
   * Récupère les succès débloqués par l'utilisateur.
   */
  async getUserAchievements(userId) {
    console.log("Chargement des succès pour :", userId);
    const { data, error } = await supabase
      .from('user_achievements')
      .select('achievement_id, created_at')
      .eq('user_id', userId);
    
    if (error) {
      console.error("Erreur chargement succès :", error);
      throw error;
    }
    return data;
  },

  /**
   * Débloque un succès pour l'utilisateur.
   */
  async unlockAchievement(userId, achievementId) {
    console.log("Tentative de déblocage succès :", achievementId, "pour :", userId);
    const { data, error } = await supabase
      .from('user_achievements')
      .upsert({
        user_id: userId,
        achievement_id: achievementId
      }, { onConflict: 'user_id, achievement_id' })
      .select()
      .single();
    
    if (error) {
      console.error("Erreur déblocage succès :", error);
      throw error;
    }
    return data;
  }
};
