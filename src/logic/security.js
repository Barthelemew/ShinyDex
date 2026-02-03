import DOMPurify from 'dompurify';

/**
 * Nettoie une chaîne de caractères pour prévenir les attaques XSS.
 * @param {string} input - La chaîne à nettoyer.
 * @returns {string} - La chaîne nettoyée.
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // On n'autorise aucun tag HTML pour les entrées simples (pseudo, etc.)
    ALLOWED_ATTR: []
  });
};

/**
 * Valide si une chaîne est un pseudo valide.
 * @param {string} username - Le pseudo à valider.
 * @returns {boolean}
 */
export const isValidUsername = (username) => {
  const re = /^[a-zA-Z0-9_\- ]{3,20}$/;
  return re.test(username);
};
