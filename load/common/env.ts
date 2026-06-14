declare const __ENV: Record<string, string | undefined>;

export function getEnv(name: string, defaultValue: string): string {
  return __ENV[name] ?? defaultValue;
}
