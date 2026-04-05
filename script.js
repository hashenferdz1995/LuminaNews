document.addEventListener('DOMContentLoaded', () => {
    // 1. STICKY HEADER & SCROLL EFFECTS
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

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
        "BTC": { type: "crypto", name: "Bitcoin (BTC)", price: "$72,450.00", trend: "+4.5%", dir: "BULLISH", color: "#10B981", pos: "88%", action: "STRONG BUY", entry: "$71,500", target: "$85,000", logic: "Heavy institutional ETF inflows detected. Technical breakout confirms strong upward momentum." },
        "ETH": { type: "crypto", name: "Ethereum (ETH)", price: "$3,850.20", trend: "+2.1%", dir: "BULLISH", color: "#10B981", pos: "70%", action: "BUY", entry: "$3,800", target: "$4,200", logic: "Network upgrade anticipation and rising DeFi TVL driving demand." },
        "SOL": { type: "crypto", name: "Solana (SOL)", price: "$145.60", trend: "-1.2%", dir: "NEUTRAL", color: "#F59E0B", pos: "45%", action: "HOLD", entry: "$140", target: "$160", logic: "Consolidating after recent massive rally. Wait for a clear breakout above $150." },
        "BNB": { type: "crypto", name: "Binance Coin (BNB)", price: "$590.30", trend: "+1.5%", dir: "BULLISH", color: "#10B981", pos: "65%", action: "BUY", entry: "$580", target: "$650", logic: "Launchpool announcements driving utility token demand." },
        "XRP": { type: "crypto", name: "Ripple (XRP)", price: "$0.61", trend: "-0.5%", dir: "NEUTRAL", color: "#F59E0B", pos: "50%", action: "HOLD", entry: "$0.58", target: "$0.70", logic: "Awaiting final court rulings with the SEC. High volatility expected." },
        "ADA": { type: "crypto", name: "Cardano (ADA)", price: "$0.45", trend: "+0.8%", dir: "NEUTRAL", color: "#F59E0B", pos: "40%", action: "HOLD", entry: "$0.42", target: "$0.55", logic: "Steady development ongoing, but lagging in immediate DEX volume growth." },
        "DOGE":{ type: "crypto", name: "Dogecoin (DOGE)", price: "$0.15", trend: "+8.2%", dir: "BULLISH", color: "#10B981", pos: "85%", action: "BUY", entry: "$0.14", target: "$0.20", logic: "Social media buzz and massive whale accumulation detected over the last 24h." },
        "DOT": { type: "crypto", name: "Polkadot (DOT)", price: "$7.20", trend: "-2.1%", dir: "BEARISH", color: "#EF4444", pos: "35%", action: "SELL", entry: "N/A", target: "$6.50", logic: "Breaking below critical support levels due to shifting retail interest." },
        
        // STOCKS
        "NVDA": { type: "stocks", name: "Nvidia (NVDA)", price: "$924.50", trend: "+3.8%", dir: "BULLISH", color: "#10B981", pos: "92%", action: "STRONG BUY", entry: "$910", target: "$1050", logic: "AI sector dominance continues. Next-gen chip orders exceeding supply capacity." },
        "TSLA": { type: "stocks", name: "Tesla (TSLA)", price: "$172.40", trend: "-2.5%", dir: "BEARISH", color: "#EF4444", pos: "20%", action: "SELL", entry: "N/A", target: "$150", logic: "Margin pressures and intense competition in the EV sector weighing heavily on the stock." },
        "AAPL": { type: "stocks", name: "Apple (AAPL)", price: "$168.20", trend: "-0.8%", dir: "NEUTRAL", color: "#F59E0B", pos: "40%", action: "HOLD", entry: "$165", target: "$180", logic: "Slow iPhone sales cycle. Waiting for clarity on the new AI product lineup announcements." },
        "AMZN": { type: "stocks", name: "Amazon (AMZN)", price: "$185.30", trend: "+1.2%", dir: "BULLISH", color: "#10B981", pos: "75%", action: "BUY", entry: "$180", target: "$200", logic: "AWS growth re-accelerating and advertising revenue expanding robustly." },
        "MSFT": { type: "stocks", name: "Microsoft (MSFT)", price: "$420.50", trend: "+0.9%", dir: "BULLISH", color: "#10B981", pos: "80%", action: "BUY", entry: "$415", target: "$450", logic: "Copilot monetization showing early, highly profitable signs of absolute success." },
        "META": { type: "stocks", name: "Meta (META)", price: "$495.10", trend: "+2.5%", dir: "BULLISH", color: "#10B981", pos: "85%", action: "STRONG BUY", entry: "$485", target: "$530", logic: "Ad spending recovery and deep AI integration driving operating margins higher." },
        "GOOGL":{ type: "stocks", name: "Alphabet (GOOGL)", price: "$155.40", trend: "-1.1%", dir: "NEUTRAL", color: "#F59E0B", pos: "55%", action: "HOLD", entry: "$150", target: "$165", logic: "Facing AI search competition fears, despite solid cloud revenue growth." },
        "NFLX": { type: "stocks", name: "Netflix (NFLX)", price: "$610.20", trend: "+4.1%", dir: "BULLISH", color: "#10B981", pos: "88%", action: "BUY", entry: "$600", target: "$650", logic: "Password crackdown success and ad-tier profitability beating all estimates." },

        // FOREX
        "EURUSD": { type: "forex", name: "EUR/USD", price: "1.0850", trend: "+0.1%", dir: "NEUTRAL", color: "#F59E0B", pos: "50%", action: "HOLD", entry: "1.0800", target: "1.0950", logic: "ECB interest rate decision pending. Market is pricing in a hold, causing range-bound trading." },
        "USDJPY": { type: "forex", name: "USD/JPY", price: "151.70", trend: "+0.3%", dir: "BULLISH", color: "#10B981", pos: "75%", action: "BUY", entry: "151.20", target: "153.00", logic: "Bank of Japan dovish stance keeping Yen weak. Upward channel remains firmly intact." },
        "GBPUSD": { type: "forex", name: "GBP/USD", price: "1.2640", trend: "-0.2%", dir: "NEUTRAL", color: "#F59E0B", pos: "45%", action: "HOLD", entry: "1.2600", target: "1.2750", logic: "UK economic data showing stagnation, but BoE remains relatively hawkish." },
        "USDCAD": { type: "forex", name: "USD/CAD", price: "1.3580", trend: "+0.4%", dir: "BULLISH", color: "#10B981", pos: "70%", action: "BUY", entry: "1.3550", target: "1.3700", logic: "Oil price fluctuations directly impacting CAD strength against a resurgent Dollar." },
        "AUDUSD": { type: "forex", name: "AUD/USD", price: "0.6520", trend: "-0.5%", dir: "BEARISH", color: "#EF4444", pos: "30%", action: "SELL", entry: "0.6550", target: "0.6400", logic: "Weak manufacturing data from China severely impacting Australian export forecasts." },
        "USDCHF": { type: "forex", name: "USD/CHF", price: "0.9050", trend: "+0.2%", dir: "BULLISH", color: "#10B981", pos: "65%", action: "BUY", entry: "0.9000", target: "0.9150", logic: "SNB unexpected rate cut has turned the Franc into a favorable funding currency." }
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

        let data = { ...(assetDataRepo[currentActiveAsset] || assetDataRepo["BTC"]) };

        // Real-Time Injection
        try {
            if (currentActiveAsset === "BTC" || currentActiveAsset === "ETH") {
                const id = currentActiveAsset === "BTC" ? "bitcoin" : "ethereum";
                const cryptoRes = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true&_=${Date.now()}`);
                const cryptoData = await cryptoRes.json();
                
                if (cryptoData[id]) {
                    data.price = `$${cryptoData[id].usd.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
                    data.trend = `${cryptoData[id].usd_24h_change >= 0 ? '+' : ''}${cryptoData[id].usd_24h_change.toFixed(2)}%`;
                }
            }
        } catch (e) {
            console.warn("Terminal Live Override Failed", e);
        }

        // Update Text
        if(displayName) displayName.textContent = data.name;
        if(displayPrice) displayPrice.textContent = data.price;
        if(displayTrend) {
            displayTrend.textContent = `${data.trend} Today`;
            displayTrend.className = `trend ${data.trend.includes('-') ? 'down' : 'up'}`;
        }
        if(logicDisplay) logicDisplay.innerHTML = `* ${data.logic}`;

        // Sentiment Update
        sentimentPointer.style.left = data.pos;
        if(marketDirection) {
            marketDirection.textContent = `${data.direction} BIAS ${data.direction === 'BULLISH' ? '🚀' : data.direction === 'BEARISH' ? '📉' : '⚖️'}`;
            marketDirection.style.color = data.color;
        }

        // Action Signal Update
        if (actionDisplay && targetDisplay && actionCard) {
            const lowAction = data.action.toLowerCase();
            const actionClass = lowAction.includes('buy') ? 'buy' : lowAction.includes('sell') ? 'sell' : 'hold';
            
            actionCard.className = `term-signal ${actionClass}`;
            actionDisplay.textContent = data.action;
            targetDisplay.textContent = `Entry: ${data.entry} | Target: ${data.target}`;
        }
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
        let imageUrl = '';
        
        // Try all possible image locations in the RSS item or database object
        if (item.image && item.image.trim() !== '') imageUrl = item.image; // Check database field first
        else if (item.thumbnail) imageUrl = item.thumbnail;
        else if (item.enclosure && (item.enclosure.link || item.enclosure.url)) imageUrl = item.enclosure.link || item.enclosure.url;
        else if (item.content && item.content.match(/src="([^"]+)"/)) imageUrl = item.content.match(/src="([^"]+)"/)[1];
        else if (item.description && item.description.match(/src="([^"]+)"/)) imageUrl = item.description.match(/src="([^"]+)"/)[1];

        // 1. Smart Source Upgrading - Keep it safe
        if (imageUrl && imageUrl.includes('http')) {
            // Safe HD upgrade (only replace low res patterns if they exist)
            imageUrl = imageUrl.replace('/120/', '/600/').replace('/240/', '/600/');
            return imageUrl;
        }

        // 2. High-Quality Professional Fallbacks (Using strictly validated Unsplash URLs)
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

        // 3. Ultra-Modern AI Generation for missing images
        if (item.title) {
            item.isAiImage = true;
            // Generate a hyper-realistic press image using the story's actual headline via Pollinations API
            return `https://image.pollinations.ai/prompt/${encodeURIComponent("News press photo of " + item.title)}?width=600&height=400&nologo=true`;
        }

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
            const card = document.createElement('article');
            card.className = 'news-card';
            card.innerHTML = `
                <div class="card-img" style="position: relative;">
                     <img src="${highResImg}" alt="News Image" loading="lazy" style="transition: opacity 0.5s ease;">
                     <span class="category-tag">${categoryLabel}</span>
                     ${item.isAiImage ? '<span class="ai-badge" style="position:absolute; top:15px; right:15px; background:rgba(0,0,0,0.8); color:#00f2ff; padding:4px 10px; border-radius:12px; font-size:0.75rem; font-weight: 800; border: 1px solid #00f2ff; backdrop-filter: blur(5px); z-index: 10;">🤖 AI Generated</span>' : ''}
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

        if (item.isAiImage) {
            const badge = document.createElement('span');
            badge.className = 'ai-badge';
            badge.style.cssText = 'position:absolute; top:20px; right:20px; background:rgba(0,0,0,0.8); color:#00f2ff; padding:6px 14px; border-radius:12px; font-size:0.85rem; font-weight: 800; border: 1px solid #00f2ff; backdrop-filter: blur(5px); z-index: 10;';
            badge.textContent = '🤖 AI Generated Content';
            heroImg.parentElement.style.position = 'relative';
            heroImg.parentElement.appendChild(badge);
        }

        setTimeout(() => {
            heroImg.src = highResColor;
            heroImg.onload = () => heroImg.style.opacity = '1';
        }, 300);
        
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

        try {
            const CF_WORKER = 'https://lumina-news-worker.hashenferdz.workers.dev';
            
            // 1. Fetch News
            const res = await fetch(`${CF_WORKER}/api/news?category=all&limit=10`);
            const data = await res.json();
            
            // 2. Fetch Live Crypto Prices (Premium Feel)
            let marketTicker = "";
            try {
                const cryptoRes = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true&_=${Date.now()}`);
                const cryptoData = await cryptoRes.json();
                marketTicker = ` <span style="color:#00f2ff">📊 BTC: $${cryptoData.bitcoin.usd.toLocaleString()}</span> <span style="color:${cryptoData.bitcoin.usd_24h_change >= 0 ? '#10B981' : '#EF4444'}">(${cryptoData.bitcoin.usd_24h_change.toFixed(2)}%)</span> • <span style="color:#00f2ff">📊 ETH: $${cryptoData.ethereum.usd.toLocaleString()}</span> <span style="color:${cryptoData.ethereum.usd_24h_change >= 0 ? '#10B981' : '#EF4444'}">(${cryptoData.ethereum.usd_24h_change.toFixed(2)}%)</span> • `;
                
                // Dynamically update the visual market glance cards if they exist on the page
                const glanceCards = document.querySelectorAll('.market-card .m-value');
                if (glanceCards.length >= 2) {
                    glanceCards[0].innerHTML = `$${cryptoData.bitcoin.usd.toLocaleString()} <i class="${cryptoData.bitcoin.usd_24h_change >= 0 ? 'up' : 'down'}">${cryptoData.bitcoin.usd_24h_change >= 0 ? '▲' : '▼'} ${cryptoData.bitcoin.usd_24h_change.toFixed(2)}%</i>`;
                    glanceCards[1].innerHTML = `$${cryptoData.ethereum.usd.toLocaleString()} <i class="${cryptoData.ethereum.usd_24h_change >= 0 ? 'up' : 'down'}">${cryptoData.ethereum.usd_24h_change >= 0 ? '▲' : '▼'} ${cryptoData.ethereum.usd_24h_change.toFixed(2)}%</i>`;
                }
            } catch (ce) { console.warn("Crypto API lag", ce); }

            if (data.status === 'ok' && data.items.length > 0) {
                const headlines = data.items.map(item => `⚡ ${item.title.toUpperCase()}`).join(' • ');
                tickerContainer.innerHTML = marketTicker + headlines;
            }
        } catch (e) {
            console.warn("Ticker sync failed", e);
        }
    }

    // Initial Ticker Sync
    updateBreakingNewsTicker();
    
    // Auto-Refresh Ticker & Trading Hub every 3 minutes
    setInterval(() => {
        updateBreakingNewsTicker();
        updateTraderHub();
    }, 180000);

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
