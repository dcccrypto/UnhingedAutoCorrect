document.addEventListener('DOMContentLoaded', function() {
  // Get DOM elements
  const enabledToggle = document.getElementById('enabledToggle');
  const skullMode = document.getElementById('skullMode');
  const nsfwMode = document.getElementById('nsfwMode');
  const emojiFrequency = document.getElementById('emojiFrequency');
  const replaceImages = document.getElementById('replaceImages');
  const statsText = document.getElementById('statsText');
  const resetStatsButton = document.getElementById('resetStats');
  
  // Track settings update status
  let isUpdating = false;
  
  // Load saved settings
  loadSettings();
  
  function loadSettings() {
    try {
      chrome.storage.sync.get(
        ['enabled', 'skull', 'nsfw', 'emojiFreq', 'replaceImg', 'stats'], 
        function(result) {
          if (chrome.runtime.lastError) {
            console.debug("Error loading settings:", chrome.runtime.lastError.message);
            return;
          }
          
          // Set initial state of toggles
          if (enabledToggle) enabledToggle.checked = result.enabled ?? false;
          if (skullMode) skullMode.checked = result.skull ?? false;
          if (nsfwMode) nsfwMode.checked = result.nsfw ?? false;
          if (emojiFrequency) emojiFrequency.value = result.emojiFreq ?? 30;
          if (replaceImages) replaceImages.checked = result.replaceImg ?? false;
          
          // Update emoji frequency display
          updateEmojiFrequencyDisplay();
          
          // Update stats display
          updateStatsDisplay(result.stats);
          
          // Setup listeners after initial state is set
          setupEventListeners();
        }
      );
    } catch (e) {
      console.debug("Exception in loadSettings:", e.message);
    }
  }
  
  // Set up event listeners for toggle changes
  function setupEventListeners() {
    if (enabledToggle) {
      enabledToggle.addEventListener('change', function() {
        saveSettings();
      });
    }
    
    if (skullMode) {
      skullMode.addEventListener('change', function() {
        saveSettings();
      });
    }
    
    if (nsfwMode) {
      nsfwMode.addEventListener('change', function() {
        saveSettings();
      });
    }
    
    if (emojiFrequency) {
      emojiFrequency.addEventListener('input', debounce(function() {
        updateEmojiFrequencyDisplay();
        saveSettings();
      }, 250));
    }
    
    if (replaceImages) {
      replaceImages.addEventListener('change', function() {
        saveSettings();
      });
    }
    
    if (resetStatsButton) {
      resetStatsButton.addEventListener('click', function() {
        resetStats();
      });
    }
  }
  
  // Update the emoji frequency display
  function updateEmojiFrequencyDisplay() {
    const frequencyDisplay = document.getElementById('frequencyValue');
    if (frequencyDisplay && emojiFrequency) {
      frequencyDisplay.textContent = emojiFrequency.value + '%';
    }
  }
  
  // Update stats display
  function updateStatsDisplay(stats) {
    if (statsText && stats) {
      statsText.textContent = `Words translated: ${stats.words || 0} | Emojis added: ${stats.emojis || 0}`;
    }
  }
  
  // Save settings to chrome.storage
  function saveSettings() {
    if (isUpdating) return;
    isUpdating = true;
    
    try {
      const settings = {
        enabled: enabledToggle ? enabledToggle.checked : false,
        skull: skullMode ? skullMode.checked : false,
        nsfw: nsfwMode ? nsfwMode.checked : false,
        emojiFreq: emojiFrequency ? parseInt(emojiFrequency.value, 10) : 30,
        replaceImg: replaceImages ? replaceImages.checked : false
      };
      
      chrome.storage.sync.set(settings, function() {
        if (chrome.runtime.lastError) {
          console.debug("Error saving settings:", chrome.runtime.lastError.message);
        } else {
          // Notify content scripts of the change
          updateContentScript();
        }
        isUpdating = false;
      });
    } catch (e) {
      console.debug("Exception in saveSettings:", e.message);
      isUpdating = false;
    }
  }
  
  // Reset stats
  function resetStats() {
    try {
      chrome.storage.sync.set({stats: {words: 0, emojis: 0}}, function() {
        if (chrome.runtime.lastError) {
          console.debug("Error resetting stats:", chrome.runtime.lastError.message);
        } else {
          updateStatsDisplay({words: 0, emojis: 0});
        }
      });
    } catch (e) {
      console.debug("Exception in resetStats:", e.message);
    }
  }
  
  // Update stats periodically, but not too frequently
  function setupStatsRefresh() {
    let statsRefreshInterval = null;
    
    // Only refresh stats when popup is visible
    document.addEventListener('visibilitychange', function() {
      if (document.visibilityState === 'visible') {
        if (!statsRefreshInterval) {
          statsRefreshInterval = setInterval(refreshStats, 3000); // Every 3 seconds
        }
      } else {
        if (statsRefreshInterval) {
          clearInterval(statsRefreshInterval);
          statsRefreshInterval = null;
        }
      }
    });
    
    // Initial setup
    if (document.visibilityState === 'visible') {
      statsRefreshInterval = setInterval(refreshStats, 3000);
    }
    
    function refreshStats() {
      try {
        chrome.storage.sync.get(['stats'], function(result) {
          if (!chrome.runtime.lastError && result.stats) {
            updateStatsDisplay(result.stats);
          }
        });
      } catch (e) {
        // Ignore errors during stats refresh
      }
    }
    
    // Clean up when popup closes
    window.addEventListener('unload', function() {
      if (statsRefreshInterval) {
        clearInterval(statsRefreshInterval);
      }
    });
  }
  
  // Set up stats refresh
  setupStatsRefresh();
  
  // Send a message to the active tab to update the content script
  function updateContentScript() {
    try {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs && tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {type: 'UPDATE_STATE'}, function(response) {
            // Ignore any error during message sending
            if (chrome.runtime.lastError) {
              console.debug("Content script may not be loaded:", chrome.runtime.lastError.message);
            }
          });
        }
      });
    } catch (e) {
      console.debug("Exception in updateContentScript:", e.message);
    }
  }
  
  // Debounce function to prevent excessive calls
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }
}); 