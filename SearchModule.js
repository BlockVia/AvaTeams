/**
 * Search Module for AvaTimes
 */
const Search = {
    recentSearches: JSON.parse(localStorage.getItem('recentSearches') || '[]'),

    init: function() {
        this.bindEvents();
        this.loadSuggested();
        this.loadRecent();
    },

    bindEvents: function() {
        const input = document.getElementById('search-input');
        if (input) {
            input.addEventListener('input', (e) => this.handleSearch(e.target.value));
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch(e.target.value);
                }
            });
        }
    },

    handleSearch: function(query) {
        const resultsContainer = document.getElementById('search-results');
        const suggestedContainer = document.getElementById('suggested-users');
        const recentContainer = document.getElementById('recent-searches');

        if (query.trim().length > 0) {
            resultsContainer.style.display = 'block';
            suggestedContainer.style.display = 'none';
            recentContainer.style.display = 'none';
            this.showResults(query);
        } else {
            resultsContainer.style.display = 'none';
            suggestedContainer.style.display = 'block';
            recentContainer.style.display = 'block';
        }
    },

    showResults: function(query) {
        const users = DataStore.users.filter(u =>
            u.username.toLowerCase().includes(query.toLowerCase()) ||
            (u.displayName && u.displayName.toLowerCase().includes(query.toLowerCase()))
        );

        const posts = DataStore.posts.filter(p =>
            p.caption && p.caption.toLowerCase().includes(query.toLowerCase())
        );

        const resultsList = document.getElementById('results-list');
        resultsList.innerHTML = '';

        if (users.length === 0 && posts.length === 0) {
            resultsList.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 40px;">No results found</p>';
            return;
        }

        users.forEach(user => {
            resultsList.innerHTML += `
                <div class="result-item user-result" onclick="window.location.href='profile.html?user=${user.username}'" style="display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border-color); cursor: pointer;">
                    <div class="avatar" style="width: 44px; height: 44px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">${user.avatar || '👤'}</div>
                    <div>
                        <p style="margin: 0; font-weight: 600;">@${user.username}</p>
                        <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted);">${user.followers || 0} followers</p>
                    </div>
                </div>
            `;
        });
    },

    performSearch: function(query) {
        if (query.trim().length === 0) return;

        // Save to recent searches
        if (!this.recentSearches.includes(query)) {
            this.recentSearches.unshift(query);
            if (this.recentSearches.length > 10) this.recentSearches.pop();
            localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
        }

        this.showResults(query);
    },

    clearRecent: function() {
        this.recentSearches = [];
        localStorage.removeItem('recentSearches');
        this.loadRecent();
    },

    loadRecent: function() {
        const list = document.getElementById('recent-list');
        if (!list) return;

        if (this.recentSearches.length === 0) {
            list.innerHTML = '<p style="color: var(--text-muted);">No recent searches</p>';
            return;
        }

        list.innerHTML = this.recentSearches.map(term => `
            <div class="recent-item" onclick="document.getElementById('search-input').value='${term}'; Search.handleSearch('${term}');" style="display: flex; align-items: center; gap: 12px; padding: 10px 0; cursor: pointer;">
                <span style="color: var(--text-muted);">🕐</span>
                <span>${term}</span>
            </div>
        `).join('');
    },

    loadSuggested: function() {
        const list = document.getElementById('suggested-list');
        if (!list) return;

        const users = DataStore.users || [];
        list.innerHTML = users.slice(0, 5).map(user => `
            <div class="user-item" style="display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border-color);">
                <div class="avatar" style="width: 44px; height: 44px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">${user.avatar || '👤'}</div>
                <div style="flex: 1;">
                    <p style="margin: 0; font-weight: 600;">@${user.username}</p>
                    <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted);">${user.displayName || user.username}</p>
                </div>
                <button class="btn btn-secondary" onclick="event.stopPropagation();" style="padding: 6px 16px; font-size: 0.85rem;">Follow</button>
            </div>
        `).join('');
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => Search.init());
