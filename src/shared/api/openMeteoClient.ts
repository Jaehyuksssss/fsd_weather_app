export async function fetchJson<T>(
  url: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Open-Meteo request failed: ${res.status} ${res.statusText}${
        text ? ` - ${text}` : ""
      }`
    );
  }
  return (await res.json()) as T;
}

type Primitive = string | number | boolean;
export type QueryParams = Readonly<
  Record<string, Primitive | null | undefined>
>;

export function buildQuery(params: QueryParams): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    searchParams.set(key, String(value));
  }
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
}

export function buildOpenMeteoUrl(
  pathname: string,
  params: QueryParams
): string {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `https://api.open-meteo.com/v1${normalizedPath}${buildQuery(params)}`;
}
