import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";

export const newsItems = sqliteTable("news_items", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  source: text("source").notNull(),
  summary: text("summary"),
  publishedAt: text("published_at").notNull(),
  fetchedAt: text("fetched_at").notNull(),
});

export const newsNodeTags = sqliteTable(
  "news_node_tags",
  {
    newsId: text("news_id")
      .notNull()
      .references(() => newsItems.id, { onDelete: "cascade" }),
    nodeId: text("node_id").notNull(),
  },
  (t) => [primaryKey({ columns: [t.newsId, t.nodeId] })],
);

export const feedMeta = sqliteTable("feed_meta", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const chatMessages = sqliteTable("chat_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull(),
});

export type NewsItem = typeof newsItems.$inferSelect;
export type NewsNodeTag = typeof newsNodeTags.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
