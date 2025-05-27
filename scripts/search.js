const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const searchBar = document.getElementById("searchInput");
const categoryDropDown = document.getElementById("categoryDropDown");

let searchQuery = urlParams.get("searchQuery") ?? "";
let categoryFilter = parseInt(urlParams.get("categoryId") ?? 0);

setTimeout(function () {
  searchBar.value = searchQuery;
  categoryDropDown.value = parseInt(categoryFilter);
}, 100);

function fetchData() {
  console.log(searchQuery, categoryFilter);
  request("quiz.getWithCategory", {}, "quizList");
  request("category.countOfQuizzes", {}, "categoryList");
  request("quiz.getRating", {}, "quizRatings");
}

ws.onopen = fetchData;

dataChange.subscribe((data) => {
  if (data === "quizList" || data === "quizRatings") {
    if (cachedData.has("quizList") && cachedData.has("quizRatings")) {
      applyRatingsToQuizzes();
      filterSearch(cachedData.get("quizList"));
    }
  }
  else if (data === "categoryList")
    generateCategoryHTML(cachedData.get("categoryList"));
});

function applyRatingsToQuizzes() {
  const quizzes = cachedData.get("quizList");
  const quizRatings = cachedData.get("quizRatings");

  const ratingsMap = {};
  if (quizRatings && quizRatings.length > 0) {
    quizRatings.forEach(item => {
      ratingsMap[item.quiz_id] = parseFloat(item.rating).toFixed(1);
    });
  }

  quizzes.forEach(quiz => {
    quiz.rating = ratingsMap[quiz.quiz_id] || '0.0';
  });

  cachedData.set("quizList", quizzes);
}

function filterSearch(quizzes) {
  if (!(quizzes.length > 0)) return "nie ma";

  quizzes = quizzes.filter((quiz) =>
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  quizzes = quizzes.filter(
      (quiz) => quiz.category_id === categoryFilter || categoryFilter === 0
  );

  generateSearchHtml(quizzes);
  return quizzes;
}

function changeSearch(text) {
  console.log(`Changed search query to : ${text}`);
  searchQuery = text;
  filterSearch(cachedData.get("quizList"));
}

function generateSearchHtml(quizzes) {
  const quizContainer = document.getElementsByClassName("container")[0];
  const currentQuizzes = Array.from(quizContainer.children);

  const quizzesToRemove = currentQuizzes.filter(child => {
    const quizId = child.href.split('quizId=')[1];
    return !quizzes.some(q => q.quiz_id == quizId);
  });

  quizzesToRemove.forEach(async child => {
    child.classList.add('exiting');
    child.addEventListener('animationend', () => {
      requestAnimationFrame(() => child.remove());
    });
  });

  const existingIds = currentQuizzes.map(c => c.href.split('quizId=')[1]);
  const quizzesToAdd = quizzes.filter(q => !existingIds.includes(q.quiz_id.toString()));

  quizzesToAdd.forEach((quiz, index) => {
    const child = createQuizElement(quiz);
    quizContainer.appendChild(child);

    child.style.animationDelay = `${index * 50}ms`;
  });
}

function createQuizElement(quiz) {
  const child = document.createElement("a");
  child.href = `../quiz/?quizId=${quiz.quiz_id}`;
  child.classList.add("quiz");

  let image = document.createElement("img");
  image.src = quiz.cover_url || '../assets/images/quiz-placeholder.png';
  image.alt = "Zdjęcie opisujące quiz";
  child.appendChild(image);

  let text = document.createElement("p");
  text.innerHTML = quiz.title;
  child.appendChild(text);

  let details = document.createElement("div");
  details.classList.add("quiz-details");

  let rating = document.createElement("span");
  rating.classList.add("rating");
  rating.innerHTML = `${generateStars(parseFloat(quiz.rating))} ${quiz.rating}`;
  details.appendChild(rating);

  child.appendChild(details);

  return child;
}

function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.5;
  let stars = '';

  for (let i = 0; i < fullStars; i++) {
    stars += '★';
  }

  if (hasHalfStar) {
    stars += '⯨';
  }

  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) {
    stars += '☆';
  }

  return stars;
}

function showLoadingState() {
  const container = document.querySelector('.container');
  container.classList.add('loading');
}

function hideLoadingState() {
  const container = document.querySelector('.container');
  container.classList.remove('loading');
}

function generateOptionHtml(title, count, value, disabled = false) {
  let object = document.createElement("option");
  object.setAttribute("value", value);
  object.textContent = `${capitalFirstLetter(title)}`;
  if(disabled) object.setAttribute("disabled", "disabled");
  else object.textContent += `: ${count}`
  return object;
}

function generateCategoryHTML(categories) {
  categoryDropDown.innerHTML = "";
  let wybierz = generateOptionHtml('Kategoria', 0, 0, true)
  categoryDropDown.appendChild(wybierz);
  let wszystkie = generateOptionHtml("Wszystkie", 0, 0);
  categoryDropDown.appendChild(wszystkie);
  categories.forEach((category) => {
    categoryDropDown.appendChild(
        generateOptionHtml(
            category.category,
            category.quiz_count,
            category.category_id
        )
    );
  });
}

function changeCategory(value) {
  console.log(`Changed category id to : ${value}`);
  categoryFilter = parseInt(value);
  filterSearch(cachedData.get("quizList"));
}

function capitalFirstLetter(text) {
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}`;
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
    }
  });
});

document.querySelectorAll('.quiz').forEach(quiz => {
  observer.observe(quiz);
});

if (!document.startViewTransition) {
  document.startViewTransition = (callback) => callback();
}

document.addEventListener('click', (e) => {
  if (e.target.matches('a')) {
    e.preventDefault();
    document.startViewTransition(() => {
      window.location.href = e.target.href;
    });
  }
});