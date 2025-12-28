// ============================================
// AvaTimes - Explore & Search
// Browse and discover content
// ============================================

const Explore = {
    currentTab: 'all',
    searchQuery: '',

    // Trending tags
    trendingTags: [
        '#avakin', '#style', '#fashion', '#look', '#avakinlife',
        '#makeup', '#kawaii', '#dark', '#aesthetic', '#cute',
        '#glow', '#vibes', '#outfit', '#tutorial', '#fyp'
    ],

    // Get all content for explore
    getAllContent() {
        const posts = DataManager.getPosts();
        const reels = DataManager.getReels();
        
        // Combine and sort by date
        const allContent = [
            ...posts.map(p => ({ ...p, type: p.features ? 'look' : 'post' })),
            ...reels.map(r => ({ ...r, type: 'reel' }))
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        return allContent;
    },

    // Filter by tab
    filterTab(tab) {
        this.currentTab = tab;
        
        // Update active tab
        document.querySelectorAll('.explore-tab').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        
        this.render();
    },

    // Search content
    search(query) {
        this.searchQuery = query.toLowerCase().trim();
        
        // Hide trending when searching
        const trendingSection = document.getElementById('trending-section');
        if (trendingSection) {
            trendingSection.style.display = this.searchQuery ? 'none' : 'block';
        }
        
        this.render();
    },

    // Filter content based on current state
    getFilteredContent() {
        let content = this.getAllContent();
        
        // Filter by tab
        if (this.currentTab !== 'all') {
            if (this.currentTab === 'looks') {
                content = content.filter(c => c.type === 'look');
            } else if (this.currentTab === 'posts') {
                content = content.filter(c => c.type === 'post');
            } else if (this.currentTab === 'reels') {
                content = content.filter(c => c.type === 'reel');
            } else if (this.currentTab === 'users') {
                // Return unique users
                const users = [...new Set(content.map(c => c.author))];
                return users.map(u => ({ type: 'user', username: u }));
            }
        }
        
        // Filter by search query
        if (this.searchQuery) {
            content = content.filter(c => {
                const searchText = [
                    c.author || '',
                    c.caption || '',
                    c.title || '',
                    c.username || ''
                ].join(' ').toLowerCase();
                
                return searchText.includes(this.searchQuery) || 
                       this.searchQuery.startsWith('#') && searchText.includes(this.searchQuery.slice(1));
            });
        }
        
        return content;
    },

    // Render explore grid
    render() {
        const grid = document.getElementById('explore-grid');
        if (!grid) return;
        
        const content = this.getFilteredContent();
        
        if (content.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <div class="empty-state-icon">🔍</div>
                    <h3>No results found</h3>
                    <p>Try different keywords or explore trending tags</p>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = content.map(item => this.renderItem(item)).join('');
    },

    // Render single item
    renderItem(item) {
        if (item.type === 'user') {
            return `
                <div class="explore-item" onclick="window.location.href='profile.html?user=${item.username}'">
                    <div style="text-align: center;">
                        <div class="notif-avatar" style="margin: 0 auto 10px; width: 60px; height: 60px; font-size: 1.5rem;">
                            ${item.username.charAt(0).toUpperCase()}
                        </div>
                        <span style="font-size: 0.85rem;">@${item.username}</span>
                    </div>
                </div>
            `;
        }
        
        const icon = item.type === 'reel' ? '🎬' : (item.type === 'look' ? '👤' : '📷');
        const link = item.type === 'reel' ? 'reels.html' : 'index.html';
        
        return `
            <div class="explore-item" onclick="window.location.href='${link}'">
                ${item.image ? `<img src="${item.image}" alt="">` : `<span class="placeholder-icon">${icon}</span>`}
            </div>
        `;
    },

    // Render trending tags
    renderTrendingTags() {
        const container = document.getElementById('trending-tags');
        if (!container) return;
        
        container.innerHTML = this.trendingTags.map(tag => `
            <button class="explore-tab" onclick="Explore.searchTag('${tag}')">${tag}</button>
        `).join('');
    },

    // Search by tag
    searchTag(tag) {
        const searchInput = document.getElementById('explore-search');
        if (searchInput) {
            searchInput.value = tag;
            this.search(tag);
        }
    },

    // Extract hashtags from content
    extractHashtags() {
        const posts = DataManager.getPosts();
        const reels = DataManager.getReels();
        
        const allText = [...posts, ...reels]
            .map(p => p.caption || '')
            .join(' ');
        
        const hashtags = allText.match(/#\w+/g) || [];
        
        // Count occurrences
        const counts = {};
        hashtags.forEach(tag => {
            counts[tag] = (counts[tag] || 0) + 1;
        });
        
        // Sort by count and return top 15
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15)
            .map(([tag]) => tag);
    },

    // Initialize
    init() {
        this.render();
        this.renderTrendingTags();
        
        // Update trending tags with actual hashtags if available
        const extractedTags = this.extractHashtags();
        if (extractedTags.length > 5) {
            this.trendingTags = extractedTags;
            this.renderTrendingTags();
        }
    }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('explore-grid')) {
        Explore.init();
    }
});
