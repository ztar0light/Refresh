// Background service worker for Refresh
chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('🔄 Refresh service worker installed/updated');
  
  if (details.reason === 'install') {
    // Set default settings
    await chrome.storage.local.set({
      enabled: true,
      smartDetection: true,
      adsBlocked: 0,
      lastReset: new Date().toDateString()
    });
    
    console.log('✅ Default settings initialized');
  }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log('🔄 Refresh service worker started');
});

// Listen for tab updates to inject content script if needed
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only act when the tab is completely loaded
  if (changeInfo.status === 'complete' && tab.url) {
    // Check if it's a YouTube page
    if (tab.url.includes('youtube.com/watch')) {
      try {
        // Test if content script is already loaded
        await chrome.tabs.sendMessage(tabId, { action: 'ping' });
        console.log('📡 Content script already active on tab:', tabId);
      } catch (error) {
        // Content script not loaded, inject it
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
          });
          console.log('📝 Content script injected into tab:', tabId);
        } catch (injectionError) {
          console.log('❌ Failed to inject content script:', injectionError);
        }
      }
    }
  }
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Background received message:', message);
  
  if (message.action === 'adBlocked') {
    // Update badge
    const count = message.count || 1;
    updateBadge(sender.tab?.id, count);
    sendResponse({ success: true, count: count });
  } else if (message.action === 'getSettings') {
    // Return current settings
    chrome.storage.local.get(['enabled', 'smartDetection'])
      .then(data => {
        console.log('📊 Sending settings:', data);
        sendResponse(data);
      })
      .catch(error => {
        console.error('❌ Failed to get settings:', error);
        sendResponse({ enabled: true, smartDetection: true });
      });
    return true; // Keep message channel open
  }
  
  return false;
});

// Update extension badge with refresh count
async function updateBadge(tabId, count = null) {
  if (!tabId) return;
  
  try {
    // Use provided count or get from storage
    let badgeCount = count;
    if (badgeCount === null) {
      const data = await chrome.storage.local.get(['adsBlocked']);
      badgeCount = data.adsBlocked || 0;
    }
    
    // Update badge text
    await chrome.action.setBadgeText({
      tabId: tabId,
      text: badgeCount > 0 ? badgeCount.toString() : ''
    });
    
    // Set badge color
    await chrome.action.setBadgeBackgroundColor({
      tabId: tabId,
      color: '#4CAF50'
    });
    
    console.log('🏷️ Badge updated for tab', tabId, 'count:', badgeCount);
  } catch (error) {
    console.log('❌ Failed to update badge:', error);
  }
}

// Clean up old data periodically
try {
  chrome.alarms.create('cleanup', { periodInMinutes: 60 });
  
  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === 'cleanup') {
      const today = new Date().toDateString();
      const data = await chrome.storage.local.get(['lastReset']);
      
      // Reset daily stats if it's a new day
      if (data.lastReset !== today) {
        await chrome.storage.local.set({
          adsBlocked: 0,
          lastReset: today
        });
        console.log('🧹 Daily stats reset');
      }
    }
  });
} catch (error) {
  console.log('⚠️ Alarms API not available:', error);
}