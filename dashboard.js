class Dashboard {
    constructor() {
        this.charts = {};
        this.init();
    }

    init() {
        console.log('📊 Dashboard Initializing...');
        
        // Initialize navigation
        this.initNavigation();
        
        // Initialize charts
        this.initCharts();
        
        // Load dashboard data
        this.loadDashboardData();
        
        // Set up auto-refresh
        this.setupAutoRefresh();
        
        console.log('✅ Dashboard Ready');
    }

    initNavigation() {
        // Tab switching
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Update active state
                document.querySelectorAll('.nav-item').forEach(nav => 
                    nav.classList.remove('active'));
                document.querySelectorAll('.dashboard-section').forEach(section => 
                    section.classList.remove('active'));
                
                item.classList.add('active');
                
                const targetId = item.getAttribute('href').substring(1);
                document.getElementById(targetId).classList.add('active');
                
                // Update page title
                const pageTitle = document.getElementById('pageTitle');
                if (pageTitle) {
                    pageTitle.textContent = item.textContent.trim();
                }
                
                // Load section-specific data
                this.loadSectionData(targetId);
            });
        });
    }

    initCharts() {
        // Server Status Chart
        const serverCtx = document.getElementById('serverStatusChart');
        if (serverCtx) {
            this.charts.serverStatus = new Chart(serverCtx.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Online', 'Offline', 'Disabled'],
                    datasets: [{
                        data: [3, 1, 1],
                        backgroundColor: [
                            '#4CAF50',
                            '#F44336',
                            '#9E9E9E'
                        ],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        },
                        title: {
                            display: true,
                            text: 'Server Status Distribution'
                        }
                    }
                }
            });
        }

        // Player Activity Chart
        const activityCtx = document.getElementById('playerActivityChart');
        if (activityCtx) {
            this.charts.playerActivity = new Chart(activityCtx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: ['12 AM', '3 AM', '6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'],
                    datasets: [{
                        label: 'Players Online',
                        data: [5, 3, 2, 8, 15, 20, 18, 12],
                        borderColor: '#2196F3',
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Player Activity (Last 24 Hours)'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Players'
                            }
                        }
                    }
                }
            });
        }

        // Timeline Chart
        const timelineCtx = document.getElementById('timelineChart');
        if (timelineCtx) {
            this.charts.timeline = new Chart(timelineCtx.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Player Sessions',
                        data: [12, 19, 8, 15, 22, 18, 25],
                        backgroundColor: 'rgba(255, 99, 132, 0.7)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Weekly Player Activity'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Sessions'
                            }
                        }
                    }
                }
            });
        }

        // Popularity Chart
        const popularityCtx = document.getElementById('popularityChart');
        if (popularityCtx) {
            this.charts.popularity = new Chart(popularityCtx.getContext('2d'), {
                type: 'polarArea',
                data: {
                    labels: ['Survival', 'Creative', 'Minigames', 'PvP', 'Skyblock'],
                    datasets: [{
                        data: [12, 19, 8, 15, 7],
                        backgroundColor: [
                            '#FF6384',
                            '#36A2EB',
                            '#FFCE56',
                            '#4BC0C0',
                            '#9966FF'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Server Type Popularity'
                        },
                        legend: {
                            position: 'right'
                        }
                    }
                }
            });
        }
    }

    loadDashboardData() {
        // Load server data
        this.loadServerData();
        
        // Load player data
        this.loadPlayerData();
        
        // Load system info
        this.loadSystemInfo();
    }

    loadSectionData(sectionId) {
        switch(sectionId) {
            case 'analytics':
                this.updateAnalytics();
                break;
            case 'logs':
                this.loadSystemLogs();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }

    loadServerData() {
        // Server data is loaded by the main monitor.js
        // This method can be extended for additional server processing
    }

    loadPlayerData() {
        // Player data is loaded by the main monitor.js
    }

    loadSystemInfo() {
        // Database size
        const dbSize = localStorage.length;
        const dbSizeElement = document.getElementById('dbSize');
        if (dbSizeElement) {
            dbSizeElement.textContent = `${Math.round(dbSize / 1024)} KB`;
        }
        
        // Last backup
        const lastBackup = localStorage.getItem('last_backup');
        const lastBackupElement = document.getElementById('lastBackupTime');
        if (lastBackupElement && lastBackup) {
            lastBackupElement.textContent = new Date(lastBackup).toLocaleString();
        }
    }

    loadSystemLogs() {
        const logs = JSON.parse(localStorage.getItem('activity_logs') || '[]');
        const systemLogs = document.getElementById('systemLogs');
        
        if (!systemLogs) return;
        
        const logHTML = logs.map(log => `
            <div class="system-log-item ${log.type.toLowerCase()}">
                <div class="log-header">
                    <span class="log-type">${log.type}</span>
                    <span class="log-time">${new Date(log.timestamp).toLocaleString()}</span>
                </div>
                <div class="log-message">${log.message}</div>
            </div>
        `).join('');
        
        systemLogs.innerHTML = logHTML || '<p class="no-data">No system logs found.</p>';
    }

    loadSettings() {
        // Load settings from localStorage
        const config = JSON.parse(localStorage.getItem('config.json') || '{}');
        
        // Set checkbox values
        const webNotifyLogin = document.getElementById('webNotifyLogin');
        const webNotifyLogout = document.getElementById('webNotifyLogout');
        const webNotifyServerDown = document.getElementById('webNotifyServerDown');
        
        if (webNotifyLogin && config.notifications) {
            webNotifyLogin.checked = config.notifications.playerLogin || true;
        }
        if (webNotifyLogout && config.notifications) {
            webNotifyLogout.checked = config.notifications.playerLogout || true;
        }
        if (webNotifyServerDown && config.notifications) {
            webNotifyServerDown.checked = config.notifications.serverDown || true;
        }
        
        // Set select values
        const backupInterval = document.getElementById('backupInterval');
        const logRetention = document.getElementById('logRetention');
        
        if (backupInterval && config.storage) {
            const intervalHours = (config.storage.backupInterval || 86400000) / 3600000;
            backupInterval.value = intervalHours.toString();
        }
        if (logRetention && config.storage) {
            logRetention.value = (config.storage.logRetentionDays || 30).toString();
        }
    }

    updateAnalytics() {
        // Update charts with latest data
        if (this.charts.serverStatus && window.monitor) {
            const servers = window.monitor.servers || [];
            const online = servers.filter(s => s.status === 'online').length;
            const offline = servers.filter(s => s.status === 'offline').length;
            const disabled = servers.filter(s => !s.enabled).length;
            
            this.charts.serverStatus.data.datasets[0].data = [online, offline, disabled];
            this.charts.serverStatus.update();
        }
        
        if (this.charts.playerActivity && window.monitor) {
            // Update with real player activity data
            // This is a simplified example
            const players = window.monitor.players || [];
            const onlineCount = players.filter(p => p.isOnline).length;
            
            // Update last data point
            const data = this.charts.playerActivity.data.datasets[0].data;
            data[data.length - 1] = onlineCount;
            this.charts.playerActivity.update();
        }
    }

    setupAutoRefresh() {
        // Auto-refresh dashboard every 30 seconds
        setInterval(() => {
            if (window.monitor) {
                window.monitor.updateStats();
                this.updateCharts();
            }
        }, 30000);
    }

    updateCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.update();
            }
        });
    }

    // Dashboard-specific functions
    refreshData() {
        if (window.monitor) {
            window.monitor.checkAllServers();
            window.monitor.updateStats();
            this.updateCharts();
            
            // Show refresh feedback
            const btn = event?.target.closest('button');
            if (btn) {
                btn.innerHTML = '<i class="fas fa-check"></i> Refreshed';
                setTimeout(() => {
                    btn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
                }, 2000);
            }
        }
    }

    exportDashboardData() {
        if (window.monitor) {
            window.monitor.exportData('json');
        }
    }

    toggleMonitoring() {
        if (window.monitor) {
            window.monitor.toggleMonitoring();
            
            const btn = event?.target.closest('button');
            if (btn) {
                if (window.monitor.isMonitoring) {
                    btn.innerHTML = '<i class="fas fa-pause"></i> Pause';
                    btn.title = 'Pause Monitoring';
                } else {
                    btn.innerHTML = '<i class="fas fa-play"></i> Resume';
                    btn.title = 'Resume Monitoring';
                }
            }
        }
    }

    saveSettings() {
        const config = JSON.parse(localStorage.getItem('config.json') || '{}');
        
        // Update notification settings
        if (!config.notifications) config.notifications = {};
        config.notifications.playerLogin = document.getElementById('webNotifyLogin').checked;
        config.notifications.playerLogout = document.getElementById('webNotifyLogout').checked;
        config.notifications.serverDown = document.getElementById('webNotifyServerDown').checked;
        
        // Update storage settings
        if (!config.storage) config.storage = {};
        const backupInterval = parseInt(document.getElementById('backupInterval').value);
        const logRetention = parseInt(document.getElementById('logRetention').value);
        
        config.storage.backupInterval = backupInterval * 3600000; // Convert to milliseconds
        config.storage.logRetentionDays = logRetention;
        
        // Save to localStorage
        localStorage.setItem('config.json', JSON.stringify(config, null, 2));
        
        // Update main monitor config
        if (window.monitor) {
            window.monitor.config = config;
        }
        
        // Show success message
        alert('Settings saved successfully!');
    }

    showAddServerModal() {
        const modal = document.getElementById('dashboardServerModal');
        if (modal) {
            modal.style.display = 'block';
        } else {
            // Fallback to mobile modal
            if (window.addServer) window.addServer();
        }
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    const dashboard = new Dashboard();
    window.dashboard = dashboard;
    
    // Expose dashboard functions
    window.refreshData = () => dashboard.refreshData();
    window.exportDashboardData = () => dashboard.exportDashboardData();
    window.toggleMonitoring = () => dashboard.toggleMonitoring();
    window.saveSettings = () => dashboard.saveSettings();
    window.showAddServerModal = () => dashboard.showAddServerModal();
});