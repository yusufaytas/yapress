import { normalizeInternalAbsoluteUrl } from "@/lib/site";

function escapeNumericLessThanInTextSegment(segment: string) {
  return segment.replace(/(^|[^\w`])<(?=\d)/g, "$1&lt;");
}

function normalizeInternalAbsoluteUrls(segment: string) {
  return segment.replace(
    /https?:\/\/[^\s<)"'\]]+/g,
    (match) => normalizeInternalAbsoluteUrl(match)
  );
}

export function normalizeMdxSource(source: string) {
  const lines = source.split("\n");
  const normalized: string[] = [];
  let inFence = false;

  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      normalized.push(line);
      continue;
    }

    if (inFence) {
      normalized.push(line);
      continue;
    }

    normalized.push(normalizeInternalAbsoluteUrls(escapeNumericLessThanInTextSegment(line)));
  }

  return normalized.join("\n");
}
