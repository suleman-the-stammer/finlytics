import { PGlite } from "@electric-sql/pglite";
import { drizzle, type PgliteDatabase } from "drizzle-orm/pglite";
import { eachDayOfInterval, format, subDays } from "date-fns";

import * as schema from "./schema";
import { LOCAL_USER_ID } from "@/lib/dev-auth";

/**
 * ⚠️ DEMO DATABASE — an embedded Postgres (PGlite, WASM) that runs inside the
 * Node process. No external database, no signup, no install. Tables are
 * created and demo data is seeded automatically on startup.
 *
 * Runs fully IN MEMORY: data reseeds on every server start (locally and on
 * each Vercel cold start). Edits persist while the server is running — ideal
 * for a portfolio demo, and immune to file-lock/corruption issues that
 * on-disk WASM persistence suffers when the dev server is killed.
 *
 * To use a real database instead, set DATABASE_URL in .env.local
 * (see db/drizzle.ts).
 */

export type DemoDb = PgliteDatabase<typeof schema>;

const DDL: string[] = [
  `CREATE TABLE IF NOT EXISTS "accounts" (
    "id" text PRIMARY KEY NOT NULL,
    "plaid_id" text,
    "name" text NOT NULL,
    "user_id" text NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "categories" (
    "id" text PRIMARY KEY NOT NULL,
    "plaid_id" text,
    "name" text NOT NULL,
    "user_id" text NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "transactions" (
    "id" text PRIMARY KEY NOT NULL,
    "amount" integer NOT NULL,
    "payee" text NOT NULL,
    "notes" text,
    "date" timestamp NOT NULL,
    "account_id" text NOT NULL REFERENCES "accounts"("id") ON DELETE CASCADE,
    "category_id" text REFERENCES "categories"("id") ON DELETE SET NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "connected_banks" (
    "id" text PRIMARY KEY NOT NULL,
    "user_id" text NOT NULL,
    "access_token" text NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "subscriptions" (
    "id" text PRIMARY KEY NOT NULL,
    "user_id" text NOT NULL UNIQUE,
    "subscription_id" text NOT NULL UNIQUE,
    "status" text NOT NULL
  )`,
];

const esc = (value: string) => value.replace(/'/g, "''");
const toMiliunits = (amount: number) => Math.round(amount * 1000);

const SEED_CATEGORIES = [
  { id: "category_1", name: "Food" },
  { id: "category_2", name: "Rent" },
  { id: "category_3", name: "Utilities" },
  { id: "category_4", name: "Transportation" },
  { id: "category_5", name: "Entertainment" },
  { id: "category_7", name: "Clothing" },
];

const SEED_ACCOUNTS = [
  { id: "account_1", name: "Checking" },
  { id: "account_2", name: "Savings" },
];

const MERCHANTS: Record<string, { payees: string[]; min: number; max: number }> = {
  Food: { payees: ["Whole Foods", "Chipotle", "Starbucks", "Trader Joe's"], min: 8, max: 45 },
  Rent: { payees: ["Parkview Apartments"], min: 1150, max: 1150 },
  Utilities: { payees: ["City Power & Light", "Verizon", "AquaFlow Water"], min: 40, max: 180 },
  Transportation: { payees: ["Uber", "Shell", "Metro Transit"], min: 8, max: 60 },
  Entertainment: { payees: ["Netflix", "Spotify", "AMC Theatres", "Steam"], min: 10, max: 70 },
  Clothing: { payees: ["Uniqlo", "Zara", "Nike"], min: 25, max: 140 },
};

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];
const between = (min: number, max: number) => Math.random() * (max - min) + min;

const buildSeedStatements = (): string[] => {
  const statements: string[] = [];

  statements.push(
    `INSERT INTO "categories" ("id", "name", "user_id", "plaid_id") VALUES ${SEED_CATEGORIES.map(
      (c) => `('${c.id}', '${esc(c.name)}', '${LOCAL_USER_ID}', NULL)`,
    ).join(", ")}`,
  );

  statements.push(
    `INSERT INTO "accounts" ("id", "name", "user_id", "plaid_id") VALUES ${SEED_ACCOUNTS.map(
      (a) => `('${a.id}', '${esc(a.name)}', '${LOCAL_USER_ID}', NULL)`,
    ).join(", ")}`,
  );

  const rows: string[] = [];
  const days = eachDayOfInterval({ start: subDays(new Date(), 90), end: new Date() });

  for (const day of days) {
    const dateStr = format(day, "yyyy-MM-dd");
    const dayOfMonth = day.getDate();

    // Salary lands on the 1st and 15th so income vs expenses looks realistic.
    if (dayOfMonth === 1 || dayOfMonth === 15) {
      rows.push(
        `('txn_${dateStr}_salary', ${toMiliunits(between(2400, 2800))}, 'Acme Corp — Salary', 'Bi-monthly payroll', '${dateStr} 09:00:00', 'account_1', NULL)`,
      );
    }
    // Rent on the 1st only.
    if (dayOfMonth === 1) {
      const rent = MERCHANTS.Rent;
      rows.push(
        `('txn_${dateStr}_rent', ${-toMiliunits(rent.min)}, '${esc(rent.payees[0])}', 'Monthly rent', '${dateStr} 08:00:00', 'account_1', 'category_2')`,
      );
    }

    // 1–3 everyday expenses per day across the other categories.
    const count = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < count; i++) {
      const category = pick(SEED_CATEGORIES.filter((c) => c.name !== "Rent"));
      const merchant = MERCHANTS[category.name];
      const amount = -toMiliunits(between(merchant.min, merchant.max));
      const accountId = Math.random() < 0.15 ? "account_2" : "account_1";
      rows.push(
        `('txn_${dateStr}_${i}', ${amount}, '${esc(pick(merchant.payees))}', NULL, '${dateStr} 12:00:00', '${accountId}', '${category.id}')`,
      );
    }
  }

  statements.push(
    `INSERT INTO "transactions" ("id", "amount", "payee", "notes", "date", "account_id", "category_id") VALUES ${rows.join(", ")}`,
  );

  return statements;
};

type RawQuery = (
  sql: string,
  params?: unknown[],
  options?: Record<string, unknown>,
) => Promise<{ rows: Array<Record<string, unknown>> }>;

const init = async (query: RawQuery) => {
  for (const statement of DDL) {
    await query(statement);
  }

  for (const statement of buildSeedStatements()) {
    await query(statement);
  }
};

const globalStore = globalThis as unknown as { __financeDemoDb?: DemoDb };

export const getDemoDb = (): DemoDb => {
  if (globalStore.__financeDemoDb) {
    return globalStore.__financeDemoDb;
  }

  // Always in-memory: reseeds on each server start / Vercel cold start.
  const client = new PGlite();

  const rawQuery = client.query.bind(client) as RawQuery;
  const ready = init(rawQuery);

  // Hold back application queries until tables exist and seeding is done.
  // Forward ALL arguments — drizzle passes a third options arg
  // ({ rowMode: "array" }) that field mapping depends on.
  (client as unknown as { query: RawQuery }).query = async (sql, params, options) => {
    await ready;
    return rawQuery(sql, params, options);
  };

  const db = drizzle(client, { schema });
  globalStore.__financeDemoDb = db;
  return db;
};
