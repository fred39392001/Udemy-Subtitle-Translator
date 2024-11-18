let isTranslating = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "get-translation-status") {
    sendResponse({ isTranslating });
  } else if (request.action === "set-translation-status") {
    isTranslating = request.status;
    // 廣播狀態給所有活動的標籤頁
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { 
          action: "translation-status-changed", 
          isTranslating: isTranslating 
        }).catch(() => {});
      });
    });
  }
});