/**
 * Truncates long strings using the Head-and-Tail pattern to prevent
 * context window blowout while preserving initial logs and final error outputs.
 */
export const truncateOutput = (
  text: string,
  maxLength: number = 8000,
): string => {
  if (!text || text.length <= maxLength) {
    return text;
  }

  const half = Math.floor(maxLength / 2);
  const head = text.slice(0, half);
  const tail = text.slice(-half);
  const omitted = text.length - maxLength;

  return `${head}\n\n... [${omitted} characters truncated] ...\n\n${tail}`;
};
