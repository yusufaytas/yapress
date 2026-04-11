import type { Metadata } from "next";
import Link from "next/link";

import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Page Not Found",
  description: "The requested page could not be found.",
  pathname: "/404",
  noIndex: true,
});

export default function NotFound() {
  return (
    <div className="container section stack">
      <article className="prose-wrap stack">
        <p className="article-kicker">404</p>
        <h1 className="page-title">Page not found</h1>
        <p className="lede">
          The URL does not exist here, or it may have moved to a new path.
        </p>
        <p>
          Try the <Link href="/" className="muted-link">home page</Link>, browse <Link href="/archives" className="muted-link">archives</Link>, or use <Link href="/search" className="muted-link">search</Link>.
        </p>
      </article>
    </div>
  );
}
