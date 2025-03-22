// jest.config.ts
import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  collectCoverage: true,
  coverageReporters: ["json", "lcov", "text", "clover"],
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts}",
    "!**/node_modules/**",
    "!**/dist/**",
    "!**/__tests__/**",
    "!**/public/**",
  ],
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "./coverage",
        outputName: "junit.xml",
      },
    ],
  ],
};

export default config;
