import { Environment, LogLevel, Paddle } from "@paddle/paddle-node-sdk";

let paddleInstance: Paddle | null = null;

export function getPaddleInstance() {
  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey) throw new Error("PADDLE_API_KEY is not configured");
  if (!paddleInstance) {
    paddleInstance = new Paddle(apiKey, {
      environment: process.env.NEXT_PUBLIC_PADDLE_ENV === "production" ? Environment.production : Environment.sandbox,
      logLevel: LogLevel.error,
    });
  }
  return paddleInstance;
}
