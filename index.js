document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get(['readingTime', 'selectedText'], (data) => {
        if (data.readingTime) {
            document.getElementById('time').innerText = data.readingTime;
        }
    });

    const btn = document.getElementById('askBtn');
    btn.addEventListener('click', () => {
        const answerDiv = document.getElementById('answer');
        answerDiv.innerText = "סורק ומסכם...";

        chrome.storage.local.get(['selectedText'], (data) => {
            if (!data.selectedText || data.selectedText.trim().length < 5) {
                answerDiv.innerText = "אופס! לא סימנת טקסט בפוסט. חזור לאתר, סמן טקסט ונסה שוב.";
                return;
            }

            const lines = data.selectedText.split('\n');
            const actionWords = [
                "לחץ", "הורד", "תתקין", "חלץ", "קובץ", "מדריך", "שלב", "קוד", "סיסמא",
                "click", "download", "install", "extract", "file", "guide", "step", "run", "open", "link"
            ];

            const summary = lines.filter(line => {
                const l = line.trim();
                return l.length > 5 && (
                    /^\d/.test(l) || 
                    l.includes("http") || 
                    l.includes(":") || 
                    actionWords.some(word => l.toLowerCase().includes(word.toLowerCase()))
                );
            });

            if (summary.length > 0) {
                answerDiv.innerHTML = "<strong>עיקרי המדריך (עברית/English):</strong><br><br>" + 
                                     summary.map(s => "• " + s.trim()).join("<br><br>");
            } else {
                answerDiv.innerText = "לא מצאתי הוראות ברורות. נסה לסמן חלק אחר בפוסט.";
            }
        });
    });
});
