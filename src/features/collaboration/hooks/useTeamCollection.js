import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { teamService } from '../services/teamService';
import { realtimeService } from '../services/realtimeService';

export function useTeamCollection(teamId) {
  const queryClient = useQueryClient();

  const { data: teamCollection = [], isLoading, error } = useQuery({
    queryKey: ['teamCollection', teamId],
    queryFn: () => teamService.getTeamCollection(teamId),
    enabled: !!teamId,
    staleTime: 1000 * 30, // 30 secondes au lieu de 5 minutes
  });

  useEffect(() => {
    if (!teamId) return;

    const channel = realtimeService.subscribeToTeam(teamId, (event) => {
      if (event === 'collection_updated' || event === 'shiny_found') {
        queryClient.invalidateQueries({ queryKey: ['teamCollection', teamId] });
      }
    });

    return () => {
      channel.unsubscribe();
    };
  }, [teamId, queryClient]);

  return {
    teamCollection,
    isLoading,
    error
  };
}
