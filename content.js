const corporateToGenZ = {
  "synergize": "slay together",
  "deliverables": "skibidi tasks",
  "leverage": "yeet",
  "paradigm shift": "vibe check",
  "think outside the box": "go off bestie",
  "touch base": "slide into DMs",
  "circle back": "hit you back fr fr",
  "low hanging fruit": "easy W",
  "pain point": "mid stuff",
  "value add": "bussin feature",
  "bandwidth": "rizz capacity",
  "deep dive": "no cap investigation",
  "action items": "to-do check beat",
  "best practices": "based moves",
  "stakeholders": "main characters",
  "ROI": "stonks",
  "optimize": "make it hit different",
  "streamline": "make it slap harder",
  "quarterly": "seasonal drop",
  "metrics": "tea ☕",
  "pipeline": "rizz line",
  "scalable": "can go viral",
  "innovative": "bussin fr fr",
  "proactive": "stay woke",
  "alignment": "same wavelength no cap",
  "robust": "built different",
  "agile": "quick flex",
  "implementation": "dropping that heat",
  "strategic": "big brain",
  "value proposition": "W offer"
};

let isEnabled = false;
let isSkullMode = false;

// Load initial state
chrome.storage.sync.get(['enabled', 'skull'], (result) => {
  isEnabled = result.enabled ?? false;
  isSkullMode = result.skull ?? false;
});

// Listen for state updates
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'UPDATE_STATE') {
    chrome.storage.sync.get(['enabled', 'skull'], (result) => {
      isEnabled = result.enabled ?? false;
      isSkullMode = result.skull ?? false;
    });
  }
});

const skullEmojis = ['💀', '👁️', '🫦', '🗿'];

function addSkullEmoji(text) {
  const words = text.split(' ');
  const randomIndex = Math.floor(Math.random() * words.length);
  const randomEmoji = skullEmojis[Math.floor(Math.random() * skullEmojis.length)];
  words.splice(randomIndex, 0, randomEmoji);
  return words.join(' ');
}

function translateText(text) {
  if (!isEnabled) return text;
  
  let translatedText = text;
  for (const [corporate, genZ] of Object.entries(corporateToGenZ)) {
    const regex = new RegExp(corporate, 'gi');
    translatedText = translatedText.replace(regex, genZ);
  }
  
  if (isSkullMode && Math.random() < 0.3) {
    translatedText = addSkullEmoji(translatedText);
  }
  
  return translatedText;
}

// Create a MutationObserver to watch for changes
const observer = new MutationObserver((mutations) => {
  if (!isEnabled) return;

  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent = translateText(node.textContent);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (!['SCRIPT', 'STYLE'].includes(node.tagName)) {
          const walker = document.createTreeWalker(
            node,
            NodeFilter.SHOW_TEXT,
            null,
            false
          );

          let textNode;
          while ((textNode = walker.nextNode())) {
            textNode.textContent = translateText(textNode.textContent);
          }
        }
      }
    });
  });
});

// Start observing
observer.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true
}); 