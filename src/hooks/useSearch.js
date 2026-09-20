import { useDebugValue, useMemo, useState } from "react";

/**
 * Custom hook for reusable search and memoized filtering.
 *
 * @param {Array} items - The collection of items to search
 * @param {Function} getSearchText - Extracts searchable text from each item
 */
export function useSearch(items = [], getSearchText) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return items;
    return items.filter((item) =>
      getSearchText(item).toLowerCase().includes(normalizedQuery)
    );
  }, [getSearchText, items, query]);

  useDebugValue(`Query: "${query}" | Results: ${results.length}`);

  return { query, setQuery, results };
}
