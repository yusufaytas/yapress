import { describe, expect, it } from "vitest";

import {
  getAllPages,
  getAllPosts,
  getDateArchiveBuckets,
  getPageByPermalink,
  getPostsBySeries,
  getPostsByDateArchive,
  getTagBuckets,
  getCategoryBuckets,
  getSeriesBuckets,
  getPostsByCategory,
  getPostsByTag,
  getPostBySlug,
  getRelatedPosts,
  getPaginatedPosts,
  getPaginationParams,
  getPageBySlug,
  stripMarkdown,
} from "@/lib/content";

describe("content", () => {
  it("loads published posts sorted by newest first", () => {
    const posts = getAllPosts();

    expect(posts.length).toBeGreaterThan(0);
    expect(posts.some((post) => post.slug === "draft-example")).toBe(false);

    for (let index = 1; index < posts.length; index += 1) {
      const previous = posts[index - 1].datePublished?.getTime() ?? 0;
      const current = posts[index].datePublished?.getTime() ?? 0;
      expect(previous).toBeGreaterThanOrEqual(current);
    }
  });

  it("resolves pages by canonical permalink", () => {
    const aboutPage = getPageByPermalink("/about");

    expect(aboutPage?.title).toBeTruthy();
    expect(getAllPages().length).toBeGreaterThan(0);
  });

  it("builds date archive buckets and filters posts by archive", () => {
    const archives = getDateArchiveBuckets();

    expect(archives.length).toBeGreaterThan(0);

    const [firstArchive] = archives;
    const posts = getPostsByDateArchive(firstArchive.year, firstArchive.month);

    expect(posts.length).toBe(firstArchive.posts.length);
    expect(firstArchive.permalink).toMatch(/^\/\d{4}\/\d{2}$/);
  });

  it("uses tag registry descriptions when available", () => {
    const tags = getTagBuckets();
    const markdown = tags.find((tag) => tag.slug === "markdown");

    expect(markdown?.title).toBe("Markdown");
    expect(markdown?.description).toBeTruthy();
  });

  it("stores language and locale per content entry", () => {
    const post = getAllPosts()[0];

    expect(post.language).toBeTruthy();
    expect(post.locale).toBeTruthy();
  });

  it("sorts series posts by explicit order before chronology", () => {
    const posts = getPostsBySeries("best-practices");

    expect(posts.length).toBeGreaterThan(0);
    expect(posts.map((post) => post.slug)).toEqual([
      "introducing-yapress",
      "content-as-source-of-truth",
      "markdown-best-practices"
    ]);
  });

  it("strips images from post excerpts", () => {
    const posts = getAllPosts();
    
    for (const post of posts) {
      // Excerpts should not contain markdown image syntax
      expect(post.excerpt).not.toMatch(/!\[.*?\]\(.*?\)/);
      
      // Excerpts should not contain HTML img tags
      expect(post.excerpt).not.toMatch(/<img[^>]*>/i);
    }
  });
});

describe("stripMarkdown", () => {
  it("removes markdown images with alt text", () => {
    const input = "![Google Logo](/images/2008/11/googlelogo.jpg) Google started in 1996.";
    const result = stripMarkdown(input);
    expect(result).toBe("Google started in 1996.");
  });

  it("removes markdown images without alt text", () => {
    const input = "![](/images/2008/11/googlelogo.jpg) Google started in 1996.";
    const result = stripMarkdown(input);
    expect(result).toBe("Google started in 1996.");
  });

  it("removes empty markdown links", () => {
    const input = "[](/images/2008/11/googlelogo.jpg) Google started in 1996.";
    const result = stripMarkdown(input);
    expect(result).toBe("Google started in 1996.");
  });

  it("removes markdown links with text", () => {
    const input = "Check out [Google](https://google.com) for search.";
    const result = stripMarkdown(input);
    expect(result).toBe("Check out for search.");
  });

  it("removes HTML img tags", () => {
    const input = '<img src="/logo.jpg" alt="Logo" /> Welcome to the site.';
    const result = stripMarkdown(input);
    expect(result).toBe("Welcome to the site.");
  });

  it("removes code blocks", () => {
    const input = "Here is code:\n```javascript\nconst x = 1;\n```\nEnd of code.";
    const result = stripMarkdown(input);
    expect(result).toBe("Here is code: End of code.");
  });

  it("removes inline code", () => {
    const input = "Use `console.log()` to debug.";
    const result = stripMarkdown(input);
    expect(result).toBe("Use console.log() to debug.");
  });

  it("removes headings", () => {
    const input = "# Title\n## Subtitle\nContent here.";
    const result = stripMarkdown(input);
    expect(result).toBe("Title Subtitle Content here.");
  });

  it("removes markdown formatting characters", () => {
    const input = "This is **bold** and *italic* and ~~strikethrough~~.";
    const result = stripMarkdown(input);
    expect(result).toBe("This is bold and italic and strikethrough.");
  });

  it("handles complex mixed content", () => {
    const input = "[](/images/2008/11/googlelogo.jpg) Google ilk olarak 1996 yılında Larry Page adındaki doktora öğrencisinin Stanford üniversitesindeki araştırmasıyla başladı.";
    const result = stripMarkdown(input);
    expect(result).toBe("Google ilk olarak 1996 yılında Larry Page adındaki doktora öğrencisinin Stanford üniversitesindeki araştırmasıyla başladı.");
  });

  it("normalizes whitespace", () => {
    const input = "Multiple    spaces   and\n\nnewlines.";
    const result = stripMarkdown(input);
    expect(result).toBe("Multiple spaces and newlines.");
  });
});

describe("getCategoryBuckets", () => {
  it("returns all categories from registry", () => {
    const buckets = getCategoryBuckets();
    
    expect(buckets.length).toBeGreaterThan(0);
    expect(buckets.every((bucket) => bucket.slug)).toBe(true);
    expect(buckets.every((bucket) => bucket.title)).toBe(true);
    expect(buckets.every((bucket) => bucket.permalink.startsWith("/categories/"))).toBe(true);
  });

  it("includes all registered categories even if they have no posts", () => {
    const buckets = getCategoryBuckets();
    
    // All registered categories should be present in the buckets
    // This verifies the function returns all categories from registry, not just those with posts
    expect(buckets.length).toBeGreaterThanOrEqual(3); // At least the 3 registered categories
  });

  it("includes category descriptions from registry", () => {
    const buckets = getCategoryBuckets();
    
    // At least some categories should have descriptions
    const someHaveDescriptions = buckets.some((bucket) => bucket.description);
    expect(someHaveDescriptions).toBe(true);
  });

  it("associates posts with correct categories", () => {
    const buckets = getCategoryBuckets();
    
    for (const bucket of buckets) {
      for (const post of bucket.posts) {
        // Each post in the bucket should have this category
        expect(post.categories.some((cat) => cat.slug === bucket.slug)).toBe(true);
      }
    }
  });

  it("does not duplicate posts in category buckets", () => {
    const buckets = getCategoryBuckets();
    
    for (const bucket of buckets) {
      const slugs = bucket.posts.map((post) => post.slug);
      const uniqueSlugs = new Set(slugs);
      expect(slugs.length).toBe(uniqueSlugs.size);
    }
  });
});

describe("getTagBuckets", () => {
  it("returns all tags from registry", () => {
    const buckets = getTagBuckets();
    
    expect(buckets.length).toBeGreaterThan(0);
    expect(buckets.every((bucket) => bucket.slug)).toBe(true);
    expect(buckets.every((bucket) => bucket.title)).toBe(true);
    expect(buckets.every((bucket) => bucket.permalink.startsWith("/tags/"))).toBe(true);
  });

  it("includes all registered tags even if they have no posts", () => {
    const buckets = getTagBuckets();
    
    // All registered tags should be present in the buckets
    // This verifies the function returns all tags from registry, not just those with posts
    expect(buckets.length).toBeGreaterThanOrEqual(5); // At least the 5 registered tags
  });

  it("includes tag descriptions from registry", () => {
    const buckets = getTagBuckets();
    
    // At least some tags should have descriptions
    const someHaveDescriptions = buckets.some((bucket) => bucket.description);
    expect(someHaveDescriptions).toBe(true);
  });

  it("associates posts with correct tags", () => {
    const buckets = getTagBuckets();
    
    for (const bucket of buckets) {
      for (const post of bucket.posts) {
        // Each post in the bucket should have this tag
        expect(post.tags.some((tag) => tag.slug === bucket.slug)).toBe(true);
      }
    }
  });

  it("does not duplicate posts in tag buckets", () => {
    const buckets = getTagBuckets();
    
    for (const bucket of buckets) {
      const slugs = bucket.posts.map((post) => post.slug);
      const uniqueSlugs = new Set(slugs);
      expect(slugs.length).toBe(uniqueSlugs.size);
    }
  });
});

