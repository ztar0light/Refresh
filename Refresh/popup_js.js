document.addEventListener('DOMContentLoaded', async () => {
  const adsBlockedEl = document.getElementById('adsBlocked');
  const statusEl = document.getElementById('status');
  
  // Load and display statistics
  await loadStats();
  
  // Show welcome status
  showStatus('Refresh is active and monitoring!');
  
  // Add hover effects to status indicators
  document.querySelectorAll('.status-indicator').forEach(indicator => {
    indicator.addEventListener('mouseenter', () => {
      indicator.style.transform = 'scale(1.05)';
      indicator.style.boxShadow = '0 0 25px rgba(76, 175, 80, 0.5)';
    });
    
    indicator.addEventListener('mouseleave', () => {
      indicator.style.transform = 'scale(1)';
      indicator.style.boxShadow = '0 0 15px rgba(76, 175, 80, 0.3)';
    });
  });
  
  async function loadStats() {
    try {
      const today = new Date().toDateString();
      const data = await chrome.storage.local.get(['adsBlocked', 'lastReset']);
      
      let adsBlocked = 0;
      
      // Reset counter if it's a new day
      if (data.lastReset !== today) {
        await chrome.storage.local.set({
          adsBlocked: 0,
          lastReset: today
        });
      } else {
        adsBlocked = data.adsBlocked || 0;
      }
      
      adsBlockedEl.textContent = adsBlocked;
      
      // Add animation when counter updates
      if (adsBlocked > 0) {
        adsBlockedEl.style.animation = 'pulse 0.5s ease-in-out';
        setTimeout(() => {
          adsBlockedEl.style.animation = '';
        }, 500);
      }
      
      console.log('📊 Stats loaded - Pages refreshed today:', adsBlocked);
    } catch (error) {
      console.error('❌ Failed to load stats:', error);
      adsBlockedEl.textContent = '0';
    }
  }
  
  function showStatus(message) {
    statusEl.textContent = message;
    statusEl.classList.add('show');
    
    setTimeout(() => {
      statusEl.classList.remove('show');
    }, 3000);
  }
  
  // Add pulse animation CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
    
    .status-indicator {
      transition: all 0.3s ease;
    }
  `;
  document.head.appendChild(style);
  
  // Refresh stats every few seconds in case they change
  setInterval(loadStats, 3000);
  
  // Check if we're on a YouTube page and show appropriate message
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url && tab.url.includes('youtube.com/watch')) {
      showStatus('🎯 Monitoring this YouTube video for ads');
    } else if (tab && tab.url && tab.url.includes('youtube.com')) {
      showStatus('📺 Ready! Open a video to start monitoring');
    } else {
      showStatus('📍 Visit YouTube to start ad blocking');
    }
  } catch (error) {
    console.log('Could not check current tab:', error);
  }
});