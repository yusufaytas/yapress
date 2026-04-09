import { describe, expect, it } from "vitest";

import { foldSearchText, tokenizeSearchQuery } from "@/lib/text";

describe("text", () => {
  it("folds Turkish characters for search matching", () => {
    expect(foldSearchText("İstanbul")).toBe("istanbul");
    expect(foldSearchText("ışık")).toBe("isik");
    expect(foldSearchText("çağrı")).toBe("cagri");
  });

  it("tokenizes multilingual search queries consistently", () => {
    expect(tokenizeSearchQuery("Türkçe  English   içerik")).toEqual(["turkce", "english", "icerik"]);
  });
});
