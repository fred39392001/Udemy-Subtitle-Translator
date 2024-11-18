let recognition;
let subtitleContainer;

// 監聽來自 popup 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "start-translation":
      startTranslation();
      break;
    case "stop-translation":
      stopTranslation();
      break;
    case "update-style":
      updateSubtitleStyle(request.property, request.value);
      break;
  }
});

function startTranslation() {
  if (!recognition) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("");
      translateText(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      if (recognition) {
        recognition.start();
        console.log("Restarting speech recognition...");
      }
    };
  }

  recognition.start();
  createSubtitleContainer();
  console.log("Speech recognition started.");
  
  // 通知 popup 翻譯狀態
  chrome.runtime.sendMessage({ action: "translation-status", isTranslating: true });
}

function stopTranslation() {
  if (recognition) {
    recognition.stop();
    recognition = null;
    console.log("Speech recognition stopped.");
    
    // 通知 popup 翻譯狀態
    chrome.runtime.sendMessage({ action: "translation-status", isTranslating: false });
  }

  removeSubtitleContainer();
}

// 新增：更新字幕樣式的函數
function updateSubtitleStyle(property, value) {
  if (!subtitleContainer) return;

  switch (property) {
    case 'fontSize':
      subtitleContainer.style.fontSize = value;
      break;
    case 'opacity':
      const bgColor = `rgba(0, 0, 0, ${value})`;
      subtitleContainer.style.backgroundColor = bgColor;
      break;
  }
}

function createSubtitleContainer() {
  if (!subtitleContainer) {
    subtitleContainer = document.createElement("div");
    subtitleContainer.id = "udemy-subtitle-container";
    subtitleContainer.style.position = "fixed";
    subtitleContainer.style.bottom = "10%";
    subtitleContainer.style.left = "50%";
    subtitleContainer.style.transform = "translateX(-50%)";
    subtitleContainer.style.padding = "10px";
    subtitleContainer.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    subtitleContainer.style.color = "white";
    subtitleContainer.style.borderRadius = "5px";
    subtitleContainer.style.zIndex = "9999";
    document.body.appendChild(subtitleContainer);

    // 載入儲存的樣式設定
    chrome.storage.local.get(['fontSize', 'opacity'], function(result) {
      if (result.fontSize) {
        subtitleContainer.style.fontSize = result.fontSize;
      }
      if (result.opacity !== undefined) {
        subtitleContainer.style.backgroundColor = `rgba(0, 0, 0, ${result.opacity})`;
      }
    });
  }
}

function removeSubtitleContainer() {
  if (subtitleContainer) {
    subtitleContainer.remove();
    subtitleContainer = null;
  }
}

async function translateText(text) {
  const apiUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-TW&dt=t&q=${encodeURIComponent(
    text
  )}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    const translation = data[0][0][0];
    if (subtitleContainer) {
      subtitleContainer.textContent = translation;
    }
  } catch (error) {
    console.error("Translation error:", error);
  }
}