import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUIStore = create(
  persist(
    (set) => ({
      viewMode: 'grid', // 'grid' or 'list'
      selectionMode: false,
      selectedIds: [],
      toggleViewMode: () => set((state) => ({ 
        viewMode: state.viewMode === 'grid' ? 'list' : 'grid' 
      })),
      setSelectionMode: (enabled) => set({ 
        selectionMode: enabled, 
        selectedIds: enabled ? [] : [] 
      }),
      toggleIdSelection: (id) => set((state) => ({
        selectedIds: state.selectedIds.includes(id)
          ? state.selectedIds.filter(i => i !== id)
          : [...state.selectedIds, id]
      })),
      clearSelection: () => set({ selectedIds: [] }),
      setViewMode: (mode) => set({ viewMode: mode }),
    }),
    {
      name: 'shinydex-ui-storage',
    }
  )
);
