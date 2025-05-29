const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const quizId = parseInt(urlParams.get("quizId") ?? 0);
let currQuiz;

const copyText = window.location.origin + '/quizRozw/?quizId=' + quizId

console.log(quizId);

if (quizId) {
    document.getElementById('ifNoQuiz').style.display = 'none';
    ws.addEventListener('open', () => {
        console.error(1);
        request('quiz.get', { quiz_id: quizId }, 'fullQuizList')
            .then(data => loadQuiz(data.find(quiz => quiz.quiz_id === quizId)));
    });
} else {
    document.getElementsByTagName('main')[0].style.display = 'none';
}


function loadQuiz(quiz) {
    console.log(quiz);

    currQuiz = quiz;

    if (quiz.cover_url && quiz.cover_url.length > 0) {
        document.getElementById('quiz-image').setAttribute('src', `${quiz.cover_url}`);
    }

    document.getElementsByClassName('description-section')[0].textContent = quiz.description;
    document.getElementsByClassName('quiz-title')[0].textContent = quiz.title;

    document.title = `${quiz.title} | Quizolandia`;

    request('user.getMinimum', { user_ids: [quiz.author_id] }, 'authorData').then(data => loadAuthor(data));
    loadComments(quiz.quiz_id);
    loadTopSolvers(quiz.quiz_id);
}

function loadAuthor(data) {
    if (!data || !data.length || !currQuiz) return;
    const author = data.find(user => user.user_id === currQuiz.author_id);
    if (author) {
        document.getElementsByClassName('quiz-author')[0].innerHTML = `Autor: ${author.username}`;
    }
}

async function loadComments(quiz_id) {
    const commentList = document.getElementById('commentList');
    commentList.innerHTML = '';

    const comments = await request('comment.get', { quiz_id: quizId }, 'commentList');
    if (!comments || comments.length === 0) return;

    const userIds = [...new Set(comments.map(comment => comment.user_id))];

    const users = await request('user.getMinimum', { user_ids: userIds }, 'filteredUsers');

    resetComments();
    comments
        .filter(comment => comment.quiz_id === quiz_id)
        .reverse()
        .forEach(comment => {
            const user = users.find(user => user.user_id === comment.user_id);
            commentList.appendChild(createComment(user, comment.comment_text, comment.rating, comment.created_at, comment));
        });
}

async function loadTopSolvers(quizId) {
    if (!quizId) return;

    try {
        const solvers = await request('quiz.getTopThree', { quiz_id: quizId }, 'topSolvers');
        displayTopSolvers(solvers);
    } catch (error) {
        console.error('Błąd podczas pobierania najlepszych rozwiązujących:', error);
    }
}

function displayTopSolvers(solvers) {
    const container = document.querySelector('.solvers-container');
    if (!container || !solvers || !solvers.length) {
        const section = document.querySelector('.top-solvers-section');
        if (section) {
            section.style.display = 'none';
        }
        return;
    }

    container.innerHTML = '';

    const positions = ['gold', 'silver', 'bronze'];

    solvers.slice(0, 3).forEach((solver, index) => {
        const solverElement = document.createElement('div');
        solverElement.className = `solver-card ${positions[index]}`;

        solverElement.innerHTML = `
            <div class="solver-avatar">
                <img src="${solver.avatar_url || '../assets/images/icon.png'}" alt="${solver.username}">
                ${index === 0 ? '<div class="crown">👑</div>' : ''}
            </div>
            <div class="solver-info">
                <h4>${solver.username}</h4>
                <p class="score">${solver.score} punktów</p>
                <p class="time">${formatScorePercent(solver.score, solver.max_possible_score)}</p>
            </div>
        `;

        solverElement.addEventListener('click', () => {
            window.location.href = `/profile/?userId=${solver.user_id}`;
        });

        container.appendChild(solverElement);
    });
}

function formatScorePercent(score, maxPossibleScore) {
    if (!score || !maxPossibleScore) return 'Brak danych';

    const percent = Math.round((score / maxPossibleScore) * 100);
    return `${percent}% ukończenia`;
}


function relocate(){
    window.location.href = copyText;
}

function formatData(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('pl-PL', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

setInterval(() => request('comment.get', {quiz_id: quizId}, 'commentList'), 600000);