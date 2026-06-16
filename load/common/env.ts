declare const __ENV: Record<string, string | undefined>;

export function getEnv(name: string): string {
  const value = __ENV[name];

  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}
