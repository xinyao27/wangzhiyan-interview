import { drizzle } from "drizzle-orm/better-sqlite3";

// Database file path
const dbPath = process.env.DATABASE_URL || `${process.cwd()}/sqlite.db`;

// Create drizzle instance
export const db = drizzle(dbPath);
