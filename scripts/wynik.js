document.addEventListener("DOMContentLoaded", () => {
    const correctCount = parseInt(localStorage.getItem("correctAnswersCount") || "0");
    const totalQuestions = parseInt(localStorage.getItem("totalQuestions") || "0");

    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const quizId = parseInt(urlParams.get(`quizId`) ?? `0`);

    const userId = parseInt(localStorage.getItem("userId") || "0");


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

        const wrongQuestions = JSON.parse(localStorage.getItem("wrongQuestions") || "[]");
        if (wrongQuestions.length > 0) {
            const wrongSection = document.createElement("div");
            wrongSection.innerHTML = "<h3>Błędne odpowiedzi:</h3>";
            wrongQuestions.forEach(q => {
                const div = document.createElement("div");
                div.className = "wrong-question";
                div.innerHTML = `
                <strong>Pytanie:</strong> ${q.question}<br>
                <strong>Poprawna odpowiedź:</strong> ${q.correctAnswers ? q.correctAnswers.join(", ") : ""}
            `;
                wrongSection.appendChild(div);
            });
            document.getElementById("result").appendChild(wrongSection);
        }
        if (!userId || isNaN(userId) || userId <= 0) {
            console.error("Brak userId lub nieprawidłowy userId.");
            return;
        }
        if (ws.readyState === WebSocket.OPEN) {
            sendRequest(userId, quizId, correctCount, totalQuestions);
        } else {
            ws.addEventListener("open", () => {
                sendRequest(userId, quizId, correctCount, totalQuestions);
            });
        }
    }
});
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
function goBack(){
    window.location.href = "../";
}