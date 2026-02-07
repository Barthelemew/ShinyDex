import { supabase } from '../../../services/supabaseClient';

export const teamService = {
  async getMyTeam(userId) {
    const { data, error } = await supabase
      .from('team_members')
      .select('team_id, teams (*)')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    return data?.teams || null;
  },

  async createTeam(userId, teamName) {
    const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .insert({ name: teamName, owner_id: userId, invite_code: inviteCode })
      .select().single();
    if (teamError) throw teamError;

    const { error: memberError } = await supabase
      .from('team_members')
      .insert({ team_id: team.id, user_id: userId, role: 'admin' });
    if (memberError) throw memberError;
    return team;
  },

  async getTeamMembers(teamId) {
    const { data, error } = await supabase
      .from('team_members')
      .select('user_id, role, profiles (username, avatar_url)')
      .eq('team_id', teamId);
    if (error) throw error;
    return data;
  },

  async joinTeam(userId, inviteCode) {
    const { data: team, error: teamError } = await supabase
      .from('teams').select('id').eq('invite_code', inviteCode).single();
    if (teamError) throw new Error("Code d'invitation invalide.");

    const { error: memberError } = await supabase
      .from('team_members')
      .insert({ team_id: team.id, user_id: userId, role: 'member' });
    if (memberError) {
      if (memberError.code === '23505') throw new Error("Déjà membre.");
      throw memberError;
    }
    return team;
  },

  async getTeamCollection(teamId) {
    if (!teamId) return [];
    
    // 1. Récupérer TOUS les membres sans exception
    const { data: memberData, error: memberError } = await supabase
      .from('team_members')
      .select('user_id')
      .eq('team_id', teamId);
    
    if (memberError) throw memberError;
    const memberIds = (memberData || []).map(m => m.user_id);

    if (memberIds.length === 0) return [];

    // 2. Récupérer TOUTE la collection pour TOUS les IDs trouvés
    // On utilise une limite très haute et on s'assure que memberIds est propre
    const { data: collection, error: collectionError } = await supabase
      .from('collection')
      .select('*')
      .in('user_id', memberIds)
      .order('created_at', { ascending: false })
      .limit(10000); // Sécurité maximale
    
    if (collectionError) throw collectionError;
    return collection || [];
  }
};