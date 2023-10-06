document.addEventListener('DOMContentLoaded', function() {
  const toggleButton = document.getElementById('toggleButton');
  
  // Retrieve current state and update button label accordingly
  chrome.storage.sync.get('extensionState', function(result) {
    toggleButton.innerText = (result.extensionState === 'on') ? 'Turn Off' : 'Turn On';
  });

  toggleButton.addEventListener('click', function() {
    // Send message to background script to toggle extension state
    chrome.runtime.sendMessage({ message: 'toggleState' }, function(response) {
      if (response.message === 'stateToggled') {
        // Update button label based on new state
        chrome.storage.sync.get('extensionState', function(result) {
          toggleButton.innerText = (result.extensionState === 'on') ? 'Turn Off' : 'Turn On';
        });
      }
    });
  });
});