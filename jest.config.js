/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  roots: ["<rootDir>/tests"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^@/shared/(.*)$": "<rootDir>/shared/$1",
  },
  collectCoverageFrom: [
    "shared/**/*.{ts,tsx}",
    "modules/**/*.{ts,tsx}",
    "app/api/**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/.next/**",
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  projects: [
    {
      displayName: "node",
      preset: "ts-jest",
      testEnvironment: "node",
      testMatch: ["<rootDir>/tests/unit/lib/**/*.test.ts"],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
        "^@/shared/(.*)$": "<rootDir>/shared/$1",
      },
      setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
      transform: {
        "^.+\\.tsx?$": [
          "ts-jest",
          {
            tsconfig: {
              jsx: "react-jsx",
            },
          },
        ],
      },
    },
    {
      displayName: "jsdom",
      preset: "ts-jest",
      testEnvironment: "jsdom",
      testMatch: ["<rootDir>/tests/unit/hooks/**/*.test.ts", "<rootDir>/tests/unit/**/*.test.tsx"],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
        "^@/shared/(.*)$": "<rootDir>/shared/$1",
      },
      setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
      transform: {
        "^.+\\.tsx?$": [
          "ts-jest",
          {
            tsconfig: {
              jsx: "react-jsx",
            },
          },
        ],
      },
    },
  ],
};

module.exports = config;
