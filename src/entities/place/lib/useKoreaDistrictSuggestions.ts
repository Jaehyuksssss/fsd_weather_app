import { useEffect, useMemo, useState } from "react";

import type {
  KoreaDistrictItem,
  KoreaDistrictSuggestion,
} from "./koreaDistricts";
import { loadKoreaDistricts, searchKoreaDistricts } from "./koreaDistricts";

type LoadStatus = "idle" | "loading" | "success" | "error";

export function useKoreaDistrictSuggestions(query: string): Readonly<{
  status: LoadStatus;
  suggestions: readonly KoreaDistrictSuggestion[];
  errorMessage?: string;
}> {
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [items, setItems] = useState<readonly KoreaDistrictItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    let cancelled = false;

    loadKoreaDistricts()
      .then((loaded) => {
        if (cancelled) return;
        setItems(loaded);
        setStatus("success");
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setStatus("error");
        setErrorMessage(e instanceof Error ? e.message : String(e));
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const suggestions = useMemo(() => {
    if (status !== "success") return [];
    return searchKoreaDistricts(items, query, 30);
  }, [items, query, status]);

  return { status, suggestions, errorMessage };
}
