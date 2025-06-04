export function maybeWipe(n: number): number | null {
  return Math.random() > 0.5 ? n : null;
}

export function fetchFallback(): number | undefined {
  return Math.random() > 0.5 ? Math.random() * 500 : undefined;
}
