#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import http from "node:http";
import { parseStringPromise } from "xml2js";
import TurndownService from "turndown";

const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
  bulletListMarker: "-",
  emDelimiter: "*",
});

// Improve HTML to Markdown conversion
turndownService.addRule("strikethrough", {
  filter: ["del", "s", "strike"],
  replacement: (content) => `~~${content}~~`,
});

turndownService.addRule("pre", {
  filter: "pre",
  replacement: (content, node) => {
    const code = node.querySelector("code");
    const language = code?.className?.match(/language-(\w+)/)?.[1] || "";
    return `\n\`\`\`${language}\n${content}\n\`\`\`\n`;
  },
});

// Ensure lists are properly converted
turndownService.addRule("listItem", {
  filter: "li",
  replacement: (content, node, options) => {
    content = content
      .replace(/^\n+/, "") // remove leading newlines
      .replace(/\n+$/, "\n") // replace trailing newlines with just a single one
      .replace(/\n/gm, "\n    "); // indent
    
    let prefix = options.bulletListMarker + " ";
    const parent = node.parentNode;
    
    if (parent.nodeName === "OL") {
      const start = parent.getAttribute("start");
      const index = Array.prototype.indexOf.call(parent.children, node);
      prefix = (start ? Number(start) + index : index + 1) + ". ";
    }
    
    return prefix + content + (node.nextSibling && !/\n$/.test(content) ? "\n" : "");
  },
});

// Handle WordPress block quotes
turndownService.addRule("wpBlockquote", {
  filter: (node) => {
    return node.nodeName === "BLOCKQUOTE";
  },
  replacement: (content, node) => {
    // Clean up the content
    const lines = content.trim().split("\n");
    const quotedLines = lines.map(line => `> ${line}`).join("\n");
    return `\n${quotedLines}\n\n`;
  },
});

// Handle WordPress galleries
turndownService.addRule("wpGallery", {
  filter: (node) => {
    if (node.nodeName !== "FIGURE") return false;
    const className = node.getAttribute("class") || "";
    return className.includes("wp-block-gallery");
  },
  replacement: (content, node) => {
    // Extract all images from the gallery
    const images = Array.from(node.querySelectorAll("img"));
    if (images.length === 0) return "";
    
    // Determine grid class based on number of images
    let gridClass = "image-grid"; // default 3 columns
    if (images.length === 2) {
      gridClass = "image-grid-2";
    } else if (images.length >= 4 && images.length <= 5) {
      gridClass = "image-grid-4";
    } else if (images.length > 5) {
      gridClass = "image-grid-5";
    }
    
    let markdown = `\n<div className="${gridClass}">\n`;
    images.forEach((img) => {
      const src = img.getAttribute("src") || "";
      const alt = img.getAttribute("alt") || "";
      markdown += `  <img src="${src}" alt="${alt}" />\n`;
    });
    markdown += `</div>\n\n`;
    
    return markdown;
  },
});

// Handle WordPress verse blocks (preserve line breaks)
turndownService.addRule("wpVerse", {
  filter: (node) => {
    if (node.nodeName !== "PRE") return false;
    const className = node.getAttribute("class") || "";
    return className.includes("wp-block-verse");
  },
  replacement: (content, node) => {
    // Verse blocks should preserve formatting like poetry
    // Convert <br> to actual line breaks
    const html = node.innerHTML;
    const lines = html.split(/<br\s*\/?>/i);
    const cleanLines = lines.map(line => {
      // Strip HTML tags but keep the text
      return line.replace(/<[^>]*>/g, "").trim();
    }).filter(line => line.length > 0);
    
    return "\n" + cleanLines.join("  \n") + "\n\n";
  },
});

// Handle WordPress embed blocks (YouTube, TikTok, etc.)
turndownService.addRule("wpEmbed", {
  filter: (node) => {
    if (node.nodeName !== "FIGURE") return false;
    const className = node.getAttribute("class") || "";
    return className.includes("wp-block-embed");
  },
  replacement: (content, node) => {
    // Extract the URL from the embed wrapper
    const wrapper = node.querySelector(".wp-block-embed__wrapper");
    if (!wrapper) return content;
    
    const url = wrapper.textContent.trim();
    if (!url) return content;
    
    // Check if it's a YouTube URL
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      // Extract video ID from various YouTube URL formats
      let videoId = null;
      
      // Format: https://www.youtube.com/watch?v=VIDEO_ID
      const watchMatch = url.match(/[?&]v=([^&]+)/);
      if (watchMatch) {
        videoId = watchMatch[1];
      }
      
      // Format: https://youtu.be/VIDEO_ID
      const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
      if (shortMatch) {
        videoId = shortMatch[1];
      }
      
      // Format: https://www.youtube.com/embed/VIDEO_ID
      const embedMatch = url.match(/youtube\.com\/embed\/([^?&]+)/);
      if (embedMatch) {
        videoId = embedMatch[1];
      }
      
      if (videoId) {
        // Return as an iframe embed
        return `\n<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>\n\n`;
      }
    }
    
    // For non-YouTube embeds, return as a simple link
    return `\n[${url}](${url})\n\n`;
  },
});

// Handle direct iframe embeds (older WordPress format)
turndownService.addRule("iframeEmbed", {
  filter: (node) => {
    if (node.nodeName !== "IFRAME") return false;
    const src = node.getAttribute("src") || "";
    return src.includes("youtube.com") || src.includes("youtu.be");
  },
  replacement: (content, node) => {
    const src = node.getAttribute("src");
    if (!src) return "";
    
    // Normalize the YouTube embed URL
    let videoId = null;
    const embedMatch = src.match(/youtube\.com\/embed\/([^?&]+)/);
    if (embedMatch) {
      videoId = embedMatch[1];
    }
    
    if (videoId) {
      return `\n<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen></iframe>\n\n`;
    }
    
    // Fallback: keep the original iframe
    return `\n${node.outerHTML}\n\n`;
  },
});

// Handle WordPress code blocks with proper class detection
turndownService.addRule("wpCode", {
  filter: (node) => {
    if (node.nodeName !== "PRE") return false;
    const className = node.getAttribute("class") || "";
    return className.includes("wp-block-code");
  },
  replacement: (content, node) => {
    const code = node.querySelector("code");
    if (!code) return content;
    
    // Try to detect language from class or content
    const className = code.className || "";
    const languageMatch = className.match(/language-(\w+)/);
    const language = languageMatch ? languageMatch[1] : "";
    
    return `\n\`\`\`${language}\n${code.textContent}\n\`\`\`\n\n`;
  },
});

// Handle WordPress block tables
turndownService.addRule("wpTable", {
  filter: (node) => {
    if (node.nodeName === "TABLE") return true;
    if (node.nodeName === "FIGURE") {
      const className = node.getAttribute("class") || "";
      return className.includes("wp-block-table");
    }
    return false;
  },
  replacement: (content, node) => {
    // Find the actual table element
    const table = node.nodeName === "TABLE" ? node : node.querySelector("table");
    if (!table) return content;
    
    const rows = Array.from(table.querySelectorAll("tr"));
    if (rows.length === 0) return "";
    
    let markdown = "\n";
    
    // Process header row
    const headerRow = rows[0];
    const headerCells = Array.from(headerRow.querySelectorAll("th, td"));
    if (headerCells.length > 0) {
      markdown += "| " + headerCells.map(cell => cell.textContent.trim()).join(" | ") + " |\n";
      markdown += "| " + headerCells.map(() => "---").join(" | ") + " |\n";
    }
    
    // Process body rows
    const bodyRows = rows.slice(headerCells.length > 0 && headerRow.querySelector("th") ? 1 : 0);
    for (const row of bodyRows) {
      const cells = Array.from(row.querySelectorAll("td, th"));
      if (cells.length > 0) {
        markdown += "| " + cells.map(cell => cell.textContent.trim()).join(" | ") + " |\n";
      }
    }
    
    return markdown + "\n";
  },
});

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeTagSlug(slug) {
  // Strip trailing numbers like -2, -3, etc. from tag slugs
  // behavioral-feedback-2 -> behavioral-feedback
  return slug.replace(/-\d+$/, "");
}

function extractExcerpt(content, maxLength = 180) {
  const text = content
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/!\[.*?\]\(.*?\)/g, "") // Remove markdown images ![alt](url)
    .replace(/\[.*?\]\(.*?\)/g, "") // Remove markdown links [text](url)
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.slice(0, maxLength - 3).trim() + "...";
}

function parseWordPressDate(wpDate) {
  // WordPress date format: "2024-01-15 10:30:00"
  const date = new Date(wpDate);
  return date.toISOString().split("T")[0];
}

async function downloadImage(url, outputPath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    
    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Follow redirect
        downloadImage(response.headers.location, outputPath)
          .then(resolve)
          .catch(reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }
      
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      const fileStream = fs.createWriteStream(outputPath);
      response.pipe(fileStream);
      
      fileStream.on("finish", () => {
        fileStream.close();
        resolve(outputPath);
      });
      
      fileStream.on("error", (err) => {
        fs.unlink(outputPath, () => {});
        reject(err);
      });
    }).on("error", reject);
  });
}

function convertWordPressCaptions(content) {
  // Convert WordPress caption shortcodes to Markdown
  // [caption id="attachment_2844" align="aligncenter" width="1024"]<a href="..."><img src="..." alt="..." /></a> caption text[/caption]
  const captionRegex = /\[caption[^\]]*\](.*?)\[\/caption\]/gs;
  
  return content.replace(captionRegex, (match, captionContent) => {
    // Extract image URL and alt text
    const imgMatch = captionContent.match(/<img[^>]+src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*>/i);
    if (!imgMatch) {
      // Try without alt attribute
      const simpleImgMatch = captionContent.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
      if (!simpleImgMatch) return match; // Keep original if can't parse
      
      const src = simpleImgMatch[1];
      // Extract caption text (everything after the closing </a> or </img>)
      const captionText = captionContent.replace(/<[^>]+>/g, '').trim();
      
      return `![${captionText}](${src})`;
    }
    
    const src = imgMatch[1];
    const alt = imgMatch[2];
    
    // Extract caption text (everything after the closing </a> or </img>)
    const captionText = captionContent.replace(/<[^>]+>/g, '').trim() || alt;
    
    return `![${captionText}](${src})`;
  });
}

function extractImageUrls(content) {
  const imageRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  const urls = [];
  let match;
  
  while ((match = imageRegex.exec(content)) !== null) {
    urls.push(match[1]);
  }
  
  return urls;
}

function getWordPressImagePath(imageUrl) {
  // Extract path from WordPress URL
  // Example: https://example.com/wp-content/uploads/2024/01/image.jpg
  // Returns: { newPath: "/images/2024/01/image.jpg", oldPath: "/wp-content/uploads/2024/01/image.jpg" }
  try {
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(/\/wp-content\/uploads\/(\d{4})\/(\d{2})\/(.+)/);
    
    if (!pathMatch) {
      return null;
    }
    
    const [, year, month, filename] = pathMatch;
    return {
      newPath: `/images/${year}/${month}/${filename}`,
      oldPath: `/wp-content/uploads/${year}/${month}/${filename}`,
    };
  } catch {
    return null;
  }
}

async function processImages(content, publicDir) {
  const imageUrls = extractImageUrls(content);
  const downloadedImages = new Map();
  const redirects = [];
  
  for (const imageUrl of imageUrls) {
    const paths = getWordPressImagePath(imageUrl);
    
    if (!paths) {
      console.log(`   ⚠️  Skipping non-WordPress image: ${imageUrl}`);
      continue;
    }
    
    // Save to clean path: /images/2024/01/image.jpg
    const localPath = path.join(publicDir, paths.newPath);
    
    try {
      // Skip if already downloaded
      if (fs.existsSync(localPath)) {
        downloadedImages.set(imageUrl, paths.newPath);
        redirects.push({ from: paths.oldPath, to: paths.newPath });
        continue;
      }
      
      await downloadImage(imageUrl, localPath);
      downloadedImages.set(imageUrl, paths.newPath);
      redirects.push({ from: paths.oldPath, to: paths.newPath });
      console.log(`   ✓ Downloaded: ${paths.newPath}`);
    } catch (error) {
      console.log(`   ✗ Failed to download ${imageUrl}: ${error.message}`);
    }
  }
  
  // Replace image URLs in content
  let updatedContent = content;
  for (const [originalUrl, localPath] of downloadedImages) {
    updatedContent = updatedContent.replace(
      new RegExp(originalUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
      localPath
    );
  }
  
  return { content: updatedContent, redirects };
}

async function parseWordPressXML(xmlPath, publicDir) {
  const xmlContent = fs.readFileSync(xmlPath, "utf8");
  const result = await parseStringPromise(xmlContent);
  
  const channel = result.rss.channel[0];
  const items = channel.item || [];
  
  const posts = [];
  const categories = new Map(); // Map of slug -> display name
  const tags = new Set();
  const allRedirects = [];
  
  console.log("\n📥 Processing posts and downloading images...");
  
  for (const item of items) {
    // Only process published posts
    const postType = item["wp:post_type"]?.[0];
    const status = item["wp:status"]?.[0];
    
    if (postType !== "post" || status !== "publish") {
      continue;
    }
    
    const title = item.title?.[0] || "Untitled";
    const content = item["content:encoded"]?.[0] || "";
    const excerpt = item["excerpt:encoded"]?.[0] || extractExcerpt(content);
    const pubDate = item.pubDate?.[0] || item["wp:post_date"]?.[0];
    const modifiedDate = item["wp:post_modified"]?.[0];
    const slug = item["wp:post_name"]?.[0] || slugify(title);
    const legacyLink = item.link?.[0];
    
    console.log(`\n   Processing: ${title}`);
    
    // Extract categories
    const postCategories = [];
    const postTags = [];
    
    if (item.category) {
      for (const cat of item.category) {
        const domain = cat.$?.domain;
        const nicename = cat.$?.nicename;
        const name = cat._;
        
        if (domain === "category" && nicename) {
          postCategories.push(nicename);
          categories.set(nicename, name); // Store slug -> display name mapping
        } else if (domain === "post_tag" && nicename) {
          // Normalize tag slug to remove trailing numbers
          const normalizedTag = normalizeTagSlug(nicename);
          postTags.push(normalizedTag);
          tags.add(name);
        }
      }
    }
    
    // Convert WordPress caption shortcodes first (before processing images)
    const contentWithCaptions = convertWordPressCaptions(content);
    
    // Process images and update content
    const { content: processedContent, redirects } = await processImages(contentWithCaptions, publicDir);
    allRedirects.push(...redirects);
    
    // Strip WordPress block comments before conversion
    const cleanedContent = processedContent.replace(/<!-- wp:.*?-->/g, "");
    
    // Convert HTML to Markdown
    const markdown = turndownService.turndown(cleanedContent);
    
    // Extract legacy path and only add as alias if different from slug
    const aliases = [];
    if (legacyLink) {
      try {
        const legacyPath = new URL(legacyLink).pathname;
        // Only add as alias if it's not just the slug itself
        // This prevents redirecting /slug to /slug
        if (legacyPath !== `/${slug}` && legacyPath !== `/${slug}/`) {
          aliases.push(legacyPath);
        }
      } catch (error) {
        console.log(`   ⚠️  Invalid legacy link: ${legacyLink}`);
      }
    }
    
    posts.push({
      title,
      slug,
      date: parseWordPressDate(pubDate),
      lastUpdated: modifiedDate ? parseWordPressDate(modifiedDate) : undefined,
      content: markdown,
      excerpt: turndownService.turndown(excerpt),
      categories: postCategories,
      tags: postTags,
      aliases,
    });
  }
  
  return { posts, categories: Array.from(categories.entries()), tags: Array.from(tags), redirects: allRedirects };
}

function escapeYamlValue(value) {
  if (!value) return value;
  
  // Convert to string if not already
  const str = String(value);
  
  // Check if value needs quoting (contains special YAML characters)
  const needsQuoting = /[:#@&*!|>'"{}[\],&%`]/.test(str) || 
                       /^(?:[-+]?\d+(?:\.\d+)?|true|false|null|~)$/i.test(str) ||
                       str.startsWith('-') || 
                       str.startsWith('?') ||
                       str.trim() !== str; // has leading/trailing whitespace
  
  if (!needsQuoting) {
    return str;
  }
  
  // Escape double quotes and wrap in double quotes
  const escaped = str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return `"${escaped}"`;
}

function generateFrontmatter(post) {
  const lines = [
    "---",
    `title: ${escapeYamlValue(post.title)}`,
    `slug: ${post.slug}`,
    `datePublished: ${post.date}`,
  ];
  
  // Add dateModified if it exists and is different from datePublished
  if (post.lastUpdated && post.lastUpdated !== post.date) {
    lines.push(`dateModified: ${post.lastUpdated}`);
  }
  
  if (post.categories.length > 0) {
    lines.push("categories:");
    post.categories.forEach((cat) => lines.push(`  - ${escapeYamlValue(cat)}`));
  }
  
  if (post.tags.length > 0) {
    lines.push("tags:");
    post.tags.forEach((tag) => lines.push(`  - ${escapeYamlValue(tag)}`));
  }
  
  if (post.excerpt) {
    lines.push(`description: ${escapeYamlValue(post.excerpt)}`);
  }

  if (post.aliases.length > 0) {
    lines.push("aliases:");
    post.aliases.forEach((alias) => lines.push(`  - ${escapeYamlValue(alias)}`));
  }
  
  lines.push("---");
  lines.push("");
  
  return lines.join("\n");
}

function generateCategoriesFile(categories) {
  const lines = [
    'import type { CategoryDefinition } from "@/types/content";',
    "",
    "const categories: CategoryDefinition[] = [",
  ];
  
  categories.forEach(([slug, displayName]) => {
    lines.push("  {");
    lines.push(`    slug: "${slug}",`);
    lines.push(`    title: "${displayName}",`);
    lines.push(`    description: "Posts about ${displayName.toLowerCase()}",`);
    lines.push("  },");
  });
  
  lines.push("];");
  lines.push("");
  lines.push("export default categories;");
  lines.push("");
  
  return lines.join("\n");
}

async function importWordPress(xmlPath, outputDir = "content") {
  console.log("🔄 Parsing WordPress XML export...");
  
  const publicDir = "public";
  const { posts, categories, tags, redirects } = await parseWordPressXML(xmlPath, publicDir);
  
  console.log(`\n📊 Summary:`);
  console.log(`   ${posts.length} posts`);
  console.log(`   ${categories.length} categories`);
  console.log(`   ${tags.length} tags`);
  console.log(`   ${redirects.length} images downloaded`);
  
  // Create output directories
  const postsDir = path.join(outputDir, "posts");
  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
  }
  
  // Write posts
  console.log("\n📝 Writing posts...");
  for (const post of posts) {
    // Extract year and month from post date
    const postDate = new Date(post.date);
    const year = postDate.getFullYear();
    const month = String(postDate.getMonth() + 1).padStart(2, "0");
    
    // Create year/month directory structure
    const postDir = path.join(postsDir, String(year), month);
    if (!fs.existsSync(postDir)) {
      fs.mkdirSync(postDir, { recursive: true });
    }
    
    const filename = `${post.slug}.md`;
    const filepath = path.join(postDir, filename);
    const content = generateFrontmatter(post) + post.content;
    
    fs.writeFileSync(filepath, content, "utf8");
    console.log(`   ✓ ${year}/${month}/${filename}`);
  }
  
  // Write categories file
  console.log("\n📁 Writing categories...");
  const categoriesPath = path.join(outputDir, "categories.ts");
  const categoriesContent = generateCategoriesFile(categories);
  fs.writeFileSync(categoriesPath, categoriesContent, "utf8");
  console.log(`   ✓ categories.ts`);
  
  console.log("\n✅ Import complete!");
  console.log("\n📋 Next steps:");
  console.log("   1. Review imported posts in content/posts/");
  console.log("   2. Check downloaded images in public/images/YYYY/MM/");
  console.log("   3. Update category descriptions in content/categories.ts");
  console.log("   4. Run: npm run dev");
  console.log("   5. Verify content and image redirects work correctly");
  console.log("\n💡 Note: WordPress image URLs (/wp-content/uploads/...) will automatically");
  console.log("   redirect to /images/... using the catch-all redirect handler.");
}

// CLI
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log("WordPress to YaPress Importer");
  console.log("");
  console.log("Usage:");
  console.log("  node scripts/import-wordpress.mjs <wordpress-export.xml> [output-dir]");
  console.log("");
  console.log("Example:");
  console.log("  node scripts/import-wordpress.mjs wordpress-export.xml content");
  console.log("");
  console.log("To export from WordPress:");
  console.log("  1. Go to Tools → Export in WordPress admin");
  console.log("  2. Select 'All content' or 'Posts'");
  console.log("  3. Download the XML file");
  console.log("  4. Run this script with the XML file path");
  process.exit(1);
}

const xmlPath = args[0];
const outputDir = args[1] || "content";

if (!fs.existsSync(xmlPath)) {
  console.error(`❌ Error: File not found: ${xmlPath}`);
  process.exit(1);
}

importWordPress(xmlPath, outputDir).catch((error) => {
  console.error("❌ Import failed:", error.message);
  process.exit(1);
});
