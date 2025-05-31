class OptionsPage {
  constructor() {
    document.addEventListener('DOMContentLoaded', () => this.init());
  }

  async init() {
    await this.loadSettings();
    this.setupAutoSave();
    this.setupImportExport();
  }

  async loadSettings() {
    try {
      const settings = await settingsManager.getAll();
      
      document.getElementById('language').value = settings.language || 'ru';
      document.getElementById('autoUpdates').checked = settings.autoUpdates !== false;
      
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
    }
  }

  setupAutoSave() {
    // Автосохранение при изменении языка
    document.getElementById('language').addEventListener('change', async (e) => {
      await settingsManager.set('language', e.target.value);
    });

    // Автосохранение при изменении автообновлений
    document.getElementById('autoUpdates').addEventListener('change', async (e) => {
      await settingsManager.set('autoUpdates', e.target.checked);
    });

    //Кнопка сброса настроек
    document.getElementById('resetBtn').addEventListener('click', async () => {
      if (confirm('Вы уверены, что хотите сбросить настройки?')) {
        await settingsManager.saveSettings(settingsManager.defaultSettings);
        await this.loadSettings();
      }
    });
  }

  setupImportExport() {
    // Экспорт настроек
    document.getElementById('exportBtn').addEventListener('click', async () => {
      try {
        const settings = await settingsManager.getAll();
        this.exportSettings(settings);
      } catch (error) {
        console.error('Ошибка экспорта:', error);
        alert('Ошибка при экспорте настроек');
      }
    });

    // Импорт настроек
    document.getElementById('importBtn').addEventListener('click', () => {
      document.getElementById('importFile').click();
    });

    document.getElementById('importFile').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const settings = await this.readSettingsFile(file);
        await settingsManager.saveSettings(settings);
        await this.loadSettings();
        alert('Настройки успешно импортированы!');
      } catch (error) {
        console.error('Ошибка импорта:', error);
        alert('Ошибка при импорте настроек: ' + error.message);
      } finally {
        e.target.value = '';
      }
    });
    }

  exportSettings(settings) {
    const data = JSON.stringify(settings, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `neurocoin-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert('Настройки успешно экспортированы!');
    }

  readSettingsFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const settings = JSON.parse(e.target.result);
          if (typeof settings !== 'object' || settings === null) {
            throw new Error('Файл не содержит валидных настроек');
          }
          resolve(settings);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Ошибка чтения файла'));
      };
      
      reader.readAsText(file);
        });
    }
}

new OptionsPage();