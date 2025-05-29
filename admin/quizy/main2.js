document.addEventListener('DOMContentLoaded', function() {
    // Zmienne globalne
    let quizId;
    let questions = [];
    let questionIds = [];
    let currentQuestionIndex = 0;
    let currentQuestionId = null;

    // Elementy DOM
    const quizTitleElement = document.getElementById('quizTitle');
    const questionNumberInput = document.getElementById('questionNumber');
    const questionTypeSelect = document.getElementById('questionType');
    const questionHintTextarea = document.getElementById('questionHint');
    const answersGrid = document.querySelector('.answers-grid');
    const questionSelector = document.querySelector('.question-selector');
    const questionCounterElement = document.querySelector('.question-counter');

    // Inicjalizacja aplikacji
    async function init() {
        // Pobierz ID quizu z URL
        const urlParams = new URLSearchParams(window.location.search);
        quizId = parseInt(urlParams.get('quizId')) || 0;

        // Pobierz dane quizu
        await fetchData();

        // Aktualizuj UI
        updateQuestionSelector();
        loadQuestion(currentQuestionIndex);
    }

    // Pobierz dane quizu z serwera - zgodnie z Twoją istniejącą strukturą
    async function fetchData() {
        try {
            ws.addEventListener('open', async() => {
                // Pobierz distinct question IDs
                const distinctInfo = await request('quiz.distinctQuestion', { quiz_id: quizId }, 'distinctQuestionsInfo');

                // Zapisz ID pytań
                questionIds = distinctInfo.map(item => item.question_id);

                // Pobierz pełne informacje o pytaniach
                const fullData = await request('quiz.getFullInfo', { quiz_id: quizId }, 'quizFullInfo');

                // Przetwórz dane do formatu potrzebnego w aplikacji
                questions = processQuestionData(fullData);

                // Aktualizuj UI
                quizTitleElement.textContent = `Quiz ID: ${quizId}`; // Możesz dostosować
                questionCounterElement.textContent = questions.length;
            })

        } catch (error) {
            console.error('Błąd podczas ładowania danych quizu:', error);
            showNotification('Błąd ładowania danych quizu', 'error');
        }
    }

    // Przetwórz dane z bazy do formatu aplikacji
    function processQuestionData(fullData) {
        const questionsMap = new Map();

        fullData.forEach(row => {
            if (!questionsMap.has(row.question_id)) {
                questionsMap.set(row.question_id, {
                    id: row.question_id,
                    text: row.question_text,
                    type: row.question_type,
                    hint: row.hint,
                    answers: []
                });
            }

            if (row.answer_id) {
                questionsMap.get(row.question_id).answers.push({
                    id: row.answer_id,
                    text: row.answer_text,
                    isCorrect: Boolean(row.is_correct)
                });
            }
        });

        return Array.from(questionsMap.values());
    }

    // Załaduj pytanie do formularza
    function loadQuestion(index) {
        if (index < 0 || index >= questions.length) return;

        currentQuestionIndex = index;
        const question = questions[index];
        currentQuestionId = question.id;

        // Aktualizuj formularz
        questionNumberInput.value = question.text;
        questionTypeSelect.value = question.type;
        questionHintTextarea.value = question.hint || '';

        // Aktualizuj odpowiedzi
        renderAnswers(question.answers);

        // Aktualizuj selektor
        questionSelector.selectedIndex = index;
    }

    // Renderuj odpowiedzi w siatce
    function renderAnswers(answers) {
        answersGrid.innerHTML = '';

        answers.forEach((answer, index) => {
            const answerBox = document.createElement('div');
            answerBox.className = 'answer-box';
            answerBox.innerHTML = `
                <div class="answer-text">
                    <input type="text" placeholder="Odpowiedź" value="${answer.text}">
                </div>
                <div class="answer-controls">
                    <label>
                        <input type="${questionTypeSelect.value === 'multiple' ? 'checkbox' : 'radio'}" 
                               name="correctAnswer" ${answer.isCorrect ? 'checked' : ''}>
                        Poprawna
                    </label>
                    <button class="remove-answer"><i class="fas fa-trash"></i></button>
                </div>
            `;
            answersGrid.appendChild(answerBox);

            // Dodaj obsługę usuwania
            const removeBtn = answerBox.querySelector('.remove-answer');
            removeBtn.addEventListener('click', function() {
                if (answersGrid.children.length > 1) {
                    answerBox.remove();
                } else {
                    showNotification('Musisz mieć przynajmniej jedną odpowiedź!', 'error');
                }
            });
        });
    }

    // Zapisz aktualne pytanie
    async function saveQuestion() {
        try {
            const questionData = {
                id: currentQuestionId,
                quizId: quizId,
                text: questionNumberInput.value,
                type: questionTypeSelect.value,
                hint: questionHintTextarea.value,
                answers: []
            };

            // Zbierz odpowiedzi
            const answerBoxes = answersGrid.querySelectorAll('.answer-box');
            answerBoxes.forEach(box => {
                const answerText = box.querySelector('input[type="text"]').value;
                const isCorrect = box.querySelector('input[type="checkbox"], input[type="radio"]').checked;
                questionData.answers.push({ text: answerText, isCorrect });
            });

            // Przygotuj dane do zapisu w Twojej strukturze
            const saveData = prepareSaveData(questionData);

            // Wyślij do serwera
            const response = await request('question.update', saveData, 'feedback');

            if (response.success) {
                showNotification('Pytanie zapisane pomyślnie!');

                // Aktualizuj lokalną kopię danych
                if (currentQuestionId === null) {
                    // Nowe pytanie
                    currentQuestionId = response.newId;
                    questions.push({...questionData, id: response.newId});
                } else {
                    // Aktualizacja istniejącego
                    questions[currentQuestionIndex] = {...questionData};
                }

                // Aktualizuj UI
                await fetchData(); // Ponownie pobierz dane aby mieć aktualne ID
                updateQuestionSelector();
                questionCounterElement.textContent = questions.length;

            } else {
                showNotification('Błąd podczas zapisywania pytania', 'error');
            }

        } catch (error) {
            console.error('Błąd zapisu:', error);
            showNotification('Błąd zapisu pytania', 'error');
        }
    }

    // Przygotuj dane do zapisu w formacie zgodnym z Twoją bazą
    function prepareSaveData(questionData) {
        return {
            question_id: questionData.id,
            quiz_id: questionData.quizId,
            question_text: questionData.text,
            question_type: questionData.type,
            hint: questionData.hint,
            answers: questionData.answers.map(answer => ({
                answer_text: answer.text,
                is_correct: answer.isCorrect ? 1 : 0
            }))
        };
    }

    // Dodaj nowe pytanie
    async function addNewQuestion() {
        try {
            // Utwórz nowy obiekt pytania w bazie
            const newQuestionData = {
                quiz_id: quizId,
                question_text: "Nowe pytanie",
                question_type: "single",
                hint: "",
                answers: [{ answer_text: "", is_correct: 1 }]
            };

            const response = await request('question.add', newQuestionData, 'feedback');

            if (response.success && response.newId) {
                // Ponownie pobierz dane aby odświeżyć listę pytań
                await fetchData();

                // Znajdź nowe pytanie
                const newQuestionIndex = questions.findIndex(q => q.id === response.newId);

                if (newQuestionIndex !== -1) {
                    currentQuestionIndex = newQuestionIndex;
                    loadQuestion(currentQuestionIndex);
                }

                showNotification('Dodano nowe pytanie');
            } else {
                showNotification('Błąd podczas dodawania pytania', 'error');
            }

        } catch (error) {
            console.error('Błąd dodawania pytania:', error);
            showNotification('Błąd dodawania pytania', 'error');
        }
    }

    // Usuń aktualne pytanie
    async function deleteQuestion() {
        if (!currentQuestionId) return;

        if (!confirm('Czy na pewno chcesz usunąć to pytanie?')) return;

        try {
            const response = await request('question.delete', { question_id: currentQuestionId }, 'feedback');

            if (response.success) {
                showNotification('Pytanie usunięte');

                // Ponownie pobierz dane aby odświeżyć listę pytań
                await fetchData();

                // Załaduj kolejne pytanie
                if (questions.length > 0) {
                    currentQuestionIndex = Math.max(0, currentQuestionIndex - 1);
                    loadQuestion(currentQuestionIndex);
                } else {
                    clearForm();
                }

            } else {
                showNotification('Błąd podczas usuwania pytania', 'error');
            }

        } catch (error) {
            console.error('Błąd usuwania:', error);
            showNotification('Błąd usuwania pytania', 'error');
        }
    }

    // Aktualizuj selektor pytań
    function updateQuestionSelector() {
        questionSelector.innerHTML = '';

        questions.forEach((question, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = `Pytanie ${index + 1}`;
            questionSelector.appendChild(option);
        });

        questionSelector.selectedIndex = currentQuestionIndex;
    }

    // Wyczyść formularz (gdy nie ma pytań)
    function clearForm() {
        questionNumberInput.value = '';
        questionTypeSelect.value = 'single';
        questionHintTextarea.value = '';
        answersGrid.innerHTML = '';
        addAnswerToGrid('', true); // Dodaj jedną domyślną odpowiedź
    }

    // Funkcja pomocnicza - pokaż powiadomienie
    function showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        notification.textContent = message;
        notification.style.display = 'block';

        if (type === 'error') {
            notification.style.background = '#e74c3c';
        } else {
            notification.style.background = '#83b78c';
        }

        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }

    // Dodaj odpowiedź do siatki
    function addAnswerToGrid(text = '', isCorrect = false) {
        const answerBox = document.createElement('div');
        answerBox.className = 'answer-box';
        answerBox.innerHTML = `
            <div class="answer-text">
                <input type="text" placeholder="Odpowiedź" value="${text}">
            </div>
            <div class="answer-controls">
                <label>
                    <input type="${questionTypeSelect.value === 'multiple' ? 'checkbox' : 'radio'}" 
                           name="correctAnswer" ${isCorrect ? 'checked' : ''}>
                    Poprawna
                </label>
                <button class="remove-answer"><i class="fas fa-trash"></i></button>
            </div>
        `;
        answersGrid.appendChild(answerBox);

        // Dodaj obsługę usuwania
        const removeBtn = answerBox.querySelector('.remove-answer');
        removeBtn.addEventListener('click', function() {
            if (answersGrid.children.length > 1) {
                answerBox.remove();
            } else {
                showNotification('Musisz mieć przynajmniej jedną odpowiedź!', 'error');
            }
        });
    }

    // Inicjalizacja przycisków
    document.querySelector('.add-answer-btn').addEventListener('click', function() {
        addAnswerToGrid();
    });

    document.getElementById('prevButton').addEventListener('click', function() {
        if (currentQuestionIndex > 0) {
            loadQuestion(currentQuestionIndex - 1);
        }
    });

    document.getElementById('nextButton').addEventListener('click', function() {
        if (currentQuestionIndex < questions.length - 1) {
            loadQuestion(currentQuestionIndex + 1);
        }
    });

    questionSelector.addEventListener('change', function() {
        loadQuestion(parseInt(this.value));
    });

    document.querySelector('.save-button').addEventListener('click', saveQuestion);
    document.querySelector('.add-button').addEventListener('click', addNewQuestion);
    document.querySelector('.delete-button').addEventListener('click', deleteQuestion);

    // Rozpocznij aplikację
    init();
});