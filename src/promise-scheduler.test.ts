import resolveAll from "./resolveAll";
import expectToHaveBeenCalledWithSequence from "../test-utils/expectToHaveBeenCalledWithSequence";
import asyncPromiseGenerator from "../test-utils/asyncPromiseGenerator";
import fetch from "node-fetch";

const promises = [
  () => asyncPromiseGenerator("First", 10),
  () => asyncPromiseGenerator("Second", 100),
  () => asyncPromiseGenerator("Third", 30),
];

describe("Promise Scheduler", () => {
  it("should resolve all promises", async () => {
    expect(await resolveAll(promises)).toEqual(["First", "Second", "Third"]);
  });

  it("should resolve all promises if the number of workers is lower than the number of promises", async () => {
    expect(await resolveAll(promises, { workerCount: 1 })).toEqual([
      "First",
      "Second",
      "Third",
    ]);
  });

  it("should resolve the promises sequentially if the number of worker is 1", async () => {
    const traceCallback = jest.fn();
    const promisesWithCallback = [
      () => asyncPromiseGenerator("First", 10, traceCallback),
      () => asyncPromiseGenerator("Second", 30, traceCallback),
      () => asyncPromiseGenerator("Third", 50, traceCallback),
    ];

    await resolveAll(promisesWithCallback, { workerCount: 1 });
    const sequence = [
      "start First",
      "resolve First",
      "start Second",
      "resolve Second",
      "start Third",
      "resolve Third",
    ];
    expectToHaveBeenCalledWithSequence(traceCallback, sequence);
  });

  it("should resolve the promises by workers", async () => {
    const traceCallback = jest.fn();
    const promisesWithCallback = [
      () => asyncPromiseGenerator("First", 10, traceCallback),
      () =>
        asyncPromiseGenerator(
          "Second",
          100 /* A very long promise that should keep a worker busy*/,
          traceCallback
        ),
      () => asyncPromiseGenerator("Third", 10, traceCallback),
      () => asyncPromiseGenerator("Forth", 10, traceCallback),
    ];

    await resolveAll(promisesWithCallback, { workerCount: 2 });
    const sequence = [
      "start First",
      "start Second",
      "resolve First",
      "start Third",
      "resolve Third",
      "start Forth",
      "resolve Forth",
      "resolve Second",
    ];
    expectToHaveBeenCalledWithSequence(traceCallback, sequence);
  });

  it("should resolve fetch promise properly", async () => {
    // A simple function that download something
    async function downloadValue(): Promise<unknown> {
      console.log("Starting download");
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/todos/1"
      );

      const result = await response.text();
      console.log("Download completed");

      return result;
    }

    // A few downloads that need to be done
    const factories = [
      () => downloadValue(),
      () => downloadValue(),
      () => downloadValue(),
      () => downloadValue(),
      () => downloadValue(),
      () => downloadValue(),
      () => downloadValue(),
    ];

    const result = await resolveAll(factories, { workerCount: 2 });
    expect(result).toHaveLength(factories.length);
  });
});
