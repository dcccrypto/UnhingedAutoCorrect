document.addEventListener('DOMContentLoaded', function() {
  // Get DOM elements
  const enabledToggle = document.getElementById('enabledToggle');
  const skullMode = document.getElementById('skullMode');
  const nsfwMode = document.getElementById('nsfwMode');
  const emojiFrequency = document.getElementById('emojiFrequency');
  const replaceImages = document.getElementById('replaceImages');
  const statsText = document.getElementById('statsText');
  
  // Load saved settings
  chrome.storage.sync.get(
    ['enabled', 'skull', 'nsfw', 'emojiFreq', 'replaceImg', 'stats'], 
    function(result) {
      // Set initial state of toggles
      enabledToggle.checked = result.enabled ?? false;
      skullMode.checked = result.skull ?? false;
      nsfwMode.checked = result.nsfw ?? false;
      emojiFrequency.value = result.emojiFreq ?? 30;
      replaceImages.checked = result.replaceImg ?? false;
      
      // Update emoji frequency display
      updateEmojiFrequencyDisplay();
      
      // Update stats display
      updateStatsDisplay(result.stats);
      
      // Setup listeners after initial state is set
      setupEventListeners();
    }
  );
  
  // Set up event listeners for toggle changes
  function setupEventListeners() {
    enabledToggle.addEventListener('change', function() {
      saveSettings();
    });
    
    skullMode.addEventListener('change', function() {
      saveSettings();
    });
    
    nsfwMode.addEventListener('change', function() {
      saveSettings();
    });
    
    emojiFrequency.addEventListener('input', function() {
      updateEmojiFrequencyDisplay();
      saveSettings();
    });
    
    replaceImages.addEventListener('change', function() {
      saveSettings();
    });
  }
  
  // Update the emoji frequency display
  function updateEmojiFrequencyDisplay() {
    const frequencyDisplay = document.getElementById('frequencyValue');
    if (frequencyDisplay) {
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
    const settings = {
      enabled: enabledToggle.checked,
      skull: skullMode.checked,
      nsfw: nsfwMode.checked,
      emojiFreq: parseInt(emojiFrequency.value, 10),
      replaceImg: replaceImages.checked
    };
    
    chrome.storage.sync.set(settings, function() {
      // Notify content scripts of the change
      updateContentScript();
    });
  }
  
  // Update stats periodically
  function setupStatsRefresh() {
    // Check for stats updates every 2 seconds
    setInterval(function() {
      chrome.storage.sync.get(['stats'], function(result) {
        updateStatsDisplay(result.stats);
      });
    }, 2000);
  }
  
  // Set up stats refresh
  setupStatsRefresh();
  
  // Send a message to the active tab to update the content script
  function updateContentScript() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {type: 'UPDATE_STATE'}, function(response) {
          // Handle potential error when content script is not loaded
          if (chrome.runtime.lastError) {
            console.debug("Content script may not be loaded:", chrome.runtime.lastError.message);
          }
        });
      }
    });
  }
  
  // Reset stats button
  const resetStatsButton = document.getElementById('resetStats');
  if (resetStatsButton) {
    resetStatsButton.addEventListener('click', function() {
      chrome.storage.sync.set({stats: {words: 0, emojis: 0}}, function() {
        updateStatsDisplay({words: 0, emojis: 0});
      });
    });
  }
}); 