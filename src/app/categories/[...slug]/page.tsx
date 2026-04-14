import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { ArticleCard } from "@/components/article-card";
import { buildMetadata, buildCollectionPageJsonLd, serializeJsonLd } from "@/lib/seo";
import { 
  getCategoryBuckets, 
  getPostsByCategories,
  getCategoryCombinationParams,
  getFurtherCategoryOptions,
  getCategoryPostCounts
} from "@/lib/content";
import { getCanonicalCategoryOrder } from "@/lib/categoryUtils";

function formatCategoryList(titles: string[]) {
  if (titles.length === 1) return titles[0];
  if (titles.length === 2) return `${titles[0]} and ${titles[1]}`.toLocaleLowerCase();
  return `${titles.slice(0, -1).join(", ")} and ${titles[titles.length - 1]}`.toLocaleLowerCase();
}

export async function generateStaticParams() {
  return getCategoryCombinationParams();
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const postCounts = getCategoryPostCounts();
  
  // Get canonical order for SEO
  const canonicalSlug = getCanonicalCategoryOrder(slug, postCounts);
  
  const buckets = slug.map((s) => getCategoryBuckets().find((item) => item.slug === s)).filter(Boolean);
  
  if (buckets.length === 0) return buildMetadata({ title: "Category Not Found" });

  const titles = buckets.map((b) => b!.title);
  const title = titles.join(" > ");
  
  let description = buckets[0]!.description ?? "Posts in this category.";
  if (buckets.length > 1) {
    description = `Posts in category ${formatCategoryList(titles)}.`;
  }

  // Always use canonical URL in metadata for SEO
  const canonicalPath = `/categories/${canonicalSlug.join("/")}`;

  return buildMetadata({
    title: title,
    description: description,
    pathname: canonicalPath,
    keywords: [...titles, "category"],
    datePublished: buckets[0]?.datePublished,
    dateModified: buckets[0]?.dateModified
  });
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  
  const buckets = slug.map((s) => getCategoryBuckets().find((item) => item.slug === s));

  if (buckets.some((b) => !b)) {
    notFound();
  }

  const posts = getPostsByCategories(slug);
  const titles = buckets.map(b => b!.title);
  
  let description = buckets[0]!.description;
  if (buckets.length > 1) {
    description = `Posts in category ${formatCategoryList(titles)}.`;
  }

  const postCounts = getCategoryPostCounts();
  const canonicalSlug = getCanonicalCategoryOrder(slug, postCounts);

  const jsonLd = buildCollectionPageJsonLd(
    titles.join(" > "),
    description ?? `Posts in the ${titles[0]} category.`,
    `/categories/${canonicalSlug.join("/")}`, // Use canonical URL in JSON-LD
    posts.length,
    buckets[0]!.datePublished,
    buckets[0]!.dateModified
  );

  const filterOptions = getFurtherCategoryOptions(posts, slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      <div className="container section stack category-layout">
        <div className="category-main">
          <h1 className="page-title">
            {buckets[0]!.title}
          </h1>
          {description ? <p className="lede" style={{ marginTop: '0.5rem' }}>{description}</p> : null}
          <div className="post-list">
            {posts.map((post) => (
              <ArticleCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
        
        {(slug.length > 1 || filterOptions.length > 0) && (
          <aside className="category-sidebar">
            {slug.length > 1 && (
              <div className="sidebar-section">
                <ol className="subtle-breadcrumb" aria-label="Breadcrumb trail">
                  {buckets.map((b, i) => (
                    <li key={b!.slug} style={{ paddingLeft: `${i * 0.85}rem` }}>
                      {i > 0 && (
                        <span aria-hidden="true" className="subtle-breadcrumb-separator">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                      )}
                      {i === buckets.length - 1 ? (
                        <span className="subtle-breadcrumb-active">{b!.title}</span>
                      ) : (
                        <Link href={`/categories/${slug.slice(0, i + 1).join("/")}`} className="subtle-breadcrumb-link">
                          {b!.title}
                        </Link>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            )}
            
            {filterOptions.length > 0 && (
              <div className="sidebar-section">
                <h3 className="eyebrow">Refine</h3>
                <ul className="sidebar-refine-list">
                  {filterOptions.map((opt) => {
                    const newSlug = getCanonicalCategoryOrder([...slug, opt.slug], postCounts);
                    return (
                      <li key={opt.slug}>
                        <Link 
                          href={`/categories/${newSlug.join("/")}`}
                          className="sidebar-refine-link"
                        >
                          <span>{opt.title} ({opt.postCount})</span>
                          <span className="sidebar-refine-icon" aria-hidden="true">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </aside>
        )}
      </div>
    </>
  );
}
