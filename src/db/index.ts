import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "path";
import fs from "fs";
import * as schema from "./schema";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = process.env.DATABASE_URL ?? path.join(DB_DIR, "ai-atlas.db");

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

function ensureSchema(sqlite: Database.Database) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS news_items (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      source TEXT NOT NULL,
      summary TEXT,
      published_at TEXT NOT NULL,
      fetched_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS news_node_tags (
      news_id TEXT NOT NULL REFERENCES news_items(id) ON DELETE CASCADE,
      node_id TEXT NOT NULL,
      PRIMARY KEY (news_id, node_id)
    );
    CREATE TABLE IF NOT EXISTS feed_meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
}

export function getDb() {
  if (_db) return _db;
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  const sqlite = new Database(DB_PATH);
  ensureSchema(sqlite);
  _db = drizzle(sqlite, { schema });
  return _db;
}
