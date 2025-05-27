const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const quizId = parseInt(urlParams.get("quizId") ?? 0);

let questions = new Map();
let questionIds = [];

let questionHolders = [];
let questionType = document.getElementById('question-type-label');
let questionTitle = document.getElementById("questionNumber");
let nextButton = document.getElementById("nextButton");
let prevButton = document.getElementById("prevButton");


let currQuestionId = 0;

for(let i = 1; i <= 4; i++) {
    questionHolders.push(document.getElementById('answer' + i.toString()))
}

ws.addEventListener('open', () => {
    request('quiz.distinctQuestion', {quiz_id: quizId}, 'distinctQuestionsInfo').then(info =>
        request('quiz.getFullInfo', {quiz_id: quizId}, 'quizFullInfo').then(data => loadData(data, info))
    )
})
function loadData(quizData, quests){
    console.table(quizData);
    console.table(quests);
    quests.forEach(quest => {
        questionIds.push(quest.question_id);
        questions.set(quest.question_id, []);
    })
    quizData.forEach(data => {
        questions.get(data.question_id).push(data)
    })
    console.log(questions);
    loadQuestionFromId(quests[0].question_id);
}


function loadQuestionFromId(questionId)
{
    let _questions = questions.get(questionId);
    console.log(_questions, questionHolders);
    currQuestionId = questionId;
    let count = 0;
    questionHolders.forEach(questionHolder => {
        questionHolder.value = '';
    })

    _questions.forEach(question => {
        questionHolders[count].value = question.answer_text;
        count++;
    })
    questionTitle.value = _questions[0].question_text;
    // questionType.value = _questions[0].question_type;


}

function changeQuestions(offset){
    let _id = questionIds.includes(currQuestionId + offset) ? currQuestionId + offset : currQuestionId;
    loadQuestionFromId(_id);
}