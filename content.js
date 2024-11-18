let recognition;
let subtitleContainer;

document.addEventListener("start-translation", () => {
  startTranslation();
});

document.addEventListener("stop-translation", () => {
  stopTranslation();
});

function startTranslation() {
  if (!recognition) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join("");
      translateText(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };
  }

  recognition.start();
  createSubtitleContainer();
  console.log("Speech recognition started.");
}

function stopTranslation() {
  if (recognition) {
    recognition.stop();
    console.log("Speech recognition stopped.");
  }

  removeSubtitleContainer();
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
