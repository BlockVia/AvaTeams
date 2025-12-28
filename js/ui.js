// ============================================
// AvaTimes - UI Utilities
// Custom modals, toasts, and interactions
// ============================================

const UI = {
    // Create and append toast container if not exists
    init() {
        if (!document.getElementById('toast-container')) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            container.style.cssText = `
                position: fixed;
                top: 80px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: none;
                width: 90%;
                max-width: 350px;
            `;
            document.body.appendChild(container);
        }
    },

    // Show a toast notification
    showToast(message, type = 'info') {
        this.init();

        const toast = document.createElement('div');

        // Colors/Icons based on type
        let bg = 'rgba(30, 30, 50, 0.95)';
        let border = 'var(--border-glass)';
        let icon = Icons.info || 'ℹ️'; // Default

        if (type === 'error') {
            bg = 'rgba(50, 20, 20, 0.95)';
            border = '1px solid rgba(239, 68, 68, 0.3)';
            icon = '✕';
        } else if (type === 'success') {
            border = '1px solid rgba(34, 197, 94, 0.3)';
            icon = Icons.check || '✓';
        }

        toast.style.cssText = `
            background: ${bg};
            border: ${border};
            backdrop-filter: blur(10px);
            padding: 12px 16px;
            border-radius: 12px;
            color: white;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            opacity: 0;
            transform: translateY(-20px);
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            pointer-events: auto;
        `;

        // Use SVG if available in Icons object, otherwise text
        const iconHtml = (typeof icon === 'string' && icon.startsWith('<svg')) ? icon : `<span>${icon}</span>`;

        toast.innerHTML = `
            <span style="color: ${type === 'error' ? '#ef4444' : '#22c55e'}; font-weight:bold; display:flex;">${iconHtml}</span>
            <span>${message}</span>
        `;

        // Fix icon size if svg
        const svg = toast.querySelector('svg');
        if (svg) {
            svg.style.width = '20px';
            svg.style.height = '20px';
        }

        document.getElementById('toast-container').appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        });

        // Remove after 3s
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(-20px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // Show a custom modal alert
    showAlert(title, message, callback) {
        // Remove existing alert if any
        const existing = document.getElementById('custom-alert-modal');
        if (existing) existing.remove();

        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'custom-alert-modal';
        modalOverlay.className = 'modal-overlay active';
        modalOverlay.style.zIndex = '10000';

        modalOverlay.innerHTML = `
            <div class="modal" style="max-width: 300px; text-align: center;">
                <div class="modal-header" style="justify-content: center; border: none; padding-bottom: 5px;">
                    <h3>${title}</h3>
                </div>
                <div class="modal-body">
                    <p style="color: var(--text-secondary); margin-bottom: 20px;">${message}</p>
                    <button class="btn btn-primary" id="alert-ok-btn" style="width: 100%;">OK</button>
                </div>
            </div>
        `;

        document.body.appendChild(modalOverlay);

        // Close on click
        const btn = document.getElementById('alert-ok-btn');
        btn.onclick = () => {
            modalOverlay.classList.remove('active');
            setTimeout(() => modalOverlay.remove(), 300);
            if (callback) callback();
        };
    },

    // Confirm Dialog
    confirm(title, message, onConfirm, option1Label, onOption1, option2Label, onOption2) {
        // Remove existing
        const existing = document.getElementById('custom-confirm-modal');
        if (existing) existing.remove();

        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'custom-confirm-modal';
        modalOverlay.className = 'modal-overlay active';
        modalOverlay.style.zIndex = '10000';

        // If two options provided, show them instead of confirm/cancel
        if (option1Label && option2Label) {
            modalOverlay.innerHTML = `
                <div class="modal" style="max-width: 350px; text-align: center;">
                    <div class="modal-header" style="justify-content: center; border: none; padding-bottom: 5px;">
                        <h3>${title}</h3>
                    </div>
                    <div class="modal-body">
                        <p style="color: var(--text-secondary); margin-bottom: 20px;">${message}</p>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            <button class="btn btn-primary" id="confirm-option1-btn" style="width: 100%;">${option1Label}</button>
                            <button class="btn btn-secondary" id="confirm-option2-btn" style="width: 100%;">${option2Label}</button>
                            <button class="btn" id="confirm-cancel-btn" style="width: 100%; background: var(--bg-input); margin-top: 10px;">Cancel</button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modalOverlay);

            document.getElementById('confirm-option1-btn').onclick = () => {
                modalOverlay.classList.remove('active');
                setTimeout(() => modalOverlay.remove(), 300);
                if (onOption1) onOption1();
            };

            document.getElementById('confirm-option2-btn').onclick = () => {
                modalOverlay.classList.remove('active');
                setTimeout(() => modalOverlay.remove(), 300);
                if (onOption2) onOption2();
            };

            document.getElementById('confirm-cancel-btn').onclick = () => {
                modalOverlay.classList.remove('active');
                setTimeout(() => modalOverlay.remove(), 300);
            };
        } else {
            // Standard confirm dialog
            modalOverlay.innerHTML = `
                <div class="modal" style="max-width: 300px; text-align: center;">
                    <div class="modal-header" style="justify-content: center; border: none; padding-bottom: 5px;">
                        <h3>${title}</h3>
                    </div>
                    <div class="modal-body">
                        <p style="color: var(--text-secondary); margin-bottom: 20px;">${message}</p>
                        <div style="display: flex; gap: 10px;">
                            <button class="btn" id="confirm-cancel-btn" style="flex: 1; background: var(--bg-input);">Cancel</button>
                            <button class="btn btn-primary" id="confirm-ok-btn" style="flex: 1;">Confirm</button>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modalOverlay);

            document.getElementById('confirm-cancel-btn').onclick = () => {
                modalOverlay.classList.remove('active');
                setTimeout(() => modalOverlay.remove(), 300);
            };

            document.getElementById('confirm-ok-btn').onclick = () => {
                modalOverlay.classList.remove('active');
                setTimeout(() => modalOverlay.remove(), 300);
                if (onConfirm) onConfirm();
            };
        }
    },

    // Prompt Dialog
    prompt(title, message, callback, placeholder = '') {
        // Remove existing
        const existing = document.getElementById('custom-prompt-modal');
        if (existing) existing.remove();

        const modalOverlay = document.createElement('div');
        modalOverlay.id = 'custom-prompt-modal';
        modalOverlay.className = 'modal-overlay active';
        modalOverlay.style.zIndex = '10000';

        modalOverlay.innerHTML = `
            <div class="modal" style="max-width: 300px; text-align: center;">
                <div class="modal-header" style="justify-content: center; border: none; padding-bottom: 5px;">
                    <h3>${title}</h3>
                </div>
                <div class="modal-body">
                    <p style="color: var(--text-secondary); margin-bottom: 15px;">${message}</p>
                    <input type="text" id="prompt-input" class="form-input" placeholder="${placeholder}" style="margin-bottom: 15px;">
                    <div style="display: flex; gap: 10px;">
                        <button class="btn" id="prompt-cancel-btn" style="flex: 1; background: var(--bg-input);">Cancel</button>
                        <button class="btn btn-primary" id="prompt-ok-btn" style="flex: 1;">OK</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modalOverlay);

        const input = document.getElementById('prompt-input');
        input.focus();

        document.getElementById('prompt-cancel-btn').onclick = () => {
            modalOverlay.classList.remove('active');
            setTimeout(() => modalOverlay.remove(), 300);
        };

        const submit = () => {
            const value = input.value;
            modalOverlay.classList.remove('active');
            setTimeout(() => modalOverlay.remove(), 300);
            if (callback) callback(value);
        }

        document.getElementById('prompt-ok-btn').onclick = submit;
        input.onkeypress = (e) => {
            if (e.key === 'Enter') submit();
        };
    }
};
