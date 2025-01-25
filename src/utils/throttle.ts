// eslint-disable-next-line @typescript-eslint/no-explicit-any
function throttle<T extends (...args: any) => any>(
  fn: (...args: Parameters<T>) => void,
  intervalMs: number = 200
) {
  let timeoutId: number | null = null;
  return (...args: Parameters<T>) => {
    if (!timeoutId) {
      timeoutId = setTimeout(() => {
        timeoutId = null;
      }, intervalMs);
      fn(...args);
    }
  };
}

export default throttle;
