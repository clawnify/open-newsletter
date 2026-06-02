/**
 * Database access. The worker is bound to a D1 database in production and a
 * compatible storage binding in preview; `@clawnify/db` detects which is
 * present and exposes one `query` / `get` / `run` API (params passed as an
 * array). This module re-exports that API and the app's D1 binding type.
 */
export type DB = D1Database;
export { initDB, query, get, run } from "@clawnify/db";
