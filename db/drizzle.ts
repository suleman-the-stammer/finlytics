import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "./schema";
import { getDemoDb } from "./demo-db";

/**
 * DEMO MODE (default): when DATABASE_URL is unset (or still a placeholder),
 * the app uses an embedded Postgres (PGlite) with auto-created tables and
 * seeded demo data — zero external services. See db/demo-db.ts.
 *
 * REAL MODE: set a real Neon DATABASE_URL in .env.local, then run
 * `npm run db:migrate` (and optionally `npm run db:seed`). No code changes.
 */
const dbUrl = process.env.DATABASE_URL;
const isRealDb =
  !!dbUrl && !dbUrl.includes("ep-xxxx") && !dbUrl.includes("USER:PASSWORD");

export const db = (
  isRealDb ? drizzle(neon(dbUrl!), { schema }) : getDemoDb()
) as NeonHttpDatabase<typeof schema>;
