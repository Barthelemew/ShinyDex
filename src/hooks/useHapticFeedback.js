export function useHapticFeedback() {
  const trigger = (pattern = 'LIGHT') => {
    if (!('vibrate' in navigator)) return;

    switch (pattern) {
      case 'LIGHT':
        navigator.vibrate(15);
        break;
      case 'MEDIUM':
        navigator.vibrate(80);
        break;
      case 'SUCCESS':
        navigator.vibrate([30, 60, 30]);
        break;
      case 'ERROR':
        navigator.vibrate([150, 50, 150]);
        break;
      default:
        navigator.vibrate(pattern);
    }
  };

  return { trigger };
}
