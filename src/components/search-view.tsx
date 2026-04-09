"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { foldSearchText, tokenizeSearchQuery } from "@/lib/text";
import { getSearchPath } from "@/lib/urls";

export type SearchEntry = {
  title: string;
  slug: string;
  excerpt: string;
  date?: string;
  categories: string[];
  permalink: string;
};

type SearchViewProps = {
  posts: SearchEntry[];
  initialQuery?: string;
};

export function SearchView({ posts, initialQuery = "" }: SearchViewProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchEntry[]>([]);

  useEffect(() => {
    const queryFromUrl = searchParams.get("q") ?? "";
    if (queryFromUrl && queryFromUrl !== query) {
      setQuery(queryFromUrl);
    }
  }, [query, searchParams]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchTerms = tokenizeSearchQuery(query);

    const filtered = posts
      .map((post) => {
        let score = 0;
        const titleLower = foldSearchText(post.title);
        const excerptLower = foldSearchText(post.excerpt);
        const categoriesLower = foldSearchText(post.categories.join(" "));

        for (const term of searchTerms) {
          if (titleLower.includes(term)) {
            score += 10;
          }
          if (categoriesLower.includes(term)) {
            score += 5;
          }
          if (excerptLower.includes(term)) {
            score += 2;
          }
        }

        return { post, score };
      })
      .filter(({ score }) => score > 0)
      .sort((left, right) => right.score - left.score)
      .slice(0, 20)
      .map(({ post }) => post);

    setResults(filtered);
  }, [query, posts]);

  return (
    <div className="container section stack">
      <div className="prose-wrap stack">
        <h1 className="page-title">Search</h1>
        <form
          className="stack"
          onSubmit={(event) => {
            event.preventDefault();
            router.push(query.trim() ? getSearchPath(query) : pathname);
          }}
        >
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search posts..."
            className="search-input search-input--page"
          />
        </form>
        {!query ? <p className="lede">Search the published archive by title, category, and excerpt.</p> : null}
        {query && results.length === 0 ? <p className="lede">No results found for "{query}".</p> : null}
      </div>
      {results.length > 0 ? (
        <div className="post-list">
          {results.map((result) => (
            <article key={result.slug} className="post-preview">
              <div className="post-preview__meta">
                <span>{result.categories.join(", ")}</span>
                {result.date ? (
                  <>
                    <span className="post-preview__dot" aria-hidden="true">·</span>
                    <span>{new Date(result.date).toLocaleDateString()}</span>
                  </>
                ) : null}
              </div>
              <div className="post-preview__content">
                <h2 className="post-preview__title">
                  <Link href={result.permalink}>{result.title}</Link>
                </h2>
                <p className="lede">{result.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
