let isTranslating = false;

chrome.action.onClicked.addListener((tab) => {
  isTranslating = !isTranslating;

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: toggleTranslation,
    args: [isTranslating]
  });
});

function toggleTranslation(translateStatus) {
  if (translateStatus) {
    console.log("Translation started.");
    document.dispatchEvent(new CustomEvent("start-translation"));
  } else {
    console.log("Translation stopped.");
    document.dispatchEvent(new CustomEvent("stop-translation"));
  }
}