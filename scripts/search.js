const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);









const searchQuery = urlParams.get('searchQuery');
console.log(searchQuery);

request('quiz.get', {}, 'quizList');
