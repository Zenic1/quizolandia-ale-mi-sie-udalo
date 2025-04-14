document.addEventListener("DOMContentLoaded", () => {
    const correctCount = parseInt(localStorage.getItem("correctAnswersCount") || "0");
    const totalQuestions = parseInt(localStorage.getItem("totalQuestions") || "0");

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const quizId = parseInt(urlParams.get(`quizId`) ?? `0`);

    const userId = parseInt(sessionStorage.getItem("userId"));

    if (totalQuestions === 0) {
        document.getElementById("score").textContent = "Nie rozwiązałeś ostatnio żadnego quizu.";
        document.getElementById("percentage").textContent = "";
        setTimeout(() => {
            window.location.href = "../";
        }, 3000);
    } else {
        const percentage = Math.round((correctCount / totalQuestions) * 100);
        document.getElementById("score").textContent = `Poprawne odpowiedzi: ${correctCount} z ${totalQuestions}`;
        document.getElementById("percentage").textContent = `Wynik: ${percentage}%`;

        if (userId !== 0) {
            if (ws.readyState === WebSocket.OPEN) {
                sendRequest(userId, quizId, correctCount, totalQuestions);
            } else {
                ws.addEventListener("open", () => {
                    sendRequest(userId, quizId, correctCount, totalQuestions);
                });
            }
        }
    }
});
// nie dziala szymon naprawi co nie?
function sendRequest(userId, quizId, correctCount, totalQuestions) {
    request('userScore.add', {
        user_id: userId,
        quiz_id: quizId,
        score: correctCount,
        max_possible_score: totalQuestions
    }, "scoreResponse").then(() => {
        console.log("Wynik zapisany w bazie");
    }).catch(err => {
        console.log("Błąd zapisu", err);
    });
}