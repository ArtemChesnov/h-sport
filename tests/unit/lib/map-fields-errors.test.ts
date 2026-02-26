/**
 * Unit тесты для map-fields-errors
 */

import { describe, it, expect } from "@jest/globals";
import {
  FieldError,
  mapFieldErrorsToForm,
  mapFieldErrorsToNestedFormErrors,
} from "../../../shared/lib";


describe("mapFieldErrorsToForm", () => {
  it("should return empty object for empty array", () => {
    expect(mapFieldErrorsToForm([])).toEqual({});
    expect(mapFieldErrorsToForm(null)).toEqual({});
    expect(mapFieldErrorsToForm(undefined)).toEqual({});
  });

  it("should map simple field errors", () => {
    const errors: FieldError[] = [
      { field: "name", message: "Название обязательно" },
      { field: "slug", message: "Slug занят" },
    ];

    const result = mapFieldErrorsToForm(errors);
    expect(result).toEqual({
      name: "Название обязательно",
      slug: "Slug занят",
    });
  });

  it("should handle _global errors", () => {
    const errors: FieldError[] = [
      { field: "_global", message: "Что-то пошло не так" },
    ];

    const result = mapFieldErrorsToForm(errors);
    expect(result).toEqual({
      _global: "Что-то пошло не так",
    });
  });

  it("should concatenate multiple errors for same field", () => {
    const errors: FieldError[] = [
      { field: "name", message: "Ошибка 1" },
      { field: "name", message: "Ошибка 2" },
    ];

    const result = mapFieldErrorsToForm(errors);
    expect(result).toEqual({
      name: "Ошибка 1\nОшибка 2",
    });
  });
});

describe("mapFieldErrorsToNestedFormErrors", () => {
  it("should return empty object for empty array", () => {
    expect(mapFieldErrorsToNestedFormErrors([])).toEqual({});
    expect(mapFieldErrorsToNestedFormErrors(null)).toEqual({});
    expect(mapFieldErrorsToNestedFormErrors(undefined)).toEqual({});
  });

  it("should map simple field errors", () => {
    const errors: FieldError[] = [
      { field: "name", message: "Название обязательно" },
    ];

    const result = mapFieldErrorsToNestedFormErrors(errors);
    expect(result).toEqual({
      name: "Название обязательно",
    });
  });

  it("should map nested array errors", () => {
    const errors: FieldError[] = [
      { field: "items[0].size", message: "Размер обязателен" },
      { field: "items[0].price", message: "Цена обязательна" },
      { field: "items[1].size", message: "Размер обязателен" },
    ];

    const result = mapFieldErrorsToNestedFormErrors(errors);
    expect(result).toEqual({
      items: [
        {
          size: "Размер обязателен",
          price: "Цена обязательна",
        },
        {
          size: "Размер обязателен",
        },
      ],
    });
  });

  it("should handle _global errors", () => {
    const errors: FieldError[] = [
      { field: "_global", message: "Общая ошибка" },
    ];

    const result = mapFieldErrorsToNestedFormErrors(errors);
    expect(result).toEqual({
      _global: "Общая ошибка",
    });
  });

  it("should concatenate multiple errors for same nested field", () => {
    const errors: FieldError[] = [
      { field: "items[0].size", message: "Ошибка 1" },
      { field: "items[0].size", message: "Ошибка 2" },
    ];

    const result = mapFieldErrorsToNestedFormErrors(errors);
    expect(result).toEqual({
      items: [
        {
          size: "Ошибка 1\nОшибка 2",
        },
      ],
    });
  });
});
