import { describe, it, expect } from "vitest";
import {
  cn,
  formatCurrency,
  formatDate,
  slugify,
  calculateMortgage,
  checkMortgageEligibility,
  truncateText,
  getPropertyTypeLabel,
  getStatusColor,
} from "../utils";

describe("cn (class name merge)", () => {
  it("merges class names", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("handles conflicting tailwind classes", () => {
    expect(cn("px-4", "px-6")).toBe("px-6");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });
});

describe("formatCurrency", () => {
  it("formats a number as GHS currency", () => {
    const result = formatCurrency(1500000);
    expect(result).toContain("1,500,000");
  });

  it("formats zero", () => {
    const result = formatCurrency(0);
    expect(result).toContain("0");
  });

  it("formats small amounts", () => {
    const result = formatCurrency(99);
    expect(result).toContain("99");
  });
});

describe("formatDate", () => {
  it("formats a Date object", () => {
    const result = formatDate(new Date("2025-06-15"));
    expect(result).toContain("Jun");
    expect(result).toContain("2025");
  });

  it("formats a date string", () => {
    const result = formatDate("2024-01-01T00:00:00Z");
    expect(result).toContain("2024");
  });
});

describe("slugify", () => {
  it("converts text to slug", () => {
    expect(slugify("Modern Villa in East Legon")).toBe("modern-villa-in-east-legon");
  });

  it("removes special characters", () => {
    expect(slugify("Hello! @World #Test")).toBe("hello-world-test");
  });

  it("handles multiple spaces", () => {
    expect(slugify("hello   world")).toBe("hello-world");
  });

  it("trims leading/trailing hyphens", () => {
    expect(slugify("--hello--")).toBe("hello");
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });
});

describe("calculateMortgage", () => {
  it("calculates monthly payment correctly", () => {
    const result = calculateMortgage(100000, 12, 20);
    expect(result.monthlyPayment).toBeGreaterThan(0);
    expect(result.totalPayment).toBeGreaterThan(100000);
    expect(result.totalInterest).toBeGreaterThan(0);
  });

  it("handles zero interest rate", () => {
    const result = calculateMortgage(120000, 0, 10);
    expect(result.monthlyPayment).toBe(1000);
    expect(result.totalPayment).toBe(120000);
    expect(result.totalInterest).toBe(0);
  });

  it("totalPayment equals principal + totalInterest", () => {
    const result = calculateMortgage(200000, 18, 15);
    expect(result.totalPayment).toBeCloseTo(result.monthlyPayment * 15 * 12, 0);
  });
});

describe("checkMortgageEligibility", () => {
  it("returns eligible when DTI is below threshold", () => {
    const result = checkMortgageEligibility(10000, 3000);
    expect(result.eligible).toBe(true);
    expect(result.dtiRatio).toBe(30);
  });

  it("returns not eligible when DTI exceeds threshold", () => {
    const result = checkMortgageEligibility(5000, 3000);
    expect(result.eligible).toBe(false);
    expect(result.dtiRatio).toBe(60);
  });

  it("returns eligible at exactly 40% threshold", () => {
    const result = checkMortgageEligibility(10000, 4000);
    expect(result.eligible).toBe(true);
    expect(result.dtiRatio).toBe(40);
  });

  it("calculates max payment correctly", () => {
    const result = checkMortgageEligibility(10000, 1000);
    expect(result.maxPayment).toBe(4000);
  });

  it("supports custom maxDTI", () => {
    const result = checkMortgageEligibility(10000, 3500, 0.3);
    expect(result.eligible).toBe(false);
    expect(result.maxPayment).toBe(3000);
  });
});

describe("truncateText", () => {
  it("returns text unchanged if shorter than max", () => {
    expect(truncateText("hello", 10)).toBe("hello");
  });

  it("truncates text and adds ellipsis", () => {
    expect(truncateText("hello world test", 10)).toBe("hello worl...");
  });

  it("returns text unchanged if exactly maxLength", () => {
    expect(truncateText("12345", 5)).toBe("12345");
  });
});

describe("getPropertyTypeLabel", () => {
  it("returns correct label for known types", () => {
    expect(getPropertyTypeLabel("HOUSE")).toBe("House");
    expect(getPropertyTypeLabel("APARTMENT")).toBe("Apartment");
    expect(getPropertyTypeLabel("VILLA")).toBe("Villa");
    expect(getPropertyTypeLabel("COMMERCIAL")).toBe("Commercial");
  });

  it("returns the input for unknown types", () => {
    expect(getPropertyTypeLabel("UNKNOWN")).toBe("UNKNOWN");
  });
});

describe("getStatusColor", () => {
  it("returns correct color for known statuses", () => {
    expect(getStatusColor("PENDING")).toContain("yellow");
    expect(getStatusColor("APPROVED")).toContain("green");
    expect(getStatusColor("REJECTED")).toContain("red");
  });

  it("returns default gray for unknown status", () => {
    expect(getStatusColor("UNKNOWN")).toContain("gray");
  });
});
