export function foldSearchText(input: string) {
  return input
    .trim()
    .normalize("NFKD")
    .replace(/[ıİ]/g, "i")
    .replace(/\p{Mark}+/gu, "")
    .toLowerCase();
}

export function tokenizeSearchQuery(query: string) {
  return foldSearchText(query).split(/\s+/).filter(Boolean);
}
