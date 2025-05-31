class SettingsManager {
  constructor(defaultSettings) {
    this.defaultSettings = defaultSettings;
    this.settings = {};
    this.initPromise = this.init();
  }

  async init() {
    this.settings = await this.loadSettings();
    chrome.storage.onChanged.addListener(this.handleStorageChange.bind(this));
  }

  async loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(this.defaultSettings, (settings) => {
        resolve({ ...this.defaultSettings, ...settings });
      });
    });
  }

  async saveSettings(newSettings) {
    return new Promise((resolve) => {
      chrome.storage.sync.set(newSettings, () => {
        this.settings = { ...this.settings, ...newSettings };
        resolve();
      });
    });
  }

  async get(key) {
    await this.initPromise;
    return this.settings[key];
  }

  async set(key, value) {
    await this.initPromise;
    return this.saveSettings({ [key]: value });
  }

  async getAll() {
    await this.initPromise;
    return { ...this.settings };
  }

  handleStorageChange(changes) {
    for (const [key, { newValue }] of Object.entries(changes)) {
      this.settings[key] = newValue;
    }
  }
}

//---//
window.settingsManager = new SettingsManager({
    language: 'ru',
    autoUpdates: true
});