import { describe, expect, it } from "vitest";

import {
  getAllPages,
  getAllPosts,
  getContentRedirects,
  getDateArchiveBuckets,
  getPageByPermalink,
  getPostsByDateArchive,
  getRedirectTarget,
  getTagBuckets,
  stripMarkdown,
} from "@/lib/content";

describe("content", () => {
  it("loads published posts sorted by newest first", () => {
    const posts = getAllPosts();

    expect(posts.length).toBeGreaterThan(0);
    expect(posts.some((post) => post.slug === "draft-example")).toBe(false);

    for (let index = 1; index < posts.length; index += 1) {
      const previous = new Date(posts[index - 1].date ?? 0).getTime();
      const current = new Date(posts[index].date ?? 0).getTime();
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

  it("generates legacy redirects for tag and category routes", () => {
    const redirects = getContentRedirects();

    expect(redirects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ from: "/category/documentation", to: "/categories/documentation" }),
        expect.objectContaining({ from: "/tag/seo", to: "/tags/seo" }),
      ])
    );
  });

  it("stores language and locale per content entry", () => {
    const post = getAllPosts()[0];

    expect(post.language).toBeTruthy();
    expect(post.locale).toBeTruthy();
  });

  it("redirects WordPress uploads to images directory", () => {
    // Test various WordPress upload URL patterns
    expect(getRedirectTarget("/wp-content/uploads/2024/01/image.jpg")).toBe("/images/2024/01/image.jpg");
    expect(getRedirectTarget("/wp-content/uploads/2023/12/photo.png")).toBe("/images/2023/12/photo.png");
    expect(getRedirectTarget("/wp-content/uploads/2025/06/document.pdf")).toBe("/images/2025/06/document.pdf");
    
    // Test with trailing slashes (should be normalized)
    expect(getRedirectTarget("/wp-content/uploads/2024/01/image.jpg/")).toBe("/images/2024/01/image.jpg");
    
    // Test non-WordPress paths should not redirect to images
    expect(getRedirectTarget("/some-other-path/2024/01/image.jpg")).not.toBe("/images/2024/01/image.jpg");
    expect(getRedirectTarget("/uploads/2024/01/image.jpg")).not.toBe("/images/2024/01/image.jpg");
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
