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
  "value proposition": "W offer",
  "meeting": "vibe sesh",
  "deadline": "no cap cutoff",
  "project manager": "rizz boss",
  "client": "main character",
  "budget": "bag 💰",
  "presentation": "flex tape",
  "feedback": "tea spill",
  "urgent": "broski emergency",
  "priority": "fr fr important",
  "solution": "big W move",
  "problem": "L moment",
  "success": "W rizz",
  "failure": "massive L",
  "team": "squad fam",
  "goals": "W targets",
  "strategy": "rizz game plan",
  "innovation": "galaxy brain move",
  "leadership": "top G energy",
  "performance": "rizz levels",
  "quality": "bussin rating",
  "efficiency": "speed run strats",
  "collaboration": "squad link up",
  "expertise": "skill issue",
  "competitive advantage": "main character energy",
  "market share": "clout points",
  "revenue": "bag secured",
  "growth": "glow up",
  "customer satisfaction": "stan energy",
  "productivity": "grind stats",
  "infrastructure": "base build",
  "resources": "power ups",
  "timeline": "drop schedule",
  "milestone": "W checkpoint",
  "objective": "mission rizz",
  "initiative": "flex move",
  "compliance": "rule check vibe",
  "sustainability": "earth W",
  "diversity": "squad mix",
  "inclusion": "vibe blend",
  "engagement": "rizz meter"
};

const nsfwTranslations = {
  "performance review": "rizz check",
  "bottom line": "thicc profits",
  "penetrate the market": "slide into market DMs",
  "growth potential": "glow up energy",
  "hard skills": "main character powers",
  "soft skills": "rizz game",
  "head office": "top G headquarters",
  "drill down": "get down bad",
  "push the envelope": "get freaky with it",
  "take it offline": "slide into private",
  "deep dive": "get down and dirty",
  "touch base": "get physical fr fr",
  "low hanging fruit": "easy snack",
  "get in bed with": "collab with",
  "missionary": "traditional approach",
  "aggressively pursue": "down bad for",
  "satisfaction guaranteed": "bussin experience fr fr",
  "customer satisfaction": "customer happy ending",
  "performance issues": "skill issues",
  "backend": "backside",
  "frontend": "frontside",
  "full stack": "both sides",
  "master/slave": "dom/sub",
  "dirty data": "sus data",
  "honeypot": "thirst trap",
  "backdoor": "secret entrance",
  "penetration testing": "security check",
  "probe": "investigate sus",
  "exploit": "take advantage",
  "vulnerability": "weak spot"
};

let isEnabled = false;
let isSkullMode = false;
let isNsfwMode = false;
let emojiFrequency = 30;
let shouldReplaceImages = false;
let stats = { words: 0, emojis: 0 };

// Load initial state
chrome.storage.sync.get(
  ['enabled', 'skull', 'nsfw', 'emojiFreq', 'replaceImg', 'stats'],
  (result) => {
    isEnabled = result.enabled ?? false;
    isSkullMode = result.skull ?? false;
    isNsfwMode = result.nsfw ?? false;
    emojiFrequency = result.emojiFreq ?? 30;
    shouldReplaceImages = result.replaceImg ?? false;
    stats = result.stats ?? { words: 0, emojis: 0 };
  }
);

// Add response to PING messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PING') {
    sendResponse({status: 'alive'});
    return;
  }
  
  if (message.type === 'UPDATE_STATE') {
    chrome.storage.sync.get(
      ['enabled', 'skull', 'nsfw', 'emojiFreq', 'replaceImg', 'stats'],
      (result) => {
        isEnabled = result.enabled ?? false;
        isSkullMode = result.skull ?? false;
        isNsfwMode = result.nsfw ?? false;
        emojiFrequency = result.emojiFreq ?? 30;
        shouldReplaceImages = result.replaceImg ?? false;
        stats = result.stats ?? { words: 0, emojis: 0 };

        // Update images if setting changed
        if (shouldReplaceImages && isEnabled) {
          replaceImages();
        } else {
          restoreImages();
        }
        
        sendResponse({status: 'updated'});
      }
    );
    return true; // Keep the message channel open for async response
  }
});

const skullEmojis = ['💀', '👁️', '🫦', '🗿', '😈', '👺', '🤡', '👻', '☠️', '😩', '😳'];

function addSkullEmoji(text) {
  const words = text.split(' ');
  const randomIndex = Math.floor(Math.random() * words.length);
  const randomEmoji = skullEmojis[Math.floor(Math.random() * skullEmojis.length)];
  words.splice(randomIndex, 0, randomEmoji);
  stats.emojis++;
  updateStats();
  return words.join(' ');
}

function translateText(text) {
  if (!isEnabled) return text;
  
  let translatedText = text;
  let translations = { ...corporateToGenZ };
  
  if (isNsfwMode) {
    translations = { ...translations, ...nsfwTranslations };
  }
  
  for (const [corporate, genZ] of Object.entries(translations)) {
    const regex = new RegExp(corporate, 'gi');
    const matches = translatedText.match(regex);
    if (matches) {
      stats.words += matches.length;
      translatedText = translatedText.replace(regex, genZ);
    }
  }
  
  if (isSkullMode && Math.random() * 100 < emojiFrequency) {
    translatedText = addSkullEmoji(translatedText);
  }
  
  updateStats();
  return translatedText;
}

function updateStats() {
  chrome.storage.sync.set({ stats });
  
  // Also notify the background script for centralized stat tracking
  chrome.runtime.sendMessage({
    type: 'LOG_STATS',
    words: stats.words,
    emojis: stats.emojis
  });
}

function replaceImages() {
  if (!shouldReplaceImages || !isEnabled) {
    restoreImages();
    return;
  }
  
  // Get meme URLs from background script to ensure they're always up to date
  chrome.runtime.sendMessage({type: 'GET_MEME_URLS'}, (response) => {
    const memeImages = response ? response.memeUrls : [
      chrome.runtime.getURL('images/meme.jpg'),
      chrome.runtime.getURL('images/meme2.jpg')
    ];
    
    function getRandomMeme() {
      return memeImages[Math.floor(Math.random() * memeImages.length)];
    }
    
    // Process images in batches to prevent browser freezing
    setTimeout(() => processRegularImages(), 0);
    setTimeout(() => processBackgroundImages(), 50);
    setTimeout(() => processPictureElements(), 100);
    setTimeout(() => processIframes(), 150);
    
    function processRegularImages() {
      // Limit the number of images processed at once
      const images = Array.from(document.querySelectorAll('img')).slice(0, 100);
      
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        // Skip cross-origin images that might cause issues
        if (isCrossOriginImage(img)) {
          continue;
        }
        
        if (!img.dataset.originalSrc && !img.src.includes('chrome-extension://')) {
          img.dataset.originalSrc = img.src;
          img.src = getRandomMeme();
          
          if (img.srcset) {
            img.dataset.originalSrcset = img.srcset;
            img.srcset = '';
          }
        }
      }
      
      // If there are more images, process them in the next batch
      if (document.querySelectorAll('img').length > 100) {
        setTimeout(processMoreImages, 200);
      }
    }
    
    function processMoreImages() {
      const images = Array.from(document.querySelectorAll('img')).slice(100, 200);
      
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (!img.dataset.originalSrc && !img.src.includes('chrome-extension://')) {
          img.dataset.originalSrc = img.src;
          img.src = getRandomMeme();
          
          if (img.srcset) {
            img.dataset.originalSrcset = img.srcset;
            img.srcset = '';
          }
        }
      }
      
      // Continue with more batches if needed
      if (document.querySelectorAll('img').length > 200) {
        setTimeout(processMoreImages, 200);
      }
    }
    
    function processBackgroundImages() {
      // Only select elements with inline background image styles
      const backgroundElements = document.querySelectorAll('[style*="background-image"]');
      const maxElements = Math.min(backgroundElements.length, 100);
      
      for (let i = 0; i < maxElements; i++) {
        const el = backgroundElements[i];
        if (!el.dataset.originalBg) {
          el.dataset.originalBg = el.style.backgroundImage;
          el.style.backgroundImage = `url(${getRandomMeme()})`;
        }
      }
      
      // Don't use querySelectorAll('*') - it's too expensive
      // Instead, only check visible elements with common image-containing tags
      const potentialBgElements = document.querySelectorAll('div, section, header, footer, aside, article, main, nav');
      const visibleElements = Array.from(potentialBgElements).slice(0, 100);
      
      for (let i = 0; i < visibleElements.length; i++) {
        const el = visibleElements[i];
        // Skip if already processed or not visible
        if (el.dataset.bgChecked || !isElementVisible(el)) {
          continue;
        }
        
        el.dataset.bgChecked = 'true';
        const computedStyle = window.getComputedStyle(el);
        const bgImage = computedStyle.getPropertyValue('background-image');
        
        if (bgImage && bgImage !== 'none' && !bgImage.includes('chrome-extension://') && !el.dataset.originalComputedBg) {
          el.dataset.originalComputedBg = bgImage;
          el.style.backgroundImage = `url(${getRandomMeme()})`;
        }
      }
    }
    
    // Helper function to check if element is visible (approximate)
    function isElementVisible(el) {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    }
    
    function processPictureElements() {
      // Handle picture elements with source elements
      const pictureSources = document.querySelectorAll('picture source');
      const maxSources = Math.min(pictureSources.length, 50);
      
      for (let i = 0; i < maxSources; i++) {
        const source = pictureSources[i];
        if (!source.dataset.originalSrcset && source.srcset) {
          source.dataset.originalSrcset = source.srcset;
          source.srcset = getRandomMeme();
        }
      }
    }
    
    function processIframes() {
      try {
        // Limit the number of iframes processed
        const iframes = Array.from(document.querySelectorAll('iframe')).slice(0, 5);
        
        for (let i = 0; i < iframes.length; i++) {
          const iframe = iframes[i];
          try {
            if (iframe.contentDocument && iframe.contentDocument.body) {
              // Process only a limited number of images inside iframe
              const iframeImages = Array.from(iframe.contentDocument.querySelectorAll('img')).slice(0, 20);
              
              for (let j = 0; j < iframeImages.length; j++) {
                const img = iframeImages[j];
                if (!img.dataset.originalSrc) {
                  img.dataset.originalSrc = img.src;
                  img.src = getRandomMeme();
                }
              }
            }
          } catch (e) {
            // Cross-origin iframe, can't access
          }
        }
      } catch (e) {
        // Error handling
      }
    }
  });
}

