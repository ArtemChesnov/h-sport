/**
 * Unit тесты для useProductVariants
 *
 * Примечание: требует jest-environment-jsdom для работы с React hooks
 */

/**
 * @jest-environment jsdom
 */

import { describe, it, expect, beforeEach } from "@jest/globals";
import { renderHook, act } from "@testing-library/react";
import { useProductVariants } from "@/shared/hooks/product/use-product-variants";
import { DTO } from "@/shared/services";

// Моковые данные для тестов
const mockProductWithVariants: DTO.ProductDetailDto = {
  id: 1,
  slug: "test-product",
  name: "Test Product",
  sku: "TEST-001",
  description: "Test description",
  composition: null,
  images: ["image1.jpg", "image2.jpg"],
  tags: [],
  categoryId: 1,
  categorySlug: "test",
  categoryName: "Test Category",
  isSet: false,
  price: 1000,
  priceMin: 1000,
  priceMax: 2000,
  colors: ["black", "white", "red"],
  sizes: ["S", "M", "L"],
  items: [
    {
      id: 1,
      sku: "TEST-001-S-BLACK",
      color: "black",
      size: "S",
      price: 1000,
      isAvailable: true,
      imageUrls: ["variant1.jpg"],
    },
    {
      id: 2,
      sku: "TEST-001-M-BLACK",
      color: "black",
      size: "M",
      price: 1500,
      isAvailable: true,
      imageUrls: ["variant2.jpg"],
    },
    {
      id: 3,
      sku: "TEST-001-L-WHITE",
      color: "white",
      size: "L",
      price: 2000,
      isAvailable: true,
      imageUrls: ["variant3.jpg"],
    },
    {
      id: 4,
      sku: "TEST-001-S-RED",
      color: "red",
      size: "S",
      price: 1200,
      isAvailable: false,
      imageUrls: [],
    },
  ],
};

const mockProductSingleVariant: DTO.ProductDetailDto = {
  ...mockProductWithVariants,
  colors: ["black"],
  sizes: ["M"],
  items: [mockProductWithVariants.items[1]],
};

const mockProductNoVariants: DTO.ProductDetailDto = {
  ...mockProductWithVariants,
  colors: [],
  sizes: [],
  items: [],
};

