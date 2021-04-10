export default function expectToHaveBeenCalledWithSequence(
  mock: jest.Mock,
  sequence: string[]
) {
  for (let i = 0; i < sequence.length; ++i) {
    expect(mock).toHaveBeenNthCalledWith(i + 1, sequence[i]);
  }
}