function restoreImages() {
  // Restore regular images
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    if (img.dataset.originalSrc) {
      img.src = img.dataset.originalSrc;
      delete img.dataset.originalSrc;
      
      // Restore srcset if it was saved
      if (img.dataset.originalSrcset) {
        img.srcset = img.dataset.originalSrcset;
        delete img.dataset.originalSrcset;
      }
      
      // Remove error handler
      img.onerror = null;
    }
  });
  
  // Restore inline background images
  const backgroundElements = document.querySelectorAll('[style*="background-image"]');
  backgroundElements.forEach(el => {
    if (el.dataset.originalBg) {
      el.style.backgroundImage = el.dataset.originalBg;
      delete el.dataset.originalBg;
    }
  });
  
  // Restore computed style background images
  const computedBgElements = document.querySelectorAll('[data-original-computed-bg]');
  computedBgElements.forEach(el => {
    if (el.dataset.originalComputedBg) {
      el.style.backgroundImage = el.dataset.originalComputedBg;
      delete el.dataset.originalComputedBg;
    }
  });
  
  // Restore picture sources
  const pictureSources = document.querySelectorAll('picture source');
  pictureSources.forEach(source => {
    if (source.dataset.originalSrcset) {
      source.srcset = source.dataset.originalSrcset;
      delete source.dataset.originalSrcset;
    }
  });
  
  // Try to restore iframes
  try {
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      try {
        if (iframe.contentDocument && iframe.contentDocument.body) {
          // Restore images inside iframe
          const iframeImages = iframe.contentDocument.querySelectorAll('img');
          iframeImages.forEach(img => {
            if (img.dataset.originalSrc) {
              img.src = img.dataset.originalSrc;
              delete img.dataset.originalSrc;
            }
          });
          
          // Restore background images inside iframe
          const iframeBgElements = iframe.contentDocument.querySelectorAll('[data-original-bg]');
          iframeBgElements.forEach(el => {
            if (el.dataset.originalBg) {
              el.style.backgroundImage = el.dataset.originalBg;
              delete el.dataset.originalBg;
            }
          });
        }
      } catch (e) {
        // Cross-origin iframe, can't access
      }
    });
  } catch (e) {
    console.debug("Error restoring iframe images:", e);
  }
}

// Update the observer to be less aggressive
const observer = new MutationObserver(debounce((mutations) => {
  if (!isEnabled) return;

  let hasTextChange = false;
  let hasImageChange = false;

  // Analyze at most 50 mutations to prevent freezing on large DOM changes
  const mutationsToProcess = mutations.slice(0, 50);
  
  mutationsToProcess.forEach((mutation) => {
    // Check for text changes in text nodes only
    if (mutation.type === 'characterData' && mutation.target.nodeType === Node.TEXT_NODE) {
      hasTextChange = true;
    }
    
    // Check for image changes
    if (mutation.type === 'attributes' && 
        (mutation.attributeName === 'src' || mutation.attributeName === 'srcset')) {
      hasImageChange = true;
    }
    
    // Check for added nodes but limit processing
    if (mutation.addedNodes.length > 0 && mutation.addedNodes.length < 10) {
      const addedImages = Array.from(mutation.addedNodes)
        .filter(node => 
          node.nodeName === 'IMG' || 
          (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'PICTURE'));
      
      if (addedImages.length > 0) {
        hasImageChange = true;
      }
      
      // Check for added text nodes
      const hasAddedTextNodes = Array.from(mutation.addedNodes)
        .some(node => node.nodeType === Node.TEXT_NODE);
      
      if (hasAddedTextNodes) {
        hasTextChange = true;
      }
    }
  });

  // Process text changes
  if (hasTextChange) {
    // Process only a limited number of mutations
    for (let i = 0; i < Math.min(mutationsToProcess.length, 20); i++) {
      const mutation = mutationsToProcess[i];
      
      if (mutation.type === 'characterData' && mutation.target.nodeType === Node.TEXT_NODE) {
        // Skip if text is very long (> 1000 chars)
        if (mutation.target.textContent.length < 1000) {
          mutation.target.textContent = translateText(mutation.target.textContent);
        }
      }
      
      if (mutation.addedNodes.length > 0) {
        // Only process a limited number of added nodes
        const nodesToProcess = Array.from(mutation.addedNodes).slice(0, 5);
        
        nodesToProcess.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE) {
            if (node.textContent.length < 1000) {
              node.textContent = translateText(node.textContent);
            }
          } else if (node.nodeType === Node.ELEMENT_NODE && !['SCRIPT', 'STYLE'].includes(node.tagName)) {
            // Limit the number of text nodes to process within added elements
            processElementTextNodes(node, 10);
          }
        });
      }
    }
  }

  // Process image changes if needed, but with a delay to prevent freezing
  if (hasImageChange && shouldReplaceImages) {
    setTimeout(replaceImages, 300);
  }
}, 100)); // Reduce frequency of observer callback

// Helper function to process a limited number of text nodes in an element
function processElementTextNodes(element, limit) {
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  let count = 0;
  let textNode;
  while ((textNode = walker.nextNode()) && count < limit) {
    if (textNode.textContent.length < 1000) {
      textNode.textContent = translateText(textNode.textContent);
      count++;
    }
  }
}

// Start observing with more focused configuration
observer.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true,
  attributes: true,
  attributeFilter: ['src', 'srcset'] // Remove 'style' to reduce triggers
});

// Handle lazy-loaded images with a more efficient debounce
window.addEventListener('scroll', debounce(function() {
  if (isEnabled && shouldReplaceImages) {
    // Use setTimeout to prevent blocking the main thread
    setTimeout(replaceImages, 500);
  }
}, 500)); // Increase to 500ms

// Improved debounce helper function
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

// Initial setup with better error handling
function initializeExtension() {
  chrome.storage.sync.get(
    ['enabled', 'skull', 'nsfw', 'emojiFreq', 'replaceImg', 'stats'],
    (result) => {
      isEnabled = result.enabled ?? false;
      isSkullMode = result.skull ?? false;
      isNsfwMode = result.nsfw ?? false;
      emojiFrequency = result.emojiFreq ?? 30;
      shouldReplaceImages = result.replaceImg ?? false;
      stats = result.stats ?? { words: 0, emojis: 0 };
      
      if (shouldReplaceImages && isEnabled) {
        // Make sure the body is loaded
        if (document.body) {
          replaceImages();
        } else {
          // Wait for the body to be available
          window.addEventListener('DOMContentLoaded', () => {
            replaceImages();
          });
        }
      }
    }
  );
}

// Make sure we initialize properly
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
  initializeExtension();
}

// Helper function to detect potentially problematic cross-origin images
function isCrossOriginImage(img) {
  // Skip images without src
  if (!img.src) return false;
  
  try {
    // Skip images with cross-origin restrictions that might cause errors
    if (img.crossOrigin === null && new URL(img.src).origin !== window.location.origin) {
      return true;
    }
    
    // Skip images from known problematic domains that might cause freezing
    const imgUrl = img.src.toLowerCase();
    const problematicDomains = ['maps.googleapis.com', 'www.google-analytics.com', 'data:'];
    return problematicDomains.some(domain => imgUrl.includes(domain));
  } catch (e) {
    // If there's an error parsing the URL, better to skip
    return true;
  }
} 