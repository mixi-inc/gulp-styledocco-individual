export function flatMap<S, T>(array: S[], fn: (s: S) => T[]): T[] {
    return Array.prototype.concat.apply([], array.map(fn));
}


export function uniqueStrings(array: string[]): string[] {
  const dict: { [elem: string]: boolean } = {};

  array.forEach((str) => {
    dict[str] = true;
  });

  return Object.keys(dict);
}
