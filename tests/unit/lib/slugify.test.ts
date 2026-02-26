/**
 * Unit тесты для slugify
 */

import { describe, it, expect } from "@jest/globals";
import { slugify } from "@/shared/lib/generators/slugify";

describe("slugify", () => {
  it("should transliterate cyrillic to latin", () => {
    // "й" транслитерируется как "y", не "j"
    expect(slugify("Футбольный мяч")).toBe("futbolnyy-myach");
    expect(slugify("Товар")).toBe("tovar");
  });

  it("should handle numbers", () => {
    expect(slugify("Товар 123")).toBe("tovar-123");
    expect(slugify("123")).toBe("123");
  });

  it("should handle mixed case", () => {
    expect(slugify("ТоВаР")).toBe("tovar");
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("should replace spaces with dashes", () => {
    expect(slugify("hello world")).toBe("hello-world");
    expect(slugify("hello  world")).toBe("hello-world");
  });

  it("should remove special characters", () => {
    expect(slugify("товар!@#$%")).toBe("tovar");
    expect(slugify("hello@world")).toBe("helloworld");
  });

  it("should trim and remove leading/trailing dashes", () => {
    expect(slugify("  товар  ")).toBe("tovar");
    expect(slugify("-товар-")).toBe("tovar");
  });

  it("should handle empty strings", () => {
    expect(slugify("")).toBe("");
    expect(slugify("   ")).toBe("");
  });

  it("should handle already latin strings", () => {
    expect(slugify("hello-world")).toBe("hello-world");
    expect(slugify("product123")).toBe("product123");
  });
});
