/**
 * Unit-тесты для модуля валидации промокодов
 */

import {
    PromoValidationError,
    validateMinOrder,
    validatePromoActive,
    validatePromoCode,
    validatePromoDates,
    validatePromoFields,
    validatePromoForSubtotal,
    validatePromoType,
    validatePromoValue,
    validateUsageLimit,
} from "@/shared/lib/promo/validate-promo";

describe("validatePromoCode", () => {
  it("должен принимать валидный код", () => {
    expect(validatePromoCode("PROMO123")).toEqual({ valid: true });
    expect(validatePromoCode("SUMMER-2024")).toEqual({ valid: true });
    expect(validatePromoCode("NEW_YEAR")).toEqual({ valid: true });
  });

  it("должен отклонять пустой код", () => {
    const result = validatePromoCode("");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Код обязателен");
  });

  it("должен отклонять код с недопустимыми символами", () => {
    const result = validatePromoCode("PROMO@123");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Код может содержать только A-Z, 0-9, _ и -");
  });

  it("должен отклонять слишком короткий код", () => {
    const result = validatePromoCode("AB");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Код промокода должен быть 3–32 символа");
  });

  it("должен отклонять слишком длинный код", () => {
    const longCode = "A".repeat(33);
    const result = validatePromoCode(longCode);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Код промокода должен быть 3–32 символа");
  });
});

describe("validatePromoType", () => {
  it("должен принимать PERCENT", () => {
    expect(validatePromoType("PERCENT")).toEqual({ valid: true });
  });

  it("должен принимать AMOUNT", () => {
    expect(validatePromoType("AMOUNT")).toEqual({ valid: true });
  });

  it("должен отклонять неверный тип", () => {
    const result = validatePromoType("INVALID");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Неверный тип промокода");
  });
});

describe("validatePromoValue", () => {
  it("должен принимать валидный процент (1-100)", () => {
    expect(validatePromoValue(50, "PERCENT")).toEqual({ valid: true });
    expect(validatePromoValue(1, "PERCENT")).toEqual({ valid: true });
    expect(validatePromoValue(100, "PERCENT")).toEqual({ valid: true });
  });

  it("должен отклонять процент < 1", () => {
    const result = validatePromoValue(0, "PERCENT");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Процент скидки должен быть больше 0");
  });

  it("должен отклонять процент > 100", () => {
    const result = validatePromoValue(101, "PERCENT");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Процент скидки должен быть от 1 до 100");
  });

  it("должен принимать валидную сумму (AMOUNT)", () => {
    expect(validatePromoValue(1000, "AMOUNT")).toEqual({ valid: true });
  });

  it("должен отклонять сумму <= 0", () => {
    const result = validatePromoValue(0, "AMOUNT");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Скидка в рублях должна быть больше 0");
  });

  it("должен отклонять null/undefined", () => {
    expect(validatePromoValue(null, "PERCENT").valid).toBe(false);
    expect(validatePromoValue(undefined, "AMOUNT").valid).toBe(false);
  });
});

describe("validateMinOrder", () => {
  it("должен принимать null", () => {
    expect(validateMinOrder(null)).toEqual({ valid: true });
  });

  it("должен принимать валидную сумму >= 0", () => {
    expect(validateMinOrder(0)).toEqual({ valid: true });
    expect(validateMinOrder(1000)).toEqual({ valid: true });
  });

  it("должен отклонять отрицательную сумму", () => {
    const result = validateMinOrder(-100);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Минимальный заказ не может быть отрицательным");
  });
});

describe("validateUsageLimit", () => {
  it("должен принимать null", () => {
    expect(validateUsageLimit(null)).toEqual({ valid: true });
  });

  it("должен принимать валидный лимит > 0", () => {
    expect(validateUsageLimit(1)).toEqual({ valid: true });
    expect(validateUsageLimit(100)).toEqual({ valid: true });
  });

  it("должен отклонять лимит <= 0", () => {
    expect(validateUsageLimit(0).valid).toBe(false);
    expect(validateUsageLimit(-1).valid).toBe(false);
  });

  it("должен отклонять нецелое число", () => {
    const result = validateUsageLimit(10.5);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Лимит использований должен быть целым числом > 0 или null");
  });
});

