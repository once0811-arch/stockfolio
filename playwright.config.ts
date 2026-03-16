import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "**/*.e2e.ts",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
  },
  webServer: {
    command: "pnpm run dev --hostname localhost --port 3001",
    url: "http://localhost:3001",
    env: {
      NEXTAUTH_URL: "http://localhost:3001",
    },
    reuseExistingServer: false,
    timeout: 120000,
  },
});
