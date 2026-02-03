import { useQuery } from '@tanstack/react-query';
import { teamService } from '../services/teamService';

export function useTeamCollection(teamId) {
  const { data: teamCollection = [], isLoading, error } = useQuery({
    queryKey: ['teamCollection', teamId],
    queryFn: () => teamService.getTeamCollection(teamId),
    enabled: !!teamId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    teamCollection,
    isLoading,
    error
  };
}
