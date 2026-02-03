import { supabase } from '../../../services/supabaseClient';

export const invitationService = {
  // Recherche d'utilisateurs par pseudo (floue)
  async searchUsers(query) {
    if (!query || query.length < 3) return [];
    
    // Utilise la fonction RPC search_profiles définie en DB pour gérer unaccent
    const { data, error } = await supabase
      .rpc('search_profiles', { search_term: query });

    if (error) {
      console.error('Erreur recherche utilisateurs:', error);
      // Fallback si la RPC n'existe pas ou échoue : recherche simple
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', `%${query}%`)
        .limit(10);
        
      if (fallbackError) throw fallbackError;
      return fallbackData;
    }

    return data;
  },

  // Envoyer une invitation
  async sendInvite(teamId, invitedUserId, inviterUserId) {
    const { data, error } = await supabase
      .from('team_invitations')
      .insert([
        { 
          team_id: teamId, 
          invited_user_id: invitedUserId,
          inviter_user_id: inviterUserId
        }
      ])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') throw new Error('Cet utilisateur a déjà été invité.');
      throw error;
    }
    return data;
  },

  // Récupérer mes invitations reçues
  async getMyInvites(userId) {
    const { data, error } = await supabase
      .from('team_invitations')
      .select(`
        *,
        teams:team_id (name),
        inviter:inviter_user_id (username)
      `)
      .eq('invited_user_id', userId)
      .eq('status', 'pending');

    if (error) throw error;
    return data;
  },

  // Répondre à une invitation
  async respondToInvite(inviteId, accept) {
    const status = accept ? 'accepted' : 'rejected';
    
    // 1. Mettre à jour le statut de l'invitation
    const { data: invite, error: updateError } = await supabase
      .from('team_invitations')
      .update({ status })
      .eq('id', inviteId)
      .select()
      .single();

    if (updateError) throw updateError;

    // 2. Si accepté, ajouter l'utilisateur à l'équipe
    if (accept) {
      const { error: memberError } = await supabase
        .from('team_members')
        .insert([
          { 
            team_id: invite.team_id, 
            user_id: invite.invited_user_id,
            role: 'member'
          }
        ]);

      if (memberError) throw memberError;
    }

    return invite;
  }
};
