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
      .from('teams').insert({ name: teamName, owner_id: userId, invite_code: inviteCode }).select().single();
    if (teamError) throw teamError;
    const { error: memberError } = await supabase
      .from('team_members').insert({ team_id: team.id, user_id: userId, role: 'admin' });
    if (memberError) throw memberError;
    return team;
  },

  async getTeamMembers(teamId) {
    const { data, error } = await supabase
      .from('team_members')
      .select('user_id, role, profiles (username, avatar_url)')
      .eq('team_id', teamId)
      .limit(1000);
    if (error) throw error;
    return data;
  },

  async joinTeam(userId, inviteCode) {
    const { data: team, error: teamError } = await supabase
      .from('teams').select('id').eq('invite_code', inviteCode).single();
    if (teamError) throw new Error("Code invalide.");
    const { error: memberError } = await supabase
      .from('team_members').insert({ team_id: team.id, user_id: userId, role: 'member' });
    if (memberError) throw memberError;
    return team;
  },

  async getTeamCollection(teamId) {
    if (!teamId) return [];
    
    // 1. Récupérer les IDs des membres
    const { data: memberData, error: memberError } = await supabase
      .from('team_members').select('user_id').eq('team_id', teamId).limit(1000);
    if (memberError) throw memberError;
    const memberIds = (memberData || []).map(m => m.user_id);
    if (memberIds.length === 0) return [];

    // 2. Récupération par tranches (bypass la limite des 1000)
    // On fait deux requêtes de 1000 pour couvrir jusqu'à 2000 entrées d'équipe
    const fetchRange = async (from, to) => {
      const { data, error } = await supabase
        .from('collection')
        .select('*')
        .in('user_id', memberIds)
        .range(from, to)
        .order('id', { ascending: true });
      if (error) throw error;
      return data || [];
    };

    try {
      const [chunk1, chunk2] = await Promise.all([
        fetchRange(0, 999),
        fetchRange(1000, 1999)
      ]);
      const fullTeamCollection = [...chunk1, ...chunk2];
      console.log(`[TeamService] Total récupéré: ${fullTeamCollection.length} lignes`);
      return fullTeamCollection;
    } catch (err) {
      console.error("Erreur lors de la récupération paginée:", err);
      return [];
    }
  }
};
