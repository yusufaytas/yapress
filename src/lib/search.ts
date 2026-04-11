export type SearchEntry = {
  title: string;
  slug: string;
  excerpt: string;
  date?: string;
  categories: string[];
  permalink: string;
};

export function scoreSearchEntry(queryTerms: string[], entry: SearchEntry) {
  let score = 0;
  const title = entry.title;
  const excerpt = entry.excerpt;
  const categories = entry.categories.join(" ");

  for (const term of queryTerms) {
    if (title.includes(term)) {
      score += 10;
    }

    if (categories.includes(term)) {
      score += 5;
    }

    if (excerpt.includes(term)) {
      score += 2;
    }
  }

  return score;
}
