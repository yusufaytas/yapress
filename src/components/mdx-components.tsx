import Image from "next/image";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { renderHighlightedCode } from "@/lib/codeHighlight";
import { ContactForm } from "@/components/contact-form";

function extractLanguage(className?: string) {
  const match = className?.match(/language-([\w-]+)/);
  return match?.[1] ?? "text";
}

function flattenText(children: ReactNode): string {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }

  if (Array.isArray(children)) {
    return children.map((child) => flattenText(child)).join("");
  }

  if (children && typeof children === "object" && "props" in children) {
    return flattenText((children as { props?: { children?: ReactNode } }).props?.children);
  }

  return "";
}

function slugifyHeading(children: ReactNode): string {
  return flattenText(children)
    .trim()
    .toLowerCase()
    .replace(/['".,!?()[\]{}]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function MdxHeading({
  as: Tag,
  children,
  ...props
}: ComponentPropsWithoutRef<"h2"> & {
  as: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}) {
  const id = slugifyHeading(children);

  if (!id) {
    return <Tag {...props}>{children}</Tag>;
  }

  return (
    <Tag id={id} {...props}>
      <a href={`#${id}`} className="heading-anchor" aria-label={`Link to section: ${flattenText(children).trim()}`}>
        <span className="heading-anchor__symbol" aria-hidden="true">
          #
        </span>
        <span className="heading-anchor__text">{children}</span>
      </a>
    </Tag>
  );
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
      children?: ReactNode;
    };
  };
  const language = extractLanguage(child?.props?.className);
  const source = flattenText(child?.props?.children);

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
      <pre>
        <code className={child?.props?.className}>
          {source ? renderHighlightedCode(source, language) : children}
        </code>
      </pre>
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

  const caption = title || alt;
  const isExternal = src.startsWith("http://") || src.startsWith("https://");
  const imgWidth = typeof width === "string" ? parseInt(width, 10) : width || 800;
  const imgHeight = typeof height === "string" ? parseInt(height, 10) : height || 600;
  const resolvedSrc = isExternal || src.startsWith("/") ? src : `/${src}`;
  const unoptimized = resolvedSrc.endsWith(".svg");

  return (
    <span className="article-image">
      <Image
        src={resolvedSrc}
        alt={alt}
        title={title}
        width={imgWidth}
        height={imgHeight}
        sizes="(max-width: 48rem) 100vw, 48rem"
        unoptimized={unoptimized}
        style={{
          width: "100%",
          height: "auto",
          maxWidth: "100%",
        }}
        {...rest}
      />
      {caption && <span className="article-image__caption">{caption}</span>}
    </span>
  );
}

export const mdxComponents = {
  h1: (props: ComponentPropsWithoutRef<"h1">) => <MdxHeading as="h1" {...props} />,
  h2: (props: ComponentPropsWithoutRef<"h2">) => <MdxHeading as="h2" {...props} />,
  h3: (props: ComponentPropsWithoutRef<"h3">) => <MdxHeading as="h3" {...props} />,
  h4: (props: ComponentPropsWithoutRef<"h4">) => <MdxHeading as="h4" {...props} />,
  h5: (props: ComponentPropsWithoutRef<"h5">) => <MdxHeading as="h5" {...props} />,
  h6: (props: ComponentPropsWithoutRef<"h6">) => <MdxHeading as="h6" {...props} />,
  pre: MdxPre,
  code: MdxCode,
  img: MdxImage,
  table: MdxTable,
  ContactForm,
};
