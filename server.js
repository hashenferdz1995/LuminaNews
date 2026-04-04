const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const cron = require('node-cron');
const Parser = require('rss-parser');
const parser = new Parser();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize SQLite Database
const db = new sqlite3.Database('./news_archive.db', (err) => {
    if (err) console.error("Error opening database " + err.message);
    else {
        db.run(`CREATE TABLE IF NOT EXISTS articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT UNIQUE,
            description TEXT,
            category TEXT,
            author TEXT,
            link TEXT,
            image TEXT,
            pubDate TEXT,
            timestamp INTEGER
        )`);
        console.log("Database connected and table ready.");
    }
});

// Helper function to extract high-quality imagery or fallbacks
function getPremiumImage(item, category) {
    let imageUrl = '';
    if (item.thumbnail) imageUrl = item.thumbnail;
    else if (item.enclosure && item.enclosure.url) imageUrl = item.enclosure.url;
    else if (item.content && item.content.match(/src="([^"]+)"/)) imageUrl = item.content.match(/src="([^"]+)"/)[1];

    if (imageUrl && imageUrl.includes('http')) {
        imageUrl = imageUrl.replace('/120/', '/600/').replace('/240/', '/600/');
        return imageUrl;
    }

    const fallbacks = {
        'sports': 'https://images.unsplash.com/photo-1508344928928-7151b67de2b4?auto=format&fit=crop&w=1200&q=80',
        'crypto': 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=1200&q=80',
        'markets': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
        'economy': 'https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=1200&q=80',
        'tech': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
        'global': 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80'
    };
    return fallbacks[category] || fallbacks['global'];
}

// Feeds Mapping
const FEEDS = [
    { key: 'sports', url: 'https://feeds.bbci.co.uk/sport/rss.xml' },
    { key: 'markets', url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html' },
    { key: 'economy', url: 'https://www.cnbc.com/id/10001147/device/rss/rss.html' },
    { key: 'crypto', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/' },
    { key: 'tech', url: 'https://feeds.bbci.co.uk/news/technology/rss.xml' },
    { key: 'global', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' }
];

async function fetchAndSaveNews() {
    console.log("Fetching latest news to archive...");
    for (const feed of FEEDS) {
        try {
            const feedData = await parser.parseURL(feed.url);
            let items = feedData.items;

            // Optional keyword filters same as frontend
            if (feed.key === 'crypto') {
                items = items.filter(i => (`${i.title} ${i.contentSnippet || ''}`).toLowerCase().match(/crypto|bitcoin|btc|eth|ethereum|blockchain|token|web3|nft|ledger/i));
            } else if (feed.key === 'sports') {
                items = items.filter(i => (`${i.title} ${i.contentSnippet || ''}`).toLowerCase().match(/sport|game|match|score|player|league|team|football|cricket/i));
            } else if (feed.key === 'markets') {
                items = items.filter(i => (`${i.title} ${i.contentSnippet || ''}`).toLowerCase().match(/stock|market|trade|invest|share|wall street|nasdaq|dow|s&p|bull|bear|dividend|yield/i));
            }

            for (const item of items) {
                const title = item.title || 'Untitled';
                const description = item.contentSnippet || item.content || '';
                const link = item.link || '';
                const pubDate = item.pubDate || new Date().toISOString();
                const ts = new Date(pubDate).getTime();
                const image = getPremiumImage(item, feed.key);
                
                db.run(`INSERT OR IGNORE INTO articles (title, description, category, author, link, image, pubDate, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, 
                    [title, description, feed.key, 'Lumina Intelligence', link, image, pubDate, ts], 
                    (err) => { if(err) console.error(err); }
                );
            }
        } catch(e) {
            console.error(`Failed to fetch ${feed.key}:`, e.message);
        }
    }
}

// Scheduled to run every hour to collect news permanently
cron.schedule('0 * * * *', fetchAndSaveNews);
// Run once on startup to bootstrap
fetchAndSaveNews();

// --- API ENDPOINTS ---

// Fetch news from Database. Can filter by:
// - category
// - date (format: YYYY-MM-DD)
app.get('/api/news', (req, res) => {
    let query = "SELECT * FROM articles WHERE 1=1";
    const params = [];

    if (req.query.category && req.query.category !== 'all') {
        query += " AND category = ?";
        params.push(req.query.category);
    }
    
    if (req.query.date) {
        const startTs = new Date(`${req.query.date}T00:00:00.000Z`).getTime();
        const endTs = new Date(`${req.query.date}T23:59:59.999Z`).getTime();
        query += " AND timestamp >= ? AND timestamp <= ?";
        params.push(startTs, endTs);
    }

    query += " ORDER BY timestamp DESC LIMIT 50"; // Limit to top 50 in the period

    db.all(query, params, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ status: 'ok', items: rows });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`LuminaNews Database Server running on port ${PORT}`);
});
