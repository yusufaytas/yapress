import { getAllPosts } from "@/lib/content";
export const dynamic = "force-static";

export function GET() {
  return Response.json(
    getAllPosts().map((post) => ({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      date: post.datePublished?.toISOString(),
      categories: post.categories.map((category) => category.title),
      permalink: post.permalink,
    }))
  );
}
