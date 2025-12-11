class DatabaseManager {
    constructor() {
        this.dbName = 'MinecraftMonitorDB';
        this.dbVersion = 1;
        this.db = null;
        this.init();
    }

    async init() {
        console.log('🗃️ Database Manager Initializing...');
        
        // Initialize IndexedDB
        await this.initIndexedDB();
        
        // Load data from localStorage as fallback
        this.loadFromLocalStorage();
        
        console.log('✅ Database Manager Ready');
    }

    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            if (!('indexedDB' in window)) {
                console.log('IndexedDB not supported, using localStorage');
                resolve(false);
                return;
            }
            
            const request = indexedDB.open(this.dbName, this.dbVersion);
            
            request.onerror = (event) => {
                console.error('IndexedDB error:', event.target.error);
                reject(event.target.error);
            };
            
            request.onsuccess = (event) => {
                this.db = event.target.result;
                console.log('IndexedDB opened successfully');
                resolve(true);
                
                // Check for existing data
                this.migrateFromLocalStorage();
            };
            
            request.onupgradeneeded = (event) => {
                this.db = event.target.result;
                this.createObjectStores();
            };
        });
    }

    createObjectStores() {
        // Servers store
        if (!this.db.objectStoreNames.contains('servers')) {
            const serversStore = this.db.createObjectStore('servers', { keyPath: 'id' });
            serversStore.createIndex('name', 'name', { unique: false });
            serversStore.createIndex('status', 'status', { unique: false });
            serversStore.createIndex('enabled', 'enabled', { unique: false });
        }
        
        // Players store
        if (!this.db.objectStoreNames.contains('players')) {
            const playersStore = this.db.createObjectStore('players', { keyPath: 'id' });
            playersStore.createIndex('username', 'username', { unique: true });
            playersStore.createIndex('isOnline', 'isOnline', { unique: false });
            playersStore.createIndex('currentServer', 'currentServer', { unique: false });
        }
        
        // Sessions store
        if (!this.db.objectStoreNames.contains('sessions')) {
            const sessionsStore = this.db.createObjectStore('sessions', { keyPath: 'id', autoIncrement: true });
            sessionsStore.createIndex('playerId', 'playerId', { unique: false });
            sessionsStore.createIndex('loginTime', 'loginTime', { unique: false });
        }
        
        // Events store
        if (!this.db.objectStoreNames.contains('events')) {
            const eventsStore = this.db.createObjectStore('events', { keyPath: 'id', autoIncrement: true });
            eventsStore.createIndex('type', 'type', { unique: false });
            eventsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        // Config store
        if (!this.db.objectStoreNames.contains('config')) {
            this.db.createObjectStore('config', { keyPath: 'key' });
        }
    }

    async migrateFromLocalStorage() {
        // Check if we have data in localStorage to migrate
        const hasLocalStorageData = localStorage.getItem('servers') !== null;
        
        if (hasLocalStorageData && this.db) {
            console.log('Migrating data from localStorage to IndexedDB...');
            
            try {
                // Migrate servers
                const servers = JSON.parse(localStorage.getItem('servers') || '[]');
                await this.saveServers(servers);
                
                // Migrate players
                const playersData = JSON.parse(localStorage.getItem('players') || '{}');
                await this.savePlayers(playersData.players || []);
                
                // Migrate config
                const config = JSON.parse(localStorage.getItem('config.json') || '{}');
                await this.saveConfig(config);
                
                // Clear localStorage after migration
                localStorage.removeItem('servers');
                localStorage.removeItem('players');
                localStorage.removeItem('config.json');
                
                console.log('Data migration completed');
            } catch (error) {
                console.error('Migration failed:', error);
            }
        }
    }

    loadFromLocalStorage() {
        // Load data from localStorage as fallback
        if (!this.db) {
            console.log('Using localStorage as database');
            
            // Load servers
            const servers = JSON.parse(localStorage.getItem('servers') || '[]');
            
            // Load players
            const playersData = JSON.parse(localStorage.getItem('players') || '{}');
            
            // Load config
            const config = JSON.parse(localStorage.getItem('config.json') || '{}');
            
            return {
                servers,
                players: playersData.players || [],
                config
            };
        }
        
        return null;
    }

    // Server operations
    async saveServers(servers) {
        if (this.db) {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['servers'], 'readwrite');
                const store = transaction.objectStore('servers');
                
                // Clear existing data
                const clearRequest = store.clear();
                
                clearRequest.onsuccess = () => {
                    // Add all servers
                    servers.forEach(server => {
                        store.add(server);
                    });
                    
                    transaction.oncomplete = () => resolve(true);
                    transaction.onerror = (event) => reject(event.target.error);
                };
                
                clearRequest.onerror = (event) => reject(event.target.error);
            });
        } else {
            // Fallback to localStorage
            localStorage.setItem('servers', JSON.stringify(servers));
            return true;
        }
    }

    async getServers() {
        if (this.db) {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['servers'], 'readonly');
                const store = transaction.objectStore('servers');
                const request = store.getAll();
                
                request.onsuccess = (event) => resolve(event.target.result);
                request.onerror = (event) => reject(event.target.error);
            });
        } else {
            // Fallback to localStorage
            return JSON.parse(localStorage.getItem('servers') || '[]');
        }
    }

    async addServer(server) {
        if (this.db) {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['servers'], 'readwrite');
                const store = transaction.objectStore('servers');
                const request = store.add(server);
                
                request.onsuccess = () => resolve(server);
                request.onerror = (event) => reject(event.target.error);
            });
        } else {
            // Fallback to localStorage
            const servers = JSON.parse(localStorage.getItem('servers') || '[]');
            servers.push(server);
            localStorage.setItem('servers', JSON.stringify(servers));
            return server;
        }
    }

    async updateServer(serverId, updates) {
        if (this.db) {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['servers'], 'readwrite');
                const store = transaction.objectStore('servers');
                const getRequest = store.get(serverId);
                
                getRequest.onsuccess = (event) => {
                    const server = event.target.result;
                    if (server) {
                        Object.assign(server, updates);
                        const putRequest = store.put(server);
                        putRequest.onsuccess = () => resolve(server);
                        putRequest.onerror = (event) => reject(event.target.error);
                    } else {
                        reject(new Error('Server not found'));
                    }
                };
                
                getRequest.onerror = (event) => reject(event.target.error);
            });
        } else {
            // Fallback to localStorage
            const servers = JSON.parse(localStorage.getItem('servers') || '[]');
            const index = servers.findIndex(s => s.id === serverId);
            if (index !== -1) {
                Object.assign(servers[index], updates);
                localStorage.setItem('servers', JSON.stringify(servers));
                return servers[index];
            }
            throw new Error('Server not found');
        }
    }

    async deleteServer(serverId) {
        if (this.db) {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['servers'], 'readwrite');
                const store = transaction.objectStore('servers');
                const request = store.delete(serverId);
                
                request.onsuccess = () => resolve(true);
                request.onerror = (event) => reject(event.target.error);
            });
        } else {
            // Fallback to localStorage
            const servers = JSON.parse(localStorage.getItem('servers') || '[]');
            const filteredServers = servers.filter(s => s.id !== serverId);
            localStorage.setItem('servers', JSON.stringify(filteredServers));
            return true;
        }
    }

    // Player operations
    async savePlayers(players) {
        if (this.db) {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['players'], 'readwrite');
                const store = transaction.objectStore('players');
                
                // Clear existing data
                const clearRequest = store.clear();
                
                clearRequest.onsuccess = () => {
                    // Add all players
                    players.forEach(player => {
                        store.add(player);
                    });
                    
                    transaction.oncomplete = () => resolve(true);
                    transaction.onerror = (event) => reject(event.target.error);
                };
                
                clearRequest.onerror = (event) => reject(event.target.error);
            });
        } else {
            // Fallback to localStorage
            const playersData = {
                players,
                sessions: [],
                statistics: this.calculatePlayerStats(players)
            };
            localStorage.setItem('players', JSON.stringify(playersData));
            return true;
        }
    }

    async getPlayers() {
        if (this.db) {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['players'], 'readonly');
                const store = transaction.objectStore('players');
                const request = store.getAll();
                
                request.onsuccess = (event) => resolve(event.target.result);
                request.onerror = (event) => reject(event.target.error);
            });
        } else {
            // Fallback to localStorage
            const playersData = JSON.parse(localStorage.getItem('players') || '{}');
            return playersData.players || [];
        }
    }

    async getOnlinePlayers() {
        const players = await this.getPlayers();
        return players.filter(p => p.isOnline);
    }

    async addPlayer(player) {
        if (this.db) {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['players'], 'readwrite');
                const store = transaction.objectStore('players');
                const request = store.add(player);
                
                request.onsuccess = () => resolve(player);
                request.onerror = (event) => reject(event.target.error);
            });
        } else {
            // Fallback to localStorage
            const playersData = JSON.parse(localStorage.getItem('players') || '{}');
            const players = playersData.players || [];
            players.push(player);
            
            const updatedData = {
                players,
                sessions: playersData.sessions || [],
                statistics: this.calculatePlayerStats(players)
            };
            
            localStorage.setItem('players', JSON.stringify(updatedData));
            return player;
        }
    }

    async updatePlayer(playerId, updates) {
        if (this.db) {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['players'], 'readwrite');
                const store = transaction.objectStore('players');
                const getRequest = store.get(playerId);
                
                getRequest.onsuccess = (event) => {
                    const player = event.target.result;
                    if (player) {
                        Object.assign(player, updates);
                        const putRequest = store.put(player);
                        putRequest.onsuccess = () => resolve(player);
                        putRequest.onerror = (event) => reject(event.target.error);
                    } else {
                        reject(new Error('Player not found'));
                    }
                };
                
                getRequest.onerror = (event) => reject(event.target.error);
            });
        } else {
            // Fallback to localStorage
            const playersData = JSON.parse(localStorage.getItem('players') || '{}');
            const players = playersData.players || [];
            const index = players.findIndex(p => p.id === playerId);
            
            if (index !== -1) {
                Object.assign(players[index], updates);
                
                const updatedData = {
                    players,
                    sessions: playersData.sessions || [],
                    statistics: this.calculatePlayerStats(players)
                };
                
                localStorage.setItem('players', JSON.stringify(updatedData));
                return players[index];
            }
            throw new Error('Player not found');
        }
    }

    // Session operations
    async addSession(session) {
        if (this.db) {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['sessions'], 'readwrite');
                const store = transaction.objectStore('sessions');
                const request = store.add(session);
                
                request.onsuccess = () => resolve(session);
                request.onerror = (event) => reject(event.target.error);
            });
        } else {
            // Fallback to localStorage
            const playersData = JSON.parse(localStorage.getItem('players') || '{}');
            const sessions = playersData.sessions || [];
            sessions.push(session);
            
            const updatedData = {
                players: playersData.players || [],
                sessions,
                statistics: this.calculatePlayerStats(playersData.players || [])
            };
            
            localStorage.setItem('players', JSON.stringify(updatedData));
            return session;
        }
    }

    async getPlayerSessions(playerId) {
        if (this.db) {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['sessions'], 'readonly');
                const store = transaction.objectStore('sessions');
                const index = store.index('playerId');
                const request = index.getAll(playerId);
                
                request.onsuccess = (event) => resolve(event.target.result);
                request.onerror = (event) => reject(event.target.error);
            });
        } else {
            // Fallback to localStorage
            const playersData = JSON.parse(localStorage.getItem('players') || '{}');
            return playersData.sessions?.filter(s => s.playerId === playerId) || [];
        }
    }

    // Event operations
    async addEvent(event) {
        if (this.db) {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['events'], 'readwrite');
                const store = transaction.objectStore('events');
                const request = store.add(event);
                
                request.onsuccess = () => resolve(event);
                request.onerror = (event) => reject(event.target.error);
            });
        } else {
            // Fallback to localStorage
            const events = JSON.parse(localStorage.getItem('events') || '[]');
            events.push(event);
            
            // Keep only last 100 events
            if (events.length > 100) {
                events.shift();
            }
            
            localStorage.setItem('events', JSON.stringify(events));
            return event;
        }
    }

    async getEvents(limit = 50) {
        if (this.db) {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['events'], 'readonly');
                const store = transaction.objectStore('events');
                const index = store.index('timestamp');
                const request = index.openCursor(null, 'prev');
                
                const events = [];
                request.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor && events.length < limit) {
                        events.push(cursor.value);
                        cursor.continue();
                    } else {
                        resolve(events);
                    }
                };
                
                request.onerror = (event) => reject(event.target.error);
            });
        } else {
            // Fallback to localStorage
            const events = JSON.parse(localStorage.getItem('events') || '[]');
            return events.slice(-limit).reverse();
        }
    }

    // Config operations
    async saveConfig(config) {
        if (this.db) {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['config'], 'readwrite');
                const store = transaction.objectStore('config');
                const request = store.put({ key: 'app', value: config });
                
                request.onsuccess = () => resolve(true);
                request.onerror = (event) => reject(event.target.error);
            });
        } else {
            // Fallback to localStorage
            localStorage.setItem('config.json', JSON.stringify(config));
            return true;
        }
    }

    async getConfig() {
        if (this.db) {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(['config'], 'readonly');
                const store = transaction.objectStore('config');
                const request = store.get('app');
                
                request.onsuccess = (event) => resolve(event.target.result?.value || {});
                request.onerror = (event) => reject(event.target.error);
            });
        } else {
            // Fallback to localStorage
            return JSON.parse(localStorage.getItem('config.json') || '{}');
        }
    }

    // Statistics
    calculatePlayerStats(players) {
        const onlinePlayers = players.filter(p => p.isOnline);
        const totalPlayTime = players.reduce((sum, p) => sum + (p.totalPlayTime || 0), 0);
        const totalSessions = players.reduce((sum, p) => sum + (p.sessions || 0), 0);
        
        return {
            totalPlayers: players.length,
            onlinePlayers: onlinePlayers.length,
            totalPlayTime,
            totalSessions,
            averageSessionTime: totalSessions > 0 ? Math.floor(totalPlayTime / totalSessions) : 0
        };
    }

    async getStatistics() {
        const players = await this.getPlayers();
        return this.calculatePlayerStats(players);
    }

    // Backup and export
    async exportData(format = 'json') {
        const servers = await this.getServers();
        const players = await this.getPlayers();
        const config = await this.getConfig();
        const events = await this.getEvents(1000);
        
        const data = {
            exportDate: new Date().toISOString(),
            servers,
            players,
            config,
            events,
            statistics: await this.getStatistics()
        };
        
        if (format === 'json') {
            return JSON.stringify(data, null, 2);
        } else if (format === 'csv') {
            return this.convertToCSV(data);
        }
        
        return data;
    }

    convertToCSV(data) {
        // Convert data to CSV format
        const csvRows = [];
        
        // Servers CSV
        if (data.servers.length > 0) {
            csvRows.push('SERVERS');
            const serverHeaders = Object.keys(data.servers[0]);
            csvRows.push(serverHeaders.join(','));
            data.servers.forEach(server => {
                csvRows.push(serverHeaders.map(header => 
                    JSON.stringify(server[header])).join(','));
            });
            csvRows.push('');
        }
        
        // Players CSV
        if (data.players.length > 0) {
            csvRows.push('PLAYERS');
            const playerHeaders = Object.keys(data.players[0]);
            csvRows.push(playerHeaders.join(','));
            data.players.forEach(player => {
                csvRows.push(playerHeaders.map(header => 
                    JSON.stringify(player[header])).join(','));
            });
        }
        
        return csvRows.join('\n');
    }

    async clearAllData() {
        if (this.db) {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction(
                    ['servers', 'players', 'sessions', 'events', 'config'], 
                    'readwrite'
                );
                
                let completed = 0;
                const totalStores = 5;
                
                const checkComplete = () => {
                    completed++;
                    if (completed === totalStores) {
                        resolve(true);
                    }
                };
                
                transaction.objectStore('servers').clear().onsuccess = checkComplete;
                transaction.objectStore('players').clear().onsuccess = checkComplete;
                transaction.objectStore('sessions').clear().onsuccess = checkComplete;
                transaction.objectStore('events').clear().onsuccess = checkComplete;
                transaction.objectStore('config').clear().onsuccess = checkComplete;
                
                transaction.onerror = (event) => reject(event.target.error);
            });
        } else {
            // Clear localStorage
            localStorage.removeItem('servers');
            localStorage.removeItem('players');
            localStorage.removeItem('config.json');
            localStorage.removeItem('events');
            return true;
        }
    }

    // Utility methods
    async getDatabaseSize() {
        if (this.db) {
            // Estimate size by getting all data
            const servers = await this.getServers();
            const players = await this.getPlayers();
            const events = await this.getEvents();
            
            const totalSize = JSON.stringify({ servers, players, events }).length;
            return totalSize;
        } else {
            // Estimate localStorage size
            let total = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    total += localStorage[key].length * 2; // UTF-16
                }
            }
            return total;
        }
    }

    async backup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupName = `backup_${timestamp}`;
        const data = await this.exportData('json');
        
        // Save backup to localStorage
        localStorage.setItem(`backup_${backupName}`, data);
        
        // Limit number of backups
        this.cleanupOldBackups();
        
        return backupName;
    }

    cleanupOldBackups() {
        const maxBackups = 10;
        const backups = [];
        
        // Find all backups
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('backup_')) {
                backups.push(key);
            }
        }
        
        // Sort by timestamp (newest first)
        backups.sort((a, b) => b.localeCompare(a));
        
        // Remove old backups
        backups.slice(maxBackups).forEach(key => {
            localStorage.removeItem(key);
        });
    }
}

// Global database instance
const database = new DatabaseManager();

// Make available globally
window.database = database;

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DatabaseManager, database };
}