"use client";

import { useEffect, useState } from "react";

export function TextHighlighter() {
  const [tooltip, setTooltip] = useState<{
    show: boolean;
    x: number;
    y: number;
    copied: boolean;
  }>({ show: false, x: 0, y: 0, copied: false });

  useEffect(() => {
    // Highlight text from URL fragment on load
    const hash = window.location.hash;
    if (hash.startsWith("#highlight=")) {
      const text = decodeURIComponent(hash.replace("#highlight=", ""));
      highlightTextInPage(text);
    }

    let hideTimeout: NodeJS.Timeout | undefined;

    // Handle text selection
    const handleSelection = () => {
      if (hideTimeout) clearTimeout(hideTimeout);
      
      // Safari needs a longer delay to settle the selection
      setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
          setTooltip({ show: false, x: 0, y: 0, copied: false });
          return;
        }

        const selectedText = selection.toString().trim();
        if (selectedText.length < 3) {
          setTooltip({ show: false, x: 0, y: 0, copied: false });
          return;
        }

        // Only trigger if selection is within article body
        const articleBody = document.querySelector(".article-body");
        if (!articleBody) return;
        const range = selection.getRangeAt(0);
        if (!articleBody.contains(range.commonAncestorContainer)) {
          setTooltip({ show: false, x: 0, y: 0, copied: false });
          return;
        }

        // Update URL with text fragment
        const textFragment = `#highlight=${encodeURIComponent(selectedText)}`;
        window.history.replaceState(null, "", textFragment);

        // Apply mark highlight immediately so it looks consistent
        const rect = range.getBoundingClientRect();
        highlightTextInPage(selectedText);
        selection.removeAllRanges();

        setTooltip({
          show: true,
          x: rect.right,
          y: rect.bottom + window.scrollY,
          copied: false,
        });
      }, 50);
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.text-highlight-marker')) {
        return;
      }
      
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setTooltip({ show: false, x: 0, y: 0, copied: false });
      }
    };

    document.addEventListener("mouseup", handleSelection);
    document.addEventListener("touchend", handleSelection);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      if (hideTimeout) clearTimeout(hideTimeout);
      document.removeEventListener("mouseup", handleSelection);
      document.removeEventListener("touchend", handleSelection);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;
      
      const selectedText = selection.toString().trim();
      const textFragment = `#highlight=${encodeURIComponent(selectedText)}`;
      const linkWithHighlight = window.location.origin + window.location.pathname + window.location.search + textFragment;
      
      await navigator.clipboard.writeText(linkWithHighlight);

      // Persist the highlight on the page
      highlightTextInPage(selectedText);
      selection.removeAllRanges();

      setTooltip((prev) => ({ ...prev, copied: true }));
      setTimeout(() => {
        setTooltip({ show: false, x: 0, y: 0, copied: false });
      }, 1500);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  if (!tooltip.show) return null;

  return (
    <button
      onClick={handleCopyLink}
      className="text-highlight-marker"
      style={{
        left: `${tooltip.x}px`,
        top: `${tooltip.y}px`,
      }}
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

function highlightTextInPage(searchText: string) {
  // Remove existing highlights
  document.querySelectorAll(".text-highlight").forEach((el) => {
    const parent = el.parentNode;
    if (parent) {
      parent.replaceChild(document.createTextNode(el.textContent || ""), el);
      parent.normalize();
    }
  });

  // Find and highlight the text
  const articleBody = document.querySelector(".article-body");
  if (!articleBody) return;

  // Normalize whitespace in search text
  const normalizedSearch = searchText.replace(/\s+/g, ' ').trim().toLowerCase();

  // Get all block-level elements that might contain text
  const blocks = articleBody.querySelectorAll('p, li, h1, h2, h3, h4, h5, h6, blockquote, td, th, div');
  
  for (const block of blocks) {
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        
        const tagName = parent.tagName.toLowerCase();
        if (["code", "pre", "script", "style"].includes(tagName)) {
          return NodeFilter.FILTER_REJECT;
        }
        
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const textNodes: Text[] = [];
    let currentNode: Node | null;
    
    while ((currentNode = walker.nextNode())) {
      textNodes.push(currentNode as Text);
    }

    if (textNodes.length === 0) continue;

    // Build concatenated text for this block
    let fullText = '';
    const nodeMap: Array<{ node: Text; start: number; end: number; originalText: string }> = [];
    
    for (const node of textNodes) {
      const originalText = node.textContent || "";
      const normalizedText = originalText.replace(/\s+/g, ' ');
      
      nodeMap.push({
        node,
        start: fullText.length,
        end: fullText.length + normalizedText.length,
        originalText,
      });
      fullText += normalizedText;
    }

    // Find the search text in this block
    const searchIndex = fullText.toLowerCase().indexOf(normalizedSearch);
    
    if (searchIndex === -1) continue;

    const searchEnd = searchIndex + normalizedSearch.length;
    
    // Find which nodes contain our search text
    const affectedNodes = nodeMap.filter(
      (item) => item.start < searchEnd && item.end > searchIndex
    );

    if (affectedNodes.length === 0) continue;

    // Highlight the text across nodes in this block
    let firstMark: HTMLElement | null = null;
    
    for (let i = 0; i < affectedNodes.length; i++) {
      const { node, start, end, originalText } = affectedNodes[i];
      const normalizedText = originalText.replace(/\s+/g, ' ');
      
      // Calculate the portion of this node that should be highlighted
      const highlightStart = Math.max(0, searchIndex - start);
      const highlightEnd = Math.min(normalizedText.length, searchEnd - start);
      
      // Map back to original text positions
      let origStart = 0;
      let origEnd = originalText.length;
      
      if (highlightStart > 0 || highlightEnd < normalizedText.length) {
        let normPos = 0;
        let origPos = 0;
        
        while (origPos < originalText.length) {
          if (normPos === highlightStart) origStart = origPos;
          if (normPos === highlightEnd) {
            origEnd = origPos;
            break;
          }
          
          if (/\s/.test(originalText[origPos])) {
            while (origPos < originalText.length && /\s/.test(originalText[origPos])) {
              origPos++;
            }
            normPos++;
          } else {
            origPos++;
            normPos++;
          }
        }
        
        if (normPos === highlightEnd) origEnd = origPos;
      }
      
      const before = originalText.substring(0, origStart);
      const match = originalText.substring(origStart, origEnd);
      const after = originalText.substring(origEnd);

      const fragment = document.createDocumentFragment();
      
      if (before) fragment.appendChild(document.createTextNode(before));
      
      const mark = document.createElement("mark");
      mark.className = "text-highlight";
      mark.textContent = match;
      fragment.appendChild(mark);
      
      if (after) fragment.appendChild(document.createTextNode(after));

      node.parentNode?.replaceChild(fragment, node);
      
      if (!firstMark) firstMark = mark;
    }

    // Scroll to the first highlighted text and stop searching
    if (firstMark) {
      firstMark.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
  }
}