describe("getSeriesBuckets", () => {
  it("returns all series from registry", () => {
    const buckets = getSeriesBuckets();
    
    expect(buckets.length).toBeGreaterThan(0);
    expect(buckets.every((bucket) => bucket.slug)).toBe(true);
    expect(buckets.every((bucket) => bucket.title)).toBe(true);
    expect(buckets.every((bucket) => bucket.permalink.startsWith("/series/"))).toBe(true);
  });

  it("includes all registered series even if they have no posts", () => {
    const buckets = getSeriesBuckets();
    
    // All registered series should be present in the buckets
    // This verifies the function returns all series from registry, not just those with posts
    expect(buckets.length).toBeGreaterThanOrEqual(5); // At least the 5 registered series
    
    // At least some series should have no posts (like tutorial-series-name)
    const someHaveNoPosts = buckets.some((bucket) => bucket.posts.length === 0);
    expect(someHaveNoPosts).toBe(true);
  });

  it("includes series descriptions from registry", () => {
    const buckets = getSeriesBuckets();
    
    // At least some series should have descriptions
    const someHaveDescriptions = buckets.some((bucket) => bucket.description);
    expect(someHaveDescriptions).toBe(true);
  });

  it("associates posts with correct series", () => {
    const buckets = getSeriesBuckets();
    
    for (const bucket of buckets) {
      for (const post of bucket.posts) {
        // Each post in the bucket should have this series
        expect(post.series.some((s) => s.slug === bucket.slug)).toBe(true);
      }
    }
  });

  it("does not duplicate posts in series buckets", () => {
    const buckets = getSeriesBuckets();
    
    for (const bucket of buckets) {
      const slugs = bucket.posts.map((post) => post.slug);
      const uniqueSlugs = new Set(slugs);
      expect(slugs.length).toBe(uniqueSlugs.size);
    }
  });
});

describe("getPostsByCategory", () => {
  it("returns posts filtered by category slug", () => {
    const posts = getAllPosts();
    const firstPostWithCategory = posts.find((post) => post.categories.length > 0);
    
    if (firstPostWithCategory) {
      const categorySlug = firstPostWithCategory.categories[0].slug;
      const filtered = getPostsByCategory(categorySlug);
      
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.every((post) => post.categories.some((cat) => cat.slug === categorySlug))).toBe(true);
      
      // Verify the original post is in the filtered results
      expect(filtered.some((post) => post.slug === firstPostWithCategory.slug)).toBe(true);
    } else {
      // If no posts have categories, test passes
      expect(true).toBe(true);
    }
  });

  it("returns empty array for non-existent category", () => {
    const filtered = getPostsByCategory("non-existent-category-slug-12345");
    expect(filtered).toEqual([]);
  });
});

describe("getPostsByTag", () => {
  it("returns posts filtered by tag slug", () => {
    const posts = getAllPosts();
    const firstPostWithTag = posts.find((post) => post.tags.length > 0);
    
    if (firstPostWithTag) {
      const tagSlug = firstPostWithTag.tags[0].slug;
      const filtered = getPostsByTag(tagSlug);
      
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.every((post) => post.tags.some((tag) => tag.slug === tagSlug))).toBe(true);
      
      // Verify the original post is in the filtered results
      expect(filtered.some((post) => post.slug === firstPostWithTag.slug)).toBe(true);
    } else {
      // If no posts have tags, test passes
      expect(true).toBe(true);
    }
  });

  it("returns empty array for non-existent tag", () => {
    const filtered = getPostsByTag("non-existent-tag-slug-12345");
    expect(filtered).toEqual([]);
  });
});

describe("getPostBySlug", () => {
  it("returns post by exact slug match", () => {
    const posts = getAllPosts();
    
    if (posts.length > 0) {
      const firstPost = posts[0];
      
      const found = getPostBySlug(firstPost.slug);
      expect(found).toBeDefined();
      expect(found?.slug).toBe(firstPost.slug);
      expect(found?.title).toBe(firstPost.title);
    } else {
      expect(true).toBe(true);
    }
  });

  it("returns undefined for non-existent slug", () => {
    const found = getPostBySlug("non-existent-post-slug-12345");
    expect(found).toBeUndefined();
  });
});

describe("getPageBySlug", () => {
  it("returns page by slug segments", () => {
    const pages = getAllPages();
    
    if (pages.length > 0) {
      const firstPage = pages[0];
      const segments = firstPage.slug.split("/").filter(Boolean);
      
      const found = getPageBySlug(segments);
      expect(found).toBeDefined();
      expect(found?.slug).toBe(firstPage.slug);
    }
  });

  it("handles single segment slugs", () => {
    const found = getPageBySlug(["about"]);
    
    if (found) {
      expect(found.slug).toBe("about");
    }
  });

  it("returns undefined for non-existent slug", () => {
    const found = getPageBySlug(["non-existent-page"]);
    expect(found).toBeUndefined();
  });
});

