document.addEventListener("DOMContentLoaded", () => {

    let wrongQuestions = [];
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const quizId = parseInt(urlParams.get("quizId") ?? 0);

    const quizContainer = document.getElementById("quiz-container");
    const nextButton = document.getElementById("next");
    const hintButton = document.getElementById("hint");

    nextButton.style.display = "none";

    let currentQuestionIndex = 0;
    let quizData = [];
    let selectedAnswers = [];
    let correctAnswersCount = 0;
    let questionTypePL = [];
    questionTypePL["open"] = "Otwarte";
    questionTypePL["multiple"] = "Wielokrotnego wyboru";
    questionTypePL["single"] = "Pojedynczego wyboru";

    async function fetchQuizData() {
        try {
            const fullQuizData = await request("quiz.getFullInfo", { quiz_id: quizId }, "quizData");
            const questionsMap = new Map();
            fullQuizData.forEach(row => {
                if (!questionsMap.has(row.question_id)) {
                    questionsMap.set(row.question_id, {
                        question: row.question_text,
                        questionType: row.question_type,
                        answers: [],
                        correctAnswers: [],
                        hint: row.hint || ""
                    });
                }
                if (row.answer_text !== null) {
                    const question = questionsMap.get(row.question_id);
                    question.answers.push({
                        text: row.answer_text,
                        isCorrect: row.is_correct === 1
                    });
                    if (row.is_correct) {
                        question.correctAnswers.push(question.answers.length - 1);
                    }
                }
            });
            quizData = Array.from(questionsMap.values());
            if (quizData.length > 0) {
                generateQuestion(quizData[currentQuestionIndex]);
            }
        } catch (error) {
            console.error("Błąd pobierania danych quizu:", error);
        }
    }
    function hideNextButton() {
        nextButton.style.display = "none";
    }
    function showNextButton() {
        nextButton.style.display = "inline-block";
    }
    function generateQuestion(questionData) {
        hideNextButton();
        selectedAnswers = [];


        if (questionData.questionType === "open") {
            quizContainer.innerHTML = `
                <h2>${questionData.question}</h2>
                <p style="font-size: 0.9rem; color: var(--font-color);">Typ pytania: ${questionData.questionType}</p>
                <textarea class="open-answer" id="open-answer" placeholder="Wpisz odpowiedź"></textarea>
            `;
            const openAnswer = document.getElementById("open-answer");
            openAnswer.addEventListener("input", () => {
                openAnswer.value.trim().length > 0 ? showNextButton() : hideNextButton();
            });
        } else {
            quizContainer.innerHTML = `
                <h2>${questionData.question}</h2>
                <p style="font-size: 0.9rem; color: var(--font-color);">Typ pytania: ${questionTypePL[questionData.questionType]}</p>
                <div class="odpowiedzi">
                    ${questionData.answers.map((answer, index) => `<button data-index="${index}" class="answer-button">${answer.text}</button>`).join("")}
                </div>
            `;
            document.querySelectorAll(".answer-button").forEach(button => {
                button.addEventListener("click", (e) => {
                    const selectedAnswerIndex = parseInt(e.target.getAttribute("data-index"));
                    if (questionData.questionType === "multiple") {
                        if (selectedAnswers.includes(selectedAnswerIndex)) {
                            selectedAnswers = selectedAnswers.filter(index => index !== selectedAnswerIndex);
                            e.target.classList.remove("selected");
                        } else {
                            selectedAnswers.push(selectedAnswerIndex);
                            e.target.classList.add("selected");
                        }
                        selectedAnswers.length > 0 ? showNextButton() : hideNextButton();
                    } else {
                        selectedAnswers = [selectedAnswerIndex];
                        document.querySelectorAll(".answer-button").forEach(btn => btn.classList.remove("selected"));
                        e.target.classList.add("selected");
                        showNextButton();
                    }
                });
            });
        }
    }

    nextButton.addEventListener("click", () => {
        const currentQuestion = quizData[currentQuestionIndex];
        let isCorrect = false;
        if (currentQuestion.questionType === "open") {
            const openAnswer = document.getElementById("open-answer").value.trim();
            isCorrect = openAnswer.length > 0;
        } else {
            if (currentQuestion.questionType === "multiple") {
                isCorrect = selectedAnswers.sort().toString() === currentQuestion.correctAnswers.sort().toString();
            } else {
                isCorrect = selectedAnswers[0] === currentQuestion.correctAnswers[0];
            }
        }
        if (isCorrect) {
            correctAnswersCount++;
        }else{
            wrongQuestions.push({
                question: currentQuestion.question,
                correctAnswers: currentQuestion.correctAnswers.map(index => currentQuestion.answers[index].text),
                userAnswer: selectedAnswers.map(index => currentQuestion.answers[index].text)
            });
        }
        currentQuestionIndex++;
        if (currentQuestionIndex < quizData.length) {
            generateQuestion(quizData[currentQuestionIndex]);
        } else {
            localStorage.setItem("correctAnswersCount", correctAnswersCount.toString());
            localStorage.setItem("totalQuestions", quizData.length.toString());
            localStorage.setItem("wrongQuestions", JSON.stringify(wrongQuestions));
            window.location.href = "../wynik/?quizId=" + quizId;
        }
    });

    hintButton.addEventListener("click", () => {
        const hint = quizData[currentQuestionIndex].hint;
        alert(hint ? hint : "Brak podpowiedzi do tego pytania.");
    });

    if(ws.readyState === WebSocket.OPEN) {
        fetchQuizData();
    } else {
        ws.addEventListener("open", fetchQuizData);
    }
});