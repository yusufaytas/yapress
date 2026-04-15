import { describe, expect, it } from "vitest";

import {
  buildHighlightFragment,
  createHighlightTarget,
  parseHighlightFragment,
  resolveHighlightOffsets,
} from "./text-highlighter";

describe("text highlight fragments", () => {
  it("round-trips exact selection offsets", () => {
    const target = {
      text: "the second occurrence",
      start: 42,
      end: 63,
      prefix: "before",
      suffix: "after",
    };

    const fragment = buildHighlightFragment(target);

    expect(fragment).toBe(
      "#highlight=the+second+occurrence&s=42&e=63&p=before&q=after",
    );
    expect(parseHighlightFragment(fragment)).toEqual(target);
  });

  it("supports position-free fragments", () => {
    expect(parseHighlightFragment("#highlight=hello%20world")).toEqual({
      text: "hello world",
    });
  });

  it("does not throw for malformed URL encoding", () => {
    expect(() => parseHighlightFragment("#highlight=%E0%A4%A")).not.toThrow();
  });

  it("ignores invalid offsets while preserving the text fallback", () => {
    expect(parseHighlightFragment("#highlight=hello&s=20&e=10")).toEqual({
      text: "hello",
    });
  });

  it("ignores unrelated fragments", () => {
    expect(parseHighlightFragment("#section-heading")).toBeNull();
  });

  it("restores the selected occurrence when text is repeated", () => {
    const source = "repeat this, then repeat this again";

    expect(
      resolveHighlightOffsets(source, {
        text: "repeat this",
        start: 18,
        end: 29,
        prefix: "repeat this, then",
        suffix: "again",
      }),
    ).toEqual({ start: 18, end: 29 });
  });

  it("restores selections spanning block whitespace", () => {
    const source = "first paragraph\nsecond paragraph";

    expect(
      resolveHighlightOffsets(source, {
        text: "paragraph second",
        start: 6,
        end: 22,
      }),
    ).toEqual({ start: 6, end: 22 });
  });

  it("adds context to ambiguous selections", () => {
    const source = "first repeated phrase and then repeated phrase last";

    expect(createHighlightTarget(source, "repeated phrase", 31, 46)).toEqual({
      text: "repeated phrase",
      start: 31,
      end: 46,
      prefix: "first repeated phrase and then",
      suffix: "last",
    });
  });

  it("uses context after edits shift an ambiguous selection", () => {
    const source = "new intro first repeated phrase and then repeated phrase last";

    expect(
      resolveHighlightOffsets(source, {
        text: "repeated phrase",
        start: 31,
        end: 46,
        prefix: "first repeated phrase and then",
        suffix: "last",
      }),
    ).toEqual({ start: 41, end: 56 });
  });

  it("does not guess when duplicate quotes have stale context", () => {
    const source = "repeated phrase changed repeated phrase changed";

    expect(
      resolveHighlightOffsets(source, {
        text: "repeated phrase",
        start: 100,
        end: 115,
        prefix: "missing context",
      }),
    ).toBeNull();
  });

  it("uses a unique quote when its context has gone stale", () => {
    expect(
      resolveHighlightOffsets("only repeated phrase remains", {
        text: "repeated phrase",
        start: 100,
        end: 115,
        prefix: "old introduction",
      }),
    ).toEqual({ start: 5, end: 20 });
  });

  it("does not guess when a context-free quote becomes ambiguous", () => {
    expect(
      resolveHighlightOffsets("same longer selection, then same longer selection", {
        text: "same longer selection",
        start: 100,
        end: 121,
      }),
    ).toBeNull();
  });
});
