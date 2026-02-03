import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collectionService } from '../services/collectionService';

export function useCollection(userId) {
  const queryClient = useQueryClient();

  // Requête pour récupérer la collection
  const { data: collection = [], isLoading, error } = useQuery({
    queryKey: ['collection', userId],
    queryFn: () => collectionService.getCollection(userId),
    enabled: !!userId,
  });

  // Mutation pour ajouter/modifier
  const upsertMutation = useMutation({
    mutationFn: (pokemonData) => collectionService.upsertPokemon({ ...pokemonData, user_id: userId }),
    onMutate: async (newPokemon) => {
      // Annuler les refetches en cours pour ne pas écraser l'optimistic update
      await queryClient.cancelQueries({ queryKey: ['collection', userId] });

      // Sauvegarder l'ancienne valeur
      const previousCollection = queryClient.getQueryData(['collection', userId]);

      // Mise à jour optimiste du cache
      queryClient.setQueryData(['collection', userId], (old = []) => {
        // Si on a un ID, on met à jour le spécimen existant
        if (newPokemon.id && !String(newPokemon.id).startsWith('temp-')) {
          const index = old.findIndex(p => p.id === newPokemon.id);
          if (index > -1) {
            const updated = [...old];
            updated[index] = { ...updated[index], ...newPokemon };
            return updated;
          }
        }
        // Sinon (ou si pas trouvé), on ajoute un nouveau spécimen (doublon)
        return [...old, { ...newPokemon, id: 'temp-' + Date.now() }];
      });

      return { previousCollection };
    },
    onError: (err, newPokemon, context) => {
      console.error("Erreur lors de l'upsert Supabase :", err);
      // En cas d'erreur, on restaure la collection précédente
      queryClient.setQueryData(['collection', userId], context.previousCollection);
    },
    onSettled: () => {
      // On invalide le cache pour synchroniser avec le serveur
      queryClient.invalidateQueries({ queryKey: ['collection', userId] });
    },
  });

  // Mutation pour supprimer
  const deleteMutation = useMutation({
    mutationFn: (id) => collectionService.deletePokemon(id, userId),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['collection', userId] });
      const previousCollection = queryClient.getQueryData(['collection', userId]);

      queryClient.setQueryData(['collection', userId], (old) => 
        old.filter(p => p.id !== id)
      );

      return { previousCollection };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['collection', userId], context.previousCollection);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['collection', userId] });
    },
  });

  // Mutation pour l'import massif
  const bulkUpsertMutation = useMutation({
    mutationFn: (dataList) => {
      const formatted = dataList.map(d => ({ ...d, user_id: userId }));
      return collectionService.upsertPokemon(formatted);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection', userId] });
    }
  });

  return {
    collection,
    isLoading,
    error,
    upsertPokemon: upsertMutation.mutate,
    deletePokemon: deleteMutation.mutate,
    importCollection: bulkUpsertMutation.mutateAsync,
    isSyncing: upsertMutation.isPending || deleteMutation.isPending || bulkUpsertMutation.isPending
  };
}
