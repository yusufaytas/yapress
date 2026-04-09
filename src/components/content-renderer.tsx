import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

import { mdxComponents } from "@/components/mdx-components";

type ContentRendererProps = {
  source: string;
};

export async function ContentRenderer({ source }: ContentRendererProps) {
  const { content } = await compileMDX({
    source,
    components: mdxComponents,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm]
      },
      parseFrontmatter: false
    }
  });

  return <div className="article-body">{content}</div>;
}
