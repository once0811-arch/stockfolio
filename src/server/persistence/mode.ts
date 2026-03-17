export type PersistenceMode = "memory" | "postgres" | "auto";

const warnedMessages = new Set<string>();
let autoPostgresDisabled = false;

function warnOnce(message: string): void {
  if (warnedMessages.has(message)) {
    return;
  }
  warnedMessages.add(message);
  console.warn(message);
}

export function getPersistenceMode(): PersistenceMode {
  const raw = process.env.PORTFOLIO_PERSISTENCE_MODE?.trim().toLowerCase();

  if (raw === "memory" || raw === "postgres" || raw === "auto") {
    return raw;
  }

  return "auto";
}

export function shouldUsePostgresByPolicy(): boolean {
  if (process.env.NODE_ENV === "test") {
    return false;
  }

  const mode = getPersistenceMode();
  if (mode === "memory") {
    return false;
  }
  if (mode === "postgres") {
    return true;
  }

  if (autoPostgresDisabled) {
    return false;
  }

  return Boolean(process.env.DATABASE_URL);
}

export function onPostgresFailure(error: unknown, context: string): void {
  const mode = getPersistenceMode();

  if (mode === "postgres") {
    throw error instanceof Error
      ? error
      : new Error(`PostgreSQL persistence failed in ${context}`);
  }

  if (mode === "auto" && process.env.NODE_ENV === "production") {
    throw error instanceof Error
      ? error
      : new Error(`PostgreSQL persistence failed in ${context}`);
  }

  const message =
    error instanceof Error ? error.message : "unknown persistence error";
  autoPostgresDisabled = true;
  warnOnce(
    `[persistence:auto] PostgreSQL failed in ${context}; fallback to memory: ${message}`,
  );
}

export function resetPersistenceModeForTests(): void {
  autoPostgresDisabled = false;
  warnedMessages.clear();
}