describe("useProductVariants", () => {
  describe("Базовый выбор варианта", () => {
    it("должен выбрать первый доступный вариант по умолчанию", () => {
      const { result } = renderHook(() =>
        useProductVariants({ product: mockProductWithVariants })
      );

      expect(result.current.selectedItem).not.toBeNull();
      expect(result.current.selectedItem?.id).toBe(1); // Первый вариант
      expect(result.current.effectiveColor).toBe("black");
      expect(result.current.effectiveSize).toBe("S");
    });

    it("должен вернуть доступные цвета и размеры", () => {
      const { result } = renderHook(() =>
        useProductVariants({ product: mockProductWithVariants })
      );

      expect(result.current.availableColors).toEqual(["black", "white", "red"]);
      expect(result.current.availableSizes).toEqual(["S", "M", "L"]);
    });
  });

  describe("Смена выбора", () => {
    it("должен обновить selectedItem при смене цвета", () => {
      const { result } = renderHook(() =>
        useProductVariants({ product: mockProductWithVariants })
      );

      act(() => {
        result.current.setSelectedColor("white");
        result.current.setSelectedSize("L"); // Устанавливаем размер, чтобы было точное совпадение
      });

      expect(result.current.effectiveColor).toBe("white");
      expect(result.current.selectedItem?.color).toBe("white");
      expect(result.current.selectedItem?.size).toBe("L");
    });

    it("должен обновить selectedItem при смене размера", () => {
      const { result } = renderHook(() =>
        useProductVariants({ product: mockProductWithVariants })
      );

      act(() => {
        result.current.setSelectedSize("M");
      });

      expect(result.current.effectiveSize).toBe("M");
      expect(result.current.selectedItem?.size).toBe("M");
    });

    it("должен найти точное совпадение цвет+размер", () => {
      const { result } = renderHook(() =>
        useProductVariants({ product: mockProductWithVariants })
      );

      act(() => {
        result.current.setSelectedColor("white");
        result.current.setSelectedSize("L");
      });

      expect(result.current.selectedItem?.id).toBe(3); // white + L
      expect(result.current.selectedItem?.color).toBe("white");
      expect(result.current.selectedItem?.size).toBe("L");
    });

    it("должен использовать доступный вариант, если точное совпадение не найдено", () => {
      const { result } = renderHook(() =>
        useProductVariants({ product: mockProductWithVariants })
      );

      act(() => {
        result.current.setSelectedColor("red");
        result.current.setSelectedSize("XL"); // XL не существует
      });

      // Должен вернуть доступный вариант (не unavailable)
      expect(result.current.selectedItem).not.toBeNull();
      expect(result.current.selectedItem?.isAvailable).toBe(true);
    });
  });

  describe("Derived state (images)", () => {
    it("должен объединить изображения из product и selectedItem", () => {
      const { result } = renderHook(() =>
        useProductVariants({ product: mockProductWithVariants })
      );

      const images = result.current.images;
      expect(images).toContain("image1.jpg");
      expect(images).toContain("image2.jpg");
      expect(images).toContain("variant1.jpg");
      expect(images.length).toBeGreaterThanOrEqual(3);
    });

    it("должен обновить images при смене selectedItem", () => {
      const { result } = renderHook(() =>
        useProductVariants({ product: mockProductWithVariants })
      );

      const initialImages = result.current.images;

      act(() => {
        result.current.setSelectedColor("white");
        result.current.setSelectedSize("L");
      });

      // Изображения должны измениться (variant3.jpg вместо variant1.jpg)
      const newImages = result.current.images;
      expect(newImages).toContain("variant3.jpg");
    });
  });

  describe("Edge cases", () => {
    it("должен обработать товар без вариантов", () => {
      const { result } = renderHook(() =>
        useProductVariants({ product: mockProductNoVariants })
      );

      expect(result.current.selectedItem).toBeNull();
      expect(result.current.availableColors).toEqual([]);
      expect(result.current.availableSizes).toEqual([]);
      expect(result.current.effectiveColor).toBe("");
      expect(result.current.effectiveSize).toBe("");
      // Если нет вариантов, но есть изображения в product, они должны быть в images
      expect(result.current.images).toEqual(mockProductNoVariants.images ?? []);
    });

    it("должен обработать товар с одним вариантом", () => {
      const { result } = renderHook(() =>
        useProductVariants({ product: mockProductSingleVariant })
      );

      expect(result.current.selectedItem).not.toBeNull();
      expect(result.current.selectedItem?.id).toBe(2); // Единственный вариант
      expect(result.current.availableColors).toEqual(["black"]);
      expect(result.current.availableSizes).toEqual(["M"]);
    });

    it("должен обработать отсутствие товара (null/undefined)", () => {
      const { result } = renderHook(() => useProductVariants({ product: null }));

      expect(result.current.selectedItem).toBeNull();
      expect(result.current.availableColors).toEqual([]);
      expect(result.current.availableSizes).toEqual([]);
      expect(result.current.images).toEqual([]);
    });

    it("должен использовать первый доступный вариант, если выбранный недоступен", () => {
      const { result } = renderHook(() =>
        useProductVariants({ product: mockProductWithVariants })
      );

      // Выбираем недоступный вариант (red + S - isAvailable: false)
      act(() => {
        result.current.setSelectedColor("red");
        result.current.setSelectedSize("S");
      });

      // Должен вернуть доступный вариант (не red+S, а другой доступный)
      expect(result.current.selectedItem).not.toBeNull();
      expect(result.current.selectedItem?.isAvailable).toBe(true);
      // Может быть любой доступный вариант, не обязательно red+S
    });

    it("должен использовать fallback на первый вариант, если нет доступных", () => {
      const productWithoutAvailable: DTO.ProductDetailDto = {
        ...mockProductWithVariants,
        items: [
          {
            ...mockProductWithVariants.items[3], // red + S, isAvailable: false
            id: 5,
            color: "blue",
            size: "XL",
          },
        ],
      };

      const { result } = renderHook(() =>
        useProductVariants({ product: productWithoutAvailable })
      );

      // Должен вернуть первый вариант (fallback), даже если он недоступен
      expect(result.current.selectedItem).not.toBeNull();
      expect(result.current.selectedItem?.id).toBe(5);
    });
  });

  describe("Эффективные значения (effectiveColor/effectiveSize)", () => {
    it("должен использовать выбранный цвет, если он доступен", () => {
      const { result } = renderHook(() =>
        useProductVariants({ product: mockProductWithVariants })
      );

      act(() => {
        result.current.setSelectedColor("white");
      });

      expect(result.current.effectiveColor).toBe("white");
    });

    it("должен использовать fallback на первый доступный цвет, если выбранный недоступен", () => {
      const { result } = renderHook(() =>
        useProductVariants({ product: mockProductWithVariants })
      );

      act(() => {
        result.current.setSelectedColor("blue"); // Не существует
      });

      expect(result.current.effectiveColor).toBe("black"); // Первый доступный
    });

    it("должен использовать выбранный размер, если он доступен", () => {
      const { result } = renderHook(() =>
        useProductVariants({ product: mockProductWithVariants })
      );

      act(() => {
        result.current.setSelectedSize("L");
      });

      expect(result.current.effectiveSize).toBe("L");
    });

    it("должен использовать fallback на первый доступный размер, если выбранный недоступен", () => {
      const { result } = renderHook(() =>
        useProductVariants({ product: mockProductWithVariants })
      );

      act(() => {
        result.current.setSelectedSize("XL"); // Не существует
      });

      expect(result.current.effectiveSize).toBe("S"); // Первый доступный
    });
  });
});
