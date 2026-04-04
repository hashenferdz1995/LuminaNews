-- Run this in Cloudflare D1 to initialize the LuminaNews Archive Table
-- Command: npx wrangler d1 execute lumina_news_db --file=init-d1.sql

CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT UNIQUE,
    description TEXT,
    category TEXT,
    link TEXT,
    image TEXT,
    pubDate TEXT,
    timestamp INTEGER
);
