import * as fs from "fs";
import * as readline from "readline";

export const sliceLines = (
  fileContent: string,
  startLine: number,
  endLine: number,
): string => {
  const [start, end] =
    startLine > endLine ? [endLine, startLine] : [startLine, endLine];

  // Handles both Unix (\n) and Windows (\r\n) line breaks
  const lines = fileContent.split(/\r?\n/);

  // Convert 1-based index to 0-based:
  // startLine - 1 includes the starting line
  // endLine is exclusive in .slice(), so it matches 1-based indexing
  const sliced = lines.slice(Math.max(0, start - 1), end);

  return sliced.join("\n");
};

export const sliceLinesFromFile = async (
  filePath: string,
  startLine: number,
  endLine: number,
): Promise<string[]> => {
  const [start, end] =
    startLine > endLine ? [endLine, startLine] : [startLine, endLine];

  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  const capturedLines: string[] = [];
  let currentLine = 0;

  for await (const line of rl) {
    currentLine++;

    if (currentLine >= start && currentLine <= end) {
      capturedLines.push(line);
    }

    if (currentLine >= end) {
      rl.close();
      fileStream.destroy();
      break;
    }
  }

  return capturedLines;
};
