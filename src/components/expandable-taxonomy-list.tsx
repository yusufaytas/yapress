"use client";

import { useState } from "react";

import type { TaxonomyItem } from "@/lib/content";

import { TaxonomyPill } from "@/components/taxonomy-pill";

type ExpandableTaxonomyListProps = {
  items: TaxonomyItem[];
  initiallyVisible?: number;
  labelPrefix?: string;
};

export function ExpandableTaxonomyList({
  items,
  initiallyVisible = 5,
  labelPrefix = ""
}: ExpandableTaxonomyListProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (items.length <= initiallyVisible) {
    return (
      <div className="pill-row">
        {items.map((item) => (
          <TaxonomyPill key={item.slug} href={item.permalink} label={`${labelPrefix}${item.title}`} />
        ))}
      </div>
    );
  }

  const visibleItems = isExpanded ? items : items.slice(0, initiallyVisible);
  const hiddenCount = items.length - initiallyVisible;

  return (
    <div className="pill-row">
      {visibleItems.map((item) => (
        <TaxonomyPill key={item.slug} href={item.permalink} label={`${labelPrefix}${item.title}`} />
      ))}
      <button
        type="button"
        className="pill pill-button"
        aria-expanded={isExpanded}
        onClick={() => setIsExpanded((current) => !current)}
      >
        {isExpanded ? "Show fewer" : `+${hiddenCount} more`}
      </button>
    </div>
  );
}
