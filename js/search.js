// ============================================
// AvaTimes - Search Functionality
// Full search with recent searches & results
// ============================================

const Search = {
    currentTab: 'all',
    searchQuery: '',
    recentSearches: [],

    // Trending tags
    trendingTags: [
        '#avakin', '#style', '#fashion', '#look', '#avakinlife',
        '#makeup', '#kawaii', '#dark', '#aesthetic', '#cute',
        '#glow', '#vibes', '#outfit', '#tutorial', '#fyp'
    ],

    // Load recent searches
    loadRecentSearches() {
        const saved = localStorage.getItem('avatimes_recent_searches');
        this.recentSearches = saved ? JSON.parse(saved) : [];
    },

    // Save recent search
    saveRecentSearch(query) {
        if (!query.trim()) return;
        
        // Remove if already exists
        this.recentSearches = this.recentSearches.filter(s => s.toLowerCase() !== query.toLowerCase());
        
        // Add to front
        this.recentSearches.unshift(query);
        
        // Keep only last 10
        this.recentSearches = this.recentSearches.slice(0, 10);
        
        localStorage.setItem('avatimes_recent_searches', JSON.stringify(this.recentSearches));
    },

    // Clear recent searches
    clearRecentSearches() {
        this.recentSearches = [];
        localStorage.removeItem('avatimes_recent_searches');
        this.renderRecentSearches();
    },

    // Handle search input
    handleSearch(query) {
        this.searchQuery = query.toLowerCase().trim();
        
        // Toggle sections based on query
        const recentSection = document.getElementById('recent-searches');
        const trendingSection = document.getElementById('trending-section');
        const resultsGrid = document.getElementById('results-grid');
        const usersList = document.getElementById('users-list');
        
        if (this.searchQuery) {
            // Save search after delay
            clearTimeout(this.saveTimeout);
            this.saveTimeout = setTimeout(() => {
                this.saveRecentSearch(this.searchQuery);
            }, 1000);
            
            // Show results, hide recent/trending
            if (recentSection) recentSection.style.display = 'none';
            if (trendingSection) trendingSection.style.display = 'none';
            
            this.renderResults();
        } else {
            // Show recent/trending, hide results
            if (recentSection) recentSection.style.display = 'block';
            if (trendingSection) trendingSection.style.display = 'block';
            if (resultsGrid) resultsGrid.style.display = 'none';
            if (usersList) usersList.style.display = 'none';
        }
    },

    // Filter by tab
    filterTab(tab) {
        this.currentTab = tab;
        
        // Update active tab
        document.querySelectorAll('.explore-tab').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        
        if (this.searchQuery) {
            this.renderResults();
        }
    },

    // Get all content
    getAllContent() {
        const posts = DataManager.getPosts();
        const reels = DataManager.getReels();
        
        // Combine and add type
        const allContent = [
            ...posts.map(p => ({ ...p, type: p.features ? 'look' : 'post' })),
            ...reels.map(r => ({ ...r, type: 'reel' }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        return allContent;
    },

    // Get unique users
    getUniqueUsers() {
        const content = this.getAllContent();
        const users = [...new Set(content.map(c => c.author))];
        return users.map(u => ({
            username: u,
            avatar: u.charAt(0).toUpperCase(),
            posts: content.filter(c => c.author === u).length
        }));
    },

    // Get filtered results
    getFilteredResults() {
        let content = this.getAllContent();
        
        // Filter by tab
        if (this.currentTab === 'users') {
            return this.getUniqueUsers().filter(u => 
                u.username.toLowerCase().includes(this.searchQuery)
            );
        } else if (this.currentTab === 'looks') {
            content = content.filter(c => c.type === 'look');
        } else if (this.currentTab === 'posts') {
            content = content.filter(c => c.type === 'post');
        } else if (this.currentTab === 'reels') {
            content = content.filter(c => c.type === 'reel');
        }
        
        // Filter by search query
        return content.filter(c => {
            const searchText = [
                c.author || '',
                c.caption || '',
                c.title || ''
            ].join(' ').toLowerCase();
            
            return searchText.includes(this.searchQuery) ||
                   (this.searchQuery.startsWith('#') && searchText.includes(this.searchQuery.slice(1)));
        });
    },

    // Render results
    renderResults() {
        const results = this.getFilteredResults();
        const resultsGrid = document.getElementById('results-grid');
        const usersList = document.getElementById('users-list');
        
        if (this.currentTab === 'users') {
            // Show users list
            if (resultsGrid) resultsGrid.style.display = 'none';
            if (usersList) {
                usersList.style.display = 'block';
                
                if (results.length === 0) {
                    usersList.innerHTML = this.renderEmptyState();
                } else {
                    usersList.innerHTML = results.map(user => `
                        <div class="notification-item" onclick="window.location.href='profile.html?user=${user.username}'">
                            <div class="notif-avatar">${user.avatar}</div>
                            <div class="notif-content">
                                <p class="notif-text"><strong>@${user.username}</strong></p>
                                <span class="notif-time">${user.posts} posts</span>
                            </div>
                            <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); Search.followUser('${user.username}')">
                                Follow
                            </button>
                        </div>
                    `).join('');
                }
            }
        } else {
            // Show results grid
            if (usersList) usersList.style.display = 'none';
            if (resultsGrid) {
                resultsGrid.style.display = 'grid';
                
                if (results.length === 0) {
                    resultsGrid.innerHTML = this.renderEmptyState();
                } else {
                    resultsGrid.innerHTML = results.map(item => this.renderItem(item)).join('');
                }
            }
        }
    },

    // Render single item
    renderItem(item) {
        const icon = item.type === 'reel' ? '🎬' : (item.type === 'look' ? '👤' : '📷');
        const link = item.type === 'reel' ? 'reels.html' : 'index.html';
        
        return `
            <div class="explore-item" onclick="window.location.href='${link}'">
                ${item.image ? `<img src="${item.image}" alt="">` : `<span class="placeholder-icon">${icon}</span>`}
            </div>
        `;
    },

    // Render empty state
    renderEmptyState() {
        return `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-state-icon">🔍</div>
                <h3>No results found</h3>
                <p>Try different keywords or explore trending tags</p>
            </div>
        `;
    },

    // Render recent searches
    renderRecentSearches() {
        const container = document.getElementById('recent-list');
        if (!container) return;
        
        if (this.recentSearches.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted); padding: 10px 0;">No recent searches</p>';
            return;
        }
        
        container.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="font-size: 0.9rem; color: var(--text-muted);">${this.recentSearches.length} recent</span>
                <button onclick="Search.clearRecentSearches()" style="background: none; border: none; color: var(--primary-light); cursor: pointer; font-size: 0.85rem;">
                    Clear all
                </button>
            </div>
            ${this.recentSearches.map(search => `
                <div class="notification-item" style="cursor: pointer;" onclick="Search.searchFromRecent('${search}')">
                    <div class="notif-avatar" style="background: var(--bg-glass); font-size: 1rem;">🕐</div>
                    <div class="notif-content" style="flex: 1;">
                        <p class="notif-text">${search}</p>
                    </div>
                    <button onclick="event.stopPropagation(); Search.removeRecent('${search}')" 
                            style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.2rem;">
                        ×
                    </button>
                </div>
            `).join('')}
        `;
    },

    // Search from recent
    searchFromRecent(query) {
        const input = document.getElementById('search-input');
        if (input) {
            input.value = query;
            this.handleSearch(query);
        }
    },

    // Remove from recent
    removeRecent(query) {
        this.recentSearches = this.recentSearches.filter(s => s !== query);
        localStorage.setItem('avatimes_recent_searches', JSON.stringify(this.recentSearches));
        this.renderRecentSearches();
    },

    // Render trending tags
    renderTrendingTags() {
        const container = document.getElementById('trending-tags');
        if (!container) return;
        
        container.innerHTML = this.trendingTags.map(tag => `
            <button class="explore-tab" onclick="Search.searchTag('${tag}')">${tag}</button>
        `).join('');
    },

    // Search by tag
    searchTag(tag) {
        const input = document.getElementById('search-input');
        if (input) {
            input.value = tag;
            this.handleSearch(tag);
        }
    },

    // Follow user
    followUser(username) {
        UI.showToast(`You are now following @${username}!`, 'success');
    },

    // Initialize
    init() {
        this.loadRecentSearches();
        this.renderRecentSearches();
        this.renderTrendingTags();
        
        // Focus on search input
        const input = document.getElementById('search-input');
        if (input) {
            input.focus();
            
            // Check if there's a query param
            const urlParams = new URLSearchParams(window.location.search);
            const query = urlParams.get('q');
            if (query) {
                input.value = query;
                this.handleSearch(query);
            }
        }
    }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('search-input')) {
        Search.init();
    }
});
