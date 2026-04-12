'use client'

import Link from "next/link"
import { useEffect, useState, useRef } from "react"

import { formatDate } from "@/lib/dateFormat"
import type { SearchEntry } from "@/lib/search"
import { loadSearchEntries, preloadSearchEntries } from "@/lib/searchClient"
import { scoreSearchEntry } from "@/lib/search"
import { foldSearchText, tokenizeSearchQuery } from "@/lib/text"

export function Search() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [posts, setPosts] = useState<SearchEntry[]>([])
  const [results, setResults] = useState<SearchEntry[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  // Keyboard shortcut to open search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus input when dialog opens
  useEffect(() => {
    const run = () => preloadSearchEntries()

    if (typeof globalThis.requestIdleCallback === "function") {
      const idleId = globalThis.requestIdleCallback(run)
      return () => globalThis.cancelIdleCallback?.(idleId)
    }

    const timeoutId = globalThis.setTimeout(run, 250)
    return () => globalThis.clearTimeout(timeoutId)
  }, [])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || posts.length > 0) {
      return
    }

    let cancelled = false

    loadSearchEntries()
      .then((payload) => {
        if (!cancelled) {
          setPosts(payload)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPosts([])
        }
      })

    return () => {
      cancelled = true
    }
  }, [isOpen, posts.length])

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const searchTerms = tokenizeSearchQuery(query)
    
    const filtered = posts
      .map(post => {
        return {
          post,
          score: scoreSearchEntry(searchTerms, {
            ...post,
            title: foldSearchText(post.title),
            excerpt: foldSearchText(post.excerpt),
            categories: post.categories.map((category) => foldSearchText(category))
          })
        }
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(({ post }) => post)

    setResults(filtered)
  }, [query, posts])

  const handleResultClick = () => {
    setIsOpen(false)
    setQuery("")
    setResults([])
  }

  return (
    <>
      {/* Search trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="search-trigger"
        aria-label="Search posts"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 16L12.65 12.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Search dialog */}
      {isOpen && (
        <div className="search-overlay">
          <div className="search-dialog" ref={dialogRef}>
            <div className="search-input-wrap">
              <svg className="search-icon" width="20" height="20" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 16L12.65 12.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search posts..."
                className="search-input"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery("")
                    setResults([])
                  }}
                  className="search-clear"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {results.length > 0 && (
              <div className="search-results">
                {results.map((result) => (
                  <Link
                    key={result.slug}
                    href={result.permalink}
                    onClick={handleResultClick}
                    className="search-result"
                  >
                    <div className="search-result__title">{result.title}</div>
                    <div className="search-result__meta">
                      {result.categories.join(', ')}
                      {result.date && ` · ${formatDate(result.date)}`}
                    </div>
                    <div className="search-result__excerpt">{result.excerpt}</div>
                  </Link>
                ))}
              </div>
            )}

            {query && posts.length > 0 && results.length === 0 && (
              <div className="search-empty">
                No results found for &quot;{query}&quot;
              </div>
            )}

            {!query && (
              <div className="search-hint">
                Start typing to search posts...
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
