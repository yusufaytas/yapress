import { describe, expect, it } from "vitest";

import { EMPTY_DYNAMIC_SEGMENT, ensureStaticParams } from "@/lib/staticParams";

describe("staticParams", () => {
  it("keeps populated params unchanged", () => {
    const params = [{ slug: "engineering" }];

    expect(ensureStaticParams(params, { slug: EMPTY_DYNAMIC_SEGMENT })).toEqual(params);
  });

  it("adds a placeholder when params are empty", () => {
    expect(ensureStaticParams([], { slug: EMPTY_DYNAMIC_SEGMENT })).toEqual([
      { slug: EMPTY_DYNAMIC_SEGMENT },
    ]);
  });
});
