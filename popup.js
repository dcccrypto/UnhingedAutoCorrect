document.addEventListener('DOMContentLoaded', () => {
  const enableToggle = document.getElementById('enableToggle');
  const skullMode = document.getElementById('skullMode');

  // Load saved states
  chrome.storage.sync.get(['enabled', 'skull'], (result) => {
    enableToggle.checked = result.enabled ?? false;
    skullMode.checked = result.skull ?? false;
  });

  // Save states on change
  enableToggle.addEventListener('change', () => {
    chrome.storage.sync.set({ enabled: enableToggle.checked });
    updateContentScript();
  });

  skullMode.addEventListener('change', () => {
    chrome.storage.sync.set({ skull: skullMode.checked });
    updateContentScript();
  });
});

function updateContentScript() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: 'UPDATE_STATE' });
  });
} 