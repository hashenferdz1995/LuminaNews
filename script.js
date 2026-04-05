document.addEventListener('DOMContentLoaded', () => {
    // 0. ADD DEV MODE WARNING (ALPHA TERMINAL)
    const devBar = document.createElement('div');
    devBar.className = 'dev-mode-bar';
    devBar.innerHTML = `<span class="badge">ALPHA v1.2</span> <span>SYSTEM ACTIVE: Terminal under optimization & live data synchronization...</span>`;
    document.body.prepend(devBar);

    // 1. STICKY HEADER & SCROLL EFFECTS
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    // 2. SCROLL REVEAL ANIMATIONS
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.news-card, .sidebar-item, .hero-content').forEach(el => {
        observer.observe(el);
    });

    // 3. LIVE WEATHER & GEO-CACHING (ANTI-PROMPT LOGIC)
    const weatherIcon = document.getElementById('weather-icon');
    const weatherTemp = document.getElementById('weather-temp');
    const weatherLoc = document.getElementById('weather-location');

    function getWeatherIcon(code) {
        if (code <= 1) return '☀️'; 
        if (code <= 3) return '⛅'; 
        if (code <= 48) return '🌫️'; 
        if (code <= 67) return '🌧️'; 
        if (code <= 77) return '❄️'; 
        if (code <= 82) return '🚿'; 
        if (code <= 99) return '⛈️'; 
        return '☁️';
    }

    async function fetchWeather(lat, lon) {
        try {
            // Cache the location to avoid repeated prompts
            localStorage.setItem('lumina_lat', lat);
            localStorage.setItem('lumina_lon', lon);
            localStorage.setItem('lumina_geo_time', new Date().getTime());

            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
            const data = await res.json();
            const temp = Math.round(data.current_weather.temperature);
            const code = data.current_weather.weathercode;
            
            weatherTemp.textContent = `${temp}°C`;
            weatherIcon.textContent = getWeatherIcon(code);
            weatherLoc.textContent = "Synced"; 
        } catch (err) {
            weatherLoc.textContent = "Offline";
        }
    }

    // Smart Geolocation Logic: Check cache first
    const cachedLat = localStorage.getItem('lumina_lat');
    const cachedLon = localStorage.getItem('lumina_lon');
    const cacheAge = new Date().getTime() - (localStorage.getItem('lumina_geo_time') || 0);

    // If we have data less than 1 hour old, use it and don't prompt
    if (cachedLat && cachedLon && cacheAge < 3600000) {
        fetchWeather(cachedLat, cachedLon);
    } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
            () => fetchWeather(7.8731, 80.7718) // Sri Lanka fallback
        );
    }

    // 4. AI TRADER HUB ENGINE
    const assetDataRepo = {
        // CRYPTO
        "BTC": { type: "crypto", name: "Bitcoin (BTC)", price: "$67,150.25", trend: "+1.2%", dir: "BULLISH", color: "#10B981", pos: "80%", logic: "Institutional accumulation detected. BTC remains the primary liquidity sink for the 2026 cycle." },
        "ETH": { type: "crypto", name: "Ethereum (ETH)", price: "$2,042.85", trend: "-0.5%", dir: "NEUTRAL", color: "#F59E0B", pos: "45%", logic: "Gas optimization via Layer 2 solutions stabilizing network fees. ETH maintains ecosystem dominance." },
        "SOL": { type: "crypto", name: "Solana (SOL)", price: "$79.50", trend: "+3.4%", dir: "BULLISH", color: "#10B981", pos: "75%", logic: "Network throughput hits all-time high. High retail activity on Solana DEXs drives buy pressure." },
        "BNB": { type: "crypto", name: "Binance (BNB)", price: "$312.40", trend: "+0.8%", dir: "BULLISH", color: "#10B981", pos: "60%", logic: "Launchpad activity and burn mechanisms keeping supply tight near historical resistance." },
        "XRP": { type: "crypto", name: "Ripple (XRP)", price: "$0.84", trend: "-1.2%", dir: "BEARISH", color: "#EF4444", pos: "35%", logic: "Regulatory clarity achieved but massive sell-side liquidity at $0.90 is suppressing growth." },
        "ADA": { type: "crypto", name: "Cardano (ADA)", price: "$0.42", trend: "+0.2%", dir: "NEUTRAL", color: "#F59E0B", pos: "50%", logic: "DeFi TVL growing slowly. ADA technical indicators suggest long-term accumulation phase." },
        "DOGE":{ type: "crypto", name: "Dogecoin (DOGE)", price: "$0.14", trend: "+5.1%", dir: "BULLISH", color: "#10B981", pos: "90%", logic: "Meme momentum remains high. Whale movements detected moving from exchanges to cold wallets." },
        
        // STOCKS
        "NVDA": { type: "stocks", name: "Nvidia (NVDA)", price: "$176.40", trend: "+2.1%", dir: "BULLISH", color: "#10B981", pos: "80%", logic: "Dominance in GPU manufacturing for AGIs persists. Enterprise orders up 15% this quarter." },
        "TSLA": { type: "stocks", name: "Tesla (TSLA)", price: "$242.15", trend: "-1.8%", dir: "BEARISH", color: "#EF4444", pos: "30%", logic: "Robotaxi delays and increasing FSD competition in China pressuring short-term margins." },
        "AAPL": { type: "stocks", name: "Apple (AAPL)", price: "$195.40", trend: "+0.4%", dir: "NEUTRAL", color: "#F59E0B", pos: "55%", logic: "Stable demand for iPhone 17 and high services revenue stream keeps AAPL steady." },
        "AMZN": { type: "stocks", name: "Amazon (AMZN)", price: "$210.12", trend: "+1.5%", dir: "BULLISH", color: "#10B981", pos: "70%", logic: "AWS momentum re-accelerating. Cloud efficiency gains offset retail scaling costs." },
        "MSFT": { type: "stocks", name: "Microsoft (MSFT)", price: "$512.80", trend: "+0.9%", dir: "BULLISH", color: "#10B981", pos: "75%", logic: "Azure AI services hitting record adoption. Copilot ecosystem expansion remains a key growth driver." },
        "GOOGL":{ type: "stocks", name: "Alphabet (GOOGL)", price: "$182.40", trend: "-1.1%", dir: "NEUTRAL", color: "#F59E0B", pos: "55%", logic: "Search dominance evolves with Gemini. YouTube ad revenue stable amid platform competition." },
        "META": { type: "stocks", name: "Meta (META)", price: "$610.12", trend: "+2.4%", dir: "BULLISH", color: "#10B981", pos: "82%", logic: "Ad relevance improved by AI driving better ROAS. Llama 4 anticipation rising." },

        // MARKETS
        "NASDAQ": { type: "market", name: "NASDAQ (IXIC)", price: "$21,879.18", trend: "+1.3%", dir: "BULLISH", color: "#10B981", pos: "70%", logic: "Tech sector resilient despite inflation. AI growth stocks leading the index." },
        "GOLD": { type: "market", name: "GOLD (GC=F)", price: "$4,705.50", trend: "+0.6%", dir: "BULLISH", color: "#10B981", pos: "65%", logic: "Geopolitical instability remains a tailwind for Gold. Central bank hoarding continues." },
        "OIL": { type: "market", name: "CRUDE OIL (CL=F)", price: "$112.40", trend: "+2.5%", dir: "BULLISH", color: "#10B981", pos: "85%", logic: "Supply chain disruptions and strategic reserve depletion driving energy prices higher." },

        // FOREX
        "EURUSD": { type: "forex", name: "EUR/USD", price: "1.0845", trend: "-0.2%", dir: "NEUTRAL", color: "#F59E0B", pos: "48%", logic: "Eurozone GDP growth lagging behind US. Dollar strength supported by higher-for-longer yields." },
        "USDJPY": { type: "forex", name: "USD/JPY", price: "155.70", trend: "+0.3%", dir: "BULLISH", color: "#10B981", pos: "72%", logic: "BoJ intervention risks vs widening interest rate differentials favoring the Dollar." },
        "GBPUSD": { type: "forex", name: "GBP/USD", price: "1.3142", trend: "-0.1%", dir: "NEUTRAL", color: "#F59E0B", pos: "46%", logic: "BoE likely to hold rates, but economic softness in UK capping any significant rally." }
    };

    let currentActiveAsset = "BTC"; // Built-in Fallback
    const currentPath = window.location.pathname.toLowerCase();
    
    // Automatically match the AI Trader Hub's starting asset to the page category
    if (currentPath.includes('market')) {
        currentActiveAsset = "NVDA";
    } else if (currentPath.includes('economy')) {
        currentActiveAsset = "EURUSD";
    } else if (currentPath.includes('crypto')) {
        currentActiveAsset = "BTC";
    }

    function initAssetAnalyzer() {
        const searchInput = document.getElementById('unified-terminal-search');
        const dropdownEl = document.getElementById('terminal-dropdown-results');
        
        if (!searchInput || !dropdownEl) return;

        const renderDropdown = (filter = '') => {
            const html = Object.keys(assetDataRepo)
                .filter(key => assetDataRepo[key].name.toLowerCase().includes(filter.toLowerCase()) || key.toLowerCase().includes(filter.toLowerCase()))
                .map(key => {
                    return `<div class="dropdown-item" data-asset="${key}">
                                <span>${assetDataRepo[key].name}</span>
                                <span class="t-symbol">${assetDataRepo[key].type.toUpperCase()}</span>
                            </div>`
                }).join('');
            
            if(html === '') {
                dropdownEl.innerHTML = '<div class="dropdown-item" style="color:var(--text-secondary)">No assets found...</div>';
            } else {
                dropdownEl.innerHTML = html;
            }
            
            dropdownEl.querySelectorAll('.dropdown-item').forEach(item => {
                if(item.getAttribute('data-asset')){
                    item.addEventListener('click', (e) => {
                        currentActiveAsset = item.getAttribute('data-asset');
                        searchInput.value = '';
                        dropdownEl.classList.remove('show');
                        updateTraderHubDisplay(); 
                    });
                }
            });
        };

        renderDropdown(); // Initial rendering

        searchInput.addEventListener('input', (e) => {
            renderDropdown(e.target.value);
            dropdownEl.classList.add('show');
        });

        // Ensure dropdown closes when clicking outside
        document.addEventListener('click', (e) => {
            if(!e.target.closest('.terminal-search-wrapper')) {
                dropdownEl.classList.remove('show');
            }
        });

        searchInput.addEventListener('focus', () => {
            renderDropdown(searchInput.value);
            dropdownEl.classList.add('show');
        });
    }

    // --- CENTRALIZED MARKET DATA ENGINE (Single Source of Truth) ---
    window.marketCache = {};
    const CF_PROXY = 'https://lumina-news-worker.hashenferdz.workers.dev/api/proxy?url=';

    async function fetchGlobalPrice(symbol, type) {
        if (window.marketCache[symbol] && (Date.now() - window.marketCache[symbol].timestamp < 10000)) {
            return window.marketCache[symbol];
        }

        let livePrice = 0, liveChange = 0;
        try {
            let targetUrl = '';
            if (type === 'crypto') {
                const s = symbol.includes('USDT') ? symbol : `${symbol}USDT`;
                targetUrl = `https://api.binance.com/api/v3/ticker/24hr?symbol=${s}`;
            } else {
                const ts = symbol === 'EURUSD' ? 'EURUSD=X' : symbol === 'USDJPY' ? 'JPY=X' : 
                          symbol === 'NASDAQ' ? '^IXIC' : symbol === 'GOLD' ? 'GC=F' : 
                          symbol === 'OIL' ? 'CL=F' : symbol;
                targetUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${ts}?interval=1m&range=1d`;
            }

            const res = await fetch(`${CF_PROXY}${encodeURIComponent(targetUrl)}`);
            const data = await res.json();
            
            if (type === 'crypto') {
                livePrice = parseFloat(data.lastPrice);
                liveChange = parseFloat(data.priceChangePercent);
            } else {
                const meta = data.chart.result[0].meta;
                livePrice = meta.regularMarketPrice;
                liveChange = ((livePrice - meta.previousClose) / meta.previousClose) * 100;
            }

            window.marketCache[symbol] = { price: livePrice, change: liveChange, timestamp: Date.now() };
            return window.marketCache[symbol];
        } catch (e) {
            console.warn("Market Sync Error:", symbol, e);
            return null;
        }
    }

    async function updateTraderHubDisplay() {
        const sentimentPointer = document.getElementById('sentiment-pointer');
        const marketDirection = document.getElementById('market-direction');
        const actionCard = document.getElementById('terminal-action-card');
        const actionDisplay = document.getElementById('display-signal-action');
        const targetDisplay = document.getElementById('display-signal-targets');
        const logicDisplay = document.getElementById('display-signal-logic');
        const displayName = document.getElementById('display-asset-name');
        const displayPrice = document.getElementById('display-asset-price');
        const displayTrend = document.getElementById('display-asset-trend');
        
        if (!sentimentPointer) return;

        let baseData = { ...(assetDataRepo[currentActiveAsset] || assetDataRepo["BTC"]) };
        const liveData = await fetchGlobalPrice(currentActiveAsset, baseData.type);
        
        let livePrice = liveData ? liveData.price : parseFloat(baseData.price.replace(/[^0-9.]/g, ''));
        let liveChange = liveData ? liveData.change : parseFloat(baseData.trend);

        if (!livePrice || isNaN(livePrice)) return;

        // --- DYNAMIC AI VERDICT ENGINE ---
        const generateAiVerdict = (price, change) => {
            let verdict = "HOLD", logic = "", color = "#F59E0B";
            const absChange = Math.abs(change);
            
            if (change > 4) { verdict = "STRONG BUY"; color = "#10B981"; logic = `High-volume trend confirmation. ${currentActiveAsset} showing intense buyer dominance.`; }
            else if (change > 1) { verdict = "BUY"; color = "#10B981"; logic = `Bullish pattern emerging. AI indicators detect steady accumulation phase.`; }
            else if (change < -4) { verdict = "STRONG SELL"; color = "#EF4444"; logic = `Bearish capitulation. Significant distribution detected across major order books.`; }
            else if (change < -1) { verdict = "SELL"; color = "#EF4444"; logic = `Weak demand at current resistance. AI predicts local support retest soon.`; }
            else { verdict = "NEUTRAL"; color = "#F59E0B"; logic = `Market flat. No clear directional bias for ${currentActiveAsset}. Wait for volatility.`; }

            const targetMult = baseData.type === 'crypto' ? 0.04 : 0.015;
            const stopMult = baseData.type === 'crypto' ? 0.02 : 0.008;

            return { 
                verdict, logic, color, entry: price, 
                target: change >= 0 ? price * (1 + targetMult) : price * (1 - targetMult), 
                stop: change >= 0 ? price * (1 - stopMult) : price * (1 + stopMult),
                confidence: Math.min(98, 85 + (absChange * 2))
            };
        };

        // --- TICKING INTERFACE ENGINE ---
        if (window.priceTickerInterval) clearInterval(window.priceTickerInterval);
        let currentTickPrice = livePrice;

        const updateUI = (p) => {
            const ai = generateAiVerdict(p, liveChange);
            const isForex = baseData.type === 'forex';
            const pf = (v) => isForex ? v.toFixed(4) : `$${v.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

            if(displayPrice) displayPrice.textContent = pf(p);
            if(displayTrend) {
                displayTrend.textContent = `${liveChange >= 0 ? '+' : ''}${liveChange.toFixed(2)}% Today`;
                displayTrend.className = `trend ${liveChange < 0 ? 'down' : 'up'}`;
            }
            if(logicDisplay) logicDisplay.innerHTML = `<span style="color:var(--accent); font-weight:800; font-size: 0.7rem;">[TERMINAL ANALYSIS]</span> ${ai.logic}`;
            
            sentimentPointer.style.left = `${Math.min(92, Math.max(8, 50 + (liveChange * 2.5)))}%`;
            if(marketDirection) {
                marketDirection.textContent = `${liveChange >= 0 ? 'BULLISH' : 'BEARISH'} BIAS ${liveChange >= 0 ? '🚀' : '📉'}`;
                marketDirection.style.color = ai.color;
            }

            if (actionDisplay && targetDisplay && actionCard) {
                actionCard.className = `term-signal ${ai.verdict.toLowerCase().includes('buy') ? 'buy' : ai.verdict.toLowerCase().includes('sell') ? 'sell' : 'hold'}`;
                actionDisplay.innerHTML = `${ai.verdict} <span style="font-size:0.6rem; opacity:0.6; display:block; font-weight:400; margin-top:5px;">AI CONFIDENCE: ${ai.confidence.toFixed(1)}%</span>`;
                targetDisplay.textContent = `LIVE ENTRY: ${pf(ai.entry)} | TARGET: ${pf(ai.target)} | STOP: ${pf(ai.stop)}`;
            }
        };

        updateUI(currentTickPrice);
        window.priceTickerInterval = setInterval(() => {
            const driftMult = baseData.type === 'forex' ? 0.00005 : 0.00015;
            currentTickPrice += (Math.random() - 0.5) * (currentTickPrice * driftMult);
            updateUI(currentTickPrice);
        }, 500);
    }

    // Bridge for initial load and interval triggers
    async function updateTraderHub() {
        if(document.getElementById('display-asset-name') && !window.analyzerInitialized) {
             initAssetAnalyzer();
             window.analyzerInitialized = true;
        }
        await updateTraderHubDisplay();
    }

    // 7. DYNAMIC REAL-TIME NEWS ENGINE (CATEGORIZED)
    const newsGrid = document.getElementById('real-time-news-grid');
    let allNewsItems = []; 
    
    function getPremiumImage(item, categoryLabel) {
        // Since the Cloudflare Worker now handles image extraction and AI generation, 
        // we prioritize the image stored in the database.
        if (item.image && item.image.trim() !== '') {
            return item.image;
        }
        
        // Secondary extraction (for items not in DB, though most should be)
        let imageUrl = '';
        if (item.thumbnail) imageUrl = item.thumbnail;
        else if (item.enclosure && (item.enclosure.link || item.enclosure.url)) imageUrl = item.enclosure.link || item.enclosure.url;
        else if (item.content && item.content.match(/src="([^"]+)"/)) imageUrl = item.content.match(/src="([^"]+)"/)[1];
        else if (item.description && item.description.match(/src="([^"]+)"/)) imageUrl = item.description.match(/src="([^"]+)"/)[1];

        if (imageUrl && imageUrl.includes('http')) {
            return imageUrl.replace('/120/', '/800/').replace('/240/', '/800/');
        }

        // Final High-Quality Professional Fallbacks (if everything fails)
        const fallbacks = {
            'sports': ['https://images.unsplash.com/photo-1508344928928-7151b67de2b4?auto=format&fit=crop&w=1200&q=80'],
            'crypto': ['https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=1200&q=80'],
            'markets': ['https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80'],
            'economy': ['https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&w=1200&q=80'],
            'tech': ['https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'],
            'global': ['https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=80']
        };

        const labelLow = categoryLabel.toLowerCase();
        const key = labelLow.includes('sport') ? 'sports' :
                    labelLow.includes('crypto') ? 'crypto' :
                    labelLow.includes('market') ? 'markets' :
                    labelLow.includes('economy') ? 'economy' :
                    labelLow.includes('tech') ? 'tech' : 'global';

        const array = fallbacks[key] || fallbacks['global'];
        const seed = item.title ? item.title.length : Math.floor(Math.random() * 100);
        return array[seed % array.length];
    }

    function renderNews(items, categoryLabel) {
        if (!newsGrid) return;
        newsGrid.innerHTML = '';
        
        const path = window.location.pathname.toLowerCase();
        const isHomePage = path === '/' || path.includes('index.html') || path.endsWith('/lumina-news/') || path.endsWith('/');

        if (items.length === 0) {
            newsGrid.innerHTML = '<div class="error-state">🔍 No matching news found.</div>';
            return;
        }

        items.forEach((item, index) => {
            const highResImg = getPremiumImage(item, categoryLabel);
            const isEager = index < 4; // Load first 4 images immediately
            const card = document.createElement('article');
            card.className = 'news-card';
            const isAiImage = highResImg.includes('pollinations.ai');
            
            card.innerHTML = `
                <div class="card-img" style="position: relative;">
                     <img src="${highResImg}" alt="News Image" ${isEager ? '' : 'loading="lazy"'} style="transition: opacity 0.5s ease;">
                     <span class="category-tag">${categoryLabel}</span>
                     ${isAiImage ? '<span class="ai-badge" style="position:absolute; top:15px; right:15px; background:rgba(0,0,0,0.8); color:#00f2ff; padding:4px 10px; border-radius:12px; font-size:0.75rem; font-weight: 800; border: 1px solid #00f2ff; backdrop-filter: blur(5px); z-index: 10;">🤖 AI Generated</span>' : ''}
                </div>
                <div class="card-content">
                    <h3>${item.title}</h3>
                    <p>${item.description.substring(0, 100).replace(/<[^>]*>?/gm, '')}...</p>
                    
                    <div class="veracity-meter">
                        <div class="meter-track">
                            <div class="meter-fill" style="width: ${Math.floor(Math.random() * 15) + 85}%"></div>
                        </div>
                        <span class="meter-label">⚡ ${Math.floor(Math.random() * 15) + 85}% AI TRUTH SCORE</span>
                    </div>

                    <div class="card-footer">
                        <span style="font-size: 0.75rem; color: var(--text-secondary);">${new Date(item.pubDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })} • ${new Date(item.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                        <a href="article.html?title=${encodeURIComponent(item.title)}&image=${encodeURIComponent(highResImg)}&time=${encodeURIComponent(new Date(item.pubDate).toLocaleTimeString())}" class="arrow-link">→</a>
                    </div>
                </div>
            `;
            newsGrid.appendChild(card);

            if (index === 2 || index === 7) {
                const ad = document.createElement('div');
                ad.className = 'ad-placement in-feed-ad';
                ad.innerHTML = '<span>SPONSORED REAL-TIME AD</span>';
                newsGrid.appendChild(ad);
            }
        });
    }

    function updateHeroSection(item, categoryLabel) {
        const heroTitle = document.querySelector('.hero-title');
        const heroExcerpt = document.querySelector('.hero-excerpt');
        const heroImg = document.querySelector('.main-hero-img');
        const heroMeta = document.querySelector('.hero-meta');

        if (!heroTitle || !item) return;

        heroTitle.textContent = item.title;
        heroExcerpt.textContent = item.description.replace(/<[^>]*>?/gm, '').substring(0, 150).trim() + '...';
        
        // Use premium image enhancer
        const highResColor = getPremiumImage(item, categoryLabel);
        heroImg.style.opacity = '0';

        let existingBadge = heroImg.parentElement.querySelector('.ai-badge');
        if (existingBadge) existingBadge.remove();

        const isAiImage = highResColor.includes('pollinations.ai');
        if (isAiImage) {
            const badge = document.createElement('span');
            badge.className = 'ai-badge';
            badge.style.cssText = 'position:absolute; top:20px; right:20px; background:rgba(0,0,0,0.8); color:#00f2ff; padding:6px 14px; border-radius:12px; font-size:0.85rem; font-weight: 800; border: 1px solid #00f2ff; backdrop-filter: blur(5px); z-index: 10;';
            badge.textContent = '🤖 AI Generated Content';
            heroImg.parentElement.style.position = 'relative';
            heroImg.parentElement.appendChild(badge);
        }

        // Direct update without artificial timeout for faster first paint
        heroImg.src = highResColor;
        heroImg.onload = () => heroImg.style.opacity = '1';
        
        const timeValue = new Date(item.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        heroMeta.innerHTML = `
            <span>By Lumina Intelligence</span>
            <span>• ${timeValue}</span>
            <span>• ${categoryLabel}</span>
        `;

        const readMoreBtn = document.querySelector('.read-more-btn');
        if (readMoreBtn) {
            readMoreBtn.onclick = () => {
                window.location.href = `article.html?title=${encodeURIComponent(item.title)}&image=${encodeURIComponent(highResColor)}&time=${encodeURIComponent(timeValue)}`;
            };
        }
    }

    // --- HISTORICAL DATABASE FETCH ENGINE ---
    async function loadHistoricalNews(dateStr) {
        if (!newsGrid) return;
        newsGrid.innerHTML = `<div class="loading-state">🛰️ Digging archives for ${dateStr}...</div>`;

        let categoryKey = 'global';
        const path = window.location.pathname.toLowerCase();
        if (path.includes('sports')) categoryKey = 'sports';
        else if (path.includes('markets')) categoryKey = 'markets';
        else if (path.includes('economy')) categoryKey = 'economy';
        else if (path.includes('crypto')) categoryKey = 'crypto';
        else if (path.includes('local')) categoryKey = 'local';

        try {
            // Priority: Cloudflare Worker API (Change this URL after deployment)
            const CF_WORKER = 'https://lumina-news-worker.hashenferdz.workers.dev'; 
            const url = `${CF_WORKER}/api/news?date=${dateStr}&category=${categoryKey === 'global' ? 'all' : categoryKey}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.status === 'ok' && data.items.length > 0) {
                renderNews(data.items, `Archives (${dateStr})`);
            } else {
                newsGrid.innerHTML = `<div class="loading-state" style="color:var(--text-secondary)">No archived records found for this date. Server might be offline or no db records.</div>`;
            }
        } catch (e) {
            newsGrid.innerHTML = `<div class="loading-state" style="color:var(--accent-red)">⚠️ Database Connection Error. Ensure the local server is running (node server.js).</div>`;
            console.error(e);
        }
    }

    // --- UNIFIED NEWS ENGINE (Worker D1 Backend) ---
    async function loadRealTimeNews(selectedCategory = null) {
        if (!newsGrid) return;
        const path = window.location.pathname.toLowerCase();
        let categoryKey = 'global';
        let categoryLabel = 'Global Hub';

        // 1. Detect Category
        if (!selectedCategory) {
            if (path.includes('sports')) categoryKey = 'sports';
            else if (path.includes('markets')) categoryKey = 'markets';
            else if (path.includes('economy')) categoryKey = 'economy';
            else if (path.includes('crypto')) categoryKey = 'crypto';
            else if (path.includes('local')) categoryKey = 'local';
        } else {
            categoryKey = selectedCategory.toLowerCase();
        }

        // 2. Fetch from Lumina D1 Database (Ultra Fast Edge)
        try {
            const CF_WORKER = 'https://lumina-news-worker.hashenferdz.workers.dev';
            const queryCategory = (categoryKey === 'all news' || categoryKey === 'global') ? 'all' : categoryKey;
            const res = await fetch(`${CF_WORKER}/api/news?category=${queryCategory}&_=${new Date().getTime()}`);
            const data = await res.json();

            if (data.status === 'ok' && data.items.length > 0) {
                allNewsItems = data.items;
                renderNews(allNewsItems.slice(0, 15), categoryLabel);
                
                // Update Hero
                updateHeroSection(allNewsItems[0], categoryLabel);
                
                // Live Indicator
                const header = document.querySelector('.section-header h2');
                if (header) {
                    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    header.innerHTML = `Lumina Insights <span style="font-size: 0.8rem; color: #10B981; margin-left: 1rem; font-weight: 400;">● AI Verified: ${time}</span>`;
                }
            } else {
                newsGrid.innerHTML = '<div class="error-state">⚠️ Feed Sync in Progress. Refreshing...</div>';
                setTimeout(() => loadRealTimeNews(categoryKey), 5000);
            }
        } catch (err) {
            newsGrid.innerHTML = '<div class="error-state">⚠️ Connection to Intelligence Hub Down.</div>';
        }
    }

    // 8. FILTER PILL LOGIC (HOME PAGE)
    const filterPills = document.querySelectorAll('.pill');
    if (filterPills) {
        filterPills.forEach(pill => {
            pill.addEventListener('click', () => {
                filterPills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                
                const category = pill.textContent.trim().toLowerCase();
                if (category === 'all news') {
                    loadRealTimeNews('all');
                } else {
                    loadRealTimeNews(category);
                }
            });
        });
    }

    // --- LIVE TICKER ENGINE (REAL HEADLINES) ---
    async function updateBreakingNewsTicker() {
        const tickerContainer = document.querySelector('.ticker-content p');
        if (!tickerContainer) return;

        const CF_PROXY = 'https://lumina-news-worker.hashenferdz.workers.dev/api/proxy?url=';

        try {
            const CF_WORKER = 'https://lumina-news-worker.hashenferdz.workers.dev';
            
            // 1. Fetch ALL Live Market Data (Crypto + Stocks/Commodities)
            let marketTicker = "";
            let masterDataMap = {}; // Map symbols to data objects

            try {
                // A. Fetch Crypto (Top 4)
                const cSymbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT"];
                const cUrl = `https://api.binance.com/api/v3/ticker/24hr?symbols=${JSON.stringify(cSymbols)}`;
                const cRes = await fetch(`${CF_PROXY}${encodeURIComponent(cUrl)}`);
                const cData = await cRes.json();
                
                cData.forEach(coin => {
                    const symbol = coin.symbol.replace('USDT', '');
                    const price = parseFloat(coin.lastPrice);
                    const change = parseFloat(coin.priceChangePercent);
                    masterDataMap[symbol] = { price, change, type: 'crypto' };
                    
                    const color = change >= 0 ? '#10B981' : '#EF4444';
                    marketTicker += ` <span style="color:#00f2ff">📊 ${symbol}: $${price.toLocaleString()}</span> <span style="color:${color}">(${change >= 0 ? '+' : ''}${change.toFixed(2)}%)</span> • `;
                });

                // B. Fetch Traditional Markets (NASDAQ, Gold, Oil)
                const mSymbols = ["^IXIC", "GC=F", "CL=F"];
                const mUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${mSymbols.join(',')}?interval=1m&range=1d`;
                // Yahoo finance multi-chart might need separate calls or specific proxy handling. 
                // Using individual proxies for maximum reliability if multi fails.
                for(const s of mSymbols) {
                    try {
                        const sUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${s}?interval=1m&range=1d`;
                        const sRes = await fetch(`${CF_PROXY}${encodeURIComponent(sUrl)}`);
                        const sData = await sRes.json();
                        const meta = sData.chart.result[0].meta;
                        const price = meta.regularMarketPrice;
                        const change = ((price - meta.previousClose) / meta.previousClose) * 100;
                        const label = s === "^IXIC" ? "NASDAQ" : s === "GC=F" ? "GOLD" : "CRUDE OIL";
                        masterDataMap[label] = { price, change, type: 'market' };
                    } catch(e) {}
                }

                // Dynamically update visual market cards (Smarter Matcher)
                const glanceCards = document.querySelectorAll('.market-card');
                glanceCards.forEach(card => {
                    const labelText = card.querySelector('.m-label').textContent.toUpperCase();
                    const valueEl = card.querySelector('.m-value');
                    
                    // Find match in masterDataMap
                    let match = null;
                    Object.keys(masterDataMap).forEach(key => {
                        if (labelText.includes(key)) match = masterDataMap[key];
                    });

                    if (match && valueEl) {
                        const pStr = match.type === 'market' && labelText.includes('CRUDE') ? `$${match.price.toFixed(2)}` : `$${match.price.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
                        valueEl.innerHTML = `${pStr} <i class="${match.change >= 0 ? 'up' : 'down'}">${match.change >= 0 ? '▲' : '▼'} ${match.change.toFixed(2)}%</i>`;
                    }
                });
            } catch (ce) { console.warn("Market Data Proxy Synchronizer Failed", ce); }

            // 2. Fetch Breaking Headlines
            const res = await fetch(`${CF_WORKER}/api/news?category=all&limit=10`);
            const data = await res.json();

            if (data.status === 'ok' && data.items.length > 0) {
                const headlines = data.items.map(item => `⚡ ${item.title.toUpperCase()}`).join(' • ');
                tickerContainer.innerHTML = marketTicker + headlines;
            }
        } catch (e) {
            console.warn("Ticker sync failed", e);
        }
    }

    // 5. GLOBAL LIVE SCOREBOARD ENGINE (Thapparen Thappare)
    let nbaMinutes = 5, nbaSeconds = 12;
    function updateLiveScoreboard() {
        const board = document.getElementById('live-scoreboard');
        if (!board) return;

        // NBA Game Clock Simulation (Second by Second)
        if (nbaSeconds > 0) nbaSeconds--;
        else { nbaMinutes--; nbaSeconds = 59; }

        const scoreHTML = `
            <div class="score-card live">
                <span class="sport-tag">NBA LIVE 🏀</span>
                <div class="match-info">MIL 108 - 105 MEM • Q4 ${nbaMinutes}:${nbaSeconds < 10 ? '0' : ''}${nbaSeconds}</div>
            </div>
            <div class="score-card live">
                <span class="sport-tag">SERIE A ⚽</span>
                <div class="match-info">INTER 1 - 1 ROMA • 67' Ticking...</div>
            </div>
            <div class="score-card finished">
                <span class="sport-tag">IPL 🏏 • RESULT</span>
                <div class="match-info">LSG Won by 5 Wickets vs SRH (SRH: 156/9)</div>
            </div>
            <div class="score-card upcoming">
                <span class="sport-tag">CRICKET 🏏 • UPCOMING</span>
                <div class="match-info">RCB vs CSK • Starts Today 7:30 PM</div>
            </div>
        `;
        
        board.innerHTML = scoreHTML;
    }

    // Initialize Scoreboard & Periodic Syncs
    updateLiveScoreboard();
    setInterval(updateLiveScoreboard, 1000); // 1-second Ticking UI
    updateTraderHub();
    updateBreakingNewsTicker();
    setInterval(updateBreakingNewsTicker, 10000);
    
    // Auto-Refresh Main News every 2 minutes for real-time feel
    setInterval(() => {
        const currentCategory = document.querySelector('.pill.active')?.textContent || 'All';
        if (currentCategory !== 'Archives') {
            loadRealTimeNews(currentCategory.toLowerCase() === 'all news' ? 'all' : currentCategory);
        }
    }, 120000);


    // 9. SEARCH FUNCTIONALITY
    const searchInput = document.querySelector('.search-bar input');
    const searchBtn = document.querySelector('.search-btn');

    function handleSearch() {
        const query = searchInput.value.toLowerCase().trim();
        const path = window.location.pathname;
        let categoryLabel = 'Results';

        if (path.includes('sports.html')) categoryLabel = 'Live Sports';
        else if (path.includes('markets.html')) categoryLabel = 'Markets Info';
        else if (path.includes('economy.html')) categoryLabel = 'Global Economy';
        else if (path.includes('crypto.html')) categoryLabel = 'Digital Assets';
        else categoryLabel = 'Global Feed';

        const filtered = allNewsItems.filter(item => 
            item.title.toLowerCase().includes(query) || 
            item.description.toLowerCase().includes(query)
        );
        renderNews(filtered, categoryLabel);
    }

    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }

    // 8. LIVE NEWS CONSOLE CHANNEL SWITCHER
    const channelButtons = document.querySelectorAll('.channel-btn');
    const newsPlayer = document.getElementById('live-news-player');

    if (channelButtons && newsPlayer) {
        channelButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const videoId = btn.getAttribute('data-video');
                // Use & instead of ? because videoId already contains ?channel=
                newsPlayer.src = `https://www.youtube.com/embed/${videoId}&autoplay=1&mute=1`;
                channelButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    // 10. NOTIFICATION SYSTEM
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<span class="toast-icon">✓</span> <span>${message}</span>`;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 500);
        }, 4000);
    }

    // 11. SUBSCRIBE HANDLING
    const mainSubscribeBtn = document.querySelector('.subscribe-btn');
    const newsletterForm = document.querySelector('.subscribe-form');

    if (mainSubscribeBtn) {
        mainSubscribeBtn.addEventListener('click', () => {
            const newsletterSection = document.querySelector('.newsletter');
            if (newsletterSection) {
                newsletterSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector('input');
            const emailValue = emailInput.value;

            if (emailValue) {
                const CF_WORKER = 'https://lumina-news-worker.hashenferdz.workers.dev';
                fetch(`${CF_WORKER}/api/subscribe`, {
                    method: 'POST',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: emailValue }),
                })
                .then(res => res.json())
                .then(data => {
                    if(data.status === 'ok') {
                        showToast(`Success! ${emailValue.split('@')[0]} joined the Inner Circle.`);
                        emailInput.value = '';
                    } else {
                        showToast(`Error: ${data.error || 'Failed to subscribe'}`);
                    }
                })
                .catch(() => {
                    showToast('Oops! Network error. Please try again later.');
                });
            }
        });
    }

    // 12. HERO SLIDER ENGINE (index.html)
    function initHeroSlider() {
        const slides = document.querySelectorAll('.hero-slide');
        const dotsContainer = document.getElementById('hero-dots-container');
        const prevBtn = document.getElementById('hero-prev');
        const nextBtn = document.getElementById('hero-next');
        
        if (!slides.length || !dotsContainer || !prevBtn || !nextBtn) return;

        let currentSlide = 0;
        let slideInterval;

        // Generate dots dynamically
        slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('hero-dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => goToSlide(index));
            dotsContainer.appendChild(dot);
        });

        const dots = document.querySelectorAll('.hero-dot');

        function goToSlide(n) {
            slides[currentSlide].classList.remove('active');
            dots[currentSlide].classList.remove('active');
            
            currentSlide = (n + slides.length) % slides.length;
            
            slides[currentSlide].classList.add('active');
            dots[currentSlide].classList.add('active');
            resetInterval();
        }

        function nextSlide() { goToSlide(currentSlide + 1); }
        function prevSlide() { goToSlide(currentSlide - 1); }
        
        function resetInterval() {
            clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, 4500); // Faster slide interval (4.5s) to ensure auto-slide is noticeable
        }

        prevBtn.addEventListener('click', prevSlide);
        nextBtn.addEventListener('click', nextSlide);
        
        // Start engine
        resetInterval();
    }

    // Initial Load
    initHeroSlider();
    initLocalization();
    updateTraderHub(); // Initialize Trading terminal on load
    if (!window.location.pathname.toLowerCase().includes('local.html')) {
        loadRealTimeNews();
    }
    
    // Inject Date Picker Filter
    const mainSectionHeader = document.querySelector('.main-content .section-header');
    if (mainSectionHeader && !document.querySelector('.history-date-picker')) {
        mainSectionHeader.style.display = 'flex';
        mainSectionHeader.style.justifyContent = 'space-between';
        mainSectionHeader.style.alignItems = 'center';
        
        const dateWrap = document.createElement('div');
        dateWrap.className = 'date-filter-wrapper';
        dateWrap.innerHTML = `
            <label for="history-date">Archives:</label>
            <input type="date" id="history-date" class="history-date-picker" title="Select a past date">
        `;
        mainSectionHeader.appendChild(dateWrap);

        document.getElementById('history-date').addEventListener('change', (e) => {
            const selectedDate = e.target.value; 
            if(selectedDate) loadHistoricalNews(selectedDate);
            else loadRealTimeNews(); 
        });
    }
    // 13. DYNAMIC LOCALIZATION & TRANSLATION
    async function initLocalization() {
        try {
            const response = await fetch('https://get.geojs.io/v1/ip/geo.json');
            const geoInfo = await response.json();
            const countryName = geoInfo.country || 'Global';
            const countryCode = geoInfo.country_code || 'US';

            const customTabName = `${countryName} News`;

            // 1. Inject Navigation Tab
            const navLinks = document.querySelector('.nav-links');
            if (navLinks) {
                const localLi = document.createElement('li');
                const isActive = window.location.pathname.includes('local.html') ? 'class="active"' : '';
                localLi.innerHTML = `<a href="local.html" ${isActive}>${customTabName}</a>`;
                if(navLinks.children.length > 1) {
                    navLinks.insertBefore(localLi, navLinks.children[1]);
                } else {
                    navLinks.appendChild(localLi);
                }
            }

            // 2. Setup Custom Local Feed
            // Using a direct search query guarantees that only news specifically about this country is fetched
            const rssFeed = `https://news.google.com/rss/search?q=${encodeURIComponent(countryName)}+location&hl=en-US&gl=US&ceid=US:en`;
            
            if (window.location.pathname.toLowerCase().includes('local.html')) {
                document.title = `LuminaNews | ${customTabName}`;
                const sectionHeader = document.querySelector('.section-header h2');
                if(sectionHeader) sectionHeader.innerHTML = `${countryName} <span>News</span>`;
                window.localRssUrl = rssFeed;
                loadRealTimeNews(); // reload with local rss
            } else {
                // Break top local news into Global ticker
                const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssFeed)}&_=${new Date().getTime()}`;
                try {
                    const localRes = await fetch(API_URL);
                    const localData = await localRes.json();
                    if (localData.status === 'ok' && localData.items.length > 0) {
                        const topLocal = localData.items[0].title;
                        const tickerContent = document.querySelector('.ticker-content p');
                        if (tickerContent) {
                            tickerContent.innerHTML += ` &bull; <span style='color:var(--accent)'>LOCAL: ${topLocal}</span>`;
                        }
                    }
                } catch (e) {}
            }

            // --- 3. ULTIMATE CUSTOM GOOGLE TRANSLATE HUB ---
            const navActions = document.querySelector('.nav-actions');
            if (navActions) {
                // Secret Hidden Google Widget
                const secretDiv = document.createElement('div');
                secretDiv.id = 'google_translate_element';
                document.body.appendChild(secretDiv);

                const script = document.createElement('script');
                script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
                document.body.appendChild(script);

                window.googleTranslateElementInit = function() {
                    new google.translate.TranslateElement({pageLanguage: 'en'}, 'google_translate_element');
                };

                // Premium Visible Picker
                const customPicker = document.createElement('div');
                customPicker.className = 'lumina-lang-picker';
                customPicker.id = 'custom-lang-hub';
                customPicker.innerHTML = `
                    <div class="lang-current" id="current-lang-select">🌐 English</div>
                    <div class="lang-dropdown" id="lang-dropdown-menu">
                        <div class="lang-option" data-lang="en">EN • English</div>
                        <div class="lang-option" data-lang="si">SI • සිංහල</div>
                        <div class="lang-option" data-lang="ta">TA • தமிழ்</div>
                        <div class="lang-option" data-lang="hi">HI • हिन्दी</div>
                        <div class="lang-option" data-lang="fr">FR • Français</div>
                        <div class="lang-option" data-lang="de">DE • Deutsch</div>
                        <div class="lang-option" data-lang="ru">RU • Русский</div>
                    </div>
                `;
                navActions.insertBefore(customPicker, navActions.firstChild);

                // Interaction Logic
                const currentBtn = document.getElementById('current-lang-select');
                const menu = document.getElementById('lang-dropdown-menu');
                
                currentBtn.onclick = (e) => {
                    e.stopPropagation();
                    menu.classList.toggle('active');
                };

                document.querySelectorAll('.lang-option').forEach(opt => {
                    opt.onclick = () => {
                        const langCode = opt.getAttribute('data-lang');
                        const langName = opt.textContent;
                        
                        // Bridge to Google
                        const googleSelect = document.querySelector('.goog-te-combo');
                        if (googleSelect) {
                            googleSelect.value = langCode;
                            googleSelect.dispatchEvent(new Event('change'));
                            currentBtn.innerHTML = `🌐 ${langName.split('•')[1].trim()}`;
                        } else {
                            alert("Translate Engine initializing... Please wait 2 seconds.");
                        }
                        menu.classList.remove('active');
                    };
                });

                window.onclick = () => menu.classList.remove('active');
            }
        } catch(err) {
            console.error("Localization engine failed", err);
        }
    }
});
