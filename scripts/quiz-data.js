const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const quizId = parseInt(urlParams.get("quizId") ?? 0);
let currQuiz;


const copyText = window.location.origin + '/quizChlopie/?quizId=' + quizId

console.log(quizId);

if(quizId){
    document.getElementById('ifNoQuiz').style.display = 'none';
    ws.addEventListener('open', () => {
        console.error(1)
        request('quiz.get', {}, 'fullQuizList').then(data => loadQuiz(data.find(quiz => quiz.quiz_id === quizId)))
        loadComments(quizId)
        request('user.get', {}, 'studentList').then(data => loadAuthor(data))
    })
}
else document.getElementsByTagName('main')[0].style.display = 'none';


function loadQuiz(quiz) {
    console.log(quiz);

    currQuiz = quiz;

    console.log(cachedData.get('studentList'))

    if(quiz.cover_url && quiz.cover_url.length > 0)
        document.getElementById('quiz-image').setAttribute('src', `${quiz.cover_url}`);

    document.getElementsByClassName('description-section')[0].textContent = quiz.description;

    document.getElementsByClassName('quiz-title')[0].textContent = quiz.title;

    loadComments(quiz.quiz_id)
}

function loadAuthor(data)
{
    if(!data || !data.length || !currQuiz) return;
    const filteredAuthor = data.find(user => user.user_id === currQuiz.author_id);
    document.getElementsByClassName('quiz-author')[0].textContent = `Autor: ` + filteredAuthor.username;
}

async function loadComments(quiz_id)
{
    const commentList = document.getElementById('commentList')
    commentList.innerHTML = '';
    let users = [];

    await request('user.get', {}, 'studentList').then(data => users = data)
    console.log(users)
    request('comment.get', {}, 'commentList').then((comments) => {
        console.log(comments)
        resetComments();
        comments.filter(comment => comment.quiz_id === quiz_id).reverse().forEach(comment =>
        {
            console.log(comment)
            commentList.appendChild(createComment(users.find(user => user.user_id === comment.user_id), comment.comment_text, comment.rating, comment.created_at));
        })
    })
}

function relocate(){
    window.location.href = copyText;
}

setInterval(() => request('comment.get', {}, 'commentList'), 60000);