// ============================================
// AvaFaces - Authentication System
// Handles user registration, login, logout
// ============================================

const Auth = {
    // Get all registered users
    getUsers() {
        const users = localStorage.getItem(DataManager.KEYS.USERS);
        return users ? JSON.parse(users) : [];
    },

    // Get current logged in user
    getCurrentUser() {
        const user = localStorage.getItem(DataManager.KEYS.CURRENT_USER);
        return user ? JSON.parse(user) : null;
    },

    // Check if user is logged in
    isLoggedIn() {
        return this.getCurrentUser() !== null;
    },

    // Register a new user
    register(username, email, password) {
        const users = this.getUsers();

        // Validate
        if (!username || !email || !password) {
            return { success: false, error: 'All fields are required' };
        }

        if (username.length < 3) {
            return { success: false, error: 'Username must be at least 3 characters' };
        }

        if (password.length < 6) {
            return { success: false, error: 'Password must be at least 6 characters' };
        }

        // Check if username exists
        if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
            return { success: false, error: 'Username already taken' };
        }

        // Check if email exists
        if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            return { success: false, error: 'Email already registered' };
        }

        // Create user
        const newUser = {
            id: 'user-' + Date.now(),
            username,
            email,
            password, // In real app, this should be hashed
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem(DataManager.KEYS.USERS, JSON.stringify(users));

        // Auto login
        const { password: _, ...userWithoutPassword } = newUser;
        localStorage.setItem(DataManager.KEYS.CURRENT_USER, JSON.stringify(userWithoutPassword));

        return { success: true, user: userWithoutPassword };
    },

    // Login user
    login(emailOrUsername, password) {
        const users = this.getUsers();

        // Validate
        if (!emailOrUsername || !password) {
            return { success: false, error: 'All fields are required' };
        }

        // Find user
        const user = users.find(u =>
            (u.email.toLowerCase() === emailOrUsername.toLowerCase() ||
                u.username.toLowerCase() === emailOrUsername.toLowerCase()) &&
            u.password === password
        );

        if (!user) {
            return { success: false, error: 'Invalid credentials' };
        }

        // Set current user (without password)
        const { password: _, ...userWithoutPassword } = user;
        localStorage.setItem(DataManager.KEYS.CURRENT_USER, JSON.stringify(userWithoutPassword));

        return { success: true, user: userWithoutPassword };
    },

    // Logout user
    logout() {
        localStorage.removeItem(DataManager.KEYS.CURRENT_USER);
        window.location.href = 'index.html';
    },

    // Protect page - redirect to login if not authenticated
    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    },

    // Update navigation based on auth state
    updateNav() {
        const authNav = document.getElementById('auth-nav');
        const userNav = document.getElementById('user-nav');

        if (!authNav || !userNav) return;

        if (this.isLoggedIn()) {
            const user = this.getCurrentUser();
            authNav.style.display = 'none';
            userNav.style.display = 'flex';

            const userAvatar = userNav.querySelector('.user-avatar-small');
            if (userAvatar) {
                userAvatar.textContent = user.username.charAt(0).toUpperCase();
            }

            const userName = userNav.querySelector('.user-name');
            if (userName) {
                userName.textContent = user.username;
            }
        } else {
            authNav.style.display = 'flex';
            userNav.style.display = 'none';
        }
    }
};

// Update nav on page load
document.addEventListener('DOMContentLoaded', () => {
    Auth.updateNav();
});
