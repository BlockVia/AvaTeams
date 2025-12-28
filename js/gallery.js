// ============================================
// AvaFaces - Gallery Functionality
// Handles displaying and filtering face posts with measurements
// ============================================

const Gallery = {
    currentFilter: 'all',

    // Render a single face card
    renderCard(post) {
        // Handle both old format (string features) and new format (object features)
        const getFeatureName = (feature) => {
            if (!feature) return '';
            if (typeof feature === 'string') return feature;
            return feature.name || '';
        };

        const featureTags = Object.entries(post.features)
            .filter(([key, value]) => {
                const name = getFeatureName(value);
                return name && name.trim() !== '';
            })
            .slice(0, 4)
            .map(([key, value]) => `<span class="feature-tag">${this.formatFeatureName(key)}</span>`)
            .join('');

        const filledFeatures = Object.entries(post.features).filter(([key, value]) => {
            const name = getFeatureName(value);
            return name && name.trim() !== '';
        });

        return `
      <div class="card face-card fade-in" data-post-id="${post.id}" onclick="Gallery.openModal('${post.id}')">
        <div class="face-card-image" style="display: flex; align-items: center; justify-content: center; font-size: 3rem;">
          👤
        </div>
        <h3 class="face-card-title">${this.escapeHtml(post.title)}</h3>
        <p class="face-card-author">by @${this.escapeHtml(post.author)}</p>
        <div class="face-card-features">
          ${featureTags}
          ${filledFeatures.length > 4 ?
                `<span class="feature-tag">+${filledFeatures.length - 4} more</span>` : ''}
        </div>
      </div>
    `;
    },

    // Format feature key to display name
    formatFeatureName(key) {
        const names = {
            eyes: '👁️ Eyes',
            head: '🗿 Head',
            skinColor: '🎨 Skin',
            eyebrows: '✨ Eyebrows',
            mouth: '👄 Mouth',
            ears: '👂 Ears',
            beard: '🧔 Beard',
            hair: '💇 Hair',
            contour: '💫 Contour'
        };
        return names[key] || key;
    },

    // Format measurement name
    formatMeasurementName(key) {
        const names = {
            width: 'Width',
            height: 'Height',
            scale: 'Scale',
            rotate: 'Rotate',
            thickness: 'Thickness',
            color: 'Color'
        };
        return names[key] || key;
    },

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Render gallery
    render(posts) {
        const container = document.getElementById('gallery-grid');
        if (!container) return;

        if (posts.length === 0) {
            container.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">🎭</div>
          <h3>No looks found</h3>
          <p>Be the first to share your Avakin look!</p>
        </div>
      `;
            return;
        }

        container.innerHTML = posts.map(post => this.renderCard(post)).join('');
    },

    // Filter posts by category
    filter(category) {
        this.currentFilter = category;

        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });

        const posts = DataManager.getPostsByCategory(category);
        this.render(posts);
    },

    // Search posts
    search(query) {
        if (!query.trim()) {
            this.render(DataManager.getPosts());
            return;
        }
        const posts = DataManager.searchPosts(query);
        this.render(posts);
    },

    // Get feature name (handles both old and new format)
    getFeatureName(feature) {
        if (!feature) return '';
        if (typeof feature === 'string') return feature;
        return feature.name || '';
    },

    // Get measurements for a feature
    getMeasurements(feature) {
        if (!feature || typeof feature === 'string') return [];
        const measurements = [];
        const measurementKeys = ['width', 'height', 'scale', 'rotate', 'thickness', 'color'];

        for (const key of measurementKeys) {
            if (feature[key] !== null && feature[key] !== undefined && feature[key] !== '') {
                measurements.push({
                    key,
                    value: feature[key]
                });
            }
        }
        return measurements;
    },

    // Open post detail modal
    openModal(postId) {
        const post = DataManager.getPost(postId);
        if (!post) return;

        const modal = document.getElementById('post-modal');
        if (!modal) return;

        const featuresList = Object.entries(post.features)
            .filter(([key, value]) => {
                const name = this.getFeatureName(value);
                return name && name.trim() !== '';
            })
            .map(([key, value]) => {
                const name = this.getFeatureName(value);
                const measurements = this.getMeasurements(value);

                let measurementBadges = '';
                if (measurements.length > 0) {
                    measurementBadges = `
            <div class="measurement-badges">
              ${measurements.map(m => `
                <span class="measurement-badge">
                  <span class="label">${this.formatMeasurementName(m.key)}:</span>
                  <span class="value">${this.escapeHtml(String(m.value))}</span>
                </span>
              `).join('')}
            </div>
          `;
                }

                return `
          <li class="feature-item" style="flex-direction: column; align-items: flex-start;">
            <div style="display: flex; justify-content: space-between; width: 100%;">
              <span class="feature-name">${this.formatFeatureName(key)}</span>
              <span class="feature-value">${this.escapeHtml(name)}</span>
            </div>
            ${measurementBadges}
          </li>
        `;
            }).join('');

        modal.querySelector('.modal-title').textContent = post.title;
        modal.querySelector('.modal-author').textContent = `by @${post.author}`;
        modal.querySelector('.feature-list').innerHTML = featuresList;
        modal.querySelector('.modal-date').textContent = new Date(post.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        modal.classList.add('active');
    },

    // Close modal
    closeModal() {
        const modal = document.getElementById('post-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    },

    // Initialize gallery
    init() {
        // Load initial posts
        const posts = DataManager.getPosts();
        this.render(posts);

        // Setup filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.filter(btn.dataset.category);
            });
        });

        // Setup search
        const searchInput = document.getElementById('search-input');
        const searchBtn = document.getElementById('search-btn');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.search(e.target.value);
            });
        }

        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.search(searchInput.value);
            });
        }

        // Setup modal close
        const modalOverlay = document.getElementById('post-modal');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    this.closeModal();
                }
            });
        }

        const modalClose = document.querySelector('.modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', () => this.closeModal());
        }

        // Close modal on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('gallery-grid')) {
        Gallery.init();
    }
});
