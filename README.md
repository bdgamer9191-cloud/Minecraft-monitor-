# 🎮 Minecraft Player Monitoring System

[![JavaScript](https://img.shields.io/badge/JavaScript-100%25-yellow)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-100%25-orange)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-100%25-blue)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Local Storage](https://img.shields.io/badge/Storage-Local-brightgreen)](https://developer.mozilla.org/en-US/docs/Web/API/Storage)
[![Mobile Friendly](https://img.shields.io/badge/Mobile-Friendly-success)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![No Dependencies](https://img.shields.io/badge/Dependencies-None-lightgrey)]()

<div align="center">
  
⚠️ **DEVELOPMENT WARNING** ⚠️
  
**This project is currently in active development.**
**You may encounter bugs, incomplete features, or unexpected behavior.**
**Please report any issues to: ahadgaming199@gmail.com**

</div>

---

A complete, self-contained Minecraft server and player monitoring system that works entirely in your browser. Monitor multiple Minecraft servers, track player activity, and view analytics - all stored locally on your device.

## 📋 Features

### 🎯 **Core Monitoring**
- ✅ **Multi-Server Support**: Monitor unlimited Minecraft servers simultaneously
- ✅ **Real-time Tracking**: Live player login/logout detection
- ✅ **Server Health Checks**: Ping status, player count, latency monitoring
- ✅ **Auto-refresh**: Configurable check intervals (10-300 seconds)

### 📊 **Data Management**
- ✅ **Local Storage**: All data stored in browser (IndexedDB + localStorage)
- ✅ **Offline Support**: Works completely without internet
- ✅ **Auto-backup**: Scheduled database backups
- ✅ **Data Export**: JSON and CSV export functionality
- ✅ **Import/Export**: Easy data migration between devices

### 🖥️ **Dual Interface**
- ✅ **Mobile Interface**: Touch-optimized, swipe-friendly mobile UI
- ✅ **Web Dashboard**: Full-featured desktop dashboard with charts
- ✅ **Responsive Design**: Works on all screen sizes
- ✅ **Dark/Light Mode**: Automatic theme detection

### 🔔 **Notifications & Alerts**
- ✅ **Browser Notifications**: Player login/logout alerts
- ✅ **Sound Alerts**: Configurable sound notifications
- ✅ **Visual Indicators**: Color-coded status badges
- ✅ **Event Logging**: Complete activity history

### 📈 **Analytics & Reporting**
- ✅ **Live Charts**: Server status, player activity, and more
- ✅ **Player Statistics**: Play time, sessions, trends
- ✅ **Server Analytics**: Uptime, popularity, performance
- ✅ **Export Reports**: Generate detailed player reports

## 🚀 Quick Start

### **Method 1: Direct File Access**
`# Clone or download the repository
git clone https://github.com/yourusername/minecraft-monitor.git

# Navigate to the folder
cd minecraft-monitor

# Open index.html in any browser
# That's it! No installation needed.`

### **Method 2: Android/Termux**
`# On Termux (Android)
cd /storage/emulated/0/Download/
mkdir MinecraftMonitor
cd MinecraftMonitor
# Copy all files here

# Start local server
python3 -m http.server 8080

# Open in browser
# http://localhost:8080`

### **Method 3: Web Hosting**
1. Upload all files to your web hosting
2. Access via: `https://yourdomain.com/minecraft-monitor/`
3. All data persists in user's browser

## 📁 File Structure

`minecraft-monitor/
├── 📱 index.html                    # Mobile main interface
├── 🌐 dashboard.html                # Web analytics dashboard
├── ⚙️ config.json                   # Application configuration
├── 🗄️ servers.json                  # Server database
├── 📊 players.json                  # Player database
├── 🔔 alerts.json                   # Notification settings
├── 🎮 monitor.js                    # Main monitoring logic
├── 🖥️ dashboard.js                  # Dashboard functionality
├── 📱 mobile-ui.js                  # Mobile interface logic
├── 🗃️ database.js                   # Data storage manager
├── 🔧 utils.js                      # Utility functions
├── 🎨 style.css                     # Core styles
├── 📱 mobile.css                    # Mobile-specific styles
├── 🌐 web.css                       # Dashboard styles
├── 📋 README.md                     # This documentation
├── 🔐 auth.xml                      # Authentication config
├── 📜 log.txt                       # Initial activity log
├── 📁 logs/                         # Logs folder
│   └── activity.log
├── 📁 backups/                      # Automatic backups
│   └── backup_20240101.json
└── 📁 exports/                      # Data exports
    └── export_20240101.json`

## 🛠️ How to Use

### **1. Adding Servers**
1. Open the mobile interface (`index.html`)
2. Click the "Add Server" button
3. Enter server details:
   - **Name**: Display name (e.g., "Hypixel Network")
   - **Address**: Server IP/hostname (e.g., `mc.hypixel.net`)
   - **Port**: Minecraft port (default: `25565`)
4. Click "Save Server"

### **2. Starting Monitoring**
1. Click the "Start" button in the footer
2. The system will begin checking servers automatically
3. View real-time status in the Servers tab

### **3. Viewing Players**
1. Navigate to the Players tab
2. See all online players with their:
   - Current server
   - Play time
   - Status (online/offline)
   - Session duration

### **4. Using the Web Dashboard**
1. Open `dashboard.html` for advanced features
2. Includes:
   - Live charts and graphs
   - Player statistics
   - Server analytics
   - Export functionality
   - Settings management

### **5. Exporting Data**
1. Go to Settings tab
2. Click "Export Data"
3. Choose format (JSON or CSV)
4. Data downloads automatically

## ⚙️ Configuration Files

### **config.json** - Main Configuration
`{
  "monitoring": {
    "checkInterval": 30000,
    "maxRetries": 3,
    "timeout": 5000
  },
  "notifications": {
    "enabled": true,
    "playerLogin": true,
    "playerLogout": true
  },
  "storage": {
    "backupInterval": 86400000,
    "maxBackups": 10
  }
}`

### **servers.json** - Server Database
`[
  {
    "id": "1",
    "name": "Hypixel Network",
    "address": "mc.hypixel.net",
    "port": 25565,
    "enabled": true,
    "checkInterval": 60000
  }
]`

### **players.json** - Player Database
`{
  "players": [
    {
      "id": "1",
      "username": "PlayerOne",
      "firstSeen": "2024-01-01T10:00:00Z",
      "lastSeen": "2024-01-01T14:30:00Z",
      "totalPlayTime": 3600,
      "isOnline": false
    }
  ]
}`

## 🎯 API Reference

### **Monitor Class** (`monitor.js`)
`// Start monitoring
monitor.startMonitoring();

// Stop monitoring
monitor.stopMonitoring();

// Add a new server
monitor.addServer({
  name: "Server Name",
  address: "server.ip",
  port: 25565
});

// Export data
monitor.exportData('json'); // or 'csv'

// Get statistics
const stats = monitor.getStatistics();`

### **Database Manager** (`database.js`)
`// Get all servers
const servers = await database.getServers();

// Get online players
const onlinePlayers = await database.getOnlinePlayers();

// Add player session
await database.addSession({
  playerName: "PlayerOne",
  server: "Hypixel",
  loginTime: new Date().toISOString()
});

// Export all data
const data = await database.exportData();`

### **Utilities** (`utils.js`)
`// Format play time
utils.formatPlayTime(3600); // "1h 0m"

// Format date
utils.formatDate('2024-01-01T10:00:00Z'); // "Jan 1, 2024"

// Show notification
utils.showToast('Player logged in', 'success');

// Validate Minecraft username
utils.isValidMinecraftUsername('PlayerOne'); // true`

## 📱 Mobile Features

### **Touch Optimization**
- Large touch targets (44px minimum)
- Swipe gestures between tabs
- Haptic feedback support
- Mobile-optimized animations

### **Offline Capabilities**
- Works without internet connection
- Data syncs when back online
- Local storage persistence
- No server dependencies

### **Mobile UI Components**
- Action sheets for menus
- Pull-to-refresh
- Bottom navigation
- Mobile modals

## 🌐 Web Dashboard Features

### **Analytics Dashboard**
- Real-time server status charts
- Player activity timelines
- Server popularity graphs
- Performance metrics

### **Data Management**
- Bulk server operations
- Player search and filter
- Session history viewer
- Export/import tools

### **System Administration**
- User management (via auth.xml)
- Log viewing and filtering
- Backup management
- System configuration

## 🔧 Advanced Configuration

### **Authentication Setup** (`auth.xml`)
`<?xml version="1.0" encoding="UTF-8"?>
<authentication>
  <enabled>false</enabled>
  <users>
    <user>
      <username>admin</username>
      <password>minecraft</password>
      <role>admin</role>
    </user>
  </users>
</authentication>`

### **Custom Styling**
Override CSS variables in `style.css`:
`:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --success-color: #10b981;
  --danger-color: #ef4444;
}`

### **Notification Sounds**
Add custom alert sounds:
`// In alerts.json
{
  "triggers": [
    {
      "id": "player_login",
      "sound": "custom-login.mp3"
    }
  ]
}`

## 🚨 Troubleshooting

### **Common Issues**

#### **1. Server Not Responding**
`✅ Solution:
- Check server address and port
- Verify server is online
- Check firewall settings
- Try different DNS server`

#### **2. No Player Data**
`✅ Solution:
- Ensure monitoring is started
- Check server has players
- Verify notification permissions
- Clear browser cache`

#### **3. Data Not Saving**
`✅ Solution:
- Check browser storage permissions
- Clear old data if storage full
- Try different browser
- Export data and reinstall`

#### **4. Mobile Notifications Not Working**
`✅ Solution:
- Enable browser notifications
- Check "Do Not Disturb" settings
- Update browser to latest version
- Grant notification permissions`

### **Debug Mode**
Enable debug logging in `config.json`:
`{
  "logging": {
    "level": "debug",
    "enableConsole": true
  }
}`

Check browser console for errors:
`// Press F12 > Console
// Look for error messages`

## 🔄 Backup & Migration

### **Automatic Backups**
- Daily automatic backups
- Stored in `/backups/` folder
- Keep last 10 backups
- Manual backup option available

### **Manual Backup**
1. Go to Settings tab
2. Click "Backup Now"
3. Backup saved as JSON file
4. Store safely for recovery

### **Restore from Backup**
1. Export current data (optional)
2. Delete existing data
3. Import backup file
4. Restart monitoring

### **Migrate Between Devices**
1. Export data from source device
2. Transfer export file
3. Import on target device
4. All data transferred

## 📊 Performance Tips

### **Optimization Settings**
`{
  "monitoring": {
    "checkInterval": 60000,  // Increase for less frequent checks
    "maxRetries": 2,         // Reduce retry attempts
    "timeout": 3000          // Lower timeout for faster failures
  },
  "ui": {
    "refreshRate": 15000,    // Reduce UI refresh rate
    "animations": false      // Disable animations for performance
  }
}`

### **Storage Management**
- Old logs auto-cleaned after 30 days
- Backups limited to 10 files
- Export unused data
- Clear cache periodically

### **Memory Usage**
- Uses IndexedDB for efficient storage
- Lazy loading of historical data
- Pagination for large datasets
- Automatic garbage collection

## 🤝 Contributing

### **Development Setup**
`# 1. Fork the repository
# 2. Clone your fork
git clone https://github.com/yourusername/minecraft-monitor.git

# 3. Create feature branch
git checkout -b feature/new-feature

# 4. Make changes
# 5. Test thoroughly
# 6. Commit changes
git commit -m "Add new feature"

# 7. Push to branch
git push origin feature/new-feature

# 8. Create Pull Request`

### **Code Guidelines**
- Use ES6+ JavaScript features
- Follow existing code style
- Add comments for complex logic
- Test on mobile and desktop
- Update documentation

### **Feature Requests**
1. Check existing issues
2. Create new issue with details
3. Discuss implementation
4. Submit PR when ready

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## 🙏 Acknowledgments

- **Minecraft Community** - For inspiration and testing
- **Browser Developers** - For amazing web technologies
- **Open Source Projects** - That make projects like this possible
- **Contributors** - Everyone who helps improve this project

## 📞 Support

### **Documentation**
- [GitHub Wiki](https://github.com/yourusername/minecraft-monitor/wiki)
- [API Reference](https://github.com/yourusername/minecraft-monitor/docs)
- [Troubleshooting Guide](https://github.com/yourusername/minecraft-monitor/troubleshooting)

### **Community**
- [GitHub Issues](https://github.com/yourusername/minecraft-monitor/issues)
- [Discord Server](https://discord.gg/your-server)
- [Twitter Updates](https://twitter.com/minecraft-monitor)

### **Bug Reports & Issues**
**⚠️ IMPORTANT: This project is in development ⚠️**

If you encounter any bugs, issues, or unexpected behavior:
1. **Check the console** (F12 > Console) for error messages
2. **Clear browser cache** and try again
3. **Export your data** before making any changes
4. **Contact support**: ahadgaming199@gmail.com

**Include in your report:**
- Browser name and version
- Operating system
- Steps to reproduce the issue
- Screenshots if possible
- Console error messages

### **Donations**
If you find this project useful, consider supporting development:
- [GitHub Sponsors](https://github.com/sponsors/yourusername)
- [Buy Me a Coffee](https://buymeacoffee.com/yourusername)
- [Patreon](https://patreon.com/yourusername)

---

**Happy Monitoring!** 🎮👀📊

*"Track every block, monitor every player, know your server better than ever."*

---
<div align="center">

⚠️ **REMEMBER:** This is a development version. Features may change, bugs may occur.
**Report issues to: ahadgaming199@gmail.com**

</div>