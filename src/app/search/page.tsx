import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { SearchView } from "@/components/search-view";
import { buildMetadata, buildSearchResultsJsonLd, serializeJsonLd } from "@/lib/seo";
import siteConfig from "@/site.config";

export const metadata: Metadata = buildMetadata({
  title: "Search",
  description: "Search the site archive by title, category, and excerpt.",
  pathname: "/search",
  keywords: ["search", "site search", "archive search"],
  noIndex: true
});

export default function SearchPage() {
  if ((siteConfig.url?.search?.enabled ?? true) === false) {
    notFound();
  }

  const jsonLd = buildSearchResultsJsonLd("", "/search", []);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <Suspense fallback={<div className="container section stack"><p className="lede">Loading search…</p></div>}>
        <SearchView />
      </Suspense>
    </>
  );
}
