// ============================================
// AvaTimes - Settings
// Handle app settings and preferences
// ============================================

const Settings = {
    // Load saved settings
    loadSettings() {
        const settings = localStorage.getItem('avatimes_settings');
        return settings ? JSON.parse(settings) : {
            notifications: true,
            darkMode: true,
            language: 'en'
        };
    },

    // Save settings
    saveSettings(settings) {
        localStorage.setItem('avatimes_settings', JSON.stringify(settings));
    },

    // Edit profile - redirect to profile page
    editProfile() {
        window.location.href = 'profile.html';
    },

    // Change password
    changePassword() {
        UI.prompt('Change Password', 'Enter current password:', (currentPassword) => {
            if (!currentPassword) return;

            UI.prompt('Change Password', 'Enter new password (min 6 characters):', (newPassword) => {
                if (!newPassword || newPassword.length < 6) {
                    UI.showAlert('Invalid Password', 'Password must be at least 6 characters');
                    return;
                }

                UI.prompt('Confirm Password', 'Confirm new password:', (confirmPassword) => {
                    if (newPassword !== confirmPassword) {
                        UI.showAlert('Password Mismatch', 'Passwords do not match');
                        return;
                    }

                    // Get current user
                    const user = Auth.getCurrentUser();
                    if (!user) {
                        UI.showAlert('Login Required', 'Please login first');
                        return;
                    }

                    // Update password in users list
                    const users = Auth.getUsers();
                    const userIndex = users.findIndex(u => u.id === user.id);
                    
                    if (userIndex !== -1) {
                        if (users[userIndex].password !== currentPassword) {
                            UI.showAlert('Incorrect Password', 'Current password is incorrect');
                            return;
                        }
                        users[userIndex].password = newPassword;
                        localStorage.setItem(DataManager.KEYS.USERS, JSON.stringify(users));
                        UI.showToast('Password updated successfully!', 'success');
                    }
                });
            });
        });
    },

    // Privacy settings
    privacy() {
        UI.confirm(
            'Privacy Settings', 
            'Choose your account privacy:', 
            null,
            'Private Account', 
            () => {
                const settings = this.loadSettings();
                settings.privateAccount = true;
                this.saveSettings(settings);
                UI.showToast('Your account is now private', 'success');
            },
            'Public Account', 
            () => {
                const settings = this.loadSettings();
                settings.privateAccount = false;
                this.saveSettings(settings);
                UI.showToast('Your account is now public', 'success');
            }
        );
    },

    // Toggle notifications
    toggleNotifications() {
        const toggle = document.getElementById('toggle-notifications');
        const settings = this.loadSettings();
        settings.notifications = toggle.checked;
        this.saveSettings(settings);
        
        if (toggle.checked) {
            UI.showToast('Push notifications enabled', 'success');
        } else {
            UI.showToast('Push notifications disabled', 'info');
        }
    },

    // Toggle dark mode
    toggleDarkMode() {
        const toggle = document.getElementById('toggle-darkmode');
        const settings = this.loadSettings();
        settings.darkMode = toggle.checked;
        this.saveSettings(settings);
        
        // Apply dark mode (already dark by default)
        if (!toggle.checked) {
            UI.showToast('Light mode is not available yet. Stay tuned!', 'info');
            toggle.checked = true;
        }
    },

    // Change language
    changeLanguage() {
        const langMap = {
            'en': { code: 'en', name: 'English', dir: 'ltr' },
            'ar': { code: 'ar', name: 'العربية', dir: 'rtl' },
            'es': { code: 'es', name: 'Español', dir: 'ltr' },
            'fr': { code: 'fr', name: 'Français', dir: 'ltr' }
        };

        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.style.zIndex = '10000';
        modal.innerHTML = `
            <div class="modal" style="max-width: 350px;">
                <div class="modal-header">
                    <h3>Select Language</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    ${Object.entries(langMap).map(([key, lang]) => `
                        <button class="btn btn-secondary" onclick="Settings.selectLanguage('${key}')" style="width: 100%; margin-bottom: 10px; text-align: left;">
                            ${lang.name}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
    },

    // Select language helper
    selectLanguage(key) {
        const langMap = {
            'en': { code: 'en', name: 'English', dir: 'ltr' },
            'ar': { code: 'ar', name: 'العربية', dir: 'rtl' },
            'es': { code: 'es', name: 'Español', dir: 'ltr' },
            'fr': { code: 'fr', name: 'Français', dir: 'ltr' }
        };

        const lang = langMap[key];
        if (!lang) return;

        const settings = this.loadSettings();
        settings.language = lang.code;
        settings.languageName = lang.name;
        settings.direction = lang.dir;
        this.saveSettings(settings);
        
        document.getElementById('current-lang').textContent = lang.name;
        document.documentElement.dir = lang.dir;
        document.documentElement.lang = lang.code;
        
        document.querySelectorAll('.modal-overlay').forEach(m => m.remove());
        UI.showToast(`Language changed to ${lang.name}`, 'success');
    },

    // Help center
    help() {
        const helpTopics = `
            <div style="text-align: left; line-height: 1.8;">
                <h3 style="margin-bottom: 15px;">AvaTimes Help Center</h3>
                <div style="margin-bottom: 15px;">
                    <strong>📱 Getting Started</strong>
                    <ul style="margin: 5px 0; padding-left: 20px;">
                        <li>Create an account or login</li>
                        <li>Complete your profile</li>
                        <li>Start posting and connecting!</li>
                    </ul>
                </div>
                <div style="margin-bottom: 15px;">
                    <strong>📸 Creating Content</strong>
                    <ul style="margin: 5px 0; padding-left: 20px;">
                        <li>Share Looks: Share your Avakin character details</li>
                        <li>Posts: Share photos with captions</li>
                        <li>Reels: Upload short videos</li>
                    </ul>
                </div>
                <div style="margin-bottom: 15px;">
                    <strong>💬 Messaging</strong>
                    <ul style="margin: 5px 0; padding-left: 20px;">
                        <li>Direct messages with friends</li>
                        <li>Create group chats</li>
                    </ul>
                </div>
                <div style="margin-bottom: 15px;">
                    <strong>🔒 Privacy & Safety</strong>
                    <ul style="margin: 5px 0; padding-left: 20px;">
                        <li>Report inappropriate content</li>
                        <li>Block unwanted users</li>
                    </ul>
                </div>
                <p style="margin-top: 15px; color: var(--text-muted);">
                    For more help, contact: <strong>support@avatimes.com</strong>
                </p>
            </div>
        `;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.style.zIndex = '10000';
        modal.innerHTML = `
            <div class="modal" style="max-width: 450px; max-height: 80vh; overflow-y: auto;">
                <div class="modal-header">
                    <h3>Help Center</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    ${helpTopics}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
    },

    // Report problem
    report() {
        UI.prompt('Report a Problem', 'Describe the problem you\'re experiencing:', (problem) => {
            if (problem && problem.trim()) {
                const ref = '#' + Date.now();
                UI.showAlert('Report Submitted', `Thank you for your report! Our team will look into this issue.\n\nReference: ${ref}`, () => {
                    UI.showToast('Report sent successfully', 'success');
                });
            }
        }, 'Describe the issue...');
    },

    // About
    about() {
        const aboutText = `
            <div style="text-align: center; line-height: 1.8;">
                <h2 style="margin-bottom: 10px; background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">✨ AvaTimes ✨</h2>
                <p style="color: var(--text-muted); margin-bottom: 20px;">Version 1.0.0</p>
                <p style="margin-bottom: 15px;">The social platform for Avakin Life players.</p>
                <p style="margin-bottom: 20px;">Share your looks, connect with friends,<br>and express yourself!</p>
                <hr style="border: none; border-top: var(--border-glass); margin: 20px 0;">
                <p style="color: var(--text-muted); font-size: 0.9rem;">© 2024 AvaTimes</p>
                <p style="color: var(--text-muted); font-size: 0.9rem;">Made with 💜 for the Avakin community</p>
            </div>
        `;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay active';
        modal.style.zIndex = '10000';
        modal.innerHTML = `
            <div class="modal" style="max-width: 400px;">
                <div class="modal-header">
                    <h3>About</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
                </div>
                <div class="modal-body">
                    ${aboutText}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.onclick = (e) => {
            if (e.target === modal) modal.remove();
        };
    },

    // Logout
    logout() {
        UI.confirm('Log Out', 'Are you sure you want to log out?', () => {
            Auth.logout();
        });
    },

    // Delete account
    deleteAccount() {
        UI.confirm('Delete Account', 'Are you sure you want to delete your account?\n\nThis action cannot be undone!', () => {
            UI.prompt('Confirm Deletion', 'Type "DELETE" to confirm account deletion:', (confirm2) => {
                if (confirm2 !== 'DELETE') {
                    UI.showToast('Account deletion cancelled', 'info');
                    return;
                }

        const user = Auth.getCurrentUser();
        if (!user) return;

        // Remove user from users list
        const users = Auth.getUsers().filter(u => u.id !== user.id);
        localStorage.setItem(DataManager.KEYS.USERS, JSON.stringify(users));

        // Remove user's posts
        const posts = DataManager.getPosts().filter(p => p.author !== user.username);
        localStorage.setItem(DataManager.KEYS.POSTS, JSON.stringify(posts));

                // Logout
                localStorage.removeItem(DataManager.KEYS.CURRENT_USER);
                
                UI.showAlert('Account Deleted', 'Your account has been deleted. We\'re sorry to see you go!', () => {
                    window.location.href = 'index.html';
                });
            }, 'Type DELETE here');
        });
    },

    // Initialize settings page
    init() {
        const settings = this.loadSettings();
        
        // Apply saved settings
        const notifToggle = document.getElementById('toggle-notifications');
        const darkToggle = document.getElementById('toggle-darkmode');
        const langSpan = document.getElementById('current-lang');
        
        if (notifToggle) notifToggle.checked = settings.notifications;
        if (darkToggle) darkToggle.checked = settings.darkMode;
        if (langSpan && settings.languageName) langSpan.textContent = settings.languageName;
        
        // Apply RTL if needed
        if (settings.direction === 'rtl') {
            document.documentElement.dir = 'rtl';
        }
    }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    Settings.init();
});
