import { describe, expect, it } from "vitest";

import { defaultRobotsDisallow, getRobotsDisallow } from "@/lib/robots";

describe("robots", () => {
  it("includes all default disallow paths", () => {
    const disallow = getRobotsDisallow();

    for (const path of defaultRobotsDisallow) {
      expect(disallow).toContain(path);
    }
  });

  it("blocks legacy WordPress admin and includes paths", () => {
    const disallow = getRobotsDisallow();

    expect(disallow).toContain("/wp-admin/");
    expect(disallow).toContain("/wp-includes/");
    expect(disallow).toContain("/wp-content/plugins/");
    expect(disallow).toContain("/wp-content/themes/");
    expect(disallow).toContain("/xmlrpc.php");
  });

  it("blocks tracking parameter variants", () => {
    const disallow = getRobotsDisallow();

    expect(disallow).toContain("/*?utm_*");
    expect(disallow).toContain("/*&utm_*");
    expect(disallow).toContain("/*?fbclid=*");
    expect(disallow).toContain("/*&fbclid=*");
    expect(disallow).toContain("/*?gclid=*");
    expect(disallow).toContain("/*&gclid=*");
    expect(disallow).toContain("/*?ref=*");
    expect(disallow).toContain("/*&ref=*");
    expect(disallow).toContain("/*?cmid=*");
    expect(disallow).toContain("/*&cmid=*");
  });

  it("blocks WordPress query and comment pagination noise", () => {
    const disallow = getRobotsDisallow();

    expect(disallow).toContain("/*?p=*");
    expect(disallow).toContain("/*?replytocom=*");
    expect(disallow).toContain("/*comment-page-*");
  });

  it("returns deduplicated paths", () => {
    const disallow = getRobotsDisallow();

    expect(disallow).toEqual([...new Set(disallow)]);
  });

  it("merges site config disallow paths with defaults", () => {
    const disallow = getRobotsDisallow();

    // getRobotsDisallow should return at least all default entries
    expect(disallow.length).toBeGreaterThanOrEqual(defaultRobotsDisallow.length);
  });
});
