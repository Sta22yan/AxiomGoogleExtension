document.addEventListener('DOMContentLoaded', async () => {
  // Ждем инициализации settingsManager
  await settingsManager.initPromise;
  
  document.getElementById('settingsButton').addEventListener('click', async () => {
    const currentSettings = await settingsManager.getAll();
    console.log('Current settings:', currentSettings);
    
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options.html'));
    }
    window.close();
  });
});