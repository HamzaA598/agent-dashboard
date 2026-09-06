import { evaluateOperation } from "@/utils/evaluateOperation";
import { tool } from "ai";
import { z } from "zod";

interface CalculatorParams {
  x: number;
  operation: "+" | "-" | "*" | "/";
  y: number;
}

export const calculator = tool({
  description:
    "call this tool when needing to do mathematical operations such as addition, subtraction, multiplication, division",
  inputSchema: z
    .object({
      x: z.number().describe("the first number"),
      operation: z
        .enum(["+", "-", "*", "/"])
        .describe(
          "a characher (+, -, *, /) that represents the mathematical operation needed",
        ),
      y: z.number().describe("the second number"),
    })
    .refine(
      (data) => {
        // If mode is "CUSTOM", amount cannot be 0
        if (data.operation === "/") {
          return data.y !== 0;
        }
        return true;
      },
      {
        message: "y cannot be zero when operation is /",
        path: ["y"], // Targets the error directly to `y`
      },
    ),
  execute: async ({ x, operation, y }: CalculatorParams) => {
    return { output: evaluateOperation(operation, x, y) };
  },
});
