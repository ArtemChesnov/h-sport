/**
 * Jest setup file для глобальных моков и настройки окружения
 */

// Мокаем next/navigation для тестов
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => "/test",
  useSearchParams: () => new URLSearchParams(),
  redirect: jest.fn(),
  notFound: jest.fn(),
}));

// Мокаем next/headers для тестов
jest.mock("next/headers", () => ({
  cookies: () => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    has: jest.fn(),
  }),
  headers: () => ({
    get: jest.fn(),
  }),
}));

// Мокаем TextEncoder/TextDecoder если их нет в окружении
if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = require("util").TextEncoder;
}
if (typeof global.TextDecoder === "undefined") {
  global.TextDecoder = require("util").TextDecoder;
}

// Мокаем ResizeObserver если его нет в окружении
if (typeof global.ResizeObserver === "undefined") {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// Очистка после каждого теста (для rate-limit и других глобальных состояний)
afterEach(() => {
  jest.clearAllMocks();
});
