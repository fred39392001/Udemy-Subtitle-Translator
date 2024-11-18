let settings = {
    fontSize: '18px',
    position: 'bottom',
    opacity: 70,
    duration: 5
};

// 載入儲存的設定
chrome.storage.local.get('subtitleSettings', (data) => {
    if (data.subtitleSettings) {
        settings = { ...settings, ...data.subtitleSettings };
        updateSettingsUI();
    }
});

// 更新UI以匹配設定
function updateSettingsUI() {
    document.getElementById('fontSize').value = settings.fontSize;
    document.getElementById('position').value = settings.position;
    document.getElementById('opacity').value = settings.opacity;
    document.getElementById('duration').value = settings.duration;
}

// 儲存設定
function saveSettings() {
    chrome.storage.local.set({ subtitleSettings: settings }, () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: 'updateSettings',
                settings: settings
            });
        });
    });
}

// 監聽設定變更
document.getElementById('fontSize').addEventListener('change', (e) => {
    settings.fontSize = e.target.value;
    saveSettings();
});

document.getElementById('position').addEventListener('change', (e) => {
    settings.position = e.target.value;
    saveSettings();
});

document.getElementById('opacity').addEventListener('input', (e) => {
    settings.opacity = parseInt(e.target.value);
    saveSettings();
});

document.getElementById('duration').addEventListener('change', (e) => {
    settings.duration = parseInt(e.target.value);
    saveSettings();
});

// 開始/停止翻譯按鈕
document.getElementById('startBtn').addEventListener('click', async () => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];
    
    if (tab.url.includes('udemy.com')) {
        chrome.runtime.sendMessage({ command: "startTranslation" });
        document.getElementById('status').textContent = '翻譯進行中...';
        document.getElementById('startBtn').disabled = true;
        document.getElementById('stopBtn').disabled = false;
    } else {
        document.getElementById('status').textContent = '請在Udemy課程頁面使用';
    }
});

document.getElementById('stopBtn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ command: "stopTranslation" });
    document.getElementById('status').textContent = '已停止翻譯';
    document.getElementById('startBtn').disabled = false;
    document.getElementById('stopBtn').disabled = true;
});
