import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    rules: {
      // A11y: требуем alt у img и предпочитаем next/image; для декоративных изображений использовать alt=""
      "@next/next/no-img-element": "warn",
      "jsx-a11y/alt-text": "warn",
      // Улучшенные правила для качества кода
      "no-console": ["warn", { allow: ["warn", "error"] }], // Разрешаем только warn и error
      "no-unused-vars": "off", // Отключаем базовое правило, используем TypeScript версию
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "prefer-const": "warn",
      "no-var": "error",
      "object-shorthand": "warn",
      "prefer-arrow-callback": "warn",
    },
  },

  // Конфигурационные файлы (Jest, скрипты) - разрешаем require (CommonJS)
  {
    files: ["jest.setup.js", "scripts/**/*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "no-console": "off", // В скриптах console.log нормален
    },
  },

  // API-клиенты: импорт только через @/shared/services; запрет прямых импортов из @/shared/services/api вне самой папки api
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/shared/services/api", "@/shared/services/api/**"],
              message:
                "Импорт только из @/shared/services. Прямые импорты из @/shared/services/api разрешены только внутри shared/services/api.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["shared/services/api/**/*.ts", "shared/services/api/**/*.tsx"],
    rules: {
      "no-restricted-imports": "off",
    },
  },

  // app/** и app/api/**/lib: запрет импорта Prisma (данные только через server-services)
  {
    files: ["app/**/*.ts", "app/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/shared/services/api", "@/shared/services/api/**"],
              message:
                "Импорт только из @/shared/services. Прямые импорты из @/shared/services/api разрешены только внутри shared/services/api.",
            },
            {
              group: ["@/prisma/prisma-client", "@/prisma/prisma-client.js"],
              message:
                "Prisma запрещён в app/** и app/api/**/lib. Используйте server-services из @/shared/services/server.",
            },
          ],
        },
      ],
    },
  },

  // Override default ignores of eslint-config-next.
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
