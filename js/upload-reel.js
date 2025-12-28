// ============================================
// AvaTimes - Reel Upload
// Handle video upload and preview
// ============================================

const ReelUpload = {
    selectedFile: null,

    handleVideoSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.processFile(file);
        }
    },

    processFile(file) {
        this.selectedFile = file;

        // Create preview URL
        const url = URL.createObjectURL(file);
        const video = document.getElementById('video-preview');
        video.src = url;

        // UI Updates
        document.getElementById('upload-prompt').style.display = 'none';
        document.getElementById('upload-preview').style.display = 'block';
        document.getElementById('video-info').style.display = 'flex';
        document.getElementById('upload-btn').disabled = false;

        // Show Metadata
        this.updateMetadata(file);

        // Auto-play preview
        video.play().catch(e => console.log('Autoplay prevented'));
    },

    updateMetadata(file) {
        document.getElementById('video-size').textContent = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
        document.getElementById('video-format').textContent = file.type.split('/')[1].toUpperCase();

        const video = document.getElementById('video-preview');
        video.onloadedmetadata = () => {
            const duration = Math.round(video.duration);
            document.getElementById('video-duration').textContent = `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`;
        };
    },

    removeVideo(event) {
        event.stopPropagation();
        this.selectedFile = null;

        const video = document.getElementById('video-preview');
        video.pause();
        video.src = '';

        document.getElementById('upload-preview').style.display = 'none';
        document.getElementById('upload-prompt').style.display = 'flex';
        document.getElementById('video-info').style.display = 'none';
        document.getElementById('upload-btn').disabled = true;
    },

    // Upload Simulation
    upload() {
        const btn = document.getElementById('upload-btn');
        const progressArea = document.getElementById('upload-progress');
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-percent');

        btn.style.display = 'none';
        progressArea.style.display = 'block';

        let progress = 0;
        const interval = setInterval(() => {
            progress += 5;

            // Update UI
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `${progress}%`;

            if (progress >= 100) {
                clearInterval(interval);
                this.finishUpload();
            }
        }, 100);
    },

    finishUpload() {
        const alertEl = document.getElementById('upload-alert');
        
        // Check if user is logged in
        const user = Auth.getCurrentUser();
        if (!user) {
            alertEl.textContent = 'Please login to upload a reel';
            alertEl.className = 'alert alert-error';
            alertEl.style.display = 'block';
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
            return;
        }

        alertEl.textContent = 'Reel uploaded successfully! 🎉';
        alertEl.className = 'alert alert-success';
        alertEl.style.display = 'block';

        // Save Reel Data
        const caption = document.getElementById('reel-caption').value.trim() || 'Check out my new reel! ✨';
        const music = document.getElementById('reel-music').value.trim() || 'Original Audio - ' + user.username;

        const newReel = {
            author: user.username,
            caption: caption,
            music: music,
            video: null // Blob URLs don't persist in localStorage
        };

        DataManager.addReel(newReel);

        setTimeout(() => {
            window.location.href = 'reels.html';
        }, 1500);
    }
};

// Form Handler
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('reel-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            ReelUpload.upload();
        });
    }
});
