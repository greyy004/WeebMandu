/**
 * Toast Notification System
 * Modern, clean notifications to replace browser alerts
 */

class NotificationSystem {
    constructor() {
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        document.body.appendChild(this.container);
        
        this.injectStyles();
    }

    injectStyles() {
        if (document.getElementById('notification-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            #toast-container {
                position: fixed;
                top: 24px;
                right: 24px;
                display: flex;
                flex-direction: column;
                gap: 12px;
                z-index: 9999;
                pointer-events: none;
            }

            .toast-notification {
                min-width: 300px;
                padding: 16px 20px;
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
                display: flex;
                align-items: center;
                gap: 12px;
                pointer-events: auto;
                animation: toast-in 0.3s cubic-bezier(0, 0, 0.2, 1);
                transition: all 0.3s ease;
            }

            .toast-notification.hiding {
                animation: toast-out 0.2s ease forwards;
            }

            .toast-icon {
                width: 20px;
                height: 20px;
                flex-shrink: 0;
            }

            .toast-content {
                flex-grow: 1;
                font-family: 'Inter', sans-serif;
                font-size: 0.875rem;
                font-weight: 500;
                color: #1e293b;
            }

            .toast-close {
                padding: 4px;
                cursor: pointer;
                color: #94a3b8;
                border-radius: 6px;
                transition: all 0.2s;
            }

            .toast-close:hover {
                background: #f1f5f9;
                color: #64748b;
            }

            .toast-success .toast-icon { color: #10b981; }
            .toast-error .toast-icon { color: #f43f5e; }
            .toast-info .toast-icon { color: #3b82f6; }
            .toast-warning .toast-icon { color: #f59e0b; }

            @keyframes toast-in {
                from { opacity: 0; transform: translateX(24px); }
                to { opacity: 1; transform: translateX(0); }
            }

            @keyframes toast-out {
                from { opacity: 1; transform: translateX(0); }
                to { opacity: 0; transform: scale(0.95); }
            }
        `;
        document.head.appendChild(style);
    }

    show(message, type = 'info', duration = 4000) {
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        
        let iconName = 'info';
        if (type === 'success') iconName = 'check-circle';
        if (type === 'error') iconName = 'alert-circle';
        if (type === 'warning') iconName = 'alert-triangle';

        toast.innerHTML = `
            <div class="toast-icon">
                <i data-lucide="${iconName}"></i>
            </div>
            <div class="toast-content">${message}</div>
            <div class="toast-close">
                <i data-lucide="x"></i>
            </div>
        `;

        this.container.appendChild(toast);
        
        // Initialize Lucide icons for the new toast
        if (window.lucide) {
            lucide.createIcons({
                root: toast
            });
        }

        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.onclick = () => this.hide(toast);

        if (duration > 0) {
            setTimeout(() => this.hide(toast), duration);
        }
    }

    hide(toast) {
        if (toast.classList.contains('hiding')) return;
        toast.classList.add('hiding');
        setTimeout(() => {
            if (toast.parentNode === this.container) {
                this.container.removeChild(toast);
            }
        }, 200);
    }

    // Modal alternative for confirm()
    async confirm(message) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';
            overlay.innerHTML = `
                <style>
                    .modal-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0, 0, 0, 0.4);
                        backdrop-filter: blur(4px);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 10000;
                        animation: modal-bg-in 0.2s ease;
                    }
                    .modal-container {
                        background: white;
                        padding: 32px;
                        border-radius: 16px;
                        width: 90%;
                        max-width: 400px;
                        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
                        animation: modal-in 0.3s cubic-bezier(0, 0, 0.2, 1);
                    }
                    .modal-title {
                        font-family: 'Inter', sans-serif;
                        font-size: 1.125rem;
                        font-weight: 700;
                        margin-bottom: 12px;
                        color: #0f172a;
                    }
                    .modal-body {
                        font-family: 'Inter', sans-serif;
                        font-size: 0.9375rem;
                        color: #475569;
                        margin-bottom: 24px;
                        line-height: 1.5;
                    }
                    .modal-footer {
                        display: flex;
                        gap: 12px;
                        justify-content: flex-end;
                    }
                    .modal-btn {
                        padding: 10px 20px;
                        border-radius: 8px;
                        font-weight: 600;
                        font-size: 0.875rem;
                        cursor: pointer;
                        transition: all 0.2s;
                        border: none;
                    }
                    .btn-cancel {
                        background: #f1f5f9;
                        color: #64748b;
                    }
                    .btn-cancel:hover { background: #e2e8f0; }
                    .btn-confirm {
                        background: #1e293b;
                        color: white;
                    }
                    .btn-confirm:hover { background: #0f172a; }

                    @keyframes modal-bg-in { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes modal-in { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
                </style>
                <div class="modal-container">
                    <div class="modal-title">Confirm Action</div>
                    <div class="modal-body">${message}</div>
                    <div class="modal-footer">
                        <button class="modal-btn btn-cancel">Cancel</button>
                        <button class="modal-btn btn-confirm">Confirm</button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            const cancelBtn = overlay.querySelector('.btn-cancel');
            const confirmBtn = overlay.querySelector('.btn-confirm');

            cancelBtn.onclick = () => {
                document.body.removeChild(overlay);
                resolve(false);
            };

            confirmBtn.onclick = () => {
                document.body.removeChild(overlay);
                resolve(true);
            };

            overlay.onclick = (e) => {
                if (e.target === overlay) {
                    document.body.removeChild(overlay);
                    resolve(false);
                }
            };
        });
    }
}

// Export a singleton instance
const notifications = new NotificationSystem();
window.notifications = notifications;

// Global helpers to mirror alert/confirm
window.showToast = (msg, type) => notifications.show(msg, type);
window.showConfirm = (msg) => notifications.confirm(msg);
