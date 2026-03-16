import { describe, expect, it } from "vitest";

import { prisma } from "@/src/db/client";

describe("prisma connectivity", () => {
  const runDbTests = process.env.RUN_DB_TESTS === "true";

  (runDbTests ? it : it.skip)(
    "connects to local postgres and returns a heartbeat",
    async () => {
      const rows = await prisma.$queryRaw<Array<{ ok: number }>>`SELECT 1 AS ok`;
      expect(rows[0]?.ok).toBe(1);
    },
  );
});
