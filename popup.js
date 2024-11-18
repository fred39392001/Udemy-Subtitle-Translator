document.addEventListener('DOMContentLoaded', function() {
    // 獲取元素
    const container = document.querySelector('.container');
    const startBtn = document.querySelector('.btn-start');
    const stopBtn = document.querySelector('.btn-stop');
    const closeBtn = document.querySelector('.close-btn');
    const fontSizeBtns = document.querySelectorAll('.size-btn');
    const opacitySlider = document.querySelector('#opacity-slider');
    const status = document.querySelector('.status');

    // 從 storage 獲取設定
    chrome.storage.local.get(['fontSize', 'opacity'], function(result) {
        if (result.fontSize) {
            document.querySelector(`.size-btn[data-size="${result.fontSize}"]`)?.classList.add('active');
        }
        if (result.opacity) {
            opacitySlider.value = result.opacity * 100;
        }
    });

    // 開始翻譯
    startBtn.addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "start-translation"});
            chrome.runtime.sendMessage({action: "set-translation-status", status: true});
        });
        status.textContent = "翻譯中...";
        status.style.backgroundColor = "#d4edda";
        status.style.color = "#155724";
    });

    // 停止翻譯
    stopBtn.addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {action: "stop-translation"});
            chrome.runtime.sendMessage({action: "set-translation-status", status: false});
        });
        status.textContent = "已停止翻譯";
        status.style.backgroundColor = "#f8d7da";
        status.style.color = "#721c24";
    });

    // 關閉面板（只是隱藏 popup）
    closeBtn.addEventListener('click', function() {
        window.close();
    });

    // 字體大小按鈕
    fontSizeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            fontSizeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const fontSize = btn.dataset.size;
            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: "update-style",
                    property: "fontSize",
                    value: fontSize
                });
            });
            chrome.storage.local.set({fontSize: fontSize});
        });
    });

    // 透明度滑桿
    opacitySlider.addEventListener('input', function() {
        const opacity = this.value / 100;
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {
                action: "update-style",
                property: "opacity",
                value: opacity
            });
        });
        chrome.storage.local.set({opacity: opacity});
    });

    // 檢查當前翻譯狀態
    chrome.runtime.sendMessage({action: "get-translation-status"}, function(response) {
        if (response.isTranslating) {
            status.textContent = "翻譯中...";
            status.style.backgroundColor = "#d4edda";
            status.style.color = "#155724";
        } else {
            status.textContent = "已停止翻譯";
            status.style.backgroundColor = "#f8d7da";
            status.style.color = "#721c24";
        }
    });
});