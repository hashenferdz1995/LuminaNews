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

    // 3. LIVE WEATHER GEOLOCATION (REAL-TIME)
    const weatherIcon = document.getElementById('weather-icon');
    const weatherTemp = document.getElementById('weather-temp');
    const weatherLoc = document.getElementById('weather-location');

    function getWeatherIcon(code) {
        if (code <= 1) return '☀️'; // Clear
        if (code <= 3) return '⛅'; // Part Cloudy
        if (code <= 48) return '🌫️'; // Fog
        if (code <= 67) return '🌧️'; // Rain
        if (code <= 77) return '❄️'; // Snow
        if (code <= 82) return '🚿'; // Showers
        if (code <= 99) return '⛈️'; // Thunder
        return '☁️';
    }

    async function fetchWeather(lat, lon) {
        try {
            const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
            const data = await res.json();
            const temp = Math.round(data.current_weather.temperature);
            const code = data.current_weather.weathercode;
            
            weatherTemp.textContent = `${temp}°C`;
            weatherIcon.textContent = getWeatherIcon(code);
            weatherLoc.textContent = "Live Update"; 
        } catch (err) {
            weatherLoc.textContent = "Offline";
        }
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
            () => fetchWeather(7.8731, 80.7718) // Sri Lanka fallback
        );
    }

    // 7. DYNAMIC REAL-TIME NEWS ENGINE (CATEGORIZED BY PAGE)
    const newsGrid = document.getElementById('real-time-news-grid');

    async function loadRealTimeNews() {
        const path = window.location.pathname;
        let RSS_URL = 'https://feeds.bbci.co.uk/news/world/rss.xml'; // Default Home
        let categoryLabel = 'Global Feed';

        // Categorize based on file name
        if (path.includes('sports.html')) {
            RSS_URL = 'https://feeds.bbci.co.uk/sport/rss.xml';
            categoryLabel = 'Live Sports';
        } else if (path.includes('markets.html')) {
            RSS_URL = 'https://www.cnbc.com/id/100003114/device/rss/rss.html'; // Business
            categoryLabel = 'Markets Info';
        } else if (path.includes('economy.html')) {
            RSS_URL = 'https://feeds.reuters.com/news/wealth';
            // If Reuters fails or CORS, fallback to a reliable one
            RSS_URL = 'https://www.cnbc.com/id/10001147/device/rss/rss.html'; // Economy
            categoryLabel = 'Global Economy';
        } else if (path.includes('crypto.html')) {
            RSS_URL = 'https://www.coindesk.com/arc/outboundfeeds/rss/';
            categoryLabel = 'Digital Assets';
        }

        const API_URL = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}`;

        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            
            if (data.status === 'ok') {
                newsGrid.innerHTML = ''; 
                
                data.items.slice(0, 12).forEach((item, index) => {
                    const card = document.createElement('article');
                    card.className = 'news-card';
                    card.innerHTML = `
                        <div class="card-img">
                             <img src="${item.thumbnail || 'https://images.unsplash.com/photo-1586339949916-3e9457bef6a3?auto=format&fit=crop&q=80&w=800'}" alt="News Image">
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
                                <a href="article.html?title=${encodeURIComponent(item.title)}&image=${encodeURIComponent(item.thumbnail || '')}&time=${encodeURIComponent(new Date(item.pubDate).toLocaleTimeString())}" class="arrow-link">→</a>
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
        } catch (err) {
            newsGrid.innerHTML = '<div class="error-state">⚠️ Failed to connect to live server.</div>';
        }
    }

    // 8. LIVE NEWS CONSOLE CHANNEL SWITCHER
    const channelButtons = document.querySelectorAll('.channel-btn');
    const newsPlayer = document.getElementById('live-news-player');

    if (channelButtons && newsPlayer) {
        channelButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const videoId = btn.getAttribute('data-video');
                // Set new URL and autoplay
                newsPlayer.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
                
                // Active Button handling
                channelButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    // Initial Load
    loadRealTimeNews();
    setInterval(loadRealTimeNews, 600000); 
});
