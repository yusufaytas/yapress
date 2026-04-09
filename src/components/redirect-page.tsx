"use client";

import Link from "next/link";
import { useEffect } from "react";

type RedirectPageProps = {
  to: string;
};

export function RedirectPage({ to }: RedirectPageProps) {
  useEffect(() => {
    window.location.replace(to);
  }, [to]);

  return (
    <div className="container section stack">
      <article className="prose-wrap stack">
        <h1 className="page-title">Redirecting</h1>
        <p className="lede">
          This URL has moved. Continue to <Link href={to} className="muted-link">{to}</Link>.
        </p>
      </article>
    </div>
  );
}
