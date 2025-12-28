// ============================================
// AvaTimes - Post Creation
// Create photo posts with captions
// ============================================

const PostCreate = {
    imageFile: null,
    imageBase64: null,

    // Initialize
    init() {
        if (!Auth.requireAuth()) return;
    },

    // Handle image selection
    handleImageSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.processImage(file);
        }
    },

    // Process image and convert to Base64
    processImage(file) {
        this.imageFile = file;

        const reader = new FileReader();
        reader.onload = (e) => {
            this.imageBase64 = e.target.result;
            
            const preview = document.getElementById('image-preview');
            const prompt = document.getElementById('image-prompt');
            const previewImg = document.getElementById('preview-img');

            if (preview) preview.style.display = 'block';
            if (prompt) prompt.style.display = 'none';
            if (previewImg) previewImg.src = this.imageBase64;
        };
        reader.readAsDataURL(file);
    },

    // Remove image
    removeImage(event) {
        event.stopPropagation();

        this.imageFile = null;
        this.imageBase64 = null;

        const preview = document.getElementById('image-preview');
        const prompt = document.getElementById('image-prompt');

        if (preview) preview.style.display = 'none';
        if (prompt) prompt.style.display = 'block';
    },

    // Handle form submit
    handleSubmit(event) {
        event.preventDefault();

        const caption = document.getElementById('post-caption')?.value.trim() || '';
        const location = document.getElementById('post-location')?.value.trim() || '';

        if (!caption && !this.imageBase64) {
            this.showAlert('Please add a photo or caption', 'error');
            return;
        }

        const user = Auth.getCurrentUser();
        if (!user) {
            this.showAlert('Please login to create a post', 'error');
            return;
        }

        // Create post with Base64 image
        const post = {
            id: 'post-' + Date.now(),
            author: user.username,
            caption: caption,
            location: location,
            image: this.imageBase64,
            likes: 0,
            liked: false,
            comments: 0,
            createdAt: new Date().toISOString()
        };

        // Save post
        let posts = DataManager.getPosts();
        posts.unshift(post);
        localStorage.setItem(DataManager.KEYS.POSTS, JSON.stringify(posts));

        this.showAlert('Post shared!', 'success');

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    },

    // Show alert
    showAlert(message, type) {
        const alert = document.getElementById('post-alert');
        if (alert) {
            alert.textContent = message;
            alert.className = `alert alert-${type}`;
            alert.style.display = 'block';
        }
    }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('post-form')) {
        PostCreate.init();
    }
});
