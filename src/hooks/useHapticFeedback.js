export function useHapticFeedback() {
  const trigger = (pattern = 'LIGHT') => {
    if (!('vibrate' in navigator)) return;

    switch (pattern) {
      case 'LIGHT':
        navigator.vibrate(10);
        break;
      case 'MEDIUM':
        navigator.vibrate(50);
        break;
      case 'SUCCESS':
        navigator.vibrate([20, 50, 20]);
        break;
      case 'ERROR':
        navigator.vibrate([100, 50, 100]);
        break;
      default:
        navigator.vibrate(pattern);
    }
  };

  return { trigger };
}
