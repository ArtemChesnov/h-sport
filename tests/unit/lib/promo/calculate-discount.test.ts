/**
 * Unit-тесты для расчёта скидки промокода
 */

import { calculatePromoDiscount } from "@/shared/lib/promo";

describe("calculatePromoDiscount", () => {
  describe("PERCENT тип", () => {
    it("должен рассчитывать процентную скидку", () => {
      expect(calculatePromoDiscount({ type: "PERCENT", value: 10, subtotal: 1000 })).toBe(100);
      expect(calculatePromoDiscount({ type: "PERCENT", value: 50, subtotal: 2000 })).toBe(1000);
    });

    it("должен ограничивать скидку суммой заказа", () => {
      expect(calculatePromoDiscount({ type: "PERCENT", value: 150, subtotal: 1000 })).toBe(1000);
    });

    it("должен возвращать 0 для нулевой суммы", () => {
      expect(calculatePromoDiscount({ type: "PERCENT", value: 10, subtotal: 0 })).toBe(0);
    });

    it("должен возвращать 0 для нулевого процента", () => {
      expect(calculatePromoDiscount({ type: "PERCENT", value: 0, subtotal: 1000 })).toBe(0);
    });

    it("должен округлять результат", () => {
      // 33% от 1000 = 330 (округление вниз)
      expect(calculatePromoDiscount({ type: "PERCENT", value: 33, subtotal: 1000 })).toBe(330);
    });
  });

  describe("AMOUNT тип", () => {
    it("должен возвращать фиксированную сумму", () => {
      expect(calculatePromoDiscount({ type: "AMOUNT", value: 500, subtotal: 1000 })).toBe(500);
      expect(calculatePromoDiscount({ type: "AMOUNT", value: 200, subtotal: 1000 })).toBe(200);
    });

    it("должен ограничивать скидку суммой заказа", () => {
      expect(calculatePromoDiscount({ type: "AMOUNT", value: 1500, subtotal: 1000 })).toBe(1000);
    });

    it("должен возвращать 0 для нулевой суммы", () => {
      expect(calculatePromoDiscount({ type: "AMOUNT", value: 500, subtotal: 0 })).toBe(0);
    });

    it("должен возвращать 0 для нулевой скидки", () => {
      expect(calculatePromoDiscount({ type: "AMOUNT", value: 0, subtotal: 1000 })).toBe(0);
    });
  });

  describe("Edge cases", () => {
    it("должен обрабатывать отрицательную сумму (возвращает 0)", () => {
      expect(calculatePromoDiscount({ type: "PERCENT", value: 10, subtotal: -100 })).toBe(0);
      expect(calculatePromoDiscount({ type: "AMOUNT", value: 100, subtotal: -100 })).toBe(0);
    });

    it("должен обрабатывать отрицательное значение скидки (возвращает 0)", () => {
      expect(calculatePromoDiscount({ type: "PERCENT", value: -10, subtotal: 1000 })).toBe(0);
      expect(calculatePromoDiscount({ type: "AMOUNT", value: -100, subtotal: 1000 })).toBe(0);
    });
  });
});
