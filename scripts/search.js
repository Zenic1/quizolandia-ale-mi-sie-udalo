const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const searchBar = document.getElementById("searchInput");
const categoryDropDown = document.getElementById("categoryDropDown");

let searchQuery = urlParams.get("searchQuery") ?? "";
let categoryFilter = parseInt(urlParams.get("categoryId") ?? 0);
let quizData = [];
let quizRatingData = [];

setTimeout(function () {
  searchBar.value = searchQuery;
  categoryDropDown.value = parseInt(categoryFilter);
}, 100);

ws.addEventListener('open', function() {
  showLoadingState();

  Promise.all([
    request("quiz.getWithCategory", {}, "quizList").then(data => {
      quizData = data;
      return data;
    }),
    request("category.countOfQuizzes", {}, "categoryList").then(data => {
      generateCategoryHTML(data);
      return data;
    }),
    request("quiz.getRating", {}, "quizRatings").then(data => {
      quizRatingData = data;
      return data;
    })
  ]).then(() => {
    applyRatingsToQuizzesDirect(quizData, quizRatingData);
    filterSearch(quizData);
    hideLoadingState();
  }).catch(error => {
    document.querySelector('.container').innerHTML = '<p class="empty-state">Wystąpił błąd podczas ładowania quizów</p>';
    hideLoadingState();
  });
});

function applyRatingsToQuizzesDirect(quizzes, ratings) {
  if (!quizzes || !Array.isArray(quizzes)) {
    return;
  }

  const ratingsMap = {};
  if (ratings && ratings.length > 0) {
    ratings.forEach(item => {
      ratingsMap[item.quiz_id] = parseFloat(item.rating).toFixed(1);
    });
  }

  quizzes.forEach(quiz => {
    quiz.rating = ratingsMap[quiz.quiz_id] || '0.0';
  });

  return quizzes;
}

dataChange.subscribe((data) => {
  if (data === "quizList") {
    quizData = cachedData.get("quizList");
    if (quizRatingData.length > 0) {
      applyRatingsToQuizzesDirect(quizData, quizRatingData);
      filterSearch(quizData);
    }
  }
  else if (data === "quizRatings") {
    quizRatingData = cachedData.get("quizRatings");
    if (quizData.length > 0) {
      applyRatingsToQuizzesDirect(quizData, quizRatingData);
      filterSearch(quizData);
    }
  }
  else if (data === "categoryList") {
    generateCategoryHTML(cachedData.get("categoryList"));
  }
});

function applyRatingsToQuizzes() {
  if (!cachedData.has("quizList") || !cachedData.has("quizRatings")) {
    return;
  }

  const quizzes = cachedData.get("quizList");
  const quizRatings = cachedData.get("quizRatings");
  applyRatingsToQuizzesDirect(quizzes, quizRatings);
  cachedData.set("quizList", quizzes);
}

function filterSearch(quizzes) {
  if (!quizzes || !Array.isArray(quizzes) || quizzes.length === 0) {
    const quizContainer = document.querySelector(".container");
    quizContainer.innerHTML = '<p class="empty-state">Nie znaleziono quizów</p>';
    return [];
  }

  let filteredQuizzes = [...quizzes];

  if (searchQuery) {
    filteredQuizzes = filteredQuizzes.filter((quiz) =>
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  filteredQuizzes = filteredQuizzes.filter(
      (quiz) => quiz.category_id === categoryFilter || categoryFilter === 0
  );

  if (filteredQuizzes.length === 0) {
    document.querySelector(".container").innerHTML = '<p class="empty-state">Nie znaleziono quizów spełniających kryteria</p>';
    return [];
  }

  generateSearchHtml(filteredQuizzes);
  return filteredQuizzes;
}

function changeSearch(text) {
  searchQuery = text;
  if (quizData.length > 0) {
    filterSearch(quizData);
  }
}

function changeCategory(value) {
  categoryFilter = parseInt(value);
  if (quizData.length > 0) {
    filterSearch(quizData);
  }
}

function generateSearchHtml(quizzes) {
  const quizContainer = document.querySelector(".container");

  if (!quizContainer) {
    return;
  }

  quizContainer.innerHTML = '';

  quizzes.forEach((quiz, index) => {
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
  container.innerHTML = '<p class="loading-message">Ładowanie quizów...</p>';
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

document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.quiz').forEach(quiz => {
    observer.observe(quiz);
  });
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