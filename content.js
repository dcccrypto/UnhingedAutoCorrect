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
    
    // Proceed with image replacement
    processRegularImages();
    processBackgroundImages();
    processPictureElements();
    processIframes();
    
    function processRegularImages() {
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (!img.dataset.originalSrc && !img.src.includes('chrome-extension://')) {
          img.dataset.originalSrc = img.src;
          img.src = getRandomMeme();
          
          // Also handle srcset if present
          if (img.srcset) {
            img.dataset.originalSrcset = img.srcset;
            img.srcset = '';
          }
          
          // Set up error handler to catch and retry failed loads
          img.onerror = function() {
            if (img.src !== img.dataset.originalSrc) {
              img.src = getRandomMeme(); // Try another random meme
            }
          };
        }
      });
    }
    
    function processBackgroundImages() {
      // Target elements with inline style background images
      const backgroundElements = document.querySelectorAll('[style*="background-image"]');
      backgroundElements.forEach(el => {
        if (!el.dataset.originalBg) {
          el.dataset.originalBg = el.style.backgroundImage;
          el.style.backgroundImage = `url(${getRandomMeme()})`;
        }
      });
      
      // Also check for elements that might have background images from CSS
      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => {
        const computedStyle = window.getComputedStyle(el);
        const bgImage = computedStyle.getPropertyValue('background-image');
        
        if (bgImage && bgImage !== 'none' && !bgImage.includes('chrome-extension://') && !el.dataset.originalComputedBg) {
          el.dataset.originalComputedBg = bgImage;
          el.style.backgroundImage = `url(${getRandomMeme()})`;
        }
      });
    }
    
    function processPictureElements() {
      // Handle picture elements with source elements
      const pictureSources = document.querySelectorAll('picture source');
      pictureSources.forEach(source => {
        if (!source.dataset.originalSrcset && source.srcset) {
          source.dataset.originalSrcset = source.srcset;
          source.srcset = getRandomMeme();
        }
      });
    }
    
    function processIframes() {
      try {
        // Try to access same-origin iframes
        const iframes = document.querySelectorAll('iframe');
        iframes.forEach(iframe => {
          try {
            if (iframe.contentDocument && iframe.contentDocument.body) {
              // Process images inside iframe
              const iframeImages = iframe.contentDocument.querySelectorAll('img');
              iframeImages.forEach(img => {
                if (!img.dataset.originalSrc) {
                  img.dataset.originalSrc = img.src;
                  img.src = getRandomMeme();
                }
              });
              
              // Process background images inside iframe
              const iframeBgElements = iframe.contentDocument.querySelectorAll('[style*="background-image"]');
              iframeBgElements.forEach(el => {
                if (!el.dataset.originalBg) {
                  el.dataset.originalBg = el.style.backgroundImage;
                  el.style.backgroundImage = `url(${getRandomMeme()})`;
                }
              });
            }
          } catch (e) {
            // Cross-origin iframe, can't access
            console.debug("Can't access iframe content (likely cross-origin)");
          }
        });
      } catch (e) {
        console.debug("Error processing iframes:", e);
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

// Update the observer to handle dynamic content better
const observer = new MutationObserver((mutations) => {
  if (!isEnabled) return;

  let hasTextChange = false;
  let hasImageChange = false;

  mutations.forEach((mutation) => {
    // Check for text changes
    if (mutation.type === 'characterData' || mutation.addedNodes.length > 0) {
      hasTextChange = true;
    }
    
    // Check for image or style changes
    if (mutation.type === 'attributes' && 
        (mutation.attributeName === 'src' || 
         mutation.attributeName === 'srcset' || 
         mutation.attributeName === 'style')) {
      hasImageChange = true;
    }
    
    // Check for added images
    if (mutation.addedNodes.length > 0) {
      const addedImages = Array.from(mutation.addedNodes)
        .filter(node => 
          node.nodeName === 'IMG' || 
          (node.nodeType === Node.ELEMENT_NODE && 
           (node.querySelector('img') || 
            node.querySelector('[style*="background-image"]') || 
            node.querySelector('picture'))));
      
      if (addedImages.length > 0) {
        hasImageChange = true;
      }
    }
  });

  // Process text changes
  if (hasTextChange) {
    mutations.forEach((mutation) => {
      // Handle text changes
      if (mutation.type === 'characterData' && mutation.target.nodeType === Node.TEXT_NODE) {
        mutation.target.textContent = translateText(mutation.target.textContent);
      }
      
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
  }

  // Process image changes if needed
  if (hasImageChange && shouldReplaceImages) {
    replaceImages();
  }
});

// Start observing with improved configuration
observer.observe(document.body, {
  childList: true,
  subtree: true,
  characterData: true,
  attributes: true,
  attributeFilter: ['src', 'srcset', 'style']
});

// Handle lazy-loaded images that appear during scrolling
window.addEventListener('scroll', debounce(function() {
  if (isEnabled && shouldReplaceImages) {
    replaceImages();
  }
}, 200));

// Debounce helper function to improve performance
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
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