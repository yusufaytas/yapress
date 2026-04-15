"use client";

import { useEffect, useRef, useState } from "react";

export interface HighlightTarget {
  text: string;
  start?: number;
  end?: number;
  prefix?: string;
  suffix?: string;
}

interface TooltipState {
  show: boolean;
  x: number;
  y: number;
  copied: boolean;
  target: HighlightTarget | null;
}

const hiddenTooltip: TooltipState = {
  show: false,
  x: 0,
  y: 0,
  copied: false,
  target: null,
};

export function buildHighlightFragment(target: HighlightTarget) {
  const params = new URLSearchParams({ highlight: target.text });

  if (target.start !== undefined && target.end !== undefined) {
    params.set("s", String(target.start));
    params.set("e", String(target.end));
  }
  if (target.prefix) params.set("p", target.prefix);
  if (target.suffix) params.set("q", target.suffix);

  return `#${params.toString()}`;
}

export function parseHighlightFragment(hash: string): HighlightTarget | null {
  if (!hash.startsWith("#")) return null;

  const params = new URLSearchParams(hash.slice(1));
  const text = params.get("highlight")?.trim();
  if (!text) return null;
  const prefix = params.get("p")?.trim() || undefined;
  const suffix = params.get("q")?.trim() || undefined;
  const quote = { text, ...(prefix ? { prefix } : {}), ...(suffix ? { suffix } : {}) };

  const startValue = params.get("s");
  const endValue = params.get("e");
  if (startValue === null || endValue === null) return quote;

  const start = Number(startValue);
  const end = Number(endValue);
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || end <= start) {
    return quote;
  }

  return { ...quote, start, end };
}

export function TextHighlighter() {
  const [tooltip, setTooltip] = useState<TooltipState>(hiddenTooltip);
  const selectionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copiedTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const applyFragment = () => {
      const target = parseHighlightFragment(window.location.hash);
      if (target) {
        highlightTextInPage(target);
      } else {
        const articleBody = document.querySelector<HTMLElement>(".article-body");
        if (articleBody) removeHighlights(articleBody);
      }
    };

    applyFragment();

    const handleSelection = (event: PointerEvent) => {
      const eventTarget = event.target;
      if (eventTarget instanceof Element && eventTarget.closest(".text-highlight-marker")) return;
      if (selectionTimeout.current) clearTimeout(selectionTimeout.current);

      // Safari needs a short delay to settle the selection.
      selectionTimeout.current = setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
          setTooltip(hiddenTooltip);
          return;
        }

        const selectedText = selection.toString().trim();
        if (selectedText.length < 3) {
          setTooltip(hiddenTooltip);
          return;
        }

        const articleBody = document.querySelector<HTMLElement>(".article-body");
        const range = selection.getRangeAt(0);
        if (
          !articleBody ||
          !articleBody.contains(range.startContainer) ||
          !articleBody.contains(range.endContainer)
        ) {
          setTooltip(hiddenTooltip);
          return;
        }

        const target = getHighlightTarget(articleBody, range, selectedText);
        const fragment = buildHighlightFragment(target);
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}${window.location.search}${fragment}`,
        );

        const rect = range.getBoundingClientRect();
        highlightTextInPage(target);
        selection.removeAllRanges();

        setTooltip({
          show: true,
          x: rect.right + window.scrollX,
          y: rect.bottom + window.scrollY,
          copied: false,
          target,
        });
      }, 50);
    };

    const handleClickOutside = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Element && target.closest(".text-highlight-marker")) return;
      setTooltip(hiddenTooltip);
    };

    document.addEventListener("pointerup", handleSelection);
    document.addEventListener("pointerdown", handleClickOutside);
    window.addEventListener("hashchange", applyFragment);

    return () => {
      if (selectionTimeout.current) clearTimeout(selectionTimeout.current);
      if (copiedTimeout.current) clearTimeout(copiedTimeout.current);
      document.removeEventListener("pointerup", handleSelection);
      document.removeEventListener("pointerdown", handleClickOutside);
      window.removeEventListener("hashchange", applyFragment);
    };
  }, []);

  const handleCopyLink = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!tooltip.target) return;

    try {
      const fragment = buildHighlightFragment(tooltip.target);
      const link = `${window.location.origin}${window.location.pathname}${window.location.search}${fragment}`;
      await navigator.clipboard.writeText(link);

      setTooltip((previous) => ({ ...previous, copied: true }));
      copiedTimeout.current = setTimeout(() => setTooltip(hiddenTooltip), 1500);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  if (!tooltip.show) return null;

  return (
    <button
      onClick={handleCopyLink}
      className="text-highlight-marker"
      style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
      aria-label="Copy link to highlighted text"
      title="Copy link to this text"
    >
      {tooltip.copied ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      )}
    </button>
  );
}

function getHighlightTarget(articleBody: HTMLElement, range: Range, text: string): HighlightTarget {
  const beforeStart = document.createRange();
  beforeStart.selectNodeContents(articleBody);
  beforeStart.setEnd(range.startContainer, range.startOffset);
  const selectedText = range.toString();
  const leadingWhitespace = selectedText.length - selectedText.trimStart().length;
  const start = beforeStart.toString().length + leadingWhitespace;

  return createHighlightTarget(
    articleBody.textContent ?? "",
    text,
    start,
    start + selectedText.trim().length,
  );
}

function getTextNodes(root: HTMLElement) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      const parent = node.parentElement;
      if (!parent || parent.closest("script, style")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes: Text[] = [];
  let node: Node | null;

  while ((node = walker.nextNode())) nodes.push(node as Text);
  return nodes;
}

function removeHighlights(articleBody: HTMLElement) {
  articleBody.querySelectorAll("mark.text-highlight").forEach((highlight) => {
    const parent = highlight.parentNode;
    if (!parent) return;
    parent.replaceChild(document.createTextNode(highlight.textContent ?? ""), highlight);
    parent.normalize();
  });
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim().toLocaleLowerCase();
}

function buildNormalizedTextIndex(source: string) {
  const normalizedCharacters: string[] = [];
  const originalOffsets: number[] = [];
  let inWhitespace = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (/\s/.test(character)) {
      if (inWhitespace || normalizedCharacters.length === 0) continue;
      normalizedCharacters.push(" ");
      originalOffsets.push(index);
      inWhitespace = true;
      continue;
    }

    const normalizedCharacter = character.toLocaleLowerCase();
    for (let normalizedIndex = 0; normalizedIndex < normalizedCharacter.length; normalizedIndex += 1) {
      normalizedCharacters.push(normalizedCharacter[normalizedIndex]);
      originalOffsets.push(index);
    }
    inWhitespace = false;
  }

  if (normalizedCharacters.at(-1) === " ") {
    normalizedCharacters.pop();
    originalOffsets.pop();
  }

  return { text: normalizedCharacters.join(""), originalOffsets };
}

function findTextCandidates(
  source: string,
  searchText: string,
  normalizedSource = buildNormalizedTextIndex(source),
) {
  const normalizedSearch = normalizeText(searchText);
  if (!normalizedSearch) return [];

  const candidates: Array<{ start: number; end: number; normalizedStart: number; normalizedEnd: number }> = [];
  let searchFrom = 0;

  while (searchFrom <= normalizedSource.text.length - normalizedSearch.length) {
    const normalizedStart = normalizedSource.text.indexOf(normalizedSearch, searchFrom);
    if (normalizedStart < 0) break;

    const normalizedEnd = normalizedStart + normalizedSearch.length;
    candidates.push({
      start: normalizedSource.originalOffsets[normalizedStart],
      end:
        normalizedEnd < normalizedSource.originalOffsets.length
          ? normalizedSource.originalOffsets[normalizedEnd]
          : source.length,
      normalizedStart,
      normalizedEnd,
    });
    searchFrom = normalizedStart + 1;
  }

  return candidates;
}

export function createHighlightTarget(
  source: string,
  text: string,
  start: number,
  end: number,
): HighlightTarget {
  const isAmbiguous = findTextCandidates(source, text).length > 1;
  const isShort = normalizeText(text).split(" ").length <= 3;
  if (!isAmbiguous && !isShort) return { text, start, end };

  const prefix = source.slice(Math.max(0, start - 32), start).trim();
  const suffix = source.slice(end, Math.min(source.length, end + 32)).trim();

  return {
    text,
    start,
    end,
    ...(prefix ? { prefix } : {}),
    ...(suffix ? { suffix } : {}),
  };
}

export function resolveHighlightOffsets(source: string, target: HighlightTarget) {
  const normalizedTarget = normalizeText(target.text);
  if (
    target.start !== undefined &&
    target.end !== undefined &&
    target.end <= source.length &&
    normalizeText(source.slice(target.start, target.end)) === normalizedTarget
  ) {
    return { start: target.start, end: target.end };
  }

  const normalizedSource = buildNormalizedTextIndex(source);
  const candidates = findTextCandidates(source, target.text, normalizedSource);
  if (candidates.length === 0) return null;

  if (target.prefix || target.suffix) {
    const normalizedPrefix = target.prefix ? normalizeText(target.prefix) : null;
    const normalizedSuffix = target.suffix ? normalizeText(target.suffix) : null;
    const contextualMatches = candidates.filter((candidate) => {
      const before = normalizedSource.text.slice(0, candidate.normalizedStart);
      const after = normalizedSource.text.slice(candidate.normalizedEnd);
      return (
        (!normalizedPrefix || before.trimEnd().endsWith(normalizedPrefix)) &&
        (!normalizedSuffix || after.trimStart().startsWith(normalizedSuffix))
      );
    });

    if (contextualMatches.length === 1) {
      return { start: contextualMatches[0].start, end: contextualMatches[0].end };
    }
  }

  // With absent or stale context, only an otherwise unique quote is safe.
  if (candidates.length === 1) return { start: candidates[0].start, end: candidates[0].end };
  return null;
}

function highlightTextInPage(target: HighlightTarget) {
  const articleBody = document.querySelector<HTMLElement>(".article-body");
  if (!articleBody) return;

  removeHighlights(articleBody);
  const source = articleBody.textContent ?? "";
  // Old links and links whose content moved still resolve by their selected text.
  const offsets = resolveHighlightOffsets(source, target);
  if (!offsets) return;

  const nodes = getTextNodes(articleBody);
  let cursor = 0;
  let firstMark: HTMLElement | null = null;

  for (const node of nodes) {
    const text = node.textContent ?? "";
    const nodeStart = cursor;
    const nodeEnd = cursor + text.length;
    cursor = nodeEnd;

    if (nodeStart >= offsets.end || nodeEnd <= offsets.start) continue;

    const start = Math.max(0, offsets.start - nodeStart);
    const end = Math.min(text.length, offsets.end - nodeStart);
    const fragment = document.createDocumentFragment();
    if (start > 0) fragment.append(document.createTextNode(text.slice(0, start)));

    const mark = document.createElement("mark");
    mark.className = "text-highlight";
    mark.textContent = text.slice(start, end);
    fragment.append(mark);
    firstMark ??= mark;

    if (end < text.length) fragment.append(document.createTextNode(text.slice(end)));
    node.parentNode?.replaceChild(fragment, node);
  }

  firstMark?.scrollIntoView({ behavior: "smooth", block: "center" });
}
