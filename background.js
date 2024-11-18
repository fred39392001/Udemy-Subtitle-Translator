// background.js

// 定義 SpeechRecognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

// 初始化 SpeechRecognition 並處理事件
function initRecognition() {
    recognition = new SpeechRecognition();
    recognition.lang = 'en-US'; // 設定語言
    recognition.interimResults = false; // 只處理完整的結果

    // 當語音結果返回時處理翻譯
    recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("語音輸入:", transcript);

        // 呼叫翻譯 API 並傳送翻譯結果給 content.js
        const translation = await translateText(transcript);
        chrome.runtime.sendMessage({ type: "subtitle", text: translation });
    };

    // 當語音識別結束時，自動重新啟動
    recognition.onend = () => {
        console.log("語音識別結束，重新啟動...");
        recognition.start(); // 重啟語音識別
    };

    recognition.onerror = (event) => {
        console.error("語音識別錯誤:", event.error);
    };
}

// 開始語音識別
function startRecognition() {
    if (!recognition) {
        initRecognition();
    }
    recognition.start();
    console.log("語音識別已啟動");
}

// 停止語音識別
function stopRecognition() {
    if (recognition) {
        recognition.stop();
        console.log("語音識別已停止");
    }
}

// 翻譯文字的函數（使用 Google Translate API）
async function translateText(text) {
    const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=YOUR_API_KEY`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            q: text,
            target: "zh-TW", // 目標語言為繁體中文
            source: "en", // 假設影片語言為英文
        }),
    });

    const data = await response.json();
    return data.data.translations[0].translatedText;
}

// 接收來自 content.js 的訊息
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "start") {
        startRecognition();
    } else if (message.type === "stop") {
        stopRecognition();
    }
});
