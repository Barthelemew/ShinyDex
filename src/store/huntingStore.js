import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useHuntingStore = create(
  persist(
    (set, get) => ({
      sessions: [], // Liste des sessions (max 10)
      activeSessionId: null, // ID de la session actuellement affichée à l'écran

      // Ajouter une nouvelle session
      startSession: (config) => {
        const { sessions } = get();
        if (sessions.length >= 10) return false;

        const newSession = {
          ...config,
          id: Date.now().toString(),
          count: 0,
          startTime: new Date().toISOString(),
        };

        set({ 
          sessions: [...sessions, newSession],
          activeSessionId: newSession.id 
        });
        return true;
      },

      // Incrémenter le compteur de la session active
      incrementCount: () => {
        const { sessions, activeSessionId } = get();
        set({
          sessions: sessions.map(s => 
            s.id === activeSessionId ? { ...s, count: s.count + 1 } : s
          )
        });
      },

      // Décrémenter
      decrementCount: () => {
        const { sessions, activeSessionId } = get();
        set({
          sessions: sessions.map(s => 
            s.id === activeSessionId ? { ...s, count: Math.max(0, s.count - 1) } : s
          )
        });
      },

      // Changer de session active
      setActiveSession: (id) => set({ activeSessionId: id }),

      // Arrêter/Supprimer une session
      stopSession: (id) => {
        const { sessions, activeSessionId } = get();
        const targetId = id || activeSessionId;
        const newSessions = sessions.filter(s => s.id !== targetId);
        
        set({ 
          sessions: newSessions,
          activeSessionId: newSessions.length > 0 ? newSessions[0].id : null
        });
      },

      // Récupérer la session active réelle
      getActiveSession: () => {
        const { sessions, activeSessionId } = get();
        return sessions.find(s => s.id === activeSessionId) || null;
      }
    }),
    {
      name: 'hunting-storage',
    }
  )
);