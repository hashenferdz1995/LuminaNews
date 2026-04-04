/**
 * LuminaNews Cloudflare Worker & D1 Engine
 * Handles RSS Fetching, Archiving, and API Serving
 */

export default {
  // 1. SCHEDULED CRON (Saves news every hour)
  async scheduled(event, env, ctx) {
    const FEEDS = [
      { key: 'sports', url: 'https://feeds.bbci.co.uk/sport/rss.xml' },
      { key: 'markets', url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html' },
      { key: 'economy', url: 'https://www.cnbc.com/id/10001147/device/rss/rss.html' },
      { key: 'crypto', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/' },
      { key: 'tech', url: 'https://feeds.bbci.co.uk/news/technology/rss.xml' },
      { key: 'global', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' }
    ];

    for (const feed of FEEDS) {
      try {
        const response = await fetch(feed.url);
        const xmlText = await response.text();
        
        // Manual Simple Parser (Fast at the edge)
        const items = [...xmlText.matchAll(/<item>([\s\S]*?)<\/item>/g)];
        
        for (const itemMatch of items) {
          const content = itemMatch[1];
          
          let title = content.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || 
                      content.match(/<title>(.*?)<\/title>/)?.[1] || "Untitled";
          
          let link = content.match(/<link>(.*?)<\/link>/)?.[1] || "";
          let pubDateRaw = content.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || new Date().toISOString();
          let ts = new Date(pubDateRaw).getTime();

          // Simple description extraction
          let description = content.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] || 
                           content.match(/<description>(.*?)<\/description>/)?.[1] || "";
          
          // Image extraction (Media enclosure or content)
          let image = content.match(/<enclosure.*?url="(.*?)"/)?.[1] || 
                      content.match(/<media:content.*?url="(.*?)"/)?.[1] || 
                      content.match(/<img.*?src="(.*?)"/)?.[1] || "";

          // DB Save (Insert or Ignore if title exists)
          await env.DB.prepare(
            `INSERT OR IGNORE INTO articles (title, description, category, link, image, pubDate, timestamp) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`
          ).bind(title, description, feed.key, link, image, pubDateRaw, ts).run();
        }
      } catch (e) {
        console.error(`Fetch Error [${feed.key}]:`, e);
      }
    }
  },

  // 2. HTTP FETCH (Serves news to Frontend)
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
      "Access-Control-Max-Age": "86400",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === "/api/news") {
      const category = url.searchParams.get("category") || 'all';
      const date = url.searchParams.get("date");
      
      let query = "SELECT * FROM articles WHERE 1=1";
      const params = [];

      if (category !== 'all') {
        query += " AND category = ?";
        params.push(category);
      }
      
      if (date) {
        const startTs = new Date(`${date}T00:00:00.000Z`).getTime();
        const endTs = new Date(`${date}T23:59:59.999Z`).getTime();
        query += " AND timestamp >= ? AND timestamp <= ?";
        params.push(startTs, endTs);
      }

      query += " ORDER BY timestamp DESC LIMIT 50";
      
      try {
        const { results } = await env.DB.prepare(query).bind(...params).all();
        return new Response(JSON.stringify({ status: 'ok', items: results }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }
    }

    return new Response("LuminaNews Cloudflare Hub - OK", { status: 200 });
  }
};
