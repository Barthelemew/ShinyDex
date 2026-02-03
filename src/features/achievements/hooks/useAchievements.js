import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { achievementService } from '../services/achievementService';
import achievementDefinitions from '../data/achievements.json';

export function useAchievements(userId) {
  const queryClient = useQueryClient();

  // On récupère la session pour savoir si on est en mode démo
  const { data: session } = useQuery({ queryKey: ['auth-session'], enabled: false });


  // Requête pour les succès débloqués
  const { data: userAchievements = [], isLoading } = useQuery({
    queryKey: ['userAchievements', userId],
    queryFn: () => achievementService.getUserAchievements(userId),
    enabled: !!userId,
  });

  const unlockMutation = useMutation({
    mutationFn: (achievementId) => achievementService.unlockAchievement(userId, achievementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userAchievements', userId] });
    },
  });

  const fullAchievements = achievementDefinitions.map(def => {
    const unlocked = userAchievements.find(ua => ua.achievement_id === def.id);
    return {
      ...def,
      unlocked: !!unlocked,
      unlockedAt: unlocked?.created_at
    };
  });

  return {
    achievements: fullAchievements,
    isLoading,
    unlockAchievement: unlockMutation.mutateAsync,
    isUnlocking: unlockMutation.isPending
  };
}
