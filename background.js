// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only run when the page is fully loaded
  if (changeInfo.status === 'complete' && tab.url) {
    // Don't inject on chrome:// or edge:// URLs (causes errors)
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('chrome-extension://')) {
      return;
    }
    
    // Check if the extension is enabled
    chrome.storage.sync.get(['enabled'], (result) => {
      if (result.enabled) {
        // Inject the content script to ensure it's loaded
        ensureContentScriptInjected(tabId);
      }
    });
  }
});

// Track injection attempts to avoid repeated errors
const injectionAttempts = new Map();

// Ensure content script is injected
function ensureContentScriptInjected(tabId) {
  // Avoid repeated injection attempts on problematic tabs
  if (injectionAttempts.get(tabId) >= 2) {
    return;
  }
  
  // Try to send a message to check if content script is already loaded
  chrome.tabs.sendMessage(tabId, {type: 'PING'}, (response) => {
    // If there's an error, the content script may not be loaded
    if (chrome.runtime.lastError) {
      // Track injection attempts
      injectionAttempts.set(tabId, (injectionAttempts.get(tabId) || 0) + 1);
      
      // Execute the content script with error handling
      try {
        chrome.scripting.executeScript({
          target: {tabId: tabId},
          files: ['content.js']
        }).catch(err => {
          console.debug("Error injecting content script:", err.message);
        });
      } catch (e) {
        console.debug("Exception during script injection:", e.message);
      }
    } else {
      // Reset injection counter on successful communication
      injectionAttempts.set(tabId, 0);
    }
  });
}

// Clear injection attempts on tab close
chrome.tabs.onRemoved.addListener((tabId) => {
  injectionAttempts.delete(tabId);
});

// Process batches of images to avoid memory issues
const processedTabImages = new Map();

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!sender.tab) {
    return false;
  }
  
  if (message.type === 'GET_MEME_URLS') {
    // Send back URLs for meme images
    sendResponse({
      memeUrls: [
        chrome.runtime.getURL('images/meme.jpg'),
        chrome.runtime.getURL('images/meme2.jpg')
      ]
    });
    return true; // Keep the message channel open for async response
  }
  
  if (message.type === 'LOG_STATS') {
    // Log stats to storage with error handling
    try {
      chrome.storage.sync.get(['stats'], (result) => {
        const stats = result.stats || { words: 0, emojis: 0 };
        stats.words = (stats.words || 0) + (message.words || 0);
        stats.emojis = (stats.emojis || 0) + (message.emojis || 0);
        
        // Ensure stats don't grow too large (prevent browser slowdowns)
        if (stats.words > 100000) stats.words = 100000;
        if (stats.emojis > 100000) stats.emojis = 100000;
        
        chrome.storage.sync.set({ stats });
      });
    } catch (e) {
      // Ignore storage errors
    }
    return false;
  }
  
  return false;
}); 