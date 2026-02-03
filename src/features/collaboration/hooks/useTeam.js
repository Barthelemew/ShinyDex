import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamService } from '../services/teamService';

export function useTeam(userId) {
  const queryClient = useQueryClient();

  // Requête pour l'équipe de l'utilisateur
  const { data: team, isLoading: teamLoading } = useQuery({
    queryKey: ['team', userId],
    queryFn: () => teamService.getMyTeam(userId),
    enabled: !!userId,
  });

  // Requête pour les membres de l'équipe
  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['teamMembers', team?.id],
    queryFn: () => teamService.getTeamMembers(team.id),
    enabled: !!team?.id,
  });

  // Mutation pour créer une équipe
  const createTeamMutation = useMutation({
    mutationFn: (name) => teamService.createTeam(userId, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', userId] });
    },
  });

  // Mutation pour rejoindre une équipe
  const joinTeamMutation = useMutation({
    mutationFn: (code) => teamService.joinTeam(userId, code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', userId] });
    },
  });

  // Mutation pour quitter une équipe
  const leaveTeamMutation = useMutation({
    mutationFn: (teamId) => teamService.leaveTeam(userId, teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team', userId] });
      queryClient.setQueryData(['teamMembers', team?.id], []);
    },
  });

  return {
    team,
    members,
    isLoading: teamLoading || membersLoading,
    createTeam: createTeamMutation.mutateAsync,
    joinTeam: joinTeamMutation.mutateAsync,
    leaveTeam: leaveTeamMutation.mutateAsync,
    isCreating: createTeamMutation.isPending,
    isJoining: joinTeamMutation.isPending,
    isLeaving: leaveTeamMutation.isPending,
  };
}
