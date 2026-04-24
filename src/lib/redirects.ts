import siteConfig from "../../site.config";

import { getUrlConfig, normalizePathname } from "./urls";

export type AppRedirectMatch = {
  type: "host";
  value: string;
};

export type AppRedirect = {
  source: string;
  destination: string;
  permanent: boolean;
  has?: AppRedirectMatch[];
};

function getWordPressLegacyRedirects(): AppRedirect[] {
  const config = getUrlConfig();
  const redirects: AppRedirect[] = [
    {
      source: "/feed",
      destination: "/rss.xml",
      permanent: true,
    },
    {
      source: "/feed/",
      destination: "/rss.xml",
      permanent: true,
    },
    {
      source: "/:slug/comment-page-:page",
      destination: "/:slug",
      permanent: true,
    },
  ];

  const legacyCategoryBase = config.wordpress.legacyCategoryBase?.trim();
  if (legacyCategoryBase) {
    redirects.push(
      {
        source: normalizePathname(`/${legacyCategoryBase}/:slug`),
        destination: "/categories/:slug",
        permanent: true,
      },
      {
        source: normalizePathname(`/${legacyCategoryBase}/:slug/page/:page`),
        destination: "/categories/:slug",
        permanent: true,
      }
    );
  }

  const legacyTagBase = config.wordpress.legacyTagBase?.trim();
  if (legacyTagBase) {
    redirects.push(
      {
        source: normalizePathname(`/${legacyTagBase}/:slug`),
        destination: "/tags/:slug",
        permanent: true,
      },
      {
        source: normalizePathname(`/${legacyTagBase}/:slug/page/:page`),
        destination: "/tags/:slug",
        permanent: true,
      }
    );
  }

  return redirects;
}

function getCanonicalHostRedirects(): AppRedirect[] {
  const canonicalUrl = new URL(siteConfig.siteUrl);
  const canonicalHost = canonicalUrl.hostname;
  const alternateHost = canonicalHost.startsWith("www.")
    ? canonicalHost.slice(4)
    : `www.${canonicalHost}`;

  if (alternateHost === canonicalHost) {
    return [];
  }

  return [
    {
      source: "/:path*",
      has: [{ type: "host", value: alternateHost }],
      destination: `${canonicalUrl.origin}/:path*`,
      permanent: true,
    },
  ];
}

export function getAppRedirects(): AppRedirect[] {
  const redirects: AppRedirect[] = [
    ...getCanonicalHostRedirects(),
    ...getWordPressLegacyRedirects(),
    ...(siteConfig.url?.redirects ?? []).map((redirect) => ({
      source: redirect.source,
      destination: redirect.destination,
      permanent: redirect.permanent ?? true,
    })),
  ];

  return Array.from(
    new Map(
      redirects.map((redirect) => [
        `${redirect.source}::${JSON.stringify(redirect.has ?? [])}`,
        redirect,
      ])
    ).values()
  );
}
