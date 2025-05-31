import { settingsManager } from './settings.js';

class SettingsAPI {
  static async getSettings() {
    return settingsManager.getAll();
  }

  static async updateSettings(newSettings) {
    return settingsManager.saveSettings(newSettings);
  }

  static async getSetting(key) {
    return settingsManager.get(key);
  }

  static async setSetting(key, value) {
    return settingsManager.set(key, value);
  }
}


window.SettingsAPI = SettingsAPI;
export default SettingsAPI;