-- LuminaNews D1 Schema Update: v2.0 (Reporter & Submission Hub)
-- Run this in your Cloudflare Dashboard/D1 Console to initialize the necessary tables.

CREATE TABLE IF NOT EXISTS reporters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT,
    nickname TEXT UNIQUE,
    email TEXT UNIQUE,
    phone TEXT,
    address TEXT,
    occupation TEXT,
    education TEXT,
    facebook_url TEXT,
    linkedin_url TEXT,
    twitter_handle TEXT,
    id_number TEXT UNIQUE,
    payment_info TEXT, 
    wallet_balance REAL DEFAULT 0.00,
    referral_code TEXT UNIQUE,
    referral_clicks INTEGER DEFAULT 0,
    referral_earnings REAL DEFAULT 0.00,
    status TEXT DEFAULT 'pending', 
    created_at TEXT
);

CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reporter_id INTEGER,
    title TEXT,
    content TEXT,
    category TEXT,
    location TEXT,
    lat REAL,
    lon REAL,
    media_url TEXT,
    view_count INTEGER DEFAULT 0,
    impact_score REAL DEFAULT 0.0,
    earnings REAL DEFAULT 0.0,
    status TEXT DEFAULT 'approved',
    created_at TEXT,
    FOREIGN KEY(reporter_id) REFERENCES reporters(id)
);
