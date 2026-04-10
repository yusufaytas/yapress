'use client'

import { useEffect, useRef, useState } from "react"

type LayoutMode = "spacious" | "editorial"

export function ArticleOptions() {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("spacious")
  const rootRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const article = rootRef.current?.closest("article.article")
    if (!article) {
      return
    }

    article.setAttribute("data-layout-mode", layoutMode)

    return () => {
      article.removeAttribute("data-layout-mode")
    }
  }, [layoutMode])

  return (
    <div ref={rootRef} className="article-options" aria-label="Reading layout">
      <button
        type="button"
        className={`article-option ${layoutMode === "spacious" ? "article-option--active" : ""}`}
        onClick={() => setLayoutMode("spacious")}
        aria-pressed={layoutMode === "spacious"}
      >
        Spacious
      </button>
      <button
        type="button"
        className={`article-option ${layoutMode === "editorial" ? "article-option--active" : ""}`}
        onClick={() => setLayoutMode("editorial")}
        aria-pressed={layoutMode === "editorial"}
      >
        Editorial
      </button>
    </div>
  )
}
