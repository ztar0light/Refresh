// YouTube Ad Skipper Content Script
class YouTubeAdSkipper {
  constructor() {
    this.enabled = true;
    this.smartDetection = true;
    this.lastTimestamp = 0;
    this.adDetected = false;
    this.observer = null;
    this.checkInterval = null;
    this.refreshCooldown = false;
    this.lastRefreshTime = 0;
    this.videoStartTime = 0;
    this.falsePositiveProtection = true;
    
    this.init();
  }
  
  init() {
    console.log('🚀 Refresh initialized - Always enabled with smart detection');
    
    // Wait a bit before starting monitoring to avoid false positives on page load
    setTimeout(() => {
      this.startMonitoring();
    }, 3000);
    
    // Listen for ping messages from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === 'ping') {
        sendResponse({ 
          success: true, 
          enabled: true, 
          smart: true,
          status: 'active'
        });
      }
      return true;
    });
    
    // Track when video starts to avoid false positives
    this.trackVideoStart();
  }
  
  trackVideoStart() {
    const video = document.querySelector('video');
    if (video) {
      video.addEventListener('loadstart', () => {
        this.videoStartTime = Date.now();
        console.log('📺 Video loading started');
      });
      
      video.addEventListener('playing', () => {
        console.log('▶️ Video started playing');
      });
    }
  }
  
  startMonitoring() {
    console.log('🎯 Refresh: Monitoring started');
    
    // Monitor for ads every 2 seconds (reduced frequency)
    this.checkInterval = setInterval(() => {
      if (this.isOnVideoPage() && !this.refreshCooldown && this.canCheckForAds()) {
        this.checkForAds();
      }
    }, 2000);
    
    // Setup DOM observer for faster detection (but with more restrictions)
    this.setupDOMObserver();
  }
  
  canCheckForAds() {
    // Don't check too soon after page load
    const timeSinceLoad = Date.now() - this.videoStartTime;
    if (timeSinceLoad < 5000) {
      return false;
    }
    
    // Don't refresh too frequently
    const timeSinceLastRefresh = Date.now() - this.lastRefreshTime;
    if (timeSinceLastRefresh < 15000) { // At least 15 seconds between refreshes
      return false;
    }
    
    // Check if video is actually playing (not just loading)
    const video = document.querySelector('video');
    if (!video || video.paused || video.ended) {
      return false;
    }
    
    return true;
  }
  
  stopMonitoring() {
    console.log('⏹️ Refresh: Monitoring stopped');
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
  
  setupDOMObserver() {
    const targetNode = document.body;
    if (!targetNode) return;
    
    this.observer = new MutationObserver((mutations) => {
      if (this.refreshCooldown) return;
      
      for (const mutation of mutations) {
        // Check if any new nodes contain ad indicators
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (this.checkElementForAds(node)) {
              this.handleAdDetected();
              return;
            }
          }
        }
      }
    });
    
    this.observer.observe(targetNode, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'id']
    });
  }
  
  isOnVideoPage() {
    return window.location.pathname === '/watch' && window.location.search.includes('v=');
  }
  
  checkForAds() {
    // More specific ad selectors to reduce false positives
    const adSelectors = [
      '.ytp-ad-skip-button-container', // Skip button is most reliable
      '.ytp-ad-text:not(.ytp-ad-preview-text)', // Ad text but not preview
      '.ytp-ad-player-overlay-instream-info', // Specific ad overlay
      '.video-ads .ytp-ad-module', // Combination selector
      '.ytp-ad-overlay-container[style*="display: block"]' // Only visible overlays
    ];
    
    // Check for ad elements with extra validation
    for (const selector of adSelectors) {
      const element = document.querySelector(selector);
      if (element && this.isElementVisible(element)) {
        console.log('🎯 Ad detected via selector:', selector);
        // Double-check with additional validation
        if (this.validateAdDetection()) {
          this.handleAdDetected();
          return;
        }
      }
    }
    
    // Check for specific ad text that's very reliable
    const reliableAdTexts = [
      'Skip ad',
      'You can skip this ad in',
      'Video will play after ad'
    ];
    
    for (const text of reliableAdTexts) {
      if (this.findTextInPlayer(text)) {
        console.log('🎯 Ad detected via reliable text:', text);
        if (this.validateAdDetection()) {
          this.handleAdDetected();
          return;
        }
      }
    }
  }
  
  isElementVisible(element) {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && 
           window.getComputedStyle(element).display !== 'none' &&
           window.getComputedStyle(element).visibility !== 'hidden';
  }
  
  findTextInPlayer(text) {
    const playerContainer = document.querySelector('.html5-video-player');
    if (!playerContainer) return false;
    
    return playerContainer.textContent.includes(text);
  }
  
  validateAdDetection() {
    // Additional checks to prevent false positives
    
    // 1. Check if video is actually playing an ad (not main content)
    const video = document.querySelector('video');
    if (!video) return false;
    
    // 2. Ensure we're not in the first few seconds of video loading
    const timeSinceVideoStart = Date.now() - this.videoStartTime;
    if (timeSinceVideoStart < 8000) {
      console.log('⚠️ Skipping detection - too soon after video start');
      return false;
    }
    
    // 3. Check video duration - ads are usually short
    if (video.duration && video.duration > 300) { // More than 5 minutes is likely main content
      console.log('⚠️ Skipping detection - video too long to be an ad');
      return false;
    }
    
    // 4. Look for multiple ad indicators (more reliable)
    const adIndicators = [
      document.querySelector('.ytp-ad-skip-button-container'),
      document.querySelector('.ytp-ad-text'),
      this.findTextInPlayer('Skip ad'),
      this.findTextInPlayer('Ad •')
    ];
    
    const foundIndicators = adIndicators.filter(indicator => indicator).length;
    if (foundIndicators < 2) {
      console.log('⚠️ Not enough ad indicators found:', foundIndicators);
      return false;
    }
    
    console.log('✅ Ad detection validated with', foundIndicators, 'indicators');
    return true;
  }
  
  checkElementForAds(element) {
    const adClasses = [
      'ytp-ad-module',
      'video-ads',
      'ytp-ad-overlay-container',
      'ad-showing',
      'ad-container',
      'ytp-ad-skip-button-container',
      'ytp-ad-player-overlay'
    ];
    
    return adClasses.some(className => 
      element.classList && element.classList.contains(className)
    );
  }
  
  isVideoShowingAd(video) {
    // Check if the video URL suggests it's an ad
    const src = video.src || video.currentSrc;
    if (src && (src.includes('googleads') || src.includes('doubleclick'))) {
      return true;
    }
    
    // Check parent containers for ad classes
    let parent = video.parentElement;
    while (parent && parent !== document.body) {
      if (parent.classList && parent.classList.toString().includes('ad')) {
        return true;
      }
      parent = parent.parentElement;
    }
    
    return false;
  }
  
  async handleAdDetected() {
    if (this.adDetected || this.refreshCooldown) return;
    
    // Extra safety check
    const timeSinceLastRefresh = Date.now() - this.lastRefreshTime;
    if (timeSinceLastRefresh < 15000) {
      console.log('⚠️ Refresh cooldown active, skipping');
      return;
    }
    
    console.log('🚨 Refresh: Confirmed ad detected, initiating skip sequence');
    this.adDetected = true;
    this.lastRefreshTime = Date.now();
    
    // Store current timestamp
    const video = document.querySelector('video');
    if (video && !isNaN(video.currentTime) && video.currentTime > 0) {
      this.lastTimestamp = video.currentTime;
      console.log('⏰ Stored timestamp:', this.lastTimestamp);
      
      // Store in sessionStorage as backup
      try {
        sessionStorage.setItem('refresh_timestamp', this.lastTimestamp.toString());
        sessionStorage.setItem('refresh_url', window.location.href);
      } catch (e) {
        console.log('SessionStorage not available');
      }
    }
    
    // Visual feedback
    this.showNotification('🚀 Skipping ad...', 1000);
    
    // Increment counter
    await this.incrementAdCounter();
    
    // Start cooldown
    this.refreshCooldown = true;
    
    // Refresh page after short delay
    setTimeout(() => {
      window.location.reload();
    }, 800);
  }
  
  async restoreTimestamp() {
    // Check if we have a stored timestamp from the refresh
    let timestampToRestore = this.lastTimestamp;
    
    try {
      const storedTimestamp = sessionStorage.getItem('refresh_timestamp');
      const storedUrl = sessionStorage.getItem('refresh_url');
      
      if (storedTimestamp && storedUrl === window.location.href) {
        timestampToRestore = parseFloat(storedTimestamp);
        console.log('📦 Retrieved timestamp from sessionStorage:', timestampToRestore);
        
        // Clean up
        sessionStorage.removeItem('refresh_timestamp');
        sessionStorage.removeItem('refresh_url');
      }
    } catch (e) {
      console.log('SessionStorage not available for recovery');
    }
    
    if (timestampToRestore <= 0) {
      this.refreshCooldown = false;
      return;
    }
    
    console.log(`⏰ Refresh: Restoring timestamp ${timestampToRestore.toFixed(2)}s`);
    
    // Wait for video to load
    const video = await this.waitForVideo();
    if (!video) {
      this.refreshCooldown = false;
      return;
    }
    
    // Wait for video to be ready
    await this.waitForVideoReady(video);
    
    // Seek to stored timestamp
    video.currentTime = timestampToRestore;
    
    // Show success notification
    this.showNotification(`⏰ Resumed at ${this.formatTime(timestampToRestore)}`, 2000);
    
    // Reset state
    this.adDetected = false;
    this.lastTimestamp = 0;
    
    // End cooldown after 10 seconds (increased for safety)
    setTimeout(() => {
      this.refreshCooldown = false;
      console.log('🔓 Refresh cooldown ended');
    }, 10000);
  }
  
  waitForVideo() {
    return new Promise((resolve) => {
      const checkVideo = () => {
        const video = document.querySelector('video');
        if (video) {
          resolve(video);
        } else {
          setTimeout(checkVideo, 100);
        }
      };
      checkVideo();
    });
  }
  
  waitForVideoReady(video) {
    return new Promise((resolve) => {
      const checkReady = () => {
        if (video.readyState >= 2 && video.duration > 0) {
          resolve();
        } else {
          setTimeout(checkReady, 100);
        }
      };
      checkReady();
    });
  }
  
  showNotification(message, duration = 3000) {
    // Remove existing notifications
    const existing = document.querySelector('.adskipper-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'adskipper-notification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 20px;
      border-radius: 25px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.2);
      animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideIn 0.3s ease-out reverse';
      setTimeout(() => notification.remove(), 300);
      style.remove();
    }, duration);
  }
  
  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  
  async incrementAdCounter() {
    try {
      const today = new Date().toDateString();
      const data = await chrome.storage.local.get(['adsBlocked', 'lastReset']);
      
      let newCount;
      // Reset counter if it's a new day
      if (data.lastReset !== today) {
        newCount = 1;
        await chrome.storage.local.set({
          adsBlocked: 1,
          lastReset: today
        });
      } else {
        newCount = (data.adsBlocked || 0) + 1;
        await chrome.storage.local.set({
          adsBlocked: newCount
        });
      }
      
      console.log('📈 Refresh counter incremented to:', newCount);
      
      // Send message to background script to update badge
      chrome.runtime.sendMessage({
        action: 'adBlocked',
        count: newCount
      }).catch(err => {
        console.log('Could not send message to background:', err);
      });
      
    } catch (error) {
      console.error('❌ Failed to increment refresh counter:', error);
    }
  }
}

// Initialize when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.adSkipper = new YouTubeAdSkipper();
  });
} else {
  window.adSkipper = new YouTubeAdSkipper();
}

// Handle page navigation (YouTube SPA)
let lastUrl = location.href;
let pageLoadTime = Date.now();

new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    pageLoadTime = Date.now();
    console.log('🔄 YouTube navigation detected');
    
    // Check if we need to restore timestamp after a refresh
    const isFromRefresh = sessionStorage.getItem('refresh_timestamp');
    
    if (window.adSkipper && isFromRefresh) {
      console.log('🔄 Detected refresh, will restore timestamp');
      setTimeout(() => {
        window.adSkipper.restoreTimestamp();
      }, 2000); // Wait longer for page to fully load
    } else if (window.adSkipper) {
      // Reset video start time for new video
      window.adSkipper.videoStartTime = Date.now();
      window.adSkipper.trackVideoStart();
    }
  }
}).observe(document, { subtree: true, childList: true });