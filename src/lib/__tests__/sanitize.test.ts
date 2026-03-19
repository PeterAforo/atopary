import { describe, it, expect } from "vitest";
import { sanitizeText, sanitizeObject } from "../sanitize";

describe("sanitizeText", () => {
  it("escapes HTML angle brackets", () => {
    expect(sanitizeText("<script>alert('xss')</script>")).not.toContain("<script>");
    expect(sanitizeText("<b>bold</b>")).toBe("&lt;b&gt;bold&lt;&#x2F;b&gt;");
  });

  it("escapes ampersands", () => {
    expect(sanitizeText("A & B")).toBe("A &amp; B");
  });

  it("escapes quotes", () => {
    expect(sanitizeText('He said "hello"')).toContain("&quot;");
    expect(sanitizeText("It's fine")).toContain("&#x27;");
  });

  it("returns plain text unchanged", () => {
    expect(sanitizeText("Hello World 123")).toBe("Hello World 123");
  });

  it("handles empty string", () => {
    expect(sanitizeText("")).toBe("");
  });
});

describe("sanitizeObject", () => {
  it("sanitizes string values in an object", () => {
    const result = sanitizeObject({
      name: "<script>xss</script>",
      count: 5,
      active: true,
    });
    expect(result.name).not.toContain("<script>");
    expect(result.count).toBe(5);
    expect(result.active).toBe(true);
  });

  it("does not modify non-string values", () => {
    const result = sanitizeObject({ num: 42, bool: false, nil: null });
    expect(result.num).toBe(42);
    expect(result.bool).toBe(false);
  });
});
