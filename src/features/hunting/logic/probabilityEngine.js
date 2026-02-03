import probData from '../data/probabilities.json';

/**
 * Calcule le taux de probabilité actuel (1/X) pour une session de chasse.
 */
export const calculateCurrentRate = (session) => {
  const { gameId, methodId, count, hasCharm, modifiers = {} } = session;
  const method = probData.methods[methodId];
  const game = probData.games[gameId];

  if (!method || !game) return game?.base_shiny_rate || 4096;

  let rolls = 1; // Nombre de tentatives (rolls) pour un shiny

  // Bonus de Charme Chroma
  if (hasCharm) rolls += 2;

  // Logique spécifique aux méthodes et jeux
  switch (methodId) {
    case 'Masuda':
      rolls = hasCharm ? 8 : 6;
      return Math.floor(4096 / rolls);

    case 'Sandwich':
      if (modifiers.sandwichLvl === 3) rolls += 3;
      return Math.floor(4096 / rolls);

    case 'Recherche':
      if (modifiers.researchLevel === 'completed') rolls += 1;
      if (modifiers.researchLevel === 'perfect') rolls += 3;
      if (modifiers.massiveOutbreak) rolls += 25;
      return Math.floor(4096 / rolls);

    case 'SOS Battle':
    case 'Combo Capture': {
      const chain = method.chains.slice().reverse().find(c => count >= c.min);
      return chain ? chain.rate : method.base_rate;
    }

    case 'Hordes':
      return Math.floor(4096 / (rolls * 5));

    default:
      return Math.floor(4096 / rolls);
  }
};

/**
 * Calcule la probabilité cumulée.
 */
export const calculateCumulativeProbability = (rate, count) => {
  if (count === 0) return 0;
  const p = 1 / rate;
  const cumulative = 1 - Math.pow(1 - p, count);
  return (cumulative * 100).toFixed(2);
};

/**
 * Calcule le facteur de chance (Luck Factor).
 * < 1 : Chanceux | 1 : Moyenne | > 1 : Malchanceux
 */
export const calculateLuckFactor = (rate, count) => {
  if (count === 0) return 1;
  return (count / rate).toFixed(2);
};