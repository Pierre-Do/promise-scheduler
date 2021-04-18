# Promise Scheduler

The goal of this repo is to implement a very simple `resolvePromiseWithWorkers` Javascript promise
utility to resolve a bunch of `Promise` not one by one or all at once, but by workers.

## Example

```typescript
import resolvePromiseWithWorkers from "./src/resolvePromiseWithWorkers";

// A simple function that download something
async function downloadValue(): Promise<unknown> {
  console.log("Starting download");
  const response = await fetch("https://jsonplaceholder.typicode.com/todos/1");

  const result = await response.text();
  console.log("Download completed");

  return result;
}

// A few downloads that need to be done.
// The promise must be wrapped in a closure to avoid to
// resolve all promises as soon as they're instanciated.
const factories = [
  () => downloadValue(),
  () => downloadValue(),
  () => downloadValue(),
  () => downloadValue(),
  () => downloadValue(),
  () => downloadValue(),
  () => downloadValue(),
];

// Two workers will download the files
const result = await resolvePromiseWithWorkers(factories, { workerCount: 2 });
```

## Acknowledgments

Inspired by the work of [Alex Ewerlöf](https://codeburst.io/async-map-with-limited-parallelism-in-node-js-2b91bd47af70).
