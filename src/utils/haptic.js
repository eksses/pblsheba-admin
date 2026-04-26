/**
 * Simple utility for native haptic feedback
 */
export const haptic = (type = 'light') => {
  if (typeof window === 'undefined' || !window.navigator.vibrate) return;

  switch (type) {
    case 'light':
      window.navigator.vibrate(10);
      break;
    case 'medium':
      window.navigator.vibrate(20);
      break;
    case 'heavy':
      window.navigator.vibrate(40);
      break;
    case 'success':
      window.navigator.vibrate([10, 30, 10]);
      break;
    case 'error':
      window.navigator.vibrate([50, 50, 50]);
      break;
    default:
      window.navigator.vibrate(10);
  }
};
