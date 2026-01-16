const STORAGE_KEY = "search:recent:v1";
const MAX_RECENT = 5;

function read(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const json: unknown = JSON.parse(raw);
    if (!Array.isArray(json)) return [];
    return json.filter((v) => typeof v === "string" && v.trim().length > 0);
  } catch {
    return [];
  }
}

function write(items: readonly string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export const recentSearches = {
  load(): string[] {
    return read();
  },

  add(label: string): string[] {
    const normalized = label.trim();
    if (normalized.length === 0) return read();

    const items = read();
    const next = [normalized, ...items.filter((x) => x !== normalized)].slice(
      0,
      MAX_RECENT
    );
    write(next);
    return next;
  },

  remove(label: string): string[] {
    const normalized = label.trim();
    if (normalized.length === 0) return read();
    const items = read();
    const next = items.filter((x) => x !== normalized);
    write(next);
    return next;
  },

  clear(): void {
    write([]);
  },
} as const;


