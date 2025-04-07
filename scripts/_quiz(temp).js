document.addEventListener('DOMContentLoaded', () => {
    const quizContainer = document.getElementById('quiz-container');
    const nextButton = document.getElementById('next');
    const hintButton = document.getElementById('hint');
    let currentQuestionIndex = 0;
    let quizData = [];
    let selectedAnswers = [];
    let correctAnswersCount = 0;

    async function fetchQuizData() {
        const queryResults = [
            { question_id: 47, question_text: "Zaznacz czynniki przyrodnicze :", question_type: "multiple", answer_id: 1, answer_text: "klimat", is_correct: 1 },
            { question_id: 47, question_text: "Zaznacz czynniki przyrodnicze :", question_type: "multiple", answer_id: 2, answer_text: "ukształtowanie terenu", is_correct: 1 },
            { question_id: 47, question_text: "Zaznacz czynniki przyrodnicze :", question_type: "multiple", answer_id: 3, answer_text: "warunki wodne", is_correct: 1 },
            { question_id: 47, question_text: "Zaznacz czynniki przyrodnicze :", question_type: "multiple", answer_id: 4, answer_text: "poziom kultury rolnej", is_correct: 0 },
            { question_id: 48, question_text: "Żyzność gleby nie ma większego wpływu na rozwój roślin:", question_type: "single", answer_id: 5, answer_text: "prawda", is_correct: 0 },
            { question_id: 48, question_text: "Żyzność gleby nie ma większego wpływu na rozwój roślin:", question_type: "single", answer_id: 6, answer_text: "fałsz", is_correct: 1 },
            { question_id: 49, question_text: "Opisz wpływ klimatu na rolnictwo:", question_type: "open", answer_id: null, answer_text: "nie", is_correct: 1 }
        ];

        const quizData = [];
        const questionsMap = new Map();

        queryResults.forEach(row => {
            if (!questionsMap.has(row.question_id)) {
                questionsMap.set(row.question_id, {
                    question: row.question_text,
                    questionType: row.question_type,
                    answers: [],
                    correctAnswers: [],
                    hint: ""
                });
            }
            const question = questionsMap.get(row.question_id);
            if (row.answer_text) {
                question.answers.push({ text: row.answer_text, isCorrect: row.is_correct });
                if (row.is_correct) {
                    question.correctAnswers.push(question.answers.length - 1);
                }
            }
        });

        questionsMap.forEach(question => quizData.push(question));
        return quizData;
    }

    function generateQuestion(questionData) {
        if (questionData.questionType === 'open') {
            quizContainer.innerHTML = `
                <h2>${questionData.question}</h2>
                <textarea class="open-answer" id="open-answer"></textarea>
            `;
        } else {
            quizContainer.innerHTML = `
                <h2>${questionData.question}</h2>
                <div class="odpowiedzi">
                    ${questionData.answers.map((answer, index) => `
                        <button data-index="${index}" class="answer-button">${answer.text}</button>
                    `).join('')}
                </div>
            `;

            selectedAnswers = [];

            document.querySelectorAll('.answer-button').forEach(button => {
                button.addEventListener('click', (e) => {
                    const selectedAnswerIndex = parseInt(e.target.getAttribute('data-index'));
                    if (questionData.questionType === 'multiple') {
                        if (selectedAnswers.includes(selectedAnswerIndex)) {
                            selectedAnswers = selectedAnswers.filter(index => index !== selectedAnswerIndex);
                            e.target.classList.remove('selected');
                        } else {
                            selectedAnswers.push(selectedAnswerIndex);
                            e.target.classList.add('selected');
                        }
                    } else {
                        selectedAnswers = [selectedAnswerIndex];
                        document.querySelectorAll('.answer-button').forEach(btn => btn.classList.remove('selected'));
                        e.target.classList.add('selected');
                    }
                });
            });
        }
    }

    nextButton.addEventListener('click', () => {
        const currentQuestion = quizData[currentQuestionIndex];
        let isCorrect;

        if (currentQuestion.questionType === 'open') {
            const openAnswer = document.getElementById('open-answer').value;
            isCorrect = openAnswer.trim().length > 0; // Zakładamy, że każda odpowiedź jest poprawna, jeśli nie jest pusta
        } else {
            isCorrect = currentQuestion.questionType === 'multiple'
                ? selectedAnswers.sort().toString() === currentQuestion.correctAnswers.sort().toString()
                : selectedAnswers[0] === currentQuestion.correctAnswers[0];
        }

        if (isCorrect) {
            correctAnswersCount++;
        }

        currentQuestionIndex++;
        if (currentQuestionIndex < quizData.length) {
            generateQuestion(quizData[currentQuestionIndex]);
        } else {
            localStorage.setItem('correctAnswersCount', correctAnswersCount);
            localStorage.setItem('totalQuestions', quizData.length);
            window.location.href = 'wynik/index.html';
        }
    });

    hintButton.addEventListener('click', () => {
        alert(quizData[currentQuestionIndex].hint);
    });

    fetchQuizData().then(data => {
        quizData = data;
        generateQuestion(quizData[currentQuestionIndex]);
    });
});