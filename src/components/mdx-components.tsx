import Image from "next/image";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

function extractLanguage(className?: string) {
  const match = className?.match(/language-([\w-]+)/);
  return match?.[1] ?? "text";
}

export function MdxTable(props: ComponentPropsWithoutRef<"table">) {
  return (
    <div className="table-wrapper">
      <table {...props} />
    </div>
  );
}

export function MdxPre({ children }: { children: ReactNode }) {
  const child = children as {
    props?: {
      className?: string;
    };
  };
  const language = extractLanguage(child?.props?.className);

  return (
    <div className="code-block">
      <div className="code-block__header">
        <span className="code-block__dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span className="code-block__label">{language}</span>
      </div>
      <pre>{children}</pre>
    </div>
  );
}

export function MdxCode(props: ComponentPropsWithoutRef<"code">) {
  const isBlockCode = props.className?.includes("language-");

  if (isBlockCode) {
    return <code {...props} />;
  }

  return <code {...props} className={`inline-code ${props.className ?? ""}`.trim()} />;
}

export function MdxImage(props: ComponentPropsWithoutRef<"img">) {
  const { src, alt = "", title, width, height, ...rest } = props;
  
  if (!src || typeof src !== "string") {
    return null;
  }

  // Use title if provided, otherwise fall back to alt
  const caption = title || alt;

  // Check if it's an external image
  const isExternal = src.startsWith("http://") || src.startsWith("https://");
  
  if (isExternal) {
    // For external images, use regular img tag
    return (
      <span className="article-image">
        <img src={src} alt={alt} title={title} {...rest} />
        {caption && <span className="article-image__caption">{caption}</span>}
      </span>
    );
  }

  // For local images, use Next.js Image with optimization
  // Parse width and height if they're strings
  const imgWidth = typeof width === "string" ? parseInt(width, 10) : width || 800;
  const imgHeight = typeof height === "string" ? parseInt(height, 10) : height || 600;
  
  return (
    <span className="article-image">
      <Image
        src={src}
        alt={alt}
        title={title}
        width={imgWidth}
        height={imgHeight}
        style={{ width: "100%", height: "auto" }}
        {...rest}
      />
      {caption && <span className="article-image__caption">{caption}</span>}
    </span>
  );
}

export const mdxComponents = {
  pre: MdxPre,
  code: MdxCode,
  img: MdxImage,
  table: MdxTable,
};
