// ============================================
// AvaTimes - Reels Functionality
// TikTok/Instagram Reels style video player
// ============================================

const Reels = {
  currentIndex: 0,
  reels: [],

  // Render a single reel
  renderReel(reel, index) {
    const likeIcon = reel.liked ? Icons.heartFilled : Icons.heart;
    const likedClass = reel.liked ? 'liked' : '';
    
    return `
      <div class="reel-wrapper" id="reel-${index}">
        <div class="reel-video" onclick="Reels.togglePlay(${index})">
          ${reel.video ?
        `<video src="${reel.video}" playsinline loop ${index === 0 ? 'autoplay muted' : ''}></video>` :
        `<div class="reel-placeholder">
              <span class="reel-placeholder-icon">${Icons.video}</span>
              <p>${reel.caption}</p>
              <span style="font-size: 0.9rem; color: var(--text-muted); margin-top: 10px;">🎵 ${reel.music}</span>
            </div>`
      }
        </div>
        <div class="reel-info">
          <div class="reel-author">
            <div class="author-avatar">${reel.author.charAt(0)}</div>
            <span class="author-name">@${reel.author}</span>
            <button class="btn btn-primary btn-sm follow-btn" onclick="Reels.followUser('${reel.author}')">Follow</button>
          </div>
          <p class="reel-caption">${reel.caption}</p>
          <div class="reel-music">🎵 ${reel.music}</div>
        </div>
        <div class="reel-actions">
          <button class="action-btn like-btn ${likedClass}" onclick="Reels.toggleLike(${index})">
            <span class="action-icon">${likeIcon}</span>
            <span class="action-count">${this.formatCount(reel.likes)}</span>
          </button>
          <button class="action-btn comment-btn" onclick="Reels.commentReel(${index})">
            <span class="action-icon">${Icons.comment}</span>
            <span class="action-count">${reel.comments}</span>
          </button>
          <button class="action-btn share-btn" onclick="Reels.shareReel(${index})">
            <span class="action-icon">${Icons.share}</span>
            <span class="action-count">Share</span>
          </button>
        </div>
      </div>
    `;
  },

  // Toggle play/pause
  togglePlay(index) {
    const video = document.querySelector(`#reel-${index} video`);
    if (video) {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    }
  },

  // Follow user
  followUser(username) {
    UI.showToast(`Following @${username}!`, 'success');
  },

  // Format count (1234 -> 1.2K)
  formatCount(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  },

  // Toggle like
  toggleLike(index) {
    const reel = this.reels[index];
    if (!reel) return;
    
    reel.liked = !reel.liked;
    reel.likes = reel.liked ? reel.likes + 1 : Math.max(0, reel.likes - 1);
    
    // Save to storage
    localStorage.setItem(DataManager.KEYS.REELS, JSON.stringify(this.reels));
    
    // Update UI without full re-render
    const likeBtn = document.querySelector(`#reel-${index} .like-btn`);
    if (likeBtn) {
      const icon = likeBtn.querySelector('.action-icon');
      const count = likeBtn.querySelector('.action-count');
      if (icon) icon.innerHTML = reel.liked ? Icons.heartFilled : Icons.heart;
      if (count) count.textContent = this.formatCount(reel.likes);
      likeBtn.classList.toggle('liked', reel.liked);
    }
  },

  // Share reel
  shareReel(index) {
    const reel = this.reels[index];
    if (!reel) return;
    
    if (navigator.share) {
      navigator.share({
        title: `Reel by @${reel.author}`,
        text: reel.caption,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      UI.showToast('Link copied!', 'success');
    }
  },

  // Comment on reel
  commentReel(index) {
    UI.showToast('Comments feature coming soon!', 'info');
  },

  // Handle scroll to play/pause videos
  handleScroll() {
    const container = document.getElementById('reels-container');
    const scrollTop = container.scrollTop;
    const viewportHeight = window.innerHeight;

    this.currentIndex = Math.round(scrollTop / viewportHeight);

    // Play current video, pause others
    document.querySelectorAll('.reel-wrapper video').forEach((video, index) => {
      if (index === this.currentIndex) {
        video.play().catch(() => { });
      } else {
        video.pause();
      }
    });
  },

  // Render all reels
  render() {
    const container = document.getElementById('reels-container');
    if (!container) return;

    // Load reels from DataManager
    this.reels = DataManager.getReels();

    if (this.reels.length === 0) {
      container.innerHTML = `
        <div class="reel-wrapper">
          <div class="reel-video">
            <div class="reel-placeholder">
              <span class="reel-placeholder-icon">${Icons.video}</span>
              <h3>No Reels Yet</h3>
              <p>Be the first to upload a reel!</p>
              <a href="upload-reel.html" class="btn btn-primary" style="margin-top: 20px;">Upload Reel</a>
            </div>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = this.reels.map((reel, index) => this.renderReel(reel, index)).join('');
  },

  // Initialize
  init() {
    this.render();

    const container = document.getElementById('reels-container');
    if (container) {
      container.addEventListener('scroll', () => this.handleScroll());
    }
  }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('reels-container')) {
    Reels.init();
  }
});
