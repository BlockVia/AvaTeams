// ============================================
// AvaTimes - Feed Functionality
// Instagram-style feed with posts
// ============================================

const Feed = {
  currentUser: null,

  // Render a single post
  renderPost(post) {
    const likeIcon = post.liked ? Icons.heartFilled : Icons.heart;
    const likeClass = post.liked ? 'liked' : '';
    const user = Auth.getCurrentUser();
    const isOwner = user && user.username === post.author;

    return `
      <article class="feed-post fade-in" id="post-${post.id}">
        <div class="post-header">
          <div class="post-avatar">${post.author.charAt(0).toUpperCase()}</div>
          <div class="post-user-info">
            <a href="profile.html?user=${post.author}" class="post-username">${post.author}</a>
            ${post.location ? `<span class="post-location">${post.location}</span>` : ''}
          </div>
          <button class="post-menu" onclick="Feed.showPostMenu('${post.id}', ${isOwner})">${Icons.more}</button>
        </div>
        
        <div class="post-image" ondblclick="Feed.toggleLike('${post.id}')" onclick="Feed.openPostDetail('${post.id}')" style="cursor: pointer;">
          ${post.image ? `<img src="${post.image}" alt="Post">` : `<div class="post-placeholder">${Icons.image}<p>${this.escapeHtml(post.title || '')}</p></div>`}
        </div>
        
        <div class="post-actions">
          <button class="post-action ${likeClass}" onclick="Feed.toggleLike('${post.id}')">${likeIcon}</button>
          <button class="post-action" onclick="Feed.openComments('${post.id}')">${Icons.comment}</button>
          <button class="post-action" onclick="Feed.sharePost('${post.id}')">${Icons.share}</button>
          <button class="post-action save-btn" onclick="Feed.savePost('${post.id}')" style="margin-left: auto;">${Icons.save}</button>
        </div>
        
        <div class="post-content">
          <div class="post-likes">${post.likes.toLocaleString()} likes</div>
          <p class="post-caption">
            <strong>${post.author}</strong> ${this.escapeHtml(post.caption || post.title)}
          </p>
          ${post.comments > 0 ? `
            <div class="post-comments-link" onclick="Feed.openComments('${post.id}')">
              View all ${post.comments} comments
            </div>
          ` : ''}
          <div class="post-time">${this.timeAgo(post.createdAt)}</div>
        </div>
      </article>
    `;
  },

  // Escape HTML
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  // Time ago formatter
  timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  },

  // Toggle like
  toggleLike(postId) {
    const posts = DataManager.getPosts();
    const post = posts.find(p => p.id === postId);
    if (post) {
      post.liked = !post.liked;
      post.likes = post.liked ? post.likes + 1 : post.likes - 1;
      localStorage.setItem(DataManager.KEYS.POSTS, JSON.stringify(posts));

      // Update UI without full re-render
      const button = document.querySelector(`button[onclick="Feed.toggleLike('${postId}')"]`);
      if (button) {
        // Toggle class
        button.classList.toggle('liked', post.liked);
        // Update icon
        button.innerHTML = post.liked ? Icons.heartFilled : Icons.heart;

        // Update like count text
        const postElement = button.closest('.feed-post');
        const likesElement = postElement.querySelector('.post-likes');
        if (likesElement) {
          likesElement.textContent = `${post.likes.toLocaleString()} likes`;
        }
      }
    }
  },

  // Delete Post
  deletePost(postId) {
    UI.confirm('Delete Post', 'Are you sure you want to delete this post?', () => {
      const posts = DataManager.getPosts().filter(p => p.id !== postId);
      localStorage.setItem(DataManager.KEYS.POSTS, JSON.stringify(posts));

      // Remove from DOM
      const postElement = document.getElementById(`post-${postId}`);
      if (postElement) {
        postElement.remove();
        UI.showToast('Post deleted', 'success');
      } else {
        this.render(); // Fallback
      }
    });
  },

  // Current post for comments
  currentPostId: null,

  // Open comments modal
  openComments(postId) {
    this.currentPostId = postId;
    const post = DataManager.getPost(postId);
    if (!post) return;

    // Initialize comments array if not exists
    if (!post.commentsData) {
      post.commentsData = this.getSampleComments(post.author);
      this.updatePostInStorage(post);
    }

    this.renderComments(post.commentsData);
    document.getElementById('comments-modal').classList.add('active');

    // Focus on input
    setTimeout(() => {
      document.getElementById('comment-input')?.focus();
    }, 100);
  },

  // Get sample comments
  getSampleComments(author) {
    return [
      { id: 1, user: 'AvaQueen', text: 'Love this! ❤️', time: '2h', likes: 5 },
      { id: 2, user: 'NightKing', text: 'Amazing look!', time: '1h', likes: 3 },
      { id: 3, user: author, text: 'Thanks everyone! 😊', time: '30m', likes: 8 }
    ];
  },

  // Render comments
  renderComments(comments) {
    const container = document.getElementById('comments-list');
    if (!container) return;

    if (comments.length === 0) {
      container.innerHTML = '<p class="no-comments">No comments yet. Be the first!</p>';
      return;
    }

    const user = Auth.getCurrentUser();

    container.innerHTML = comments.map(c => `
      <div class="comment-item" data-comment-id="${c.id}">
        <div class="comment-avatar">${c.user.charAt(0).toUpperCase()}</div>
        <div class="comment-content">
          <div>
            <a href="profile.html?user=${c.user}" class="comment-user">${c.user}</a>
            <span class="comment-text">${this.escapeHtml(c.text)}</span>
          </div>
          <div style="display: flex; gap: 15px; align-items: center;">
            <span class="comment-time">${c.time}</span>
            <button class="comment-like-btn" onclick="Feed.likeComment(${c.id})" style="background:none; border:none; color: var(--text-muted); cursor:pointer; font-size: 0.75rem;">
              ${c.likes || 0} likes
            </button>
            <button class="comment-reply-btn" onclick="Feed.replyToComment('${c.user}')" style="background:none; border:none; color: var(--text-muted); cursor:pointer; font-size: 0.75rem;">
              Reply
            </button>
            ${user && user.username === c.user ? `
              <button onclick="Feed.deleteComment(${c.id})" style="background:none; border:none; color: #ef4444; cursor:pointer; font-size: 0.75rem;">
                Delete
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `).join('');

    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
  },

  // Like comment
  likeComment(commentId) {
    const post = DataManager.getPost(this.currentPostId);
    if (!post || !post.commentsData) return;

    const comment = post.commentsData.find(c => c.id === commentId);
    if (comment) {
      comment.likes = (comment.likes || 0) + 1;
      this.updatePostInStorage(post);
      this.renderComments(post.commentsData);
    }
  },

  // Reply to comment
  replyToComment(username) {
    const input = document.getElementById('comment-input');
    if (input) {
      input.value = `@${username} `;
      input.focus();
    }
  },

  // Delete comment
  deleteComment(commentId) {
    UI.confirm('Delete Comment', 'Are you sure you want to delete this comment?', () => {
      const post = DataManager.getPost(this.currentPostId);
      if (!post || !post.commentsData) return;

      post.commentsData = post.commentsData.filter(c => c.id !== commentId);
      post.comments = post.commentsData.length;

      this.updatePostInStorage(post);
      this.renderComments(post.commentsData);
      this.render();
    });
  },

  // Add comment
  addComment() {
    const input = document.getElementById('comment-input');
    const text = input.value.trim();
    if (!text) return;

    const user = Auth.getCurrentUser();
    if (!user) {
      UI.showAlert('Login Required', 'Please login to comment', () => {
        window.location.href = 'login.html';
      });
      return;
    }

    const post = DataManager.getPost(this.currentPostId);
    if (!post) return;

    if (!post.commentsData) post.commentsData = [];

    post.commentsData.push({
      id: Date.now(),
      user: user.username,
      text: text,
      time: 'Just now',
      likes: 0
    });
    post.comments = post.commentsData.length;

    this.updatePostInStorage(post);
    this.renderComments(post.commentsData);
    input.value = '';
    this.render();
  },

  // Update post in storage
  updatePostInStorage(post) {
    const posts = DataManager.getPosts();
    const index = posts.findIndex(p => p.id === post.id);
    if (index !== -1) {
      posts[index] = post;
      localStorage.setItem(DataManager.KEYS.POSTS, JSON.stringify(posts));
    }
  },

  // Save post to storage
  savePost(post) {
    const posts = DataManager.getPosts();
    const index = posts.findIndex(p => p.id === post.id);
    if (index !== -1) {
      posts[index] = post;
      localStorage.setItem(DataManager.KEYS.POSTS, JSON.stringify(posts));
    }
  },

  // Close comments modal
  closeComments() {
    document.getElementById('comments-modal').classList.remove('active');
    this.currentPostId = null;
  },

  // Share post
  sharePost(postId) {
    const post = DataManager.getPost(postId);
    if (!post) return;

    if (navigator.share) {
      navigator.share({
        title: post.title || 'Check this post on AvaTimes',
        text: post.caption || '',
        url: window.location.href
      }).catch(() => { });
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        UI.showToast('Link copied to clipboard!', 'success');
      });
    }
  },

  // Save post (bookmark)
  savePost(postId) {
    let saved = JSON.parse(localStorage.getItem('avatimes_saved_posts') || '[]');
    if (saved.includes(postId)) {
      saved = saved.filter(id => id !== postId);
      UI.showToast('Post removed from saved', 'info');
    } else {
      saved.push(postId);
      UI.showToast('Post saved!', 'success');
    }
    localStorage.setItem('avatimes_saved_posts', JSON.stringify(saved));
  },

  // Show post menu
  showPostMenu(postId, isOwner) {
    const options = isOwner
      ? ['Delete Post', 'Edit Post']
      : ['Report', 'Copy Link'];

    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.style.zIndex = '10000';
    modal.innerHTML = `
      <div class="modal" style="max-width: 300px;">
        <div class="modal-header">
          <h3>Post Options</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
        </div>
        <div class="modal-body">
          ${options.map((opt, idx) => `
            <button class="btn ${idx === 0 && opt === 'Delete Post' ? 'btn-secondary' : 'btn-primary'}" 
                    onclick="Feed.handlePostMenuAction('${postId}', ${isOwner}, '${opt}')" 
                    style="width: 100%; margin-bottom: 10px;">
              ${opt}
            </button>
          `).join('')}
          <button class="btn" onclick="this.closest('.modal-overlay').remove()" 
                  style="width: 100%; background: var(--bg-input);">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };
  },

  // Handle post menu action
  handlePostMenuAction(postId, isOwner, action) {
    document.querySelectorAll('.modal-overlay').forEach(m => m.remove());

    if (action === 'Delete Post') {
      this.deletePost(postId);
    } else if (action === 'Edit Post') {
      UI.showToast('Edit feature coming soon!', 'info');
    } else if (action === 'Report') {
      UI.showToast('Post reported. Thank you!', 'success');
    } else if (action === 'Copy Link') {
      navigator.clipboard.writeText(window.location.href);
      UI.showToast('Link copied!', 'success');
    }
  },

  // Render all posts
  render() {
    const container = document.getElementById('feed-container');
    if (!container) return;

    const posts = DataManager.getPosts();

    if (posts.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">${Icons.camera}</div>
          <h3>No posts yet</h3>
          <p>Be the first to share something!</p>
          <a href="create.html" class="btn btn-primary">Create Post</a>
        </div>
      `;
      return;
    }

    container.innerHTML = posts.map(post => this.renderPost(post)).join('');
  },

  // Render stories
  renderStories() {
    const storiesBar = document.querySelector('.stories-bar');
    if (!storiesBar) return;

    const user = Auth.getCurrentUser();
    const stories = DataManager.getStories();

    let html = `
      <div class="story add-story" onclick="Feed.createStory()">
        <div class="story-avatar">${user ? user.username.charAt(0).toUpperCase() : '+'}</div>
        <span class="story-name">Your Story</span>
      </div>
    `;

    stories.forEach(story => {
      const viewedClass = story.viewed ? 'viewed' : '';
      html += `
        <div class="story ${viewedClass}" onclick="Feed.viewStory('${story.id}')">
          <div class="story-avatar">${story.avatar}</div>
          <span class="story-name">${story.author}</span>
        </div>
      `;
    });

    storiesBar.innerHTML = html;
  },

  // Current story data
  currentStoryIndex: 0,
  storyTimer: null,

  // View story
  viewStory(storyId) {
    const stories = DataManager.getStories();
    const storyIndex = stories.findIndex(s => s.id === storyId);
    if (storyIndex === -1) return;

    this.currentStoryIndex = storyIndex;
    this.showStoryViewer(stories[storyIndex]);
  },

  // Show story viewer
  showStoryViewer(story) {
    DataManager.markStoryViewed(story.id);

    document.getElementById('story-avatar').textContent = story.avatar;
    document.getElementById('story-username').textContent = '@' + story.author;
    document.getElementById('story-time').textContent = this.timeAgo(story.createdAt);

    // Story content (sample gradient background with text)
    const colors = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    document.getElementById('story-content').innerHTML = `
      <div class="story-display" style="background: ${randomColor};">
        <p class="story-text">✨ ${story.author}'s Story ✨</p>
        <p class="story-subtext">Tap to continue</p>
      </div>
    `;

    document.getElementById('story-modal').classList.add('active');
    this.startStoryProgress();
    this.renderStories();
  },

  // Start story progress bar
  startStoryProgress() {
    const progressBar = document.getElementById('story-progress-bar');
    progressBar.style.width = '0%';

    let progress = 0;
    clearInterval(this.storyTimer);

    this.storyTimer = setInterval(() => {
      progress += 2;
      progressBar.style.width = progress + '%';

      if (progress >= 100) {
        clearInterval(this.storyTimer);
        this.nextStory();
      }
    }, 100); // 5 seconds total
  },

  // Next story
  nextStory() {
    const stories = DataManager.getStories();
    this.currentStoryIndex++;

    if (this.currentStoryIndex < stories.length) {
      this.showStoryViewer(stories[this.currentStoryIndex]);
    } else {
      this.closeStoryViewer();
    }
  },

  // Close story viewer
  closeStoryViewer() {
    clearInterval(this.storyTimer);
    document.getElementById('story-modal').classList.remove('active');
    this.renderStories();
  },

  // Create story
  createStory() {
    const user = Auth.getCurrentUser();
    if (!user) {
      UI.showAlert('Login Required', 'Please login to create a story', () => {
        window.location.href = 'login.html';
      });
      return;
    }

    UI.prompt('Create Story', 'What\'s on your mind? (Your story will be visible for 24h)', (text) => {
      if (text && text.trim()) {
        DataManager.addStory({
          author: user.username,
          avatar: user.username.charAt(0).toUpperCase(),
          content: text.trim()
        });
        this.renderStories();
        UI.showToast('Story posted! 🎉', 'success');
      }
    }, 'Share your story...');
  },

  // Close post modal
  closePostModal() {
    document.getElementById('post-modal').classList.remove('active');
  },

  // Open post detail (Instagram-style)
  openPostDetail(postId) {
    const posts = DataManager.getPosts();
    const post = posts.find(p => p.id === postId);
    
    if (!post) return;

    const index = posts.findIndex(p => p.id === postId);
    
    // Use Profile's post detail modal if available
    if (typeof Profile !== 'undefined' && Profile.openPost) {
      Profile.allPosts = posts;
      Profile.currentPostIndex = index;
      Profile.renderPostDetail(post);
      
      const modal = document.getElementById('post-detail-modal');
      if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        Profile.updatePostNavigation();
      }
    } else {
      // Fallback: redirect to profile
      window.location.href = `profile.html?user=${post.author}`;
    }
  },

  // Initialize
  init() {
    this.currentUser = Auth.getCurrentUser();
    this.render();
    this.renderStories();

    // Update auth UI
    const authButtons = document.getElementById('auth-buttons');
    if (this.currentUser && authButtons) {
      authButtons.style.display = 'none';
    }
  }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('feed-container')) {
    Feed.init();
  }
});
