document.addEventListener('DOMContentLoaded', () => {
    const correctAnswersCount = localStorage.getItem('correctAnswersCount');
    const totalQuestions = localStorage.getItem('totalQuestions');
    const resultContainer = document.getElementById('result-container');

    resultContainer.innerHTML = `
        <h2>Wynik Quizu</h2>
        <p>Poprawne odpowiedzi: ${correctAnswersCount} z ${totalQuestions}</p>
    `;
});