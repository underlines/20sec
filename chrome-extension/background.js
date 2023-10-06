// This script uses Chrome's Storage API

// Initialize Extension State:
// Sets an initial state for the extension in Chrome's storage.
// Set it to 'off' by default.
function initializeState() {
  chrome.storage.sync.set({ 'extensionState': 'off' }, function() {
    console.log('The extension is initially set to off.');
  });
}

// Check Existing State:
// When the background script is run,
// it should first check if an extensionState already exists.
// If it doesn't, it should initialize it.
chrome.storage.sync.get('extensionState', function(result) {
  if (result.extensionState === undefined) {
    initializeState();
  }
});

// Toggle State:
// Create a function to toggle the extension state
// between 'on' and 'off'. Should link to popup button
function toggleExtensionState() {
  chrome.storage.sync.get('extensionState', function(result) {
    let newState = (result.extensionState === 'on') ? 'off' : 'on';
    chrome.storage.sync.set({ 'extensionState': newState }, function() {
      // Inform content script about state change
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { message: 'stateChanged', newState: newState });
      });
    });
  });
}

// Connect to Popup:
// Adds an event listener to listen for messages from the popup script.
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message === 'toggleState') {
      toggleExtensionState();
      sendResponse({ message: 'stateToggled' });
    }
  }
);