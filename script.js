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
    function updateTraderHub() {
        const sentimentPointer = document.getElementById('sentiment-pointer');
        const marketDirection = document.getElementById('market-direction');
        const topPicksContainer = document.getElementById('ai-top-picks');
        
        if (!sentimentPointer) return;

        // ASSET DATA REPOSITORY (MOCKED ANALYTICS)
        const marketData = {
            stocks: {
                direction: "BULLISH",
                color: "#10B981",
                pos: "82%",
                signal: { action: "BUY", price: "$224.50", target: "$250.00", logic: "AI detects massive accumulation in NVDA and high-growth tech stocks. Order books suggest a potential +12% breakout within 48 hours." },
                picks: [
                    { name: "NVDA", trend: "+4.2%", up: true },
                    { name: "TSLA", trend: "+1.8%", up: true },
                    { name: "AAPL", trend: "-0.5%", up: false },
                    { name: "AMZN", trend: "+2.1%", up: true }
                ]
            },
            crypto: {
                direction: "BULLISH",
                color: "#10B981",
                pos: "90%",
                signal: { action: "STRONG BUY", price: "$72,120", target: "$85,000", logic: "Bitcoin ETF inflows hitting record levels. Global network hashrate stable. Institutional FOMO detected in derivatives market." },
                picks: [
                    { name: "BTC/USD", trend: "+5.1%", up: true },
                    { name: "SOL", trend: "+8.4%", up: true },
                    { name: "ETH", trend: "+3.2%", up: true },
                    { name: "LINK", trend: "-1.5%", up: false }
                ]
            },
            forex: {
                direction: "NEUTRAL",
                color: "#F59E0B",
                pos: "50%",
                signal: { action: "HOLD", price: "151.40", target: "155.00", logic: "USD/JPY is testing high-tension resistance zones. Central Bank intervention risks are elevated. Stay on the sidelines until a clear breakout." },
                picks: [
                    { name: "USD/JPY", trend: "+0.2%", up: true },
                    { name: "EUR/USD", trend: "-0.5%", up: false },
                    { name: "GBP/USD", trend: "+0.1%", up: true },
                    { name: "USD/CAD", trend: "-0.3%", up: false }
                ]
            }
        };

        const activeTab = document.querySelector('.asset-tab.active');
        const type = activeTab ? activeTab.getAttribute('data-type') : 'stocks';
        const data = marketData[type] || marketData.stocks;

        // Update UI
        sentimentPointer.style.left = data.pos;
        marketDirection.textContent = `${data.direction} BIAS ${data.direction === 'BULLISH' ? '🚀' : data.direction === 'BEARISH' ? '📉' : '⚖️'}`;
        marketDirection.style.color = data.color;

        // Big Signal Board
        const signalBoard = document.getElementById('ai-main-signal');
        if (signalBoard) {
            const lowAction = data.signal.action.toLowerCase();
            const actionClass = lowAction.includes('buy') ? 'buy' : lowAction.includes('sell') ? 'sell' : 'hold';
            
            signalBoard.innerHTML = `
                <div class="action-card ${actionClass}">
                    <span class="action-label">AI RECOMMENDED ACTION</span>
                    <div class="action-main">${data.signal.action}</div>
                    <div class="action-price">Entry: ${data.signal.price} | Target: ${data.signal.target}</div>
                </div>
                <div class="signal-logic">
                    <b>WHY THIS TRADE?</b>
                    ${data.signal.logic}
                </div>
            `;
        }

        // Top Alpha Grid
        topPicksContainer.innerHTML = data.picks.map(a => `
            <div class="asset-item">
                <span class="asset-name">${a.name}</span>
                <span class="asset-trend ${a.up ? '' : 'down'}">${a.trend}</span>
            </div>
        `).join('');
    }

    // 5. TAB INTERACTIVITY (OFFLINE SYNC)
    const assetTabs = document.querySelectorAll('.asset-tab');
    if (assetTabs) {
        assetTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                assetTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                updateTraderHub(); // Trigger immediate AI refresh
            });
        });
    }

    // 7. DYNAMIC REAL-TIME NEWS ENGINE (CATEGORIZED)
    const newsGrid = document.getElementById('real-time-news-grid');
    let allNewsItems = []; 
    
    function getPremiumImage(item, categoryLabel) {
        let imageUrl = '';
        
        // Try all possible image locations in the RSS item
        if (item.thumbnail) imageUrl = item.thumbnail;
        else if (item.enclosure && item.enclosure.link) imageUrl = item.enclosure.link;
        else if (item.content && item.content.match(/src="([^"]+)"/)) imageUrl = item.content.match(/src="([^"]+)"/)[1];

        // 1. Smart Source Upgrading & Fixing
        if (imageUrl && imageUrl.includes('http')) {
            // Specific fix for CNBC and Financial sources
            if (imageUrl.includes('cnbc.com')) {
                imageUrl = imageUrl.replace(/width=\d+/, 'width=1024').replace(/&height=\d+/, '');
            }
            // Standard HD upgrade
            imageUrl = imageUrl.replace('/120/', '/1024/').replace('/240/', '/1024/').replace('width=240', 'width=1024');
            return imageUrl;
        }

        // 2. High-Quality Professional Fallbacks
        const fallbacks = {
            'sports': 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=1200',
            'crypto': 'https://images.unsplash.com/photo-1542340358-19642050965e?auto=format&fit=crop&q=80&w=1200',
            'markets': 'https://images.unsplash.com/photo-1611974717482-48a4a390e8c6?auto=format&fit=crop&q=80&w=1200',
            'economy': 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=1200',
            'tech': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200',
            'global': 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=1200'
        };

        const labelLow = categoryLabel.toLowerCase();
        const key = labelLow.includes('sport') ? 'sports' :
                    labelLow.includes('crypto') ? 'crypto' :
                    labelLow.includes('market') ? 'markets' :
                    labelLow.includes('economy') ? 'economy' :
                    labelLow.includes('tech') ? 'tech' : 'global';

        return fallbacks[key];
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
                <div class="card-img">
                     <img src="${highResImg}" alt="News Image" loading="lazy" style="transition: opacity 0.5s ease;">
                     <span class="category-tag">${categoryLabel}</span>
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
                        <span>${new Date(item.pubDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
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

    async function loadRealTimeNews(selectedCategory = null) {
        const path = window.location.pathname.toLowerCase();
        let RSS_URL = 'https://feeds.bbci.co.uk/news/world/rss.xml';
        let categoryLabel = 'Global Feed';
        let categoryKey = '';

        // Auto-detect from URL if no category provided (For specific landing pages)
        if (!selectedCategory) {
            if (path.includes('sports') || path.includes('sport')) categoryKey = 'sports';
            else if (path.includes('markets')) categoryKey = 'markets';
            else if (path.includes('economy')) categoryKey = 'economy';
            else if (path.includes('crypto')) categoryKey = 'crypto';
        } else {
            categoryKey = selectedCategory.toLowerCase();
        }

        // Assign RSS Source based on category
        if (categoryKey === 'sports') {
            RSS_URL = 'https://feeds.bbci.co.uk/sport/rss.xml';
            categoryLabel = 'Live Sports';
        } else if (categoryKey === 'markets') {
            RSS_URL = 'https://www.cnbc.com/id/100003114/device/rss/rss.html';
            categoryLabel = 'Markets Info';
        } else if (categoryKey === 'economy') {
            RSS_URL = 'https://www.cnbc.com/id/10001147/device/rss/rss.html';
            categoryLabel = 'Global Economy';
        } else if (categoryKey === 'crypto') {
            RSS_URL = 'https://www.coindesk.com/arc/outboundfeeds/rss/';
            categoryLabel = 'Digital Assets';
        } else if (categoryKey === 'tech') {
            RSS_URL = 'https://feeds.bbci.co.uk/news/technology/rss.xml';
            categoryLabel = 'Tech Updates';
        }

        // Advanced Cache Busting: Force the proxy to fetch new data from the source
        const cacheBust = new Date().getTime();
        const freshRssUrl = RSS_URL + (RSS_URL.includes('?') ? '&' : '?') + 'nocache=' + cacheBust;
        const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(freshRssUrl)}&_=${cacheBust}`;

        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            
            if (data.status === 'ok') {
                allNewsItems = data.items;
                
                // Update "Last Updated" UI indicator
                const header = document.querySelector('.section-header h2');
                if (header) {
                    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                    header.innerHTML = `Top Headlines <span style="font-size: 0.8rem; color: #10B981; margin-left: 1rem; font-weight: 400;">● Live Updated: ${time}</span>`;
                }
                // Advanced Filtering: Ensure news relevance especially for mixed feeds
                let filteredItems = allNewsItems;
                if (categoryKey === 'crypto') {
                    filteredItems = allNewsItems.filter(i => 
                        (`${i.title} ${i.description} ${i.content || ''}`).toLowerCase().match(/crypto|bitcoin|btc|eth|ethereum|blockchain|token|web3|nft|ledger/i)
                    );
                } else if (categoryKey === 'sports') {
                    filteredItems = allNewsItems.filter(i => 
                        (`${i.title} ${i.description} ${i.content || ''}`).toLowerCase().match(/sport|game|match|score|player|league|team|football|cricket/i)
                    );
                }

                // If filtering wiped out everything, show some original items
                if (filteredItems.length === 0) filteredItems = allNewsItems.slice(0, 12);

                renderNews(filteredItems.slice(0, 12), categoryLabel);

                // Update Hero Section on Home Page/Initial Load
                if (filteredItems.length > 0) {
                    updateHeroSection(filteredItems[0], categoryLabel);
                }
            }
        } catch (err) {
            if (newsGrid) newsGrid.innerHTML = '<div class="error-state">⚠️ Failed to connect to live server.</div>';
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
                newsPlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
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
                // Submit to Netlify via AJAX (prevents page refresh)
                fetch('/', {
                    method: 'POST',
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: new URLSearchParams({
                        "form-name": "newsletter",
                        "email": emailValue
                    }).toString(),
                })
                .then(() => {
                    showToast(`Success! ${emailValue.split('@')[0]} joined the Inner Circle.`);
                    emailInput.value = '';
                })
                .catch(() => {
                    showToast('Oops! Network error. Please try again later.');
                });
            }
        });
    }

    // Initial Load
    loadRealTimeNews();
    updateTraderHub();
    setInterval(() => {
        loadRealTimeNews();
        updateTraderHub();
    }, 60000); // Updated to 1 minute frequency for faster refreshes
});
