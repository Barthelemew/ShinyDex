export const checkAchievements = (collection) => {
  const captured = collection.filter(p => p.captured);
  const count = captured.length;
  const unlockedIds = [];

  // 1. Première capture
  if (count >= 1) {
    unlockedIds.push('first_shiny');
  }

  // 2. Kanto Master (151)
  const kantoCaptured = captured.filter(p => {
    const id = parseInt(p.pokedexId || p.id);
    return id <= 151;
  }).length;
  if (kantoCaptured >= 151) {
    unlockedIds.push('kanto_master');
  }

  // 3. Centurion
  if (count >= 100) {
    unlockedIds.push('centurion');
  }

  // 4. Masuda Expert
  const masudaCount = captured.filter(p => p.details?.origin === 'Masuda').length;
  if (masudaCount >= 50) {
    unlockedIds.push('masuda_expert');
  }

  // 5. Hunter God
  if (count >= 1000) {
    unlockedIds.push('shiny_hunter_god');
  }

  return unlockedIds;
};