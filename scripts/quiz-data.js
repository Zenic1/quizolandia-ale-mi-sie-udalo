const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const quizId = parseInt(urlParams.get("quizId") ?? 0);


const copyText = window.location.origin + '/quizChlopie/?quizId=' + quizId

console.log(quizId);

if(quizId){
    document.getElementById('ifNoQuiz').style.display = 'none';
    ws.onopen = () => request('quiz.get', {}, 'fullQuizList')
    dataChange.subscribe((data) => {
        if(data === 'fullQuizList') loadQuiz(cachedData.get('fullQuizList').find(quiz => quiz.quiz_id === quizId));
        else if(data === 'commentList') loadComments(quizId)
    })
}
else document.getElementsByTagName('main')[0].style.display = 'none';


function loadQuiz(quiz) {
    console.log(quiz);
    document.getElementById('quiz-image').setAttribute('src', `${quiz.cover_url}`);

    document.getElementsByClassName('description-section')[0].textContent = quiz.description;

    document.getElementsByClassName('quiz-title')[0].textContent = quiz.title;

    document.getElementsByClassName('quiz-author')[0].textContent = `Autor: ` + cachedData.get('studentList').find(user => user.user_id === quiz.author_id).username;
    loadComments(quiz.quiz_id)
}

function loadComments(quiz_id)
{
    if(!cachedData.has('commentList')) return;
    const commentList = document.getElementById('commentList')
    commentList.innerHTML = '';
    cachedData.get('commentList').filter(comment => comment.quiz_id === quiz_id).reverse().forEach(comment =>
    {
        commentList.appendChild(createComment(cachedData.get('studentList').find(user => user.user_id === comment.user_id), comment.comment_text, comment.rating, comment.created_at));
    })
}

function relocate(){
    window.location.href = copyText;
}

setInterval(() => request('comment.get', {}, 'commentList'), 60000);