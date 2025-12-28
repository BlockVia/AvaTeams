// ============================================
// AvaTimes - Profile Functionality
// User profile with posts, looks, and reels tabs
// ============================================

const Profile = {
    currentTab: 'posts',
    userData: null,
    isOwnProfile: true,
    viewingUsername: null,
    allPosts: [],
    currentPostIndex: 0,

    // Initialize
    init() {
        const currentUser = Auth.getCurrentUser();

        // Check if viewing another user's profile
        const urlParams = new URLSearchParams(window.location.search);
        const viewUser = urlParams.get('user');

        if (viewUser) {
            // Viewing another user's profile
            this.viewingUsername = viewUser;
            this.isOwnProfile = currentUser && currentUser.username.toLowerCase() === viewUser.toLowerCase();
            this.userData = this.loadUserData(viewUser);
        } else if (currentUser) {
            // Viewing own profile
            this.viewingUsername = currentUser.username;
            this.isOwnProfile = true;
            this.userData = this.loadUserData(currentUser.username);
        } else {
            // Not logged in and no user specified
            document.querySelector('.profile-content')?.style.setProperty('display', 'none');
            document.getElementById('login-prompt')?.style.setProperty('display', 'block');
            return;
        }

        this.render();
        this.updateButtonsForProfileType();
    },

    // Update buttons based on profile type
    updateButtonsForProfileType() {
        const editBtn = document.querySelector('.edit-profile-btn');
        const profileButtons = document.querySelector('.profile-buttons');

        if (!this.isOwnProfile) {
            // Hide edit, show follow button
            if (editBtn) editBtn.style.display = 'none';

            // Replace with follow button
            if (profileButtons) {
                profileButtons.innerHTML = `
                    <button class="btn btn-primary follow-profile-btn" onclick="Profile.toggleFollow()" style="flex: 2;">
                        Follow
                    </button>
                    <button class="btn btn-secondary" onclick="Profile.messageUser()" style="flex: 1;">
                        Message
                    </button>
                `;
            }
        }
    },

    // Toggle follow
    toggleFollow() {
        const btn = document.querySelector('.follow-profile-btn');
        if (!btn) return;

        const isFollowing = btn.classList.contains('following');

        if (isFollowing) {
            btn.classList.remove('following');
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-primary');
            btn.textContent = 'Follow';
            if (this.userData) this.userData.followers--;
        } else {
            btn.classList.add('following');
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-secondary');
            btn.textContent = 'Following';
            if (this.userData) this.userData.followers++;
        }

        // Update display
        document.getElementById('stat-followers').textContent = this.userData.followers;
        this.saveUserData();
    },

    // Message user
    messageUser() {
        window.location.href = 'messages.html';
    },

    // Load user data
    loadUserData(username) {
        const saved = localStorage.getItem(`avatimes_profile_${username}`);
        const userPosts = DataManager.getPostsByAuthor(username);
        const userReels = DataManager.getReelsByAuthor ? DataManager.getReelsByAuthor(username) : [];

        if (saved) {
            const data = JSON.parse(saved);
            data.posts = userPosts.length + userReels.length; // Update post count
            return data;
        }

        return {
            username: username,
            displayName: username,
            bio: 'Avakin Life player 🎮✨',
            avatar: '👤',
            posts: userPosts.length + userReels.length,
            followers: Math.floor(Math.random() * 1000),
            following: Math.floor(Math.random() * 500)
        };
    },

    // Save user data
    saveUserData() {
        if (this.userData) {
            localStorage.setItem(`avatimes_profile_${this.userData.username}`, JSON.stringify(this.userData));
        }
    },

    // Render profile
    render() {
        if (!this.userData) return;

        // Update header
        const pageTitle = document.querySelector('.page-title');
        if (pageTitle) pageTitle.textContent = '@' + this.userData.username;

        // Show/hide settings button based on profile ownership
        const settingsBtn = document.querySelector('.header-actions');
        if (settingsBtn) {
            settingsBtn.style.display = this.isOwnProfile ? 'block' : 'none';
        }

        // Update avatar
        const avatar = document.getElementById('profile-avatar');
        if (avatar) avatar.textContent = this.userData.avatar;

        // Update stats
        document.getElementById('stat-posts').textContent = this.userData.posts;
        document.getElementById('stat-followers').textContent = this.userData.followers;
        document.getElementById('stat-following').textContent = this.userData.following;

        // Update details
        document.getElementById('display-name').textContent = this.userData.displayName;
        document.getElementById('profile-bio').textContent = this.userData.bio;

        // Load user's posts
        this.loadContent();
    },

    // Load content based on current tab
    loadContent() {
        const grid = document.getElementById('profile-grid');
        if (!grid) return;

        const posts = DataManager.getPostsByAuthor(this.userData.username);

        if (posts.length === 0) {
            grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">📷</div>
          <h3>No ${this.currentTab} yet</h3>
          <p>Share your first ${this.currentTab === 'reels' ? 'reel' : 'post'}!</p>
          <a href="${this.currentTab === 'reels' ? 'upload-reel.html' : 'create.html'}" class="btn btn-primary">Create</a>
        </div>
      `;
            return;
        }

        // Store posts for navigation
        this.allPosts = posts;

        // Render grid items
        grid.innerHTML = posts.map((post, index) => `
      <div class="profile-grid-item" onclick="Profile.openPost('${post.id}', ${index})">
        ${post.image ? `<img src="${post.image}" alt="">` : '👤'}
      </div>
    `).join('');
    },

    // Switch tab
    switchTab(tab) {
        this.currentTab = tab;

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        this.loadContent();
    },

    // Open post detail
    openPost(postId, index = null) {
        const posts = this.allPosts || DataManager.getPostsByAuthor(this.userData.username);
        const post = posts.find(p => p.id === postId);
        
        if (!post) return;

        // Find index if not provided
        if (index === null) {
            index = posts.findIndex(p => p.id === postId);
        }
        
        this.currentPostIndex = index;
        this.allPosts = posts;

        this.renderPostDetail(post);
        
        const modal = document.getElementById('post-detail-modal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scroll
        }

        // Update navigation buttons visibility
        this.updatePostNavigation();
    },

    // Render post detail (Instagram-style)
    renderPostDetail(post) {
        const container = document.getElementById('post-detail-content');
        if (!container) return;

        const likeIcon = post.liked ? Icons.heartFilled : Icons.heart;
        const likeClass = post.liked ? 'liked' : '';
        const user = Auth.getCurrentUser();
        const isOwner = user && user.username === post.author;

        // Initialize comments if not exists
        if (!post.commentsData) {
            post.commentsData = this.getSampleComments(post.author);
            this.updatePostInStorage(post);
        }

        container.innerHTML = `
            <div class="post-detail-image">
                ${post.image ? 
                    `<img src="${post.image}" alt="Post">` : 
                    `<div class="post-placeholder" style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px;">
                        ${Icons.image}
                        <p style="margin-top: 20px; font-size: 1.2rem;">${this.escapeHtml(post.title || post.caption || '')}</p>
                    </div>`
                }
            </div>
            <div class="post-detail-sidebar">
                <div class="post-detail-header">
                    <div class="post-avatar">${post.author.charAt(0).toUpperCase()}</div>
                    <div class="post-user-info">
                        <a href="profile.html?user=${post.author}" class="post-username">${post.author}</a>
                        ${post.location ? `<span class="post-location">${post.location}</span>` : ''}
                    </div>
                    <button class="post-menu" onclick="Feed.showPostMenu('${post.id}', ${isOwner})">${Icons.more}</button>
                </div>
                
                <div class="post-detail-comments" id="post-detail-comments">
                    ${this.renderCommentsList(post.commentsData)}
                </div>

                <div class="post-detail-actions">
                    <div class="post-actions">
                        <button class="post-action ${likeClass}" onclick="Profile.toggleLikeInDetail('${post.id}')">${likeIcon}</button>
                        <button class="post-action" onclick="Profile.focusCommentInput()">${Icons.comment}</button>
                        <button class="post-action" onclick="Feed.sharePost('${post.id}')">${Icons.share}</button>
                        <button class="post-action save-btn" onclick="Feed.savePost('${post.id}')" style="margin-left: auto;">${Icons.save}</button>
                    </div>
                    <div class="post-likes" id="post-detail-likes">${post.likes.toLocaleString()} likes</div>
                    <div class="post-caption">
                        <strong>${post.author}</strong> ${this.escapeHtml(post.caption || post.title || '')}
                    </div>
                    <div class="post-time">${this.timeAgo(post.createdAt)}</div>
                </div>

                <div class="post-detail-comment-input">
                    <input type="text" id="post-detail-comment-input" class="form-input" placeholder="Add a comment..." 
                           onkeypress="if(event.key === 'Enter') Profile.addCommentInDetail('${post.id}')">
                    <button class="btn btn-primary btn-sm" onclick="Profile.addCommentInDetail('${post.id}')">Post</button>
                </div>
            </div>
        `;
    },

    // Render comments list
    renderCommentsList(comments) {
        if (!comments || comments.length === 0) {
            return '<div class="no-comments" style="padding: 20px; text-align: center; color: var(--text-muted);">No comments yet</div>';
        }

        return comments.map(c => `
            <div class="comment-item" style="padding: 12px 15px; border-bottom: var(--border-glass);">
                <div class="comment-avatar" style="width: 32px; height: 32px; border-radius: 50%; background: var(--gradient-primary); display: inline-flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.85rem; margin-right: 10px; vertical-align: top;">
                    ${c.user.charAt(0).toUpperCase()}
                </div>
                <div style="display: inline-block; flex: 1;">
                    <a href="profile.html?user=${c.user}" class="comment-user" style="font-weight: 600; font-size: 0.9rem; margin-right: 8px;">${c.user}</a>
                    <span class="comment-text" style="font-size: 0.9rem; color: var(--text-secondary);">${this.escapeHtml(c.text)}</span>
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">${c.time}</div>
                </div>
            </div>
        `).join('');
    },

    // Toggle like in detail view
    toggleLikeInDetail(postId) {
        Feed.toggleLike(postId);
        const post = DataManager.getPost(postId);
        if (post) {
            this.renderPostDetail(post);
        }
    },

    // Focus comment input
    focusCommentInput() {
        const input = document.getElementById('post-detail-comment-input');
        if (input) input.focus();
    },

    // Add comment in detail view
    addCommentInDetail(postId) {
        const input = document.getElementById('post-detail-comment-input');
        const text = input.value.trim();
        if (!text) return;

        const user = Auth.getCurrentUser();
        if (!user) {
            UI.showAlert('Login Required', 'Please login to comment', () => {
                window.location.href = 'login.html';
            });
            return;
        }

        const post = DataManager.getPost(postId);
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
        this.renderPostDetail(post);
        input.value = '';
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

    // Time ago helper
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

    // Escape HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Get sample comments
    getSampleComments(author) {
        return [
            { id: 1, user: 'AvaQueen', text: 'Love this! ❤️', time: '2h', likes: 5 },
            { id: 2, user: 'NightKing', text: 'Amazing look!', time: '1h', likes: 3 },
            { id: 3, user: author, text: 'Thanks everyone! 😊', time: '30m', likes: 8 }
        ];
    },

    // Navigate between posts
    navigatePost(direction) {
        if (!this.allPosts || this.allPosts.length === 0) return;

        this.currentPostIndex += direction;

        if (this.currentPostIndex < 0) {
            this.currentPostIndex = this.allPosts.length - 1;
        } else if (this.currentPostIndex >= this.allPosts.length) {
            this.currentPostIndex = 0;
        }

        const post = this.allPosts[this.currentPostIndex];
        if (post) {
            this.renderPostDetail(post);
            this.updatePostNavigation();
        }
    },

    // Update navigation buttons visibility
    updatePostNavigation() {
        const prevBtn = document.querySelector('.post-nav-prev');
        const nextBtn = document.querySelector('.post-nav-next');

        if (this.allPosts && this.allPosts.length > 1) {
            if (prevBtn) prevBtn.style.display = 'flex';
            if (nextBtn) nextBtn.style.display = 'flex';
        } else {
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
        }
    },

    // Close post detail
    closePostDetail() {
        const modal = document.getElementById('post-detail-modal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = ''; // Restore scroll
        }
    },

    // Show edit modal
    showEditModal() {
        const modal = document.getElementById('edit-profile-modal');
        if (!modal) return;

        document.getElementById('edit-display-name').value = this.userData.displayName;
        document.getElementById('edit-bio').value = this.userData.bio;
        document.getElementById('edit-avatar').value = this.userData.avatar;

        modal.classList.add('active');
    },

    // Hide edit modal
    hideEditModal() {
        const modal = document.getElementById('edit-profile-modal');
        if (modal) modal.classList.remove('active');
    },

    // Save profile changes
    saveProfile() {
        const displayName = document.getElementById('edit-display-name')?.value.trim();
        const bio = document.getElementById('edit-bio')?.value.trim();
        const avatar = document.getElementById('edit-avatar')?.value.trim();

        if (displayName) this.userData.displayName = displayName;
        if (bio !== undefined) this.userData.bio = bio;
        if (avatar) this.userData.avatar = avatar;

        this.saveUserData();
        this.hideEditModal();
        this.render();
    },

    // Show settings
    showSettings() {
        UI.showToast('Settings coming soon', 'info');
    },

    // Share profile
    shareProfile() {
        if (navigator.share) {
            navigator.share({
                title: `@${this.userData.username} on AvaTimes`,
                text: `Check out ${this.userData.displayName}'s profile on AvaTimes!`,
                url: window.location.href
            }).catch(() => { });
        } else {
            // Fallback: copy to clipboard
            const url = window.location.href;
            navigator.clipboard.writeText(url).then(() => {
                UI.showToast('Profile link copied to clipboard!', 'success');
            }).catch(() => {
                UI.showToast('Could not copy link', 'error');
            });
        }
    },

    // Delete user post
    deletePost(postId) {
        UI.confirm('Delete Post', 'Are you sure you want to delete this post?', () => {
            DataManager.deletePost(postId);
            this.userData.posts = DataManager.getPostsByAuthor(this.userData.username).length;
            this.saveUserData();
            this.render();
            UI.showToast('Post deleted', 'success');
        });
    }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.profile-content')) {
        Profile.init();
    }
});
