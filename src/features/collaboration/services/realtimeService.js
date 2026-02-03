import { supabase } from '../../../services/supabaseClient';

export const realtimeService = {
  /**
   * Rejoint le canal d'une équipe pour écouter les événements Broadcast.
   */
  subscribeToTeam(teamId, onEvent) {
    const channel = supabase.channel(`team:${teamId}`, {
      config: {
        broadcast: { self: true },
      },
    });

    channel
      .on('broadcast', { event: 'shared_hunt_started' }, ({ payload }) => {
        onEvent('shared_hunt_started', payload);
      })
      .on('broadcast', { event: 'hunt_increment' }, ({ payload }) => {
        onEvent('hunt_increment', payload);
      })
      .on('broadcast', { event: 'shiny_found' }, ({ payload }) => {
        onEvent('shiny_found', payload);
      })
      .subscribe();

    return channel;
  },

  /**
   * Diffuse le début d'une chasse partagée.
   */
  broadcastHuntStart(channel, sessionData) {
    channel.send({
      type: 'broadcast',
      event: 'shared_hunt_started',
      payload: sessionData,
    });
  },

  /**
   * Diffuse l'incrémentation du compteur.
   */
  broadcastIncrement(channel, userId, count) {
    channel.send({
      type: 'broadcast',
      event: 'hunt_increment',
      payload: { userId, count },
    });
  },

  /**
   * Diffuse la découverte d'un Shiny.
   */
  broadcastShinyFound(channel, userId, trainerName, pokemonName) {
    channel.send({
      type: 'broadcast',
      event: 'shiny_found',
      payload: { userId, trainerName, pokemonName },
    });
  }
};
