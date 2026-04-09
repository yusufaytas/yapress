import Link from "next/link";

type TaxonomyPillProps = {
  href: string;
  label: string;
};

export function TaxonomyPill({ href, label }: TaxonomyPillProps) {
  return (
    <Link href={href} className="pill">
      {label}
    </Link>
  );
}

