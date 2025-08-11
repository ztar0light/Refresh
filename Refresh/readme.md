# YouTube Ad Skipper Chrome Extension

A sleek, user-friendly Chrome extension that automatically detects YouTube ads, pauses the video, refreshes the page, and seamlessly returns you to your exact timestamp.

## ✨ Features

- **Automatic Ad Detection**: Uses multiple detection methods including DOM monitoring and visual cues
- **Smart Timestamp Recovery**: Remembers exactly where you were watching and returns you there
- **Beautiful Modern UI**: Glassmorphism design with smooth animations
- **Real-time Statistics**: Track how many ads you've skipped today
- **Smart Detection Mode**: Advanced monitoring for faster ad detection
- **Zero Configuration**: Works immediately after installation

## 🚀 Installation Instructions

### Method 1: Load as Unpacked Extension (Recommended for Development)

1. **Download the Files**
   - Copy all the code from the artifacts above into separate files
   - Create a new folder called `youtube-ad-skipper`

2. **Create the File Structure**
   ```
   youtube-ad-skipper/
   ├── manifest.json
   ├── popup.html
   ├── popup.js
   ├── content.js
   ├── background.js
   └── icons/ (optional - create simple icons)
       ├── icon16.png
       ├── icon48.png
       └── icon128.png
   ```

3. **Create Icon Files** (Optional)
   - Create simple 16x16, 48x48, and 128x128 pixel PNG icons
   - Or remove the icons section from manifest.json if you don't want icons

4. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select your `youtube-ad-skipper` folder

### Method 2: Package as .crx File

1. In Chrome extensions page, click "Pack extension"
2. Select your extension folder
3. Generate the .crx file
4. Share with others to install

## 📝 File Contents

Copy the following code into their respective files:

### manifest.json
```json
[Copy the manifest content from artifact 1]
```

### popup.html
```html
[Copy the HTML content from artifact 2]
```

### content.js
```javascript
[Copy the JavaScript content from artifact 3]
```

### popup.js
```javascript
[Copy the JavaScript content from artifact 4]
```

### background.js
```javascript
[Copy the JavaScript content from artifact 5]
```

## 🎯 How It Works

1. **Detection**: The extension monitors YouTube pages for ad indicators using multiple methods:
   - DOM element detection (ad containers, skip buttons, etc.)
   - Text content analysis (looking for "Ad •", "Advertisement", etc.)
   - Video source URL checking
   - Real-time DOM mutation monitoring

2. **Timestamp Storage**: When an ad is detected, it immediately stores the current video timestamp

3. **Page Refresh**: The page is refreshed to bypass the ad entirely

4. **Recovery**: Once the page reloads, the extension waits for the video to be ready and seeks to the stored timestamp

5. **Cooldown**: A smart cooldown period prevents infinite refresh loops

## 🎨 User Interface

The extension features a modern, beautiful popup interface with:
- **Gradient Background**: Eye-catching purple gradient with animated shimmer effect
- **Glass Morphism**: Translucent panels with backdrop blur
- **Smooth Animations**: Hover effects and transitions throughout
- **Toggle Switches**: Beautiful custom toggle switches for settings
- **Live Statistics**: Real-time counter of ads blocked today
- **Status Notifications**: Informative popup notifications

## ⚙️ Settings

- **Auto Skip Ads**: Enable/disable the automatic ad skipping functionality
- **Smart Detection**: Toggle advanced DOM monitoring for faster ad detection
- **Statistics**: View daily ad blocking statistics (resets automatically each day)

## 🔧 Technical Details

### Permissions Required
- `activeTab`: Access to the current YouTube tab
- `storage`: Save settings and statistics
- `host_permissions`: Access to YouTube domains

### Browser Compatibility
- Chrome 88+ (Manifest V3 support required)
- Based on modern web APIs and ES6+

### Performance
- Lightweight footprint with minimal resource usage
- Smart detection reduces unnecessary processing
- Optimized refresh timing to prevent loops

## 🚨 Important Notes

1. **Legal Disclaimer**: This extension is for educational purposes. Be aware of YouTube's Terms of Service.

2. **Ad Blocking vs. Skipping**: This extension refreshes the page rather than blocking ads, which is a different approach from traditional ad blockers.

3. **Cooldown Period**: The extension includes a 5-second cooldown after each refresh to prevent infinite loops.

4. **Timestamp Accuracy**: The extension stores timestamps down to the millisecond for precise recovery.

## 🐛 Troubleshooting

### Extension Not Working
- Check that the extension is enabled in `chrome://extensions/`
- Verify all files are in the correct locations
- Check the browser console for any error messages

### Timestamp Not Restoring
- Ensure the video was actually playing when the ad was detected
- Check that JavaScript is enabled
- Try refreshing the extension settings

### Too Many Refreshes
- The extension includes built-in cooldown protection
- If issues persist, disable and re-enable the extension

## 🔄 Updates and Maintenance

The extension automatically:
- Resets daily statistics at midnight
- Handles YouTube's dynamic page loading
- Adapts to YouTube layout changes through robust selectors

## 📊 Privacy

This extension:
- ✅ Operates entirely locally (no external servers)
- ✅ Stores settings only in local browser storage
- ✅ Does not collect or transmit any personal data
- ✅ Only accesses YouTube pages with explicit permissions

## 🎉 Enjoy Ad-Free YouTube!

Once installed, the extension works automatically. Just visit any YouTube video and watch as it seamlessly handles ads for you, returning you to exactly where you left off!