// ============================================
// AvaTimes - Notifications System
// Handles user notifications
// ============================================

const Notifications = {
    // Get notifications from storage
    getNotifications() {
        const notifs = localStorage.getItem('avatimes_notifications');
        return notifs ? JSON.parse(notifs) : this.getSampleNotifications();
    },

    // Save notifications
    saveNotifications(notifications) {
        localStorage.setItem('avatimes_notifications', JSON.stringify(notifications));
    },

    // Sample notifications for demo
    getSampleNotifications() {
        return [
            {
                id: 'notif-1',
                type: 'like',
                user: 'AvaQueen',
                text: 'liked your post',
                time: '2m ago',
                unread: true,
                postId: 'post-1'
            },
            {
                id: 'notif-2',
                type: 'follow',
                user: 'NightKing',
                text: 'started following you',
                time: '1h ago',
                unread: true
            },
            {
                id: 'notif-3',
                type: 'comment',
                user: 'SweetAva',
                text: 'commented: "Love this look! 💕"',
                time: '3h ago',
                unread: false,
                postId: 'post-2'
            },
            {
                id: 'notif-4',
                type: 'like',
                user: 'EarthChild',
                text: 'liked your reel',
                time: '5h ago',
                unread: false
            },
            {
                id: 'notif-5',
                type: 'mention',
                user: 'AvaQueen',
                text: 'mentioned you in a comment',
                time: '1d ago',
                unread: false
            },
            {
                id: 'notif-6',
                type: 'follow',
                user: 'StarGazer',
                text: 'started following you',
                time: '2d ago',
                unread: false
            }
        ];
    },

    // Render notifications
    render() {
        const container = document.getElementById('notifications-list');
        if (!container) return;

        const notifications = this.getNotifications();

        if (notifications.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🔔</div>
                    <h3>No notifications</h3>
                    <p>When someone interacts with your content, you'll see it here.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = notifications.map(notif => this.renderNotification(notif)).join('');
    },

    // Render single notification
    renderNotification(notif) {
        const unreadClass = notif.unread ? 'unread' : '';
        const actionButton = notif.type === 'follow' 
            ? `<button class="btn btn-primary btn-sm notif-action" onclick="Notifications.followBack('${notif.user}')">Follow</button>`
            : '';

        return `
            <div class="notification-item ${unreadClass}" onclick="Notifications.handleClick('${notif.id}')">
                <div class="notif-avatar">${notif.user.charAt(0).toUpperCase()}</div>
                <div class="notif-content">
                    <p class="notif-text"><strong>${notif.user}</strong> ${notif.text}</p>
                    <span class="notif-time">${notif.time}</span>
                </div>
                ${actionButton}
            </div>
        `;
    },

    // Handle notification click
    handleClick(notifId) {
        const notifications = this.getNotifications();
        const notif = notifications.find(n => n.id === notifId);
        
        if (notif) {
            // Mark as read
            notif.unread = false;
            this.saveNotifications(notifications);
            
            // Navigate based on type
            if (notif.postId) {
                window.location.href = 'index.html';
            } else if (notif.type === 'follow') {
                window.location.href = `profile.html?user=${notif.user}`;
            }
        }
    },

    // Follow back action
    followBack(username) {
        event.stopPropagation();
        UI.showToast(`You are now following @${username}!`, 'success');
        
        // Update button
        const btn = event.target;
        btn.textContent = 'Following';
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-secondary');
        btn.disabled = true;
    },

    // Add new notification
    addNotification(notification) {
        const notifications = this.getNotifications();
        const newNotif = {
            id: 'notif-' + Date.now(),
            time: 'Just now',
            unread: true,
            ...notification
        };
        notifications.unshift(newNotif);
        this.saveNotifications(notifications);
        return newNotif;
    },

    // Mark all as read
    markAllRead() {
        const notifications = this.getNotifications();
        notifications.forEach(n => n.unread = false);
        this.saveNotifications(notifications);
        this.render();
    },

    // Get unread count
    getUnreadCount() {
        const notifications = this.getNotifications();
        return notifications.filter(n => n.unread).length;
    },

    // Initialize
    init() {
        this.render();
    }
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('notifications-list')) {
        Notifications.init();
    }
});
