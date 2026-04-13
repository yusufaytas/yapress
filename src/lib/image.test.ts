import { describe, expect, it } from "vitest";
import { extractFirstImageFromContent, resolveContentImage } from "@/lib/image";

describe("extractFirstImageFromContent", () => {
  describe("markdown images", () => {
    it("extracts image from markdown syntax with alt text", () => {
      const content = "Some text ![Alt text](/images/photo.jpg) more text";
      const result = extractFirstImageFromContent(content);
      expect(result).toContain("/images/photo.jpg");
    });

    it("extracts image from markdown syntax without alt text", () => {
      const content = "Some text ![](/images/photo.jpg) more text";
      const result = extractFirstImageFromContent(content);
      expect(result).toContain("/images/photo.jpg");
    });

    it("extracts image from markdown syntax with title", () => {
      const content = '![Alt text](/images/photo.jpg "Image title") more text';
      const result = extractFirstImageFromContent(content);
      expect(result).toContain("/images/photo.jpg");
    });

    it("extracts absolute URL from markdown", () => {
      const content = "![Photo](https://example.com/photo.jpg)";
      const result = extractFirstImageFromContent(content);
      expect(result).toBe("https://example.com/photo.jpg");
    });

    it("handles markdown images with special characters in alt text", () => {
      const content = "![Alt text with special chars!@#](/images/photo.jpg)";
      const result = extractFirstImageFromContent(content);
      expect(result).toContain("/images/photo.jpg");
    });
  });

  describe("HTML images", () => {
    it("extracts image from HTML img tag with double quotes", () => {
      const content = '<div><img src="/images/photo.jpg" alt="Photo" /></div>';
      const result = extractFirstImageFromContent(content);
      expect(result).toContain("/images/photo.jpg");
    });

    it("extracts image from HTML img tag with single quotes", () => {
      const content = "<div><img src='/images/photo.jpg' alt='Photo' /></div>";
      const result = extractFirstImageFromContent(content);
      expect(result).toContain("/images/photo.jpg");
    });

    it("extracts image from HTML img tag without closing slash", () => {
      const content = '<img src="/images/photo.jpg" alt="Photo">';
      const result = extractFirstImageFromContent(content);
      expect(result).toContain("/images/photo.jpg");
    });

    it("extracts image from HTML img tag with multiple attributes", () => {
      const content = '<img class="photo" src="/images/photo.jpg" alt="Photo" width="500" height="300" />';
      const result = extractFirstImageFromContent(content);
      expect(result).toContain("/images/photo.jpg");
    });

    it("extracts absolute URL from HTML img tag", () => {
      const content = '<img src="https://example.com/photo.jpg" alt="Photo" />';
      const result = extractFirstImageFromContent(content);
      expect(result).toBe("https://example.com/photo.jpg");
    });

    it("handles HTML img tags with src attribute in different positions", () => {
      const content = '<img alt="Photo" class="image" src="/images/photo.jpg" />';
      const result = extractFirstImageFromContent(content);
      expect(result).toContain("/images/photo.jpg");
    });
  });

  describe("mixed content", () => {
    it("returns the first image when both markdown and HTML are present", () => {
      const content = `
        Some text here
        ![First](/images/first.jpg)
        More text
        <img src="/images/second.jpg" alt="Second" />
      `;
      const result = extractFirstImageFromContent(content);
      expect(result).toContain("/images/first.jpg");
    });

    it("returns HTML image when it appears before markdown", () => {
      const content = `
        Some text here
        <img src="/images/first.jpg" alt="First" />
        More text
        ![Second](/images/second.jpg)
      `;
      const result = extractFirstImageFromContent(content);
      expect(result).toContain("/images/first.jpg");
    });

    it("handles multiple images and returns the first one", () => {
      const content = `
        ![Image 1](/images/img1.jpg)
        ![Image 2](/images/img2.jpg)
        <img src="/images/img3.jpg" />
      `;
      const result = extractFirstImageFromContent(content);
      expect(result).toContain("/images/img1.jpg");
    });
  });

  describe("edge cases", () => {
    it("returns undefined when no images are present", () => {
      const content = "Just some text without any images";
      const result = extractFirstImageFromContent(content);
      expect(result).toBeUndefined();
    });

    it("returns undefined for empty content", () => {
      const content = "";
      const result = extractFirstImageFromContent(content);
      expect(result).toBeUndefined();
    });

    it("ignores images with empty src", () => {
      const content = '![Alt]() <img src="" /> ![Valid](/images/photo.jpg)';
      const result = extractFirstImageFromContent(content);
      expect(result).toContain("/images/photo.jpg");
    });

    it("ignores images with whitespace-only src", () => {
      const content = '![Alt](   ) <img src="  " /> ![Valid](/images/photo.jpg)';
      const result = extractFirstImageFromContent(content);
      expect(result).toContain("/images/photo.jpg");
    });

    it("handles images in code blocks (should still extract them)", () => {
      const content = `
        \`\`\`markdown
        ![Code example](/images/in-code.jpg)
        \`\`\`
        ![Real image](/images/real.jpg)
      `;
      const result = extractFirstImageFromContent(content);
      // Should extract the first image found, even if in code block
      expect(result).toContain("/images/in-code.jpg");
    });

    it("handles relative paths without leading slash", () => {
      const content = "![Photo](images/photo.jpg)";
      const result = extractFirstImageFromContent(content);
      // Should return undefined as relative paths without / are not valid
      expect(result).toBeUndefined();
    });

    it("handles images with query parameters", () => {
      const content = "![Photo](/images/photo.jpg?w=500&h=300)";
      const result = extractFirstImageFromContent(content);
      expect(result).toContain("/images/photo.jpg");
    });

    it("handles images with fragments", () => {
      const content = "![Photo](/images/photo.jpg#section)";
      const result = extractFirstImageFromContent(content);
      expect(result).toContain("/images/photo.jpg");
    });
  });

  describe("real-world scenarios", () => {
    it("extracts image from blog post with mixed content", () => {
      const content = `
# Blog Post Title

This is an introduction paragraph with some text.

## Section 1

More text here with a [link](https://example.com).

![Featured Image](/images/featured.jpg)

Some more content after the image.

<div class="gallery">
  <img src="/images/gallery1.jpg" alt="Gallery 1" />
  <img src="/images/gallery2.jpg" alt="Gallery 2" />
</div>
      `;
      const result = extractFirstImageFromContent(content);
      expect(result).toContain("/images/featured.jpg");
    });

    it("extracts image from content with inline HTML", () => {
      const content = `
<div class="hero">
  <img src="/images/hero.jpg" alt="Hero image" />
</div>

# Article Title

![Another image](/images/article.jpg)
      `;
      const result = extractFirstImageFromContent(content);
      expect(result).toContain("/images/hero.jpg");
    });
  });
});

describe("resolveContentImage", () => {
  it("prioritizes explicit image from frontmatter", () => {
    const explicitImage = "/images/explicit.jpg";
    const content = "![Content image](/images/content.jpg)";
    const result = resolveContentImage(explicitImage, content);
    expect(result).toContain("/images/explicit.jpg");
  });

  it("falls back to content image when no explicit image", () => {
    const content = "![Content image](/images/content.jpg)";
    const result = resolveContentImage(undefined, content);
    expect(result).toContain("/images/content.jpg");
  });

  it("falls back to site default when no explicit or content image", () => {
    const content = "Just text without images";
    const result = resolveContentImage(undefined, content);
    // Should return site default (from siteConfig.siteImage.src)
    expect(result).toBeDefined();
  });

  it("handles absolute URLs in explicit image", () => {
    const explicitImage = "https://example.com/image.jpg";
    const content = "![Content image](/images/content.jpg)";
    const result = resolveContentImage(explicitImage, content);
    expect(result).toBe("https://example.com/image.jpg");
  });

  it("handles empty string as explicit image", () => {
    const content = "![Content image](/images/content.jpg)";
    const result = resolveContentImage("", content);
    expect(result).toContain("/images/content.jpg");
  });

  it("handles whitespace-only explicit image", () => {
    const content = "![Content image](/images/content.jpg)";
    const result = resolveContentImage("   ", content);
    expect(result).toContain("/images/content.jpg");
  });

  it("normalizes relative paths in explicit image", () => {
    const explicitImage = "/images/photo.jpg";
    const content = "Some content";
    const result = resolveContentImage(explicitImage, content);
    expect(result).toContain("/images/photo.jpg");
  });
});
