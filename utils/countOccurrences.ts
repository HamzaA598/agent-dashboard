export const countOccurrences = (source: string, target: string): number => {
  return source.split(target).length - 1;
};
