import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { renderHighlightedCode } from "@/lib/codeHighlight";

describe("renderHighlightedCode", () => {
  it("highlights script keywords and strings", () => {
    const markup = renderToStaticMarkup(
      <code>{renderHighlightedCode('const greeting = "hello";', "typescript")}</code>
    );

    expect(markup).toContain("token--keyword");
    expect(markup).toContain("token--string");
  });

  it("highlights bash comments and variables", () => {
    const markup = renderToStaticMarkup(
      <code>{renderHighlightedCode('echo $HOME # home', "bash")}</code>
    );

    expect(markup).toContain("token--variable");
    expect(markup).toContain("token--comment");
  });

  it("highlights python keywords and strings", () => {
    const markup = renderToStaticMarkup(
      <code>{renderHighlightedCode('def greet():\n    return "hi"', "python")}</code>
    );

    expect(markup).toContain("token--keyword");
    expect(markup).toContain("token--string");
  });

  it("highlights python decorators", () => {
    const markup = renderToStaticMarkup(
      <code>{renderHighlightedCode("@app.get\nasync def endpoint():\n    pass", "python")}</code>
    );

    expect(markup).toContain("token--meta");
  });

  it("highlights java keywords and function calls", () => {
    const markup = renderToStaticMarkup(
      <code>{renderHighlightedCode('public class App { System.out.println("hi"); }', "java")}</code>
    );

    expect(markup).toContain("token--keyword");
    expect(markup).toContain("token--function");
  });

  it("highlights java annotations", () => {
    const markup = renderToStaticMarkup(
      <code>{renderHighlightedCode("@Override\npublic String toString() { return \"x\"; }", "java")}</code>
    );

    expect(markup).toContain("token--meta");
  });
});
