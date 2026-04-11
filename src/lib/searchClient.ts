"use client";

import type { SearchEntry } from "@/lib/search";

let cachedSearchEntries: SearchEntry[] | undefined;
let searchEntriesPromise: Promise<SearchEntry[]> | undefined;

function requestSearchEntries() {
  return fetch("/search-index.json").then((response) => {
    if (!response.ok) {
      throw new Error(`Search index request failed with ${response.status}`);
    }

    return response.json() as Promise<SearchEntry[]>;
  });
}

export function loadSearchEntries() {
  if (cachedSearchEntries) {
    return Promise.resolve(cachedSearchEntries);
  }

  if (!searchEntriesPromise) {
    searchEntriesPromise = requestSearchEntries()
      .then((entries) => {
        cachedSearchEntries = entries;
        return entries;
      })
      .finally(() => {
        searchEntriesPromise = undefined;
      });
  }

  return searchEntriesPromise;
}

export function preloadSearchEntries() {
  void loadSearchEntries().catch(() => undefined);
}
