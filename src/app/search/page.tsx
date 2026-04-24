import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { SearchView } from "@/components/search-view";
import { buildBreadcrumbJsonLd, buildMetadata, serializeJsonLd } from "@/lib/seo";
import siteConfig from "@/site.config";

export const metadata: Metadata = buildMetadata({
  title: "Search Articles",
  description: "Search the site archive by title, category, and excerpt.",
  pathname: "/search",
  keywords: ["search", "site search", "archive search"],
  noIndex: true
});

export default function SearchPage() {
  if ((siteConfig.url?.search?.enabled ?? true) === false) {
    notFound();
  }

  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: "/" },
    { name: "Search Articles" }
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(breadcrumbJsonLd) }}
      />
      <Suspense fallback={<div className="container section stack"><p className="lede">Loading search…</p></div>}>
        <SearchView />
      </Suspense>
    </>
  );
}
