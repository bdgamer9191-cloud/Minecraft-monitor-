class MinecraftUtils {
    constructor() {
        this.cache = new Map();
        this.init();
    }

    init() {
        console.log('🔧 Utilities Initializing...');
        
        // Initialize utility functions
        this.setupGlobalHelpers();
        
        console.log('✅ Utilities Ready');
    }

    setupGlobalHelpers() {
        // Format time
        window.formatTime = (dateString) => {
            if (!dateString) return 'Never';
            const date = new Date(dateString);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        };

        // Format date
        window.formatDate = (dateString) => {
            if (!dateString) return 'Never';
            const date = new Date(dateString);
            return date.toLocaleDateString();
        };

        // Format date/time
        window.formatDateTime = (dateString) => {
            if (!dateString) return 'Never';
            const date = new Date(dateString);
            return date.toLocaleString();
        };

        // Format play time
        window.formatPlayTime = (seconds) => {
            if (!seconds || seconds === 0) return '0m';
            
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            
            if (hours > 0) {
                return `${hours}h ${minutes}m`;
            }
            return `${minutes}m`;
        };

        // Format bytes
        window.formatBytes = (bytes, decimals = 2) => {
            if (bytes === 0) return '0 Bytes';
            
            const k = 1024;
            const dm = decimals < 0 ? 0 : decimals;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            
            return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
        };

        // Generate random color
        window.getRandomColor = () => {
            const colors = [
                '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
                '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
                '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
            ];
            return colors[Math.floor(Math.random() * colors.length)];
        };

        // Generate UUID
        window.generateUUID = () => {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        };

        // Debounce function
        window.debounce = (func, wait) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        };

        // Throttle function
        window.throttle = (func, limit) => {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        };

        // Copy to clipboard
        window.copyToClipboard = (text) => {
            if (navigator.clipboard && window.isSecureContext) {
                return navigator.clipboard.writeText(text);
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand('copy');
                    return Promise.resolve();
                } catch (err) {
                    return Promise.reject(err);
                } finally {
                    document.body.removeChild(textArea);
                }
            }
        };

        // Validate Minecraft username
        window.isValidMinecraftUsername = (username) => {
            if (!username) return false;
            // Minecraft usernames must be 3-16 characters, alphanumeric and underscores
            return /^[a-zA-Z0-9_]{3,16}$/.test(username);
        };

        // Validate Minecraft server address
        window.isValidServerAddress = (address) => {
            if (!address) return false;
            
            // Check if it's a valid domain or IP address
            const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?$/;
            const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
            
            return domainRegex.test(address) || ipRegex.test(address);
        };

        // Validate Minecraft server port
        window.isValidServerPort = (port) => {
            const portNum = parseInt(port);
            return !isNaN(portNum) && portNum >= 1 && portNum <= 65535;
        };

        // Ping a server (simulated)
        window.pingServer = async (address, port = 25565) => {
            return new Promise((resolve) => {
                const startTime = Date.now();
                
                // Simulate network latency
                setTimeout(() => {
                    const latency = Date.now() - startTime;
                    const isOnline = Math.random() > 0.3; // 70% chance of being online
                    
                    resolve({
                        online: isOnline,
                        latency: isOnline ? Math.min(latency, 500) : 999,
                        playersOnline: isOnline ? Math.floor(Math.random() * 50) : 0,
                        maxPlayers: 20,
                        version: isOnline ? '1.20.1' : 'Unknown',
                        motd: isOnline ? 'A Minecraft Server' : ''
                    });
                }, 100 + Math.random() * 400);
            });
        };

        // Get Minecraft player head URL
        window.getPlayerHead = (username, size = 64) => {
            return `https://crafatar.com/avatars/${username}?size=${size}&default=steve`;
        };

        // Get Minecraft player skin URL
        window.getPlayerSkin = (username) => {
            return `https://crafatar.com/skins/${username}`;
        };

        // Get server icon URL (Minecraft Favicon)
        window.getServerIcon = (serverAddress) => {
            // In a real implementation, this would fetch the server's favicon
            // For now, return a placeholder
            return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAADNSURBVHgB7ZbBCcMwDEVtJ5AZSvc/YKfJHHA3SKfJHB4jEJAQQrKNBM8DnwjZlvz9SZZkWX6NATgDuAK4A+iA3g8nANe4XwBcANwAtBTPCxwxwB3AnQnQjHwBeDLn3x4T4IUF6fKAnHwT8r0hJ99F5CNPAO4sSJsL5ORrSD45XQC6hHwVyfWchAWAewD9ALqUfAXJ9XxEAVwB9AOw8hUk1/MSBXAE0A/AyleQXM9TFMARQD8AVr6C5HreogCOAPoBsPIVJNfzEgVwBNAPYMtXkFzPTRTAEcBfygfoX8ONbWpaYQAAAABJRU5ErkJggg==';
        };

        // Calculate player playtime percentage
        window.calculatePlayTimePercentage = (playerTime, maxTime) => {
            if (!maxTime || maxTime === 0) return 0;
            return Math.min(100, Math.round((playerTime / maxTime) * 100));
        };

        // Get status color
        window.getStatusColor = (status) => {
            const colors = {
                online: '#4CAF50',
                offline: '#F44336',
                unknown: '#9E9E9E',
                error: '#FF9800',
                disabled: '#607D8B'
            };
            return colors[status] || colors.unknown;
        };

        // Get status icon
        window.getStatusIcon = (status) => {
            const icons = {
                online: 'fa-check-circle',
                offline: 'fa-times-circle',
                unknown: 'fa-question-circle',
                error: 'fa-exclamation-circle',
                disabled: 'fa-ban'
            };
            return icons[status] || icons.unknown;
        };

        // Create loading spinner
        window.createSpinner = (size = '20px', color = '#667eea') => {
            const spinner = document.createElement('div');
            spinner.className = 'spinner';
            spinner.style.width = size;
            spinner.style.height = size;
            spinner.style.border = `3px solid ${color}20`;
            spinner.style.borderTop = `3px solid ${color}`;
            spinner.style.borderRadius = '50%';
            spinner.style.animation = 'spin 1s linear infinite';
            
            // Add animation keyframes if not already present
            if (!document.querySelector('#spinner-animation')) {
                const style = document.createElement('style');
                style.id = 'spinner-animation';
                style.textContent = `
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `;
                document.head.appendChild(style);
            }
            
            return spinner;
        };

        // Show loading overlay
        window.showLoading = (message = 'Loading...') => {
            const overlay = document.createElement('div');
            overlay.className = 'loading-overlay';
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            overlay.style.display = 'flex';
            overlay.style.flexDirection = 'column';
            overlay.style.justifyContent = 'center';
            overlay.style.alignItems = 'center';
            overlay.style.zIndex = '9999';
            
            const spinner = this.createSpinner('40px', '#fff');
            const text = document.createElement('p');
            text.textContent = message;
            text.style.color = '#fff';
            text.style.marginTop = '20px';
            text.style.fontSize = '16px';
            
            overlay.appendChild(spinner);
            overlay.appendChild(text);
            document.body.appendChild(overlay);
            
            return overlay;
        };

        // Hide loading overlay
        window.hideLoading = (overlay) => {
            if (overlay && overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        };

        // Create toast notification
        window.showToast = (message, type = 'info', duration = 3000) => {
            // Remove existing toasts
            const existingToasts = document.querySelectorAll('.toast');
            existingToasts.forEach(toast => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            });
            
            // Create new toast
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.textContent = message;
            
            // Style the toast
            toast.style.position = 'fixed';
            toast.style.bottom = '20px';
            toast.style.left = '50%';
            toast.style.transform = 'translateX(-50%)';
            toast.style.backgroundColor = type === 'error' ? '#F44336' : 
                                         type === 'success' ? '#4CAF50' : 
                                         type === 'warning' ? '#FF9800' : '#2196F3';
            toast.style.color = 'white';
            toast.style.padding = '12px 24px';
            toast.style.borderRadius = '4px';
            toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            toast.style.zIndex = '10000';
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s, transform 0.3s';
            
            document.body.appendChild(toast);
            
            // Animate in
            setTimeout(() => {
                toast.style.opacity = '1';
                toast.style.transform = 'translateX(-50%) translateY(-10px)';
            }, 10);
            
            // Remove after duration
            setTimeout(() => {
                toast.style.opacity = '0';
                toast.style.transform = 'translateX(-50%) translateY(20px)';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.parentNode.removeChild(toast);
                    }
                }, 300);
            }, duration);
            
            return toast;
        };

        // Confirm dialog
        window.showConfirm = (message, onConfirm, onCancel) => {
            const overlay = document.createElement('div');
            overlay.className = 'confirm-overlay';
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            overlay.style.display = 'flex';
            overlay.style.justifyContent = 'center';
            overlay.style.alignItems = 'center';
            overlay.style.zIndex = '10000';
            
            const dialog = document.createElement('div');
            dialog.className = 'confirm-dialog';
            dialog.style.backgroundColor = 'white';
            dialog.style.padding = '24px';
            dialog.style.borderRadius = '8px';
            dialog.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
            dialog.style.maxWidth = '400px';
            dialog.style.width = '90%';
            
            const messageEl = document.createElement('p');
            messageEl.textContent = message;
            messageEl.style.marginBottom = '20px';
            messageEl.style.fontSize = '16px';
            messageEl.style.color = '#333';
            
            const buttons = document.createElement('div');
            buttons.style.display = 'flex';
            buttons.style.justifyContent = 'flex-end';
            buttons.style.gap = '12px';
            
            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = 'Cancel';
            cancelBtn.style.padding = '8px 16px';
            cancelBtn.style.border = '1px solid #ddd';
            cancelBtn.style.borderRadius = '4px';
            cancelBtn.style.backgroundColor = 'transparent';
            cancelBtn.style.cursor = 'pointer';
            cancelBtn.onclick = () => {
                document.body.removeChild(overlay);
                if (onCancel) onCancel();
            };
            
            const confirmBtn = document.createElement('button');
            confirmBtn.textContent = 'Confirm';
            confirmBtn.style.padding = '8px 16px';
            confirmBtn.style.border = 'none';
            confirmBtn.style.borderRadius = '4px';
            confirmBtn.style.backgroundColor = '#667eea';
            confirmBtn.style.color = 'white';
            confirmBtn.style.cursor = 'pointer';
            confirmBtn.onclick = () => {
                document.body.removeChild(overlay);
                if (onConfirm) onConfirm();
            };
            
            buttons.appendChild(cancelBtn);
            buttons.appendChild(confirmBtn);
            
            dialog.appendChild(messageEl);
            dialog.appendChild(buttons);
            overlay.appendChild(dialog);
            document.body.appendChild(overlay);
            
            return overlay;
        };

        // Local storage helper
        window.storage = {
            set: (key, value) => {
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                    return true;
                } catch (error) {
                    console.error('Storage error:', error);
                    return false;
                }
            },
            
            get: (key, defaultValue = null) => {
                try {
                    const item = localStorage.getItem(key);
                    return item ? JSON.parse(item) : defaultValue;
                } catch (error) {
                    console.error('Storage error:', error);
                    return defaultValue;
                }
            },
            
            remove: (key) => {
                localStorage.removeItem(key);
            },
            
            clear: () => {
                localStorage.clear();
            },
            
            getAll: () => {
                const items = {};
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    try {
                        items[key] = JSON.parse(localStorage.getItem(key));
                    } catch (error) {
                        items[key] = localStorage.getItem(key);
                    }
                }
                return items;
            }
        };

        // Cache helper
        window.cache = {
            set: (key, value, ttl = 300000) => { // 5 minutes default
                const item = {
                    value,
                    expiry: Date.now() + ttl
                };
                this.cache.set(key, item);
            },
            
            get: (key) => {
                const item = this.cache.get(key);
                if (!item) return null;
                
                if (Date.now() > item.expiry) {
                    this.cache.delete(key);
                    return null;
                }
                
                return item.value;
            },
            
            delete: (key) => {
                this.cache.delete(key);
            },
            
            clear: () => {
                this.cache.clear();
            }
        };

        // Network status
        window.network = {
            isOnline: () => navigator.onLine,
            
            onStatusChange: (callback) => {
                window.addEventListener('online', () => callback(true));
                window.addEventListener('offline', () => callback(false));
            },
            
            checkConnectivity: () => {
                return new Promise((resolve) => {
                    if (!navigator.onLine) {
                        resolve(false);
                        return;
                    }
                    
                    // Try to fetch a small file to check connectivity
                    fetch('https://www.google.com/favicon.ico', {
                        method: 'HEAD',
                        mode: 'no-cors',
                        cache: 'no-cache'
                    })
                    .then(() => resolve(true))
                    .catch(() => resolve(false));
                });
            }
        };

        // Device information
        window.device = {
            isMobile: () => {
                return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            },
            
            isAndroid: () => {
                return /Android/i.test(navigator.userAgent);
            },
            
            isIOS: () => {
                return /iPhone|iPad|iPod/i.test(navigator.userAgent);
            },
            
            getOS: () => {
                const userAgent = navigator.userAgent;
                if (/Android/i.test(userAgent)) return 'android';
                if (/iPhone|iPad|iPod/i.test(userAgent)) return 'ios';
                if (/Windows/i.test(userAgent)) return 'windows';
                if (/Mac/i.test(userAgent)) return 'mac';
                if (/Linux/i.test(userAgent)) return 'linux';
                return 'unknown';
            },
            
            getBrowser: () => {
                const userAgent = navigator.userAgent;
                if (/Chrome/i.test(userAgent) && !/Edg/i.test(userAgent)) return 'chrome';
                if (/Firefox/i.test(userAgent)) return 'firefox';
                if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) return 'safari';
                if (/Edg/i.test(userAgent)) return 'edge';
                if (/MSIE|Trident/i.test(userAgent)) return 'ie';
                return 'unknown';
            }
        };

        // Minecraft-specific utilities
        window.minecraft = {
            // Parse Minecraft version
            parseVersion: (versionString) => {
                if (!versionString) return { major: 0, minor: 0, patch: 0 };
                
                const match = versionString.match(/(\d+)\.(\d+)(?:\.(\d+))?/);
                if (match) {
                    return {
                        major: parseInt(match[1]),
                        minor: parseInt(match[2]),
                        patch: match[3] ? parseInt(match[3]) : 0,
                        raw: versionString
                    };
                }
                
                return { major: 0, minor: 0, patch: 0, raw: versionString };
            },
            
            // Compare Minecraft versions
            compareVersions: (v1, v2) => {
                const parsed1 = this.parseVersion(v1);
                const parsed2 = this.parseVersion(v2);
                
                if (parsed1.major !== parsed2.major) {
                    return parsed1.major - parsed2.major;
                }
                if (parsed1.minor !== parsed2.minor) {
                    return parsed1.minor - parsed2.minor;
                }
                return parsed1.patch - parsed2.patch;
            },
            
            // Check if version is supported (1.8+ for example)
            isVersionSupported: (versionString, minVersion = '1.8') => {
                return this.compareVersions(versionString, minVersion) >= 0;
            },
            
            // Get version color based on age
            getVersionColor: (versionString) => {
                const version = this.parseVersion(versionString);
                const now = new Date();
                const currentYear = now.getFullYear();
                
                // Very old versions (pre-1.8)
                if (version.major === 1 && version.minor < 8) {
                    return '#F44336'; // Red
                }
                
                // Old versions (1.8-1.12)
                if (version.major === 1 && version.minor <= 12) {
                    return '#FF9800'; // Orange
                }
                
                // Recent versions (1.13-1.16)
                if (version.major === 1 && version.minor <= 16) {
                    return '#4CAF50'; // Green
                }
                
                // Modern versions (1.17+)
                return '#2196F3'; // Blue
            },
            
            // Parse MOTD (Message of the Day)
            parseMotd: (motd) => {
                if (!motd) return '';
                
                // Remove Minecraft formatting codes
                let cleaned = motd.replace(/§[0-9a-fk-or]/g, '');
                
                // Remove extra whitespace
                cleaned = cleaned.replace(/\s+/g, ' ').trim();
                
                // Limit length
                if (cleaned.length > 100) {
                    cleaned = cleaned.substring(0, 97) + '...';
                }
                
                return cleaned;
            },
            
            // Get server type based on port or version
            getServerType: (port, version) => {
                if (port === 19132 || port === 19133) {
                    return 'bedrock';
                }
                
                if (version && version.includes('Pocket') || version.includes('MCPE')) {
                    return 'bedrock';
                }
                
                return 'java';
            },
            
            // Format player count with color
            formatPlayerCount: (current, max) => {
                const percentage = max > 0 ? (current / max) * 100 : 0;
                
                if (percentage >= 90) {
                    return `<span style="color: #F44336">${current}/${max}</span>`;
                } else if (percentage >= 70) {
                    return `<span style="color: #FF9800">${current}/${max}</span>`;
                } else if (percentage >= 50) {
                    return `<span style="color: #FFC107">${current}/${max}</span>`;
                } else {
                    return `<span style="color: #4CAF50">${current}/${max}</span>`;
                }
            },
            
            // Get latency color
            getLatencyColor: (latency) => {
                if (latency < 50) return '#4CAF50'; // Green
                if (latency < 100) return '#8BC34A'; // Light green
                if (latency < 200) return '#FFC107'; // Yellow
                if (latency < 300) return '#FF9800'; // Orange
                return '#F44336'; // Red
            }
        };
    }

    // Additional utility methods
    static async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static async retry(fn, retries = 3, delay = 1000) {
        for (let i = 0; i < retries; i++) {
            try {
                return await fn();
            } catch (error) {
                if (i === retries - 1) throw error;
                await this.sleep(delay * (i + 1));
            }
        }
    }

    static deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    static mergeObjects(target, source) {
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (!target[key]) target[key] = {};
                this.mergeObjects(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
        return target;
    }

    static flattenObject(obj, prefix = '') {
        return Object.keys(obj).reduce((acc, k) => {
            const pre = prefix.length ? prefix + '.' : '';
            if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
                Object.assign(acc, this.flattenObject(obj[k], pre + k));
            } else {
                acc[pre + k] = obj[k];
            }
            return acc;
        }, {});
    }

    static getQueryParams() {
        const params = {};
        window.location.search.substring(1).split('&').forEach(pair => {
            const [key, value] = pair.split('=');
            if (key) {
                params[decodeURIComponent(key)] = decodeURIComponent(value || '');
            }
        });
        return params;
    }

    static updateQueryParams(params) {
        const url = new URL(window.location);
        Object.keys(params).forEach(key => {
            if (params[key] === null || params[key] === undefined) {
                url.searchParams.delete(key);
            } else {
                url.searchParams.set(key, params[key]);
            }
        });
        window.history.replaceState({}, '', url);
    }
}

// Initialize utilities
const utils = new MinecraftUtils();

// Make available globally
window.utils = utils;
window.MinecraftUtils = MinecraftUtils;

// Add CSS for utilities
const utilityStyles = `
    .spinner {
        border: 3px solid rgba(102, 126, 234, 0.2);
        border-top: 3px solid #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .toast {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #2196F3;
        color: white;
        padding: 12px 24px;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s, transform 0.3s;
    }
    
    .toast.show {
        opacity: 1;
        transform: translateX(-50%) translateY(-10px);
    }
    
    .toast-success {
        background-color: #4CAF50;
    }
    
    .toast-error {
        background-color: #F44336;
    }
    
    .toast-warning {
        background-color: #FF9800;
    }
    
    .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    }
    
    .confirm-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    }
    
    .confirm-dialog {
        background-color: white;
        padding: 24px;
        border-radius: 8px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        max-width: 400px;
        width: 90%;
    }
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = utilityStyles;
document.head.appendChild(styleSheet);