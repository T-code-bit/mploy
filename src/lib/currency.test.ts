import { describe, expect, it } from "vitest";
import { formatMinorCurrency } from "./currency";

describe("formatMinorCurrency", () => {
  it("converts Paystack minor units to shillings", () => {
    expect(formatMinorCurrency(1000)).toBe("KES 10.00");
  });

  it("formats accumulated CV revenue", () => {
    expect(formatMinorCurrency(12_500)).toBe("KES 125.00");
  });
});