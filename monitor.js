class MinecraftMonitor {
    constructor() {
        this.config = {};
        this.servers = [];
        this.players = [];
        this.alerts = {};
        this.isMonitoring = false;
        this.monitorInterval = null;
        this.startTime = null;
        this.lastBackup = null;
        this.eventListeners = {};
        
        this.init();
    }

    async init() {
        console.log('🎮 Minecraft Monitor Initializing...');
        
        // Load configuration
        await this.loadConfig();
        
        // Load data
        await this.loadServers();
        await this.loadPlayers();
        await this.loadAlerts();
        
        // Initialize UI
        this.updateStats();
        
        // Auto-start if configured
        if (this.config.monitoring?.autoStart) {
            setTimeout(() => this.startMonitoring(), 1000);
        }
        
        console.log('✅ Minecraft Monitor Ready');
    }

    async loadConfig() {
        try {
            const response = await fetch('config.json');
            this.config = await response.json();
        } catch (error) {
            console.error('Failed to load config:', error);
            // Use default config
            this.config = {
                monitoring: { enabled: true, checkInterval: 30000 },
                notifications: { enabled: true }
            };
        }
    }

    async loadServers() {
        try {
            const response = await fetch('servers.json');
            this.servers = await response.json();
            this.updateServerList();
        } catch (error) {
            console.error('Failed to load servers:', error);
            this.servers = [];
        }
    }

    async loadPlayers() {
        try {
            const response = await fetch('players.json');
            const data = await response.json();
            this.players = data.players || [];
            this.updatePlayerList();
        } catch (error) {
            console.error('Failed to load players:', error);
            this.players = [];
        }
    }

    async loadAlerts() {
        try {
            const response = await fetch('alerts.json');
            this.alerts = await response.json();
        } catch (error) {
            console.error('Failed to load alerts:', error);
            this.alerts = { enabled: true, triggers: [] };
        }
    }

    async saveConfig() {
        try {
            await this.saveToFile('config.json', this.config);
        } catch (error) {
            console.error('Failed to save config:', error);
        }
    }

    async saveServers() {
        try {
            await this.saveToFile('servers.json', this.servers);
        } catch (error) {
            console.error('Failed to save servers:', error);
        }
    }

    async savePlayers() {
        try {
            const data = {
                players: this.players,
                sessions: [],
                statistics: this.getPlayerStats()
            };
            await this.saveToFile('players.json', data);
        } catch (error) {
            console.error('Failed to save players:', error);
        }
    }

    async saveAlerts() {
        try {
            await this.saveToFile('alerts.json', this.alerts);
        } catch (error) {
            console.error('Failed to save alerts:', error);
        }
    }

    async saveToFile(filename, data) {
        // For browser environment, we'll use localStorage
        // In a real app, you might use IndexedDB or server API
        localStorage.setItem(filename, JSON.stringify(data, null, 2));
        
        // Log the action
        this.logActivity('DATA_SAVE', `Saved ${filename}`);
    }

    async checkServer(server) {
        if (!server.enabled) return;
        
        const startTime = Date.now();
        
        try {
            // Simulate server check (replace with actual Minecraft server query)
            const isOnline = Math.random() > 0.3; // 70% chance of being online
            
            const status = {
                id: server.id,
                name: server.name,
                status: isOnline ? 'online' : 'offline',
                playersOnline: isOnline ? Math.floor(Math.random() * server.maxPlayers) : 0,
                maxPlayers: server.maxPlayers,
                latency: isOnline ? Math.floor(Math.random() * 300) : 999,
                version: isOnline ? '1.20.1' : 'Unknown',
                motd: isOnline ? 'A Minecraft Server' : '',
                lastChecked: new Date().toISOString()
            };
            
            // Update server status
            Object.assign(server, status);
            
            // Trigger events
            if (isOnline && server.status !== 'online') {
                this.triggerEvent('server_online', { server: server.name });
            } else if (!isOnline && server.status === 'online') {
                this.triggerEvent('server_offline', { server: server.name });
            }
            
            // Check player count alert
            if (isOnline && this.alerts.enabled) {
                const highPlayerTrigger = this.alerts.triggers.find(t => t.id === 'high_player_count');
                if (highPlayerTrigger && status.playersOnline >= highPlayerTrigger.threshold) {
                    this.triggerAlert('high_player_count', {
                        server: server.name,
                        count: status.playersOnline
                    });
                }
            }
            
            // Update UI
            this.updateServerDisplay(server);
            
            this.logActivity('SERVER_CHECK', `Checked ${server.name}: ${status.status}`);
            
        } catch (error) {
            console.error(`Error checking server ${server.name}:`, error);
            server.status = 'error';
            server.latency = 999;
            this.updateServerDisplay(server);
        }
        
        return server;
    }

    async checkAllServers() {
        console.log('🔍 Checking all servers...');
        
        for (const server of this.servers) {
            if (server.enabled) {
                await this.checkServer(server);
                // Small delay between checks
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        // Update overall stats
        this.updateStats();
        
        // Save updated server data
        await this.saveServers();
    }

    async simulatePlayerActivity() {
        // Simulate player logins/logouts for demo
        const servers = this.servers.filter(s => s.status === 'online');
        if (servers.length === 0) return;
        
        const server = servers[Math.floor(Math.random() * servers.length)];
        const players = ['PlayerOne', 'MinecraftPro', 'Steve', 'Alex', 'Notch', 'Herobrine'];
        const player = players[Math.floor(Math.random() * players.length)];
        
        const action = Math.random() > 0.5 ? 'login' : 'logout';
        
        if (action === 'login') {
            await this.trackPlayerLogin(player, server.name);
        } else {
            await this.trackPlayerLogout(player, server.name);
        }
    }

    async trackPlayerLogin(playerName, serverName) {
        // Find or create player
        let player = this.players.find(p => p.username === playerName);
        
        if (!player) {
            player = {
                id: Date.now().toString(),
                username: playerName,
                uuid: this.generateUUID(),
                firstSeen: new Date().toISOString(),
                lastSeen: new Date().toISOString(),
                totalPlayTime: 0,
                sessions: 0,
                currentServer: serverName,
                isOnline: true,
                rank: 'Member',
                notes: '',
                favorite: false
            };
            this.players.push(player);
        } else {
            player.lastSeen = new Date().toISOString();
            player.currentServer = serverName;
            player.isOnline = true;
            player.sessions++;
        }
        
        // Trigger event
        this.triggerEvent('player_login', {
            player: playerName,
            server: serverName
        });
        
        // Update UI
        this.updatePlayerList();
        this.updateStats();
        
        // Save data
        await this.savePlayers();
        
        this.logActivity('PLAYER_LOGIN', `${playerName} logged into ${serverName}`);
    }

    async trackPlayerLogout(playerName, serverName) {
        const player = this.players.find(p => p.username === playerName);
        
        if (player) {
            player.isOnline = false;
            player.currentServer = null;
            
            // Add some playtime
            player.totalPlayTime += Math.floor(Math.random() * 3600) + 300;
            
            // Trigger event
            this.triggerEvent('player_logout', {
                player: playerName,
                server: serverName
            });
            
            // Update UI
            this.updatePlayerList();
            this.updateStats();
            
            // Save data
            await this.savePlayers();
            
            this.logActivity('PLAYER_LOGOUT', `${playerName} logged out from ${serverName}`);
        }
    }

    startMonitoring() {
        if (this.isMonitoring) return;
        
        console.log('🚀 Starting Minecraft monitoring...');
        this.isMonitoring = true;
        this.startTime = Date.now();
        
        // Update UI
        document.getElementById('statusIndicator')?.classList.add('active');
        
        // Start monitoring interval
        const interval = this.config.monitoring?.checkInterval || 30000;
        this.monitorInterval = setInterval(async () => {
            await this.checkAllServers();
            
            // Simulate player activity (for demo)
            if (Math.random() > 0.7) {
                await this.simulatePlayerActivity();
            }
            
            // Auto-backup
            if (this.shouldBackup()) {
                await this.backupData();
            }
            
        }, interval);
        
        // Initial check
        this.checkAllServers();
        
        this.logActivity('MONITOR_START', 'Monitoring started');
    }

    stopMonitoring() {
        if (!this.isMonitoring) return;
        
        console.log('🛑 Stopping Minecraft monitoring...');
        this.isMonitoring = false;
        
        // Clear interval
        if (this.monitorInterval) {
            clearInterval(this.monitorInterval);
            this.monitorInterval = null;
        }
        
        // Update UI
        document.getElementById('statusIndicator')?.classList.remove('active');
        
        this.logActivity('MONITOR_STOP', 'Monitoring stopped');
    }

    toggleMonitoring() {
        if (this.isMonitoring) {
            this.stopMonitoring();
        } else {
            this.startMonitoring();
        }
    }

    async addServer(serverData) {
        const newServer = {
            id: Date.now().toString(),
            ...serverData,
            enabled: true,
            status: 'unknown',
            playersOnline: 0,
            maxPlayers: 20,
            latency: 0,
            lastChecked: new Date().toISOString(),
            addedDate: new Date().toISOString().split('T')[0]
        };
        
        this.servers.push(newServer);
        await this.saveServers();
        this.updateServerList();
        
        this.logActivity('SERVER_ADD', `Added server: ${serverData.name}`);
        
        return newServer;
    }

    async removeServer(serverId) {
        const index = this.servers.findIndex(s => s.id === serverId);
        if (index !== -1) {
            const server = this.servers[index];
            this.servers.splice(index, 1);
            await this.saveServers();
            this.updateServerList();
            
            this.logActivity('SERVER_REMOVE', `Removed server: ${server.name}`);
        }
    }

    async toggleServer(serverId) {
        const server = this.servers.find(s => s.id === serverId);
        if (server) {
            server.enabled = !server.enabled;
            await this.saveServers();
            this.updateServerList();
            
            this.logActivity('SERVER_TOGGLE', 
                `${server.enabled ? 'Enabled' : 'Disabled'} server: ${server.name}`);
        }
    }

    updateStats() {
        const onlineServers = this.servers.filter(s => 
            s.enabled && s.status === 'online').length;
        const onlinePlayers = this.players.filter(p => p.isOnline).length;
        const totalPlayers = this.players.length;
        
        const uptime = this.startTime ? 
            Math.floor((Date.now() - this.startTime) / 3600000) : 0;
        
        // Update mobile UI
        if (document.getElementById('serverCount')) {
            document.getElementById('serverCount').textContent = this.servers.length;
            document.getElementById('playerCount').textContent = onlinePlayers;
            document.getElementById('sessionCount').textContent = 
                this.players.reduce((sum, p) => sum + (p.sessions || 0), 0);
            document.getElementById('uptime').textContent = `${uptime}h`;
        }
        
        // Update web dashboard
        if (document.getElementById('totalServers')) {
            document.getElementById('totalServers').textContent = this.servers.length;
            document.getElementById('onlineServers').textContent = `${onlineServers} online`;
            document.getElementById('totalPlayers').textContent = onlinePlayers;
            document.getElementById('uniquePlayers').textContent = 
                `${this.getUniquePlayersToday()} unique today`;
            document.getElementById('totalUptime').textContent = `${uptime}h`;
            document.getElementById('totalSessions').textContent = 
                this.players.reduce((sum, p) => sum + (p.sessions || 0), 0);
        }
    }

    updateServerList() {
        const serverList = document.getElementById('serverList');
        const dashboardServerList = document.getElementById('dashboardServerList');
        
        if (!serverList && !dashboardServerList) return;
        
        const serverHTML = this.servers.map(server => `
            <div class="server-item ${server.status} ${!server.enabled ? 'disabled' : ''}">
                <div class="server-icon" style="background-color: ${server.color || '#667eea'}">
                    <i class="fas ${server.icon || 'fa-server'}"></i>
                </div>
                <div class="server-info">
                    <h4>${server.name}</h4>
                    <p class="server-address">${server.address}:${server.port}</p>
                    <div class="server-status">
                        <span class="status-dot ${server.status}"></span>
                        <span class="status-text">${server.status.toUpperCase()}</span>
                        <span class="player-count">
                            <i class="fas fa-user"></i> ${server.playersOnline}/${server.maxPlayers}
                        </span>
                        <span class="latency">${server.latency}ms</span>
                    </div>
                </div>
                <div class="server-actions">
                    <button class="btn-icon" onclick="monitor.toggleServer('${server.id}')" 
                            title="${server.enabled ? 'Disable' : 'Enable'}">
                        <i class="fas ${server.enabled ? 'fa-toggle-on' : 'fa-toggle-off'}"></i>
                    </button>
                    <button class="btn-icon" onclick="monitor.checkServer(monitor.servers.find(s => s.id === '${server.id}'))" 
                            title="Check Now">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                    <button class="btn-icon btn-danger" onclick="monitor.removeServer('${server.id}')" 
                            title="Remove">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        if (serverList) {
            serverList.innerHTML = serverHTML || '<p class="no-data">No servers added yet.</p>';
        }
        
        if (dashboardServerList) {
            dashboardServerList.innerHTML = serverHTML || '<p class="no-data">No servers configured.</p>';
        }
    }

    updatePlayerList() {
        const playerList = document.getElementById('playerList');
        const playerTableBody = document.getElementById('playerTableBody');
        
        if (!playerList && !playerTableBody) return;
        
        const onlinePlayers = this.players.filter(p => p.isOnline);
        const allPlayers = this.players;
        
        // Mobile view
        if (playerList) {
            const playerHTML = onlinePlayers.map(player => `
                <div class="player-item">
                    <div class="player-avatar">
                        ${player.username.charAt(0).toUpperCase()}
                    </div>
                    <div class="player-info">
                        <h4>${player.username}</h4>
                        <p class="player-server">${player.currentServer || 'Offline'}</p>
                        <div class="player-stats">
                            <span><i class="fas fa-clock"></i> ${this.formatPlayTime(player.totalPlayTime)}</span>
                            <span><i class="fas fa-signal"></i> ${player.sessions || 0} sessions</span>
                        </div>
                    </div>
                    <div class="player-status ${player.isOnline ? 'online' : 'offline'}">
                        <i class="fas fa-circle"></i>
                    </div>
                </div>
            `).join('');
            
            playerList.innerHTML = playerHTML || '<p class="no-data">No players online.</p>';
        }
        
        // Web dashboard view
        if (playerTableBody) {
            const tableHTML = allPlayers.map(player => `
                <tr>
                    <td>
                        <div class="player-cell">
                            <div class="player-avatar-small">
                                ${player.username.charAt(0).toUpperCase()}
                            </div>
                            <strong>${player.username}</strong>
                            ${player.favorite ? '<i class="fas fa-star favorite-star"></i>' : ''}
                        </div>
                    </td>
                    <td>
                        <span class="status-badge ${player.isOnline ? 'online' : 'offline'}">
                            ${player.isOnline ? 'Online' : 'Offline'}
                        </span>
                    </td>
                    <td>${player.currentServer || '-'}</td>
                    <td>${this.formatPlayTime(player.totalPlayTime)}</td>
                    <td>${this.formatDate(player.lastSeen)}</td>
                    <td>
                        <button class="btn-icon-small" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-icon-small" title="${player.favorite ? 'Remove from' : 'Add to'} favorites"
                                onclick="monitor.toggleFavorite('${player.id}')">
                            <i class="fas ${player.favorite ? 'fa-star' : 'fa-star-o'}"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
            
            playerTableBody.innerHTML = tableHTML || '<tr><td colspan="6">No players found.</td></tr>';
        }
    }

    updateServerDisplay(server) {
        // Update specific server display if needed
        const serverElement = document.querySelector(`[data-server-id="${server.id}"]`);
        if (serverElement) {
            serverElement.querySelector('.status-dot').className = `status-dot ${server.status}`;
            serverElement.querySelector('.status-text').textContent = server.status.toUpperCase();
            serverElement.querySelector('.player-count').innerHTML = 
                `<i class="fas fa-user"></i> ${server.playersOnline}/${server.maxPlayers}`;
            serverElement.querySelector('.latency').textContent = `${server.latency}ms`;
        }
    }

    async backupData() {
        console.log('💾 Creating backup...');
        
        const backup = {
            timestamp: new Date().toISOString(),
            servers: this.servers,
            players: this.players,
            config: this.config,
            alerts: this.alerts
        };
        
        const backupName = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
        
        // Save to localStorage
        localStorage.setItem(`backup_${backupName}`, JSON.stringify(backup, null, 2));
        
        this.lastBackup = new Date();
        
        // Update UI
        if (document.getElementById('lastBackupTime')) {
            document.getElementById('lastBackupTime').textContent = 
                this.formatDate(this.lastBackup);
        }
        
        this.logActivity('BACKUP_CREATE', 'Created system backup');
        
        return backupName;
    }

    async exportData(format = 'json') {
        console.log(`📤 Exporting data as ${format}...`);
        
        const data = {
            exportDate: new Date().toISOString(),
            servers: this.servers,
            players: this.players,
            statistics: this.getPlayerStats()
        };
        
        let exportContent, fileName;
        
        if (format === 'json') {
            exportContent = JSON.stringify(data, null, 2);
            fileName = `minecraft_export_${new Date().toISOString().split('T')[0]}.json`;
        } else if (format === 'csv') {
            // Convert to CSV (simplified)
            exportContent = this.convertToCSV(data);
            fileName = `minecraft_export_${new Date().toISOString().split('T')[0]}.csv`;
        }
        
        // Create download link
        const blob = new Blob([exportContent], { type: format === 'json' ? 'application/json' : 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.logActivity('DATA_EXPORT', `Exported data as ${format}`);
        
        return fileName;
    }

    async clearData() {
        if (!confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            return;
        }
        
        console.log('🗑️ Clearing all data...');
        
        // Create backup first
        await this.backupData();
        
        // Clear data
        this.servers = [];
        this.players = [];
        
        // Save empty data
        await this.saveServers();
        await this.savePlayers();
        
        // Update UI
        this.updateServerList();
        this.updatePlayerList();
        this.updateStats();
        
        this.logActivity('DATA_CLEAR', 'Cleared all data');
    }

    logActivity(type, message) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            type,
            message
        };
        
        console.log(`[${type}] ${message}`);
        
        // Add to log display
        this.addToLogDisplay(logEntry);
        
        // Save to localStorage
        const logs = JSON.parse(localStorage.getItem('activity_logs') || '[]');
        logs.unshift(logEntry);
        
        // Keep only last 100 logs
        if (logs.length > 100) {
            logs.pop();
        }
        
        localStorage.setItem('activity_logs', JSON.stringify(logs));
    }

    addToLogDisplay(logEntry) {
        const logList = document.getElementById('logList');
        const recentActivityList = document.getElementById('recentActivityList');
        const systemLogs = document.getElementById('systemLogs');
        
        const logHTML = `
            <div class="log-item ${logEntry.type.toLowerCase()}">
                <div class="log-icon">
                    <i class="fas ${this.getLogIcon(logEntry.type)}"></i>
                </div>
                <div class="log-content">
                    <p class="log-message">${logEntry.message}</p>
                    <small class="log-time">${this.formatTime(logEntry.timestamp)}</small>
                </div>
            </div>
        `;
        
        if (logList) {
            logList.insertAdjacentHTML('afterbegin', logHTML);
        }
        
        if (recentActivityList) {
            recentActivityList.insertAdjacentHTML('afterbegin', logHTML);
            
            // Keep only 10 items
            const items = recentActivityList.querySelectorAll('.log-item');
            if (items.length > 10) {
                items[items.length - 1].remove();
            }
        }
        
        if (systemLogs) {
            systemLogs.insertAdjacentHTML('afterbegin', logHTML);
        }
    }

    triggerEvent(eventName, data) {
        console.log(`🎯 Event: ${eventName}`, data);
        
        // Check if we should trigger an alert
        const alertConfig = this.alerts.triggers?.find(t => t.id === eventName);
        if (alertConfig && alertConfig.enabled) {
            this.triggerAlert(eventName, data);
        }
        
        // Call event listeners
        if (this.eventListeners[eventName]) {
            this.eventListeners[eventName].forEach(callback => callback(data));
        }
    }

    triggerAlert(alertType, data) {
        if (!this.alerts.enabled) return;
        
        const alertConfig = this.alerts.triggers?.find(t => t.id === alertType);
        if (!alertConfig) return;
        
        const message = this.formatAlertMessage(alertConfig.message, data);
        
        // Show browser notification
        if (this.alerts.desktop && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('Minecraft Monitor', {
                body: message,
                icon: '/icon.png'
            });
        }
        
        // Play sound
        if (this.alerts.sound) {
            this.playAlertSound(alertConfig.sound);
        }
        
        // Add to alert history
        if (!this.alerts.history) {
            this.alerts.history = [];
        }
        
        this.alerts.history.unshift({
            id: Date.now().toString(),
            type: alertType,
            message: message,
            timestamp: new Date().toISOString(),
            read: false
        });
        
        // Save alerts
        this.saveAlerts();
        
        console.log(`🔔 Alert: ${message}`);
    }

    // Utility methods
    formatPlayTime(seconds) {
        if (!seconds) return '0m';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }

    formatDate(dateString) {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        return date.toLocaleString();
    }

    formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString();
    }

    formatAlertMessage(template, data) {
        return template.replace(/{(\w+)}/g, (match, key) => data[key] || match);
    }

    getLogIcon(type) {
        const icons = {
            'MONITOR_START': 'fa-play',
            'MONITOR_STOP': 'fa-stop',
            'SERVER_CHECK': 'fa-search',
            'SERVER_ADD': 'fa-plus',
            'SERVER_REMOVE': 'fa-trash',
            'SERVER_TOGGLE': 'fa-toggle-on',
            'PLAYER_LOGIN': 'fa-sign-in-alt',
            'PLAYER_LOGOUT': 'fa-sign-out-alt',
            'BACKUP_CREATE': 'fa-save',
            'DATA_EXPORT': 'fa-download',
            'DATA_CLEAR': 'fa-trash',
            'DATA_SAVE': 'fa-save'
        };
        return icons[type] || 'fa-info-circle';
    }

    getUniquePlayersToday() {
        const today = new Date().toISOString().split('T')[0];
        return this.players.filter(p => 
            p.lastSeen && p.lastSeen.startsWith(today)
        ).length;
    }

    getPlayerStats() {
        const onlinePlayers = this.players.filter(p => p.isOnline);
        const totalPlayTime = this.players.reduce((sum, p) => sum + (p.totalPlayTime || 0), 0);
        const totalSessions = this.players.reduce((sum, p) => sum + (p.sessions || 0), 0);
        
        return {
            totalPlayers: this.players.length,
            onlinePlayers: onlinePlayers.length,
            totalPlayTime,
            totalSessions,
            uniqueToday: this.getUniquePlayersToday(),
            averageSessionTime: totalSessions > 0 ? Math.floor(totalPlayTime / totalSessions) : 0
        };
    }

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    convertToCSV(data) {
        // Simplified CSV conversion
        const serversCSV = this.arrayToCSV(data.servers, 'servers');
        const playersCSV = this.arrayToCSV(data.players, 'players');
        return `${serversCSV}\n\n${playersCSV}`;
    }

    arrayToCSV(array, section) {
        if (!array || array.length === 0) return `${section}:\nNo data`;
        
        const headers = Object.keys(array[0]);
        const rows = array.map(obj => 
            headers.map(header => JSON.stringify(obj[header])).join(',')
        );
        
        return `${section}:\n${headers.join(',')}\n${rows.join('\n')}`;
    }

    shouldBackup() {
        if (!this.lastBackup) return true;
        const backupInterval = this.config.storage?.backupInterval || 86400000;
        return Date.now() - this.lastBackup > backupInterval;
    }

    playAlertSound(soundFile) {
        // Play alert sound
        const audio = new Audio(soundFile);
        audio.play().catch(e => console.log('Could not play sound:', e));
    }

    on(eventName, callback) {
        if (!this.eventListeners[eventName]) {
            this.eventListeners[eventName] = [];
        }
        this.eventListeners[eventName].push(callback);
    }

    off(eventName, callback) {
        if (this.eventListeners[eventName]) {
            this.eventListeners[eventName] = 
                this.eventListeners[eventName].filter(cb => cb !== callback);
        }
    }

    toggleFavorite(playerId) {
        const player = this.players.find(p => p.id === playerId);
        if (player) {
            player.favorite = !player.favorite;
            this.savePlayers();
            this.updatePlayerList();
        }
    }
}

// Global instance
const monitor = new MinecraftMonitor();

// Expose to window for HTML onclick handlers
window.monitor = monitor;

// Utility functions for HTML
window.startMonitoring = () => monitor.startMonitoring();
window.stopMonitoring = () => monitor.stopMonitoring();
window.toggleMonitoring = () => monitor.toggleMonitoring();
window.refreshPlayers = () => monitor.updatePlayerList();
window.clearLogs = () => {
    localStorage.removeItem('activity_logs');
    const logList = document.getElementById('logList');
    if (logList) logList.innerHTML = '<p class="no-data">Logs cleared.</p>';
};
window.exportData = () => monitor.exportData('json');
window.backupData = () => monitor.backupData();
window.clearData = () => monitor.clearData();
window.openDashboard = () => window.open('dashboard.html', '_blank');
window.showTab = (tabName) => {
    // Hide all tabs
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    
    // Show selected tab
    document.getElementById(`${tabName}Tab`).classList.add('active');
    document.querySelector(`.tab[onclick*="${tabName}"]`).classList.add('active');
};
window.addServer = () => {
    document.getElementById('serverModal').style.display = 'block';
};
window.closeModal = () => {
    document.getElementById('serverModal').style.display = 'none';
};
window.saveServer = async () => {
    const name = document.getElementById('serverName').value;
    const address = document.getElementById('serverAddress').value;
    const port = document.getElementById('serverPort').value;
    
    if (name && address) {
        await monitor.addServer({
            name,
            address,
            port: parseInt(port) || 25565,
            type: 'java',
            maxPlayers: 20
        });
        closeModal();
        
        // Clear form
        document.getElementById('serverName').value = '';
        document.getElementById('serverAddress').value = '';
        document.getElementById('serverPort').value = '25565';
    } else {
        alert('Please fill in all required fields.');
    }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Auto-start monitoring if on dashboard
    if (window.location.pathname.includes('dashboard.html')) {
        monitor.startMonitoring();
    }
    
    // Load existing logs
    const logs = JSON.parse(localStorage.getItem('activity_logs') || '[]');
    logs.forEach(log => monitor.addToLogDisplay(log));
});