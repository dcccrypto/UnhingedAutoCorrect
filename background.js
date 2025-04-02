// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only run when the page is fully loaded
  if (changeInfo.status === 'complete' && tab.url) {
    // Check if the extension is enabled
    chrome.storage.sync.get(['enabled', 'replaceImg'], (result) => {
      if (result.enabled) {
        // Inject the content script to ensure it's loaded
        ensureContentScriptInjected(tabId);
      }
    });
  }
});

// Ensure content script is injected
function ensureContentScriptInjected(tabId) {
  // Try to send a message to check if content script is already loaded
  chrome.tabs.sendMessage(tabId, {type: 'PING'}, (response) => {
    // If there's an error, the content script may not be loaded
    if (chrome.runtime.lastError) {
      // Execute the content script
      chrome.scripting.executeScript({
        target: {tabId: tabId},
        files: ['content.js']
      }).catch(err => console.error("Error injecting content script:", err));
    }
  });
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
    // Log stats to storage
    chrome.storage.sync.get(['stats'], (result) => {
      const stats = result.stats || { words: 0, emojis: 0 };
      stats.words += message.words || 0;
      stats.emojis += message.emojis || 0;
      chrome.storage.sync.set({ stats });
    });
  }
}); 