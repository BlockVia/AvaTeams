// ============================================
// AvaFaces - Post Creation
// Handles creating new face posts with measurements
// ============================================

// Toggle accordion sections
function toggleAccordion(button) {
    const accordion = button.parentElement;
    const wasActive = accordion.classList.contains('active');

    // Close all accordions first (optional: comment out for multiple open)
    document.querySelectorAll('.feature-accordion').forEach(acc => {
        acc.classList.remove('active');
    });

    // Toggle the clicked one
    if (!wasActive) {
        accordion.classList.add('active');
    }
}

const CreatePost = {
    // Initialize create form
    init() {
        // Check authentication
        if (!Auth.requireAuth()) return;

        const form = document.getElementById('create-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Initialize slider value displays
        this.initSliders();
    },

    // Initialize all sliders to update their value display
    initSliders() {
        const sliders = document.querySelectorAll('.slider-input');
        sliders.forEach(slider => {
            // Set initial value display
            const valSpan = document.getElementById(slider.id + '-val');
            if (valSpan) {
                valSpan.textContent = slider.value;
            }

            // Update on change
            slider.addEventListener('input', (e) => {
                const valSpan = document.getElementById(e.target.id + '-val');
                if (valSpan) {
                    valSpan.textContent = e.target.value;
                }
            });
        });
    },

    // Get value from input, return empty string if not filled
    getValue(id) {
        const el = document.getElementById(id);
        return el ? el.value.trim() : '';
    },

    // Get slider value
    getSliderValue(id) {
        const el = document.getElementById(id);
        if (!el) return null;
        return parseInt(el.value, 10);
    },

    // Handle form submission
    handleSubmit() {
        const title = this.getValue('post-title');

        // Validate title
        if (!title) {
            this.showAlert('Please enter a title for your look', 'error');
            return;
        }

        // Collect all features with measurements
        const features = {
            eyes: {
                name: this.getValue('feature-eyes'),
                width: this.getSliderValue('eyes-width'),
                height: this.getSliderValue('eyes-height'),
                scale: this.getSliderValue('eyes-scale'),
                rotate: this.getSliderValue('eyes-rotate')
            },
            head: {
                name: this.getValue('feature-head'),
                scale: this.getSliderValue('head-scale')
            },
            skinColor: {
                name: this.getValue('feature-skin')
            },
            eyebrows: {
                name: this.getValue('feature-eyebrows'),
                width: this.getSliderValue('eyebrows-width'),
                height: this.getSliderValue('eyebrows-height'),
                scale: this.getSliderValue('eyebrows-scale'),
                rotate: this.getSliderValue('eyebrows-rotate'),
                thickness: this.getSliderValue('eyebrows-thickness')
            },
            mouth: {
                name: this.getValue('feature-mouth'),
                height: this.getSliderValue('mouth-height'),
                scale: this.getSliderValue('mouth-scale')
            },
            ears: {
                name: this.getValue('feature-ears')
            },
            beard: {
                name: this.getValue('feature-beard'),
                color: this.getValue('beard-color')
            },
            hair: {
                name: this.getValue('feature-hair')
            },
            contour: {
                name: this.getValue('feature-contour'),
                height: this.getSliderValue('contour-height'),
                scale: this.getSliderValue('contour-scale')
            }
        };

        // Check at least one feature name is filled
        const hasFeature = Object.values(features).some(f => f.name && f.name !== '');

        if (!hasFeature) {
            this.showAlert('Please fill in at least one feature', 'error');
            return;
        }

        // Get current user
        const user = Auth.getCurrentUser();
        if (!user) {
            this.showAlert('You must be logged in to create a post', 'error');
            return;
        }

        // Create post
        const post = DataManager.addPost({
            title,
            author: user.username,
            features
        });

        // Show success and redirect
        this.showAlert('Your look has been shared!', 'success');

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    },

    // Show alert message
    showAlert(message, type) {
        const alertEl = document.getElementById('create-alert');
        if (!alertEl) return;

        alertEl.textContent = message;
        alertEl.className = `alert alert-${type}`;
        alertEl.style.display = 'block';

        if (type === 'error') {
            setTimeout(() => {
                alertEl.style.display = 'none';
            }, 3000);
        }
    }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('create-form')) {
        CreatePost.init();
    }
});