describe("validatePromoDates", () => {
  it("должен принимать null даты", () => {
    expect(validatePromoDates(null, null)).toEqual({ valid: true });
  });

  it("должен принимать валидные даты", () => {
    const startsAt = new Date("2024-01-01");
    const endsAt = new Date("2024-12-31");
    expect(validatePromoDates(startsAt, endsAt)).toEqual({ valid: true });
  });

  it("должен отклонять, если startsAt > endsAt", () => {
    const startsAt = new Date("2024-12-31");
    const endsAt = new Date("2024-01-01");
    const result = validatePromoDates(startsAt, endsAt);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Дата начала не может быть позже даты окончания");
  });

  it("должен принимать строки дат", () => {
    expect(validatePromoDates("2024-01-01", "2024-12-31")).toEqual({ valid: true });
  });
});

describe("validatePromoActive", () => {
  const now = new Date("2024-06-15");

  it("должен принимать активный промокод", () => {
    const promo = {
      isActive: true,
      startsAt: new Date("2024-01-01"),
      endsAt: new Date("2024-12-31"),
    };
    expect(validatePromoActive(promo, now)).toEqual({ valid: true });
  });

  it("должен отклонять неактивный промокод", () => {
    const promo = { isActive: false };
    const result = validatePromoActive(promo, now);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Промокод отключён");
    expect(result.field).toBe("code");
  });

  it("должен отклонять промокод, который ещё не начался", () => {
    const promo = {
      isActive: true,
      startsAt: new Date("2024-12-01"),
    };
    const result = validatePromoActive(promo, now);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Промокод ещё не активен");
  });

  it("должен отклонять истёкший промокод", () => {
    const promo = {
      isActive: true,
      endsAt: new Date("2024-01-01"),
    };
    const result = validatePromoActive(promo, now);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Срок действия промокода истёк");
  });
});

describe("validatePromoForSubtotal", () => {
  const now = new Date("2024-06-15");

  it("должен принимать валидный промокод", () => {
    const promo = {
      code: "TEST",
      isActive: true,
      startsAt: new Date("2024-01-01"),
      endsAt: new Date("2024-12-31"),
      minOrder: null,
      usageLimit: null,
      usedCount: 0,
    };
    expect(() => validatePromoForSubtotal(promo, 10000, now)).not.toThrow();
  });

  it("должен бросать ошибку, если промокод неактивен", () => {
    const promo = {
      code: "TEST",
      isActive: false,
    };
    expect(() => validatePromoForSubtotal(promo, 10000, now)).toThrow(PromoValidationError);
  });

  it("должен бросать ошибку, если сумма меньше minOrder", () => {
    const promo = {
      code: "TEST",
      isActive: true,
      minOrder: 5000,
      usageLimit: null,
      usedCount: 0,
    };
    expect(() => validatePromoForSubtotal(promo, 3000, now)).toThrow(PromoValidationError);
  });

  it("должен бросать ошибку, если лимит исчерпан", () => {
    const promo = {
      code: "TEST",
      isActive: true,
      minOrder: null,
      usageLimit: 10,
      usedCount: 10,
    };
    expect(() => validatePromoForSubtotal(promo, 10000, now)).toThrow(PromoValidationError);
  });
});

describe("validatePromoFields", () => {
  it("должен принимать валидный промокод", () => {
    const promo = {
      code: "TEST123",
      type: "PERCENT" as const,
      value: 10,
      minOrder: null,
      usageLimit: null,
      startsAt: null,
      endsAt: null,
      isActive: true,
    };
    const result = validatePromoFields(promo);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("должен возвращать ошибки для невалидного промокода", () => {
    const promo = {
      code: "AB", // слишком короткий
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- тест на некорректный тип payload; any умышленно для проверки валидации
      type: "INVALID" as any,
      value: -10, // отрицательное
      minOrder: -100, // отрицательное
    };
    const result = validatePromoFields(promo);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("должен валидировать только переданные поля", () => {
    const promo = {
      code: "VALID_CODE",
    };
    const result = validatePromoFields(promo);
    expect(result.valid).toBe(true);
  });
});
