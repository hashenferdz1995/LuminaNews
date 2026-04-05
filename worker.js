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
                      content.match(/<media:thumbnail.*?url="(.*?)"/)?.[1] || 
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

    if (url.pathname === "/api/subscribe" && request.method === "POST") {
      try {
        const body = await request.json();
        const email = body.email;

        if (!email || !email.includes('@')) {
          return new Response(JSON.stringify({ error: 'Invalid email address' }), { status: 400, headers: corsHeaders });
        }

        const now = new Date();
        await env.DB.prepare(
          "INSERT OR IGNORE INTO subscribers (email, signup_at, timestamp) VALUES (?, ?, ?)"
        ).bind(email, now.toISOString(), now.getTime()).run();

        return new Response(JSON.stringify({ status: 'ok', message: 'Subscribed successfully' }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }
    }

    // 4. RSS FEED GENERATOR (For Google News Publisher Center)
    if (url.pathname === "/api/feed" || url.pathname === "/rss") {
      try {
        const { results } = await env.DB.prepare(
          "SELECT * FROM articles ORDER BY timestamp DESC LIMIT 20"
        ).all();

        const rssItems = results.map(item => `
          <item>
            <title><![CDATA[${item.title}]]></title>
            <link>https://luminanews.online/article.html?title=${encodeURIComponent(item.title)}</link>
            <description><![CDATA[${item.description}]]></description>
            <pubDate>${new Date(item.timestamp).toUTCString()}</pubDate>
            <guid isPermaLink="false">${item.id}</guid>
            <media:content url="${item.image}" medium="image" />
          </item>
        `).join('');

        const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>LuminaNews | Real-Time Global AI News</title>
    <link>https://luminanews.online/</link>
    <description>Bringing you closer to the adrenaline of world updates with AI intelligence.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${rssItems}
  </channel>
</rss>`;

        return new Response(rssXml, {
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/rss+xml; charset=utf-8" 
          }
        });
      } catch (err) {
        return new Response(err.message, { status: 500 });
      }
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
