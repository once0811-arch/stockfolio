import { afterEach, describe, expect, it, vi } from "vitest";

import {
  onPostgresFailure,
  resetPersistenceModeForTests,
  shouldUsePostgresByPolicy,
} from "@/src/server/persistence/mode";

describe("persistence mode policy", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    resetPersistenceModeForTests();
  });

  it("fails fast in production when postgres auto mode errors", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("PORTFOLIO_PERSISTENCE_MODE", "auto");
    vi.stubEnv(
      "DATABASE_URL",
      "postgresql://postgres:postgres@localhost:5432/portfolio_ops",
    );

    expect(shouldUsePostgresByPolicy()).toBe(true);
    expect(() => onPostgresFailure(new Error("db down"), "listTrades")).toThrow();
    expect(shouldUsePostgresByPolicy()).toBe(true);
  });

  it("falls back to memory in development auto mode", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("PORTFOLIO_PERSISTENCE_MODE", "auto");
    vi.stubEnv(
      "DATABASE_URL",
      "postgresql://postgres:postgres@localhost:5432/portfolio_ops",
    );

    expect(shouldUsePostgresByPolicy()).toBe(true);
    onPostgresFailure(new Error("db down"), "listTrades");
    expect(shouldUsePostgresByPolicy()).toBe(false);
  });
});
