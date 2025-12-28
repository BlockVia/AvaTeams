// ============================================
// AvaTimes - Data Management
// Handles localStorage for posts, reels, users, and messages
// ============================================

const DataManager = {
  KEYS: {
    USERS: 'avatimes_users',
    POSTS: 'avatimes_posts',
    CURRENT_USER: 'avatimes_current_user',
    REELS: 'avatimes_reels',
    CONVERSATIONS: 'avatimes_conversations'
  },

  // Initialize with sample data
  init() {
    if (!localStorage.getItem(this.KEYS.POSTS)) {
      localStorage.setItem(this.KEYS.POSTS, JSON.stringify(this.getSamplePosts()));
    }
    if (!localStorage.getItem(this.KEYS.USERS)) {
      localStorage.setItem(this.KEYS.USERS, JSON.stringify([]));
    }
  },

  // Sample posts for feed
  getSamplePosts() {
    return [
      {
        id: 'post-1',
        author: 'AvaQueen',
        title: 'Ethereal Glow Look',
        caption: 'Finally got the perfect ethereal look! ✨ Took me hours but so worth it! #avakin #style #glow',
        location: 'Avakin Life',
        image: null,
        likes: 1234,
        liked: false,
        comments: 89,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        features: {
          eyes: { name: 'Luminous Aqua Eyes', width: 15, height: 10, scale: 5, rotate: 0 },
          head: { name: 'Soft Oval Shape', scale: 8 },
          skinColor: { name: 'Porcelain Fair' },
          eyebrows: { name: 'Natural Arch Brown', width: 12, height: 5, scale: 6, rotate: 2, thickness: 4 },
          mouth: { name: 'Glossy Rose Lips', height: 8, scale: 7 },
          hair: { name: 'Flowing Silver Waves' }
        }
      },
      {
        id: 'post-2',
        author: 'NightKing',
        title: 'Dark Prince Style',
        caption: 'Dark vibes only 🖤 The perfect look for the new club opening tonight! #darkmode #avakinlife',
        location: 'Night Club VIP',
        image: null,
        likes: 856,
        liked: false,
        comments: 45,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        features: {
          eyes: { name: 'Intense Onyx Gaze', width: 18, height: 12, scale: 8, rotate: -2 },
          head: { name: 'Sharp Angular', scale: 10 },
          skinColor: { name: 'Deep Bronze' },
          beard: { name: 'Designer Stubble', color: 'Dark Brown' },
          hair: { name: 'Slicked Back Raven' }
        }
      },
      {
        id: 'post-3',
        author: 'SweetAva',
        title: 'Candy Pop Princess',
        caption: 'Living my best kawaii life 💕🍬 Who else loves pink? #kawaii #cute #avakin',
        location: '',
        image: null,
        likes: 2341,
        liked: false,
        comments: 156,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        features: {
          eyes: { name: 'Sparkle Pink Fantasy', width: 20, height: 15, scale: 12, rotate: 3 },
          head: { name: 'Heart Shaped', scale: 6 },
          skinColor: { name: 'Peachy Glow' },
          mouth: { name: 'Cherry Bomb Lips', height: 10, scale: 9 },
          hair: { name: 'Cotton Candy Pigtails' }
        }
      },
      {
        id: 'post-4',
        author: 'EarthChild',
        title: 'Natural Beauty',
        caption: 'Sometimes natural is the best look 🌿 Keeping it simple today! #natural #beauty',
        location: 'Beach Paradise',
        image: null,
        likes: 678,
        liked: false,
        comments: 32,
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        features: {
          eyes: { name: 'Warm Hazel Natural', width: 14, height: 11, scale: 6, rotate: 0 },
          head: { name: 'Round Soft', scale: 7 },
          skinColor: { name: 'Warm Caramel' },
          eyebrows: { name: 'Full Natural Dark', width: 15, height: 5, scale: 7, rotate: 1, thickness: 5 },
          hair: { name: 'Curly Afro Black' }
        }
      }
    ];
  },

  // Get all posts
  getPosts() {
    const posts = localStorage.getItem(this.KEYS.POSTS);
    return posts ? JSON.parse(posts) : [];
  },

  // Get feature name (handles both formats)
  getFeatureName(feature) {
    if (!feature) return '';
    if (typeof feature === 'string') return feature;
    return feature.name || '';
  },

  // Get posts by category
  getPostsByCategory(category) {
    const posts = this.getPosts();
    if (!category || category === 'all') return posts;
    return posts.filter(post => {
      const feature = post.features?.[category];
      const name = this.getFeatureName(feature);
      return name && name.trim() !== '';
    });
  },

  // Get posts by author
  getPostsByAuthor(username) {
    const posts = this.getPosts();
    return posts.filter(post => post.author.toLowerCase() === username.toLowerCase());
  },

  // Search posts
  searchPosts(query) {
    const posts = this.getPosts();
    const lowerQuery = query.toLowerCase();
    return posts.filter(post => {
      if (post.title?.toLowerCase().includes(lowerQuery)) return true;
      if (post.caption?.toLowerCase().includes(lowerQuery)) return true;
      if (post.author.toLowerCase().includes(lowerQuery)) return true;
      return false;
    });
  },

  // Add post
  addPost(postData) {
    const posts = this.getPosts();
    const newPost = {
      id: 'post-' + Date.now(),
      likes: 0,
      liked: false,
      comments: 0,
      createdAt: new Date().toISOString(),
      ...postData
    };
    posts.unshift(newPost);
    localStorage.setItem(this.KEYS.POSTS, JSON.stringify(posts));
    return newPost;
  },

  // Get single post
  getPost(postId) {
    const posts = this.getPosts();
    return posts.find(post => post.id === postId);
  },

  // Delete post
  deletePost(postId) {
    const posts = this.getPosts().filter(p => p.id !== postId);
    localStorage.setItem(this.KEYS.POSTS, JSON.stringify(posts));
    return true;
  },

  // Toggle like on post
  toggleLike(postId) {
    const posts = this.getPosts();
    const post = posts.find(p => p.id === postId);
    if (post) {
      post.liked = !post.liked;
      post.likes = post.liked ? post.likes + 1 : Math.max(0, post.likes - 1);
      localStorage.setItem(this.KEYS.POSTS, JSON.stringify(posts));
      return post;
    }
    return null;
  },

  // ========== REELS ==========
  getReels() {
    const reels = localStorage.getItem(this.KEYS.REELS);
    return reels ? JSON.parse(reels) : this.getSampleReels();
  },

  getSampleReels() {
    return [
      {
        id: 'reel-1',
        author: 'AvaQueen',
        caption: 'Check out my new Avakin look! ✨ #avakin #style',
        music: 'Original Sound - AvaQueen',
        likes: 1234,
        liked: false,
        comments: 89,
        video: null,
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'reel-2',
        author: 'NightKing',
        caption: 'Dark vibes only 🖤 #darkmode #avakinlife',
        music: 'Trending Sound',
        likes: 856,
        liked: false,
        comments: 45,
        video: null,
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'reel-3',
        author: 'SweetAva',
        caption: 'Tutorial: How to get this look 💕 #tutorial #avakin',
        music: 'Pop Hits 2024',
        likes: 2100,
        liked: false,
        comments: 156,
        video: null,
        createdAt: new Date(Date.now() - 172800000).toISOString()
      }
    ];
  },

  addReel(reelData) {
    const reels = this.getReels();
    const newReel = {
      id: 'reel-' + Date.now(),
      likes: 0,
      liked: false,
      comments: 0,
      createdAt: new Date().toISOString(),
      ...reelData
    };
    reels.unshift(newReel);
    localStorage.setItem(this.KEYS.REELS, JSON.stringify(reels));
    return newReel;
  },

  getReelsByAuthor(username) {
    const reels = this.getReels();
    return reels.filter(reel => reel.author.toLowerCase() === username.toLowerCase());
  },

  // ========== CONVERSATIONS ==========
  getConversations() {
    const convs = localStorage.getItem(this.KEYS.CONVERSATIONS);
    return convs ? JSON.parse(convs) : [];
  },

  saveConversations(conversations) {
    localStorage.setItem(this.KEYS.CONVERSATIONS, JSON.stringify(conversations));
  },

  // ========== STORIES ==========
  getStories() {
    const stories = localStorage.getItem('avatimes_stories');
    return stories ? JSON.parse(stories) : this.getSampleStories();
  },

  getSampleStories() {
    return [
      { id: 'story-1', author: 'AvaQueen', avatar: 'A', viewed: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
      { id: 'story-2', author: 'NightKing', avatar: 'N', viewed: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
      { id: 'story-3', author: 'SweetAva', avatar: 'S', viewed: true, createdAt: new Date(Date.now() - 14400000).toISOString() }
    ];
  },

  addStory(storyData) {
    const stories = this.getStories();
    const newStory = {
      id: 'story-' + Date.now(),
      viewed: false,
      createdAt: new Date().toISOString(),
      ...storyData
    };
    stories.unshift(newStory);
    localStorage.setItem('avatimes_stories', JSON.stringify(stories));
    return newStory;
  },

  markStoryViewed(storyId) {
    const stories = this.getStories();
    const story = stories.find(s => s.id === storyId);
    if (story) {
      story.viewed = true;
      localStorage.setItem('avatimes_stories', JSON.stringify(stories));
    }
  }
};

// Initialize on load
DataManager.init();
