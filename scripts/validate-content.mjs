import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const postsDir = path.join(root, "content", "posts");
const categoriesPath = path.join(root, "content", "categories.ts");
const seriesPath = path.join(root, "content", "series.ts");

const categorySource = fs.readFileSync(categoriesPath, "utf8");
const categoryMatches = [...categorySource.matchAll(/slug:\s*"([^"]+)"/g)];
const categories = new Set(categoryMatches.map((match) => match[1]));

const seriesSource = fs.readFileSync(seriesPath, "utf8");
const seriesMatches = [...seriesSource.matchAll(/slug:\s*"([^"]+)"/g)];
const seriesRegistry = new Set(seriesMatches.map((match) => match[1]));

const files = fs
  .readdirSync(postsDir)
  .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"))
  .sort((a, b) => a.localeCompare(b));

let hasErrors = false;

for (const file of files) {
  const source = fs.readFileSync(path.join(postsDir, file), "utf8");
  const title = source.match(/^title:\s*(.+)$/m)?.[1];
  const slug = source.match(/^slug:\s*(.+)$/m)?.[1];
  const date = source.match(/^date:\s*(.+)$/m)?.[1];
  const categoryBlock = source.match(/^categories:\n((?:\s+-\s+.+\n?)+)/m)?.[1] ?? "";
  const postCategories = [...categoryBlock.matchAll(/-\s+([^\n]+)/g)].map((match) => match[1].trim());
  const seriesBlock = source.match(/^series:\n((?:\s+-\s+.+\n?)+)/m)?.[1] ?? "";
  const postSeries = [...seriesBlock.matchAll(/-\s+([^\n]+)/g)].map((match) => match[1].trim());

  if (!title || !slug || !date || postCategories.length === 0) {
    console.error(`Invalid frontmatter in ${file}`);
    hasErrors = true;
    continue;
  }

  for (const category of postCategories) {
    if (!categories.has(category)) {
      console.error(`Unknown category "${category}" in ${file}`);
      hasErrors = true;
    }
  }

  for (const series of postSeries) {
    if (!seriesRegistry.has(series)) {
      console.error(`Unknown series "${series}" in ${file}`);
      hasErrors = true;
    }
  }
}

if (hasErrors) {
  process.exit(1);
}

console.log(`Validated ${files.length} post files.`);

