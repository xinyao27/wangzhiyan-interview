import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

// Database file path - using relative path
const dbPath = "./sqlite.db";

// Create database connection
export const sqlite = new Database(dbPath);

// Create drizzle instance
export const db = drizzle(sqlite);

// Function to close database connection
export function closeDatabase() {
  sqlite.close();
}
