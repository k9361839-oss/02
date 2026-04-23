document.addEventListener('mouseup', function() {
    let selectedText = window.getSelection().toString();
    if (selectedText.length > 0) {
        let wordsCount = selectedText.split(/\s+/).length;
        let readingTime = Math.max(1, Math.round(wordsCount / 200));
        
        chrome.storage.local.set({
            'selectedText': selectedText,
            'readingTime': readingTime
        });
    }
});