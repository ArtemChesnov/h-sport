/**
 * Unit тесты для formatMoney
 */

import { describe, it, expect } from "@jest/globals";
import { formatMoney } from "@/shared/lib/formatters/format-money";

describe("formatMoney", () => {
  it("should format kopecks to rubles", () => {
    expect(formatMoney(100)).toBe("1\u00A0₽");
    expect(formatMoney(1000)).toBe("10\u00A0₽");
    expect(formatMoney(630000)).toBe("6\u00A0300\u00A0₽");
  });

  it("should handle zero", () => {
    expect(formatMoney(0)).toBe("0\u00A0₽");
  });

  it("should handle null and undefined", () => {
    expect(formatMoney(null)).toBe("0\u00A0₽");
    expect(formatMoney(undefined)).toBe("0\u00A0₽");
  });

  it("should format large numbers with spaces", () => {
    // 123456789 копеек = 1234567.89 рублей, округляется до 1234568
    expect(formatMoney(123456789)).toBe("1\u00A0234\u00A0568\u00A0₽");
  });

  it("should round fractional kopecks", () => {
    // 99 копеек = 0.99 рублей, округляется до 1
    expect(formatMoney(99)).toBe("1\u00A0₽");
    // 199 копеек = 1.99 рублей, округляется до 2
    expect(formatMoney(199)).toBe("2\u00A0₽");
  });
});
