'use client'

import Link from "next/link"
import { useEffect, useState, useRef } from "react"

import { foldSearchText, tokenizeSearchQuery } from "@/lib/text"

type SearchResult = {
  title: string
  slug: string
  excerpt: string
  date?: string
  categories: string[]
  permalink: string
}

type SearchProps = {
  posts: SearchResult[]
}

export function Search({ posts }: SearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
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
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

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
        let score = 0
        const titleLower = foldSearchText(post.title)
        const excerptLower = foldSearchText(post.excerpt)
        const categoriesLower = foldSearchText(post.categories.join(' '))

        searchTerms.forEach(term => {
          // Title matches are worth more
          if (titleLower.includes(term)) {
            score += 10
          }
          // Category matches
          if (categoriesLower.includes(term)) {
            score += 5
          }
          // Excerpt matches
          if (excerptLower.includes(term)) {
            score += 2
          }
        })

        return { post, score }
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
                      {result.date && ` · ${new Date(result.date).toLocaleDateString()}`}
                    </div>
                    <div className="search-result__excerpt">{result.excerpt}</div>
                  </Link>
                ))}
              </div>
            )}

            {query && results.length === 0 && (
              <div className="search-empty">
                No results found for "{query}"
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
