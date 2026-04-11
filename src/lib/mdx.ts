function escapeNumericLessThanInTextSegment(segment: string) {
  return segment.replace(/(^|[^\w`])<(?=\d)/g, "$1&lt;");
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

    normalized.push(escapeNumericLessThanInTextSegment(line));
  }

  return normalized.join("\n");
}