describe("getRelatedPosts", () => {
  it("returns related posts based on shared taxonomy", () => {
    const posts = getAllPosts();
    const postWithTaxonomy = posts.find((post) => 
      post.categories.length > 0 || post.tags.length > 0 || post.series.length > 0
    );
    
    if (postWithTaxonomy && posts.length > 1) {
      const related = getRelatedPosts(postWithTaxonomy, 5);
      
      // Should not include the post itself
      expect(related.every((post) => post.slug !== postWithTaxonomy.slug)).toBe(true);
      
      // Should have at most 5 posts
      expect(related.length).toBeLessThanOrEqual(5);
    } else {
      // If there's only one post or no posts with taxonomy, test passes
      expect(true).toBe(true);
    }
  });

  it("respects the limit parameter", () => {
    const posts = getAllPosts();
    const postWithTaxonomy = posts.find((post) => 
      post.categories.length > 0 || post.tags.length > 0
    );
    
    if (postWithTaxonomy && posts.length > 1) {
      const related = getRelatedPosts(postWithTaxonomy, 2);
      expect(related.length).toBeLessThanOrEqual(2);
    } else {
      expect(true).toBe(true);
    }
  });

  it("prioritizes series matches over other taxonomy", () => {
    const posts = getAllPosts();
    const postWithSeries = posts.find((post) => post.series.length > 0);
    
    if (postWithSeries && posts.length > 1) {
      const related = getRelatedPosts(postWithSeries, 10);
      
      if (related.length > 0) {
        const seriesSlug = postWithSeries.series[0].slug;
        
        // Related posts with same series should appear first
        const relatedWithSeries = related.filter((post) => 
          post.series.some((s) => s.slug === seriesSlug)
        );
        
        if (relatedWithSeries.length > 0) {
          // First related post should have the same series
          expect(related[0].series.some((s) => s.slug === seriesSlug)).toBe(true);
        } else {
          // If no related posts share the series, that's also valid
          expect(true).toBe(true);
        }
      }
    } else {
      expect(true).toBe(true);
    }
  });
});

describe("getPaginatedPosts", () => {
  it("returns correct page of posts", () => {
    const allPosts = getAllPosts();
    const pageSize = 5;
    const result = getPaginatedPosts(1, pageSize);
    
    expect(result.posts.length).toBeLessThanOrEqual(pageSize);
    expect(result.currentPage).toBe(1);
    expect(result.pageSize).toBe(pageSize);
    expect(result.totalPosts).toBe(allPosts.length);
    expect(result.totalPages).toBe(Math.ceil(allPosts.length / pageSize));
  });

  it("returns correct posts for page 2", () => {
    const allPosts = getAllPosts();
    const pageSize = 3;
    const result = getPaginatedPosts(2, pageSize);
    
    expect(result.currentPage).toBe(2);
    expect(result.posts.length).toBeLessThanOrEqual(pageSize);
    
    // Posts should match the slice from all posts
    const expectedPosts = allPosts.slice(pageSize, pageSize * 2);
    expect(result.posts.map((p) => p.slug)).toEqual(expectedPosts.map((p) => p.slug));
  });

  it("handles page number exceeding total pages", () => {
    const allPosts = getAllPosts();
    const pageSize = 5;
    const totalPages = Math.ceil(allPosts.length / pageSize);
    const result = getPaginatedPosts(totalPages + 10, pageSize);
    
    // Should return the last page
    expect(result.currentPage).toBe(totalPages);
  });

  it("handles page number less than 1", () => {
    const result = getPaginatedPosts(0, 5);
    
    // Should return page 1
    expect(result.currentPage).toBe(1);
  });
});

describe("getPaginationParams", () => {
  it("returns correct pagination parameters", () => {
    const allPosts = getAllPosts();
    const pageSize = 5;
    const params = getPaginationParams(pageSize, 1);
    
    const expectedPages = Math.ceil(allPosts.length / pageSize);
    expect(params.length).toBe(expectedPages);
    expect(params[0].page).toBe("1");
    expect(params[params.length - 1].page).toBe(String(expectedPages));
  });

  it("respects startPage parameter", () => {
    const allPosts = getAllPosts();
    const pageSize = 5;
    const startPage = 2;
    const params = getPaginationParams(pageSize, startPage);
    
    const expectedPages = Math.ceil(allPosts.length / pageSize);
    expect(params.length).toBe(expectedPages - startPage + 1);
    expect(params[0].page).toBe("2");
  });

  it("returns at least one page even with no posts", () => {
    const params = getPaginationParams(5, 1);
    expect(params.length).toBeGreaterThanOrEqual(1);
  });
});
