import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testPathIgnorePatterns: ["/node_modules/", "setup\\.ts$"],
  setupFiles: ["<rootDir>/src/lib/workflow/__tests__/setup.ts"],
};

export default config;
