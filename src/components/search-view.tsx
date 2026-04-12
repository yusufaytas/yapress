"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { formatDate } from "@/lib/dateFormat";
import type { SearchEntry } from "@/lib/search";
import { loadSearchEntries, preloadSearchEntries } from "@/lib/searchClient";
import { scoreSearchEntry } from "@/lib/search";
import { foldSearchText, tokenizeSearchQuery } from "@/lib/text";
import { getSearchPath } from "@/lib/urls";

type SearchViewProps = {
  initialQuery?: string;
};

export function SearchView({ initialQuery = "" }: SearchViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [posts, setPosts] = useState<SearchEntry[]>([]);
  const [results, setResults] = useState<SearchEntry[]>([]);

  useEffect(() => {
    preloadSearchEntries();

    let cancelled = false;

    loadSearchEntries()
      .then((payload) => {
        if (!cancelled) {
          setPosts(payload);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPosts([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const queryFromUrl = searchParams.get("q") ?? "";
    setQuery(queryFromUrl);
  }, [searchParams]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchTerms = tokenizeSearchQuery(query);

    const filtered = posts
      .map((post) => {
        return {
          post,
          score: scoreSearchEntry(searchTerms, {
            ...post,
            title: foldSearchText(post.title),
            excerpt: foldSearchText(post.excerpt),
            categories: post.categories.map((category) => foldSearchText(category)),
          }),
        };
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
            router.push(getSearchPath(query));
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
        {query && posts.length > 0 && results.length === 0 ? <p className="lede">No results found for &quot;{query}&quot;.</p> : null}
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
                    <span>{formatDate(result.date)}</span>
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
