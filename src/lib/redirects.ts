import siteConfig from "../../site.config";

import { getUrlConfig, normalizePathname } from "./urls";

export type AppRedirect = {
  source: string;
  destination: string;
  permanent: boolean;
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
export function getAppRedirects(): AppRedirect[] {
  const redirects: AppRedirect[] = [
    ...getWordPressLegacyRedirects(),
    ...(siteConfig.url?.redirects ?? []).map((redirect) => ({
      source: redirect.source,
      destination: redirect.destination,
      permanent: redirect.permanent ?? true,
    })),
  ];

  return Array.from(
    new Map(
      redirects.map((redirect) => [redirect.source, redirect])
    ).values()
  );
}
