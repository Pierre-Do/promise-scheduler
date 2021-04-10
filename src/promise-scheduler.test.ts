import resolveAll from "./resolveAll";

describe("Promise Scheduler", () => {
  it("should resolve all promises", async () => {
    const result = await resolveAll();
    expect(result).toEqual([]);
  });
});
