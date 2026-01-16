export type KoreaDistrictItem = Readonly<{
  raw: string;
  label: string;
  searchable: string;
}>;

export type KoreaDistrictSuggestion = Readonly<{
  raw: string;
  label: string;
}>;

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((v) => typeof v === "string" && v.length > 0)
  );
}

function normalizeForSearch(input: string): string {
  return input
    .normalize("NFC")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "");
}

function toDisplayLabel(raw: string): string {
  return raw.replace(/-/g, " ").trim();
}

let cache: Promise<readonly KoreaDistrictItem[]> | null = null;

export async function loadKoreaDistricts(): Promise<readonly KoreaDistrictItem[]> {
  if (cache) return cache;

  cache = (async () => {
    const res = await fetch("/assets/korea_districts.json");
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `Failed to load korea_districts.json: ${res.status} ${res.statusText}${
          text ? ` - ${text}` : ""
        }`
      );
    }

    const json: unknown = await res.json();
    if (!isStringArray(json)) {
      throw new Error("korea_districts.json has unexpected shape (string[] expected)");
    }

    return json.map((raw) => {
      const label = toDisplayLabel(raw);
      return {
        raw,
        label,
        searchable: normalizeForSearch(label),
      } as const;
    });
  })();

  return cache;
}

export function searchKoreaDistricts(
  items: readonly KoreaDistrictItem[],
  query: string,
  limit = 12
): readonly KoreaDistrictSuggestion[] {
  const q = normalizeForSearch(query);
  if (q.length === 0) return [];

  type Scored = {
    item: KoreaDistrictItem;
    isPrefix: boolean;
    index: number;
    length: number;
  };

  const matches: Scored[] = [];

  for (const item of items) {
    const index = item.searchable.indexOf(q);
    if (index < 0) continue;
    matches.push({
      item,
      isPrefix: index === 0,
      index,
      length: item.label.length,
    });
  }

  matches.sort((a, b) => {
    if (a.isPrefix !== b.isPrefix) return a.isPrefix ? -1 : 1;
    if (a.index !== b.index) return a.index - b.index;
    if (a.length !== b.length) return a.length - b.length;
    return a.item.label.localeCompare(b.item.label, "ko");
  });

  return matches
    .slice(0, limit)
    .map((m) => ({ raw: m.item.raw, label: m.item.label }));
}


