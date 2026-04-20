import siteConfig from "../../site.config";

export type AppRedirect = {
  source: string;
  destination: string;
  permanent: boolean;
};

export function getAppRedirects(): AppRedirect[] {
  return (siteConfig.url?.redirects ?? []).map((redirect) => ({
    source: redirect.source,
    destination: redirect.destination,
    permanent: redirect.permanent ?? true,
  }));
}
