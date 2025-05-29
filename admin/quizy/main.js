const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const quizId = parseInt(urlParams.get("quizId") ?? 0);

let questions = new Map();
let questionIds = [];

let isNewQuestion = false;

let singleQuestionHolders = [];
let multipleQuestionHolders = [];
let textQuestionHolder = [document.getElementById("text_answer")];
let questionType = document.getElementById('questionType');
let questionTitle = document.getElementById("questionNumber");
let nextButton = document.getElementById("nextButton");
let prevButton = document.getElementById("prevButton");
let answer_grid = document.getElementsByClassName("answers-grid")[0];

let currQuestionId = 0;

for(let i = 1; i <= 4; i++) {
    singleQuestionHolders.push(document.getElementById('answer' + i.toString()))
    multipleQuestionHolders.push(document.getElementById('multiple_answer' + i.toString()))
}

let _currHolder = singleQuestionHolders;
// console.log(userId)
// if(userId === 0 ) window.location.replace('../../')

function fetchData() {
    request('quiz.distinctQuestion', {quiz_id: quizId}, 'distinctQuestionsInfo').then(info =>
        request('quiz.getFullInfo', {quiz_id: quizId}, 'quizFullInfo').then(data => loadData(data, info))
    )
}

    ws.addEventListener('open',fetchData)
function loadData(quizData, quests){
    console.table(quizData);
    console.table(quests);
    questionIds = [];
    questions = new Map();
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
    isNewQuestion = false
    let _questions = questions.get(questionId);
    console.log(_questions, singleQuestionHolders);
    answer_grid.classList.remove('single');
    answer_grid.classList.remove('multiple');
    answer_grid.classList.remove('text');
    currQuestionId = questionId;
    let count = 0;
    switch (_questions[0].question_type) {
        case 'single':
            _currHolder = singleQuestionHolders;
            break;
        case 'multiple':
            _currHolder = multipleQuestionHolders;
            break;
        case 'text':
            _currHolder = textQuestionHolder;
            break;
        default:
            _currHolder = singleQuestionHolders;
    }
    _currHolder.forEach(questionHolder => {
        questionHolder.value = '';
        questionHolder.parentNode.children[1].checked = false;
    })
    let _otherHolder = (_currHolder === singleQuestionHolders) ? multipleQuestionHolders : singleQuestionHolders;
    _otherHolder.forEach(questionHolder => {
        questionHolder.value = '';
        questionHolder.parentNode.children[1].checked = false;
    })

    _questions.forEach(question => {
        _currHolder[count].value = question.answer_text;
        _currHolder[count].parentNode.children[1].checked = question.is_correct
        if(_currHolder !== textQuestionHolder){
            _otherHolder[count].value = question.answer_text;
            _otherHolder[count].parentNode.children[1].checked = question.is_correct
        }
        count++;
    })
    questionTitle.value = _questions[0].question_text;
    answer_grid.classList.add(_questions[0].question_type);
    questionType.value = _questions[0].question_type;
}

function changeQuestions(offset){
    let _id = questionIds[questionIds.indexOf(currQuestionId) + offset] ? questionIds[questionIds.indexOf(currQuestionId) + offset] : currQuestionId;
    console.log(_id)
    loadQuestionFromId(_id);
}

function sendChanges(){
    if(!isNewQuestion){
        let _currQuestions = Array.from(questions.get(currQuestionId))
        for (let question in _currQuestions){
            let _question = _currQuestions[question];
            let _questionHTMLElement = singleQuestionHolders[question];
            console.log(_question, _questionHTMLElement);
            console.log(_currHolder[question].parentNode.children[1].checked)
            if(_question)
                request('answer.update', {question_id: _question.question_id, answer_text: _questionHTMLElement.value, is_correct: _currHolder[question].parentNode.children[1].checked, answer_id: _question.answer_id}, 'feedback').then(() => {
                    console.log('done');
                    fetchData()
                })
        }
        request('question.update', {
            quiz_id: quizId,
            question_id: _currQuestions[0].question_id,
            question_text: questionTitle.value,
            question_type: questionType.value,
            image_url: '',
            explanation: '',
            hint: '',
            points: 1,
            question_order: 0
        }, 'feedback')
    }else{
        request('question.add', {
            quiz_id: quizId,
            question_text: questionTitle.value,
            question_type: questionType.value,
            image_url: '',
            explanation: '',
            hint: '',
            points: 1,
            question_order: 0
        }, 'feedback').then((result) => {
            _currHolder.forEach((question, index) => {
                if(!!question.value){
                    request('answer.add', {
                        question_id: result.insertId,
                        answer_text: question.value,
                        is_correct: question.parentNode.children[1].checked,
                    }, 'feedback')
                }
            })
            console.log(result);
            rollback()
        })
    }
}

function loadNullQuestion(){
    if(!!isNewQuestion)
        rollback()
    isNewQuestion = true
    answer_grid.classList.remove('single');
    answer_grid.classList.remove('multiple');
    answer_grid.classList.remove('text');
    answer_grid.classList.add('single');
    _currHolder = singleQuestionHolders;

    singleQuestionHolders.forEach(questionHolder => {
        questionHolder.value = '';
        questionHolder.parentNode.children[1].checked = false
    })

    multipleQuestionHolders.forEach(questionHolder => {
        questionHolder.value = '';
        questionHolder.parentNode.children[1].checked = false
    })

    textQuestionHolder[0].value = '';
    questionTitle.value = "Nowe Pytanie";
    questionType.value = 'single';
}

async function rollback(){
    isNewQuestion = false
    await fetchData()
}

function changeQuestionType() {
    answer_grid.classList.remove('single');
    answer_grid.classList.remove('multiple');
    answer_grid.classList.remove('text');
    answer_grid.classList.add(questionType.value);
    switch (questionType.value) {
        case 'single':
            _currHolder = singleQuestionHolders;
            break;
        case 'multiple':
            _currHolder = multipleQuestionHolders;
            break;
        case 'text':
            _currHolder = textQuestionHolder;
            break;
        default:
            _currHolder = singleQuestionHolders;
    }
}

function deleteQuestion(){
    let _currQuestions = Array.from(questions.get(currQuestionId))
    request('question.delete', {
        question_id: _currQuestions[0].question_id
    }, 'feedback').then(() => {
        fetchData()
    })
}