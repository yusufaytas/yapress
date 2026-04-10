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

// Handle WordPress block tables
turndownService.addRule("wpTable", {
  filter: (node) => {
    return node.nodeName === "TABLE" || 
           (node.nodeName === "FIGURE" && node.classList?.contains("wp-block-table"));
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
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
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
  const categories = new Set();
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
          categories.add(name);
        } else if (domain === "post_tag" && nicename) {
          // Normalize tag slug to remove trailing numbers
          const normalizedTag = normalizeTagSlug(nicename);
          postTags.push(normalizedTag);
          tags.add(name);
        }
      }
    }
    
    // Process images and update content
    const { content: processedContent, redirects } = await processImages(content, publicDir);
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
      content: markdown,
      excerpt: turndownService.turndown(excerpt),
      categories: postCategories,
      tags: postTags,
      aliases,
    });
  }
  
  return { posts, categories: Array.from(categories), tags: Array.from(tags), redirects: allRedirects };
}

function escapeYamlValue(value) {
  if (!value) return value;
  
  // Convert to string if not already
  const str = String(value);
  
  // Check if value needs quoting (contains special YAML characters)
  const needsQuoting = /[:#@&*!|>'"{}[\],&%`]/.test(str) || 
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
    `date: ${post.date}`,
  ];
  
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
  
  categories.forEach((category) => {
    const slug = slugify(category);
    lines.push("  {");
    lines.push(`    slug: "${slug}",`);
    lines.push(`    title: "${category}",`);
    lines.push(`    description: "Posts about ${category.toLowerCase()}",`);
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
