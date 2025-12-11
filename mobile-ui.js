class MobileUI {
    constructor() {
        this.currentTab = 'servers';
        this.init();
    }

    init() {
        console.log('📱 Mobile UI Initializing...');
        
        // Initialize event listeners
        this.initEventListeners();
        
        // Initialize swipe gestures
        this.initSwipeGestures();
        
        // Load initial data
        this.loadInitialData();
        
        console.log('✅ Mobile UI Ready');
    }

    initEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.currentTarget.getAttribute('onclick').match(/'([^']+)'/)[1];
                this.switchTab(tabName);
            });
        });
        
        // Modal handling
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
        
        // Form submissions
        const serverForm = document.querySelector('#serverModal form');
        if (serverForm) {
            serverForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveServer();
            });
        }
        
        // Settings changes
        document.querySelectorAll('.setting-item input').forEach(input => {
            input.addEventListener('change', () => {
                this.saveSettings();
            });
        });
    }

    initSwipeGestures() {
        let touchStartX = 0;
        let touchEndX = 0;
        
        const tabContent = document.querySelector('.tab-content');
        if (!tabContent) return;
        
        tabContent.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, false);
        
        tabContent.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        }, false);
    }

    handleSwipe(startX, endX) {
        const swipeThreshold = 50;
        const diff = startX - endX;
        
        if (Math.abs(diff) > swipeThreshold) {
            const tabs = ['servers', 'players', 'logs', 'settings'];
            const currentIndex = tabs.indexOf(this.currentTab);
            
            if (diff > 0) {
                // Swipe left - next tab
                const nextIndex = (currentIndex + 1) % tabs.length;
                this.switchTab(tabs[nextIndex]);
            } else {
                // Swipe right - previous tab
                const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
                this.switchTab(tabs[prevIndex]);
            }
        }
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Update tab buttons
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        
        // Activate selected tab
        const tabButton = document.querySelector(`.tab[onclick*="${tabName}"]`);
        const tabPane = document.getElementById(`${tabName}Tab`);
        
        if (tabButton) tabButton.classList.add('active');
        if (tabPane) tabPane.classList.add('active');
        
        // Load tab-specific data
        this.loadTabData(tabName);
    }

    loadInitialData() {
        // Load servers
        this.loadServers();
        
        // Load players
        this.loadPlayers();
        
        // Load logs
        this.loadLogs();
        
        // Load settings
        this.loadSettings();
    }

    loadTabData(tabName) {
        switch(tabName) {
            case 'servers':
                this.loadServers();
                break;
            case 'players':
                this.loadPlayers();
                break;
            case 'logs':
                this.loadLogs();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }

    loadServers() {
        // Servers are loaded by monitor.js
        // This method can be extended for additional UI updates
    }

    loadPlayers() {
        // Players are loaded by monitor.js
    }

    loadLogs() {
        // Logs are handled by monitor.js
    }

    loadSettings() {
        // Load settings from localStorage
        const config = JSON.parse(localStorage.getItem('config.json') || '{}');
        
        // Set checkbox values
        const notifyLogin = document.getElementById('notifyLogin');
        const notifyLogout = document.getElementById('notifyLogout');
        const checkInterval = document.getElementById('checkInterval');
        
        if (notifyLogin && config.notifications) {
            notifyLogin.checked = config.notifications.playerLogin || true;
        }
        if (notifyLogout && config.notifications) {
            notifyLogout.checked = config.notifications.playerLogout || true;
        }
        if (checkInterval && config.monitoring) {
            checkInterval.value = (config.monitoring.checkInterval / 1000) || 30;
        }
    }

    saveSettings() {
        const config = JSON.parse(localStorage.getItem('config.json') || '{}');
        
        // Update notification settings
        if (!config.notifications) config.notifications = {};
        config.notifications.playerLogin = document.getElementById('notifyLogin').checked;
        config.notifications.playerLogout = document.getElementById('notifyLogout').checked;
        
        // Update monitoring settings
        if (!config.monitoring) config.monitoring = {};
        const interval = parseInt(document.getElementById('checkInterval').value);
        config.monitoring.checkInterval = interval * 1000;
        
        // Save to localStorage
        localStorage.setItem('config.json', JSON.stringify(config, null, 2));
        
        // Update main monitor config
        if (window.monitor) {
            window.monitor.config = config;
            window.monitor.saveConfig();
        }
        
        // Show feedback
        this.showToast('Settings saved');
    }

    showToast(message, duration = 2000) {
        // Remove existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) existingToast.remove();
        
        // Create new toast
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Hide toast after duration
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            modal.classList.add('show');
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }

    saveServer() {
        const nameInput = document.getElementById('serverName');
        const addressInput = document.getElementById('serverAddress');
        const portInput = document.getElementById('serverPort');
        
        const name = nameInput.value.trim();
        const address = addressInput.value.trim();
        const port = parseInt(portInput.value) || 25565;
        
        if (!name || !address) {
            this.showToast('Please fill in all fields');
            return;
        }
        
        if (window.monitor) {
            window.monitor.addServer({
                name,
                address,
                port,
                type: 'java',
                maxPlayers: 20,
                description: 'Added from mobile'
            }).then(() => {
                this.closeModal('serverModal');
                this.showToast('Server added successfully');
                
                // Clear form
                nameInput.value = '';
                addressInput.value = '';
                portInput.value = '25565';
            });
        }
    }

    showServerDetails(serverId) {
        if (window.monitor) {
            const server = window.monitor.servers.find(s => s.id === serverId);
            if (server) {
                const details = `
                    <strong>${server.name}</strong><br>
                    ${server.address}:${server.port}<br>
                    Status: ${server.status}<br>
                    Players: ${server.playersOnline}/${server.maxPlayers}<br>
                    Latency: ${server.latency}ms<br>
                    ${server.description || ''}
                `;
                alert(details);
            }
        }
    }

    toggleServerStatus(serverId) {
        if (window.monitor) {
            window.monitor.toggleServer(serverId);
            this.showToast('Server status updated');
        }
    }

    refreshServerList() {
        if (window.monitor) {
            window.monitor.checkAllServers();
            this.showToast('Refreshing servers...');
        }
    }

    exportData() {
        if (window.monitor) {
            window.monitor.exportData('json');
            this.showToast('Export started');
        }
    }

    backupData() {
        if (window.monitor) {
            window.monitor.backupData();
            this.showToast('Backup created');
        }
    }

    clearData() {
        if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            if (window.monitor) {
                window.monitor.clearData();
                this.showToast('All data cleared');
            }
        }
    }

    // Offline support
    setupOfflineSupport() {
        // Check if online
        window.addEventListener('online', () => {
            this.showToast('Back online');
        });
        
        window.addEventListener('offline', () => {
            this.showToast('Working offline', 4000);
        });
        
        // Service Worker registration (if supported)
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(() => console.log('Service Worker registered'))
                .catch(err => console.log('Service Worker registration failed:', err));
        }
    }

    // Theme handling
    toggleTheme() {
        const body = document.body;
        const currentTheme = body.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        this.showToast(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} theme enabled`);
    }

    // Vibration feedback
    vibrate(pattern = [100]) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }
}

// Initialize mobile UI when page loads
document.addEventListener('DOMContentLoaded', () => {
    const mobileUI = new MobileUI();
    window.mobileUI = mobileUI;
    
    // Set theme from localStorage
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    
    // Setup offline support
    mobileUI.setupOfflineSupport();
});