export const evaluateOperation = (operation: string, x: number, y: number) => {
  switch (operation) {
    case "+":
      return x + y;
    case "-":
      return x - y;
    case "*":
      return x * y;
    case "/":
      if (y === 0) {
        throw new Error("Invalid divisor: denominator cannot be zero");
      }
      return x / y;
    default:
      throw new Error(`Unsupported action type: ${operation}`);
  }
};
