import { supabase } from '../../../services/supabaseClient';

export const teamService = {
  /**
   * Récupère l'équipe actuelle de l'utilisateur (où il est membre).
   */
  async getMyTeam(userId) {
    const { data, error } = await supabase
      .from('team_members')
      .select('team_id, teams (*)')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    return data?.teams || null;
  },

  /**
   * Crée une nouvelle équipe et ajoute le créateur comme admin.
   */
  async createTeam(userId, teamName) {
    // 1. Générer un code d'invitation unique (8 caractères)
    const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    // 2. Créer l'équipe
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({
        name: teamName,
        owner_id: userId,
        invite_code: inviteCode
      })
      .select()
      .single();

    if (teamError) throw teamError;

    // 3. Ajouter le créateur comme membre admin
    const { error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: userId,
        role: 'admin'
      });

    if (memberError) throw memberError;

    return team;
  },

  /**
   * Récupère les membres d'une équipe.
   */
  async getTeamMembers(teamId) {
    const { data, error } = await supabase
      .from('team_members')
      .select('user_id, role, profiles (username, avatar_url)')
      .eq('team_id', teamId);
    
    if (error) throw error;
    return data;
  },

  /**
   * Rejoint une équipe via un code d'invitation.
   */
  async joinTeam(userId, inviteCode) {
    // 1. Trouver l'équipe par son code
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id')
      .eq('invite_code', inviteCode)
      .single();

    if (teamError) throw new Error("Code d'invitation invalide.");

    // 2. Ajouter l'utilisateur comme membre
    const { error: memberError } = await supabase
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: userId,
        role: 'member'
      });

    if (memberError) {
      if (memberError.code === '23505') throw new Error("Vous faites déjà partie de cette équipe.");
      throw memberError;
    }

    return team;
  },

  /**
   * Quitte une équipe.
   */
  async leaveTeam(userId, teamId) {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId);
    
    if (error) throw error;
    return true;
  },

  /**
   * Récupère la collection consolidée de tous les membres de l'équipe.
   */
  async getTeamCollection(teamId) {
    // 1. Récupérer les IDs des membres
    const { data: memberData, error: memberError } = await supabase
      .from('team_members')
      .select('user_id')
      .eq('team_id', teamId);
    
    if (memberError) throw memberError;
    const memberIds = memberData.map(m => m.user_id);

    // 2. Récupérer toutes les captures de ces membres
    const { data: collection, error: collectionError } = await supabase
      .from('collection')
      .select('*, profiles (username, avatar_url)')
      .in('user_id', memberIds);
    
    if (collectionError) throw collectionError;
    return collection;
  }
};
