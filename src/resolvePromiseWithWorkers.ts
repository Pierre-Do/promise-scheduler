type PromiseGeneratorType<T> = Generator<[Promise<T>, number]>;
type PromiseFactoriesType<T> = Array<() => Promise<T>>;

type ResolveAllOptions = {
  /**
   * Maximum number of workers. Defaults to 3
   */
  workerCount?: number;
};

const DEFAULT_OPTIONS: ResolveAllOptions = {
  workerCount: 3,
};

function* generator<T>(
  promiseFactories: PromiseFactoriesType<T>
): PromiseGeneratorType<T> {
  for (let i = 0; i < promiseFactories.length; ++i) {
    yield [promiseFactories[i](), i];
  }
}

async function worker<T>(generator: PromiseGeneratorType<T>, result: Array<T>) {
  for (let [promise, index] of generator) {
    result[index] = await promise;
  }
}

export default async function resolvePromiseWithWorkers<T>(
  promiseFactories: PromiseFactoriesType<T>,
  options: ResolveAllOptions = {}
): Promise<Array<T>> {
  // Options with default
  const { workerCount } = Object.assign({}, DEFAULT_OPTIONS, options);

  // The generator is shared between workers, ensuring each promise is only resolved once
  const sharedGenerator = generator(promiseFactories);

  // Shared result for all promises
  const result: Array<T> = [];

  // There's no need to create more workers than promises to resolve
  const actualWorkerCount = Math.min(
    Number(workerCount),
    promiseFactories.length
  );

  const workers = Array.from(new Array(actualWorkerCount)).map(() =>
    worker(sharedGenerator, result)
  );

  // Wait for all the workers to do their job
  await Promise.all(workers);

  return result;
}
