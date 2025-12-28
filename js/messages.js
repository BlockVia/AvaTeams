// ============================================
// AvaTimes - Messages
// Instagram-style Direct Messages & Groups
// ============================================

const Messages = {
    // Sample Data
    conversations: [],
    currentChat: null,

    // Load conversations
    loadConversations() {
        const saved = DataManager.getConversations();
        if (saved && saved.length > 0) {
            this.conversations = saved;
        } else {
            // Default sample conversations
            this.conversations = [
                {
                    id: 'conv-1',
                    type: 'direct',
                    name: 'AvaQueen',
                    avatar: 'A',
                    lastMessage: 'Hey! Love your new look 😍',
                    time: '2m',
                    unread: 1,
                    messages: [
                        { id: 1, sender: 'AvaQueen', text: 'Hey! Love your new look 😍', time: '10:30 AM', isMe: false },
                        { id: 2, sender: 'AvaQueen', text: 'Where did you get that outfit?', time: '10:31 AM', isMe: false }
                    ]
                },
                {
                    id: 'conv-2',
                    type: 'group',
                    name: 'Avakin Stylists',
                    avatar: '👥',
                    members: ['AvaQueen', 'NightKing', 'SweetAva'],
                    lastMessage: 'NightKing: Check this out!',
                    time: '1h',
                    unread: 0,
                    messages: [
                        { id: 1, sender: 'NightKing', text: 'Does anyone have the new wings?', time: '9:00 AM', isMe: false },
                        { id: 2, sender: 'SweetAva', text: 'Yes! They are amazing', time: '9:05 AM', isMe: false },
                        { id: 3, sender: 'me', text: 'I need to get them soon', time: '9:10 AM', isMe: true }
                    ]
                },
                {
                    id: 'conv-3',
                    type: 'direct',
                    name: 'NightKing',
                    avatar: 'N',
                    lastMessage: 'Are we doing the event later?',
                    time: '3h',
                    unread: 0,
                    messages: [
                        { id: 1, sender: 'NightKing', text: 'Are we doing the event later?', time: '3:00 PM', isMe: false }
                    ]
                },
                {
                    id: 'conv-4',
                    type: 'direct',
                    name: 'SweetAva',
                    avatar: 'S',
                    lastMessage: 'Thanks for the tips! 💕',
                    time: '1d',
                    unread: 0,
                    messages: [
                        { id: 1, sender: 'me', text: 'Try the new hair styles!', time: '2:00 PM', isMe: true },
                        { id: 2, sender: 'SweetAva', text: 'Thanks for the tips! 💕', time: '2:30 PM', isMe: false }
                    ]
                }
            ];
            this.saveConversations();
        }
    },

    // Save conversations
    saveConversations() {
        DataManager.saveConversations(this.conversations);
    },

    // Render conversation list
    renderList() {
        const container = document.querySelector('.conversation-list');
        if (!container) return;

        container.innerHTML = this.conversations.map(conv => `
      <div class="conversation-item ${conv.unread ? 'unread' : ''}" onclick="Messages.openChat('${conv.id}')">
        <div class="conv-avatar">
          ${conv.type === 'group' ? conv.avatar : conv.name.charAt(0)}
        </div>
        <div class="conv-info">
          <h4 class="conv-name">${conv.name}</h4>
          <p class="conv-last-message">
            ${conv.lastMessage}
            <span class="conv-time">· ${conv.time}</span>
          </p>
        </div>
        ${conv.unread ? `<div class="conv-badge"></div>` : ''}
      </div>
    `).join('');
    },

    // Open Chat
    openChat(id) {
        this.currentChat = this.conversations.find(c => c.id === id);

        // UI Updates
        document.querySelector('.messages-container').classList.add('chat-active');
        document.querySelector('.mobile-nav').style.display = 'none'; // Hide nav in chat on mobile

        // Header Info
        const chatHeader = document.querySelector('.chat-user');
        chatHeader.innerHTML = `
      <div class="chat-avatar-small">
        ${this.currentChat.type === 'group' ? this.currentChat.avatar : this.currentChat.name.charAt(0)}
      </div>
      <div class="chat-user-details">
        <h4>${this.currentChat.name}</h4>
        <span>${this.currentChat.type === 'group' ? this.currentChat.members.length + ' members' : 'Active now'}</span>
      </div>
    `;

        this.renderMessages();
    },

    // Close Chat
    closeChat() {
        this.currentChat = null;
        document.querySelector('.messages-container').classList.remove('chat-active');
        document.querySelector('.mobile-nav').style.display = 'flex';
    },

    // Render Messages
    renderMessages() {
        const container = document.getElementById('chat-messages');
        if (!this.currentChat) return;

        container.innerHTML = this.currentChat.messages.map(msg => `
      <div class="message ${msg.isMe ? 'message-own' : ''}">
        ${!msg.isMe && this.currentChat.type === 'group' ? `<span class="message-sender">${msg.sender}</span>` : ''}
        <div class="message-bubble">
          ${msg.text}
        </div>
        <div class="message-time">${msg.time}</div>
      </div>
    `).join('');

        container.scrollTop = container.scrollHeight;
    },

    // Send Message
    sendMessage() {
        const input = document.getElementById('message-input');
        const text = input.value.trim();
        if (!text || !this.currentChat) return;

        // Add message
        this.currentChat.messages.push({
            id: Date.now(),
            sender: 'me',
            text: text,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true
        });

        // Update last message
        this.currentChat.lastMessage = `You: ${text}`;
        this.currentChat.time = 'Now';

        input.value = '';
        this.renderMessages();
        this.renderList();
        this.saveConversations();

        // Simulate reply after 2 seconds (for demo)
        if (this.currentChat.type === 'direct') {
            setTimeout(() => {
                this.simulateReply();
            }, 2000);
        }
    },

    // Simulate a reply (for demo purposes)
    simulateReply() {
        if (!this.currentChat) return;
        
        const replies = [
            'That sounds great! 😊',
            'I love it!',
            'Thanks for sharing ❤️',
            'Cool! Tell me more',
            'Awesome 🔥',
            'Can\'t wait to see!',
            'Nice one! 👍'
        ];
        
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        
        this.currentChat.messages.push({
            id: Date.now(),
            sender: this.currentChat.name,
            text: randomReply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: false
        });

        this.currentChat.lastMessage = randomReply;
        this.currentChat.time = 'Now';
        
        this.renderMessages();
        this.renderList();
        this.saveConversations();
    },

    handleKeyPress(e) {
        if (e.key === 'Enter') this.sendMessage();
    },

    // Create Group Modal
    showCreateGroup() {
        document.getElementById('create-group-modal').classList.add('active');
    },

    hideCreateGroup() {
        document.getElementById('create-group-modal').classList.remove('active');
    },

    createGroup() {
        const nameInput = document.getElementById('group-name');
        const checkboxes = document.querySelectorAll('.member-checkbox input:checked');

        if (!nameInput.value) {
            UI.showAlert('Group Name Required', 'Please enter a group name');
            return;
        }

        const members = Array.from(checkboxes).map(cb => cb.value);
        members.push('Me');

        const newGroup = {
            id: 'conv-' + Date.now(),
            type: 'group',
            name: nameInput.value.trim(),
            avatar: Icons.profile,
            members: members,
            lastMessage: 'Group created',
            time: 'Now',
            unread: 0,
            messages: []
        };

        this.conversations.unshift(newGroup);
        this.renderList();
        this.hideCreateGroup();
        this.openChat(newGroup.id);
    },

    // Show new chat (placeholder for now)
    showNewChat() {
        this.showCreateGroup(); // Reuse group modal for demo
    },

    init() {
        this.loadConversations();
        this.renderList();

        // Show empty state or chat area based on screen size
        const chatArea = document.getElementById('chat-area');
        const chatEmpty = document.getElementById('chat-empty');
        
        if (window.innerWidth > 768) {
            if (chatEmpty) chatEmpty.style.display = 'flex';
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Messages.init();
});
