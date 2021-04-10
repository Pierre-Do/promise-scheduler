/**
 * A simple function that creates as promise that resolves after 50ms
 */
export default function asyncPromiseGenerator(
  name: string,
  timeout: number,
  traceCallback?: (name: string) => void
): Promise<string> {
  return new Promise((resolve) => {
    if (traceCallback) {
      traceCallback(`start ${name}`);
    }

    setTimeout(() => {
      if (traceCallback) {
        traceCallback(`resolve ${name}`);
      }
      resolve(name);
    }, timeout);
  });
}
