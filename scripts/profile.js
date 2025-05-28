const params = new URLSearchParams(window.location.search);
const urlUserId = parseInt(params.get('userId') ?? 0);

async function checkIsAdmin() {
    if (!window.userId) return false;
    try {
        const adminStatus = await request('user.isAdmin', { user_id: window.userId }, 'adminStatus');
        return adminStatus === 1;
    } catch (error) {
        console.error("Błąd podczas sprawdzania uprawnień:", error);
        return false;
    }
}

if (urlUserId) {
    ws.addEventListener('open', () => {
        request('user.getMinimum', { user_ids: [urlUserId] }, 'profileUser')
            .then(users => {
                if (!users || users.length == 0 || (users[0].is_active === 0 && window.userId !== urlUserId)){
                    document.querySelector('main').style.display = 'none';
                    document.querySelector('.hidden').style.display = 'block';
                    if (users[0] && users[0].is_active === 0) {
                        document.querySelector('.hidden').textContent = 'Profil został dezaktywowany.';
                    }
                    return;
                }
                const user = users[0];
                document.querySelector('.profil img.avatar').src = user.avatar_url || '../assets/images/icon.png';
                document.querySelector('.profil p strong').textContent = 'Nick: ';
                document.querySelector('.profil p').innerHTML += user.username;


            });

        request('userScore.distinctCount', { user_id: urlUserId }, 'profileUserScores')
            .then(scores => {
                const wykresDiv = document.querySelector('.staty .wykres');
                const yAxis = document.querySelector('.staty .y-axis');
                wykresDiv.innerHTML = '';
                yAxis.innerHTML = '';

                if (scores && scores.length > 0) {
                    const maxCount = Math.max(...scores.map(s => s.distinct_count));
                    const ySteps = 5;

                    const calculatedStreak = calculateMaxStreak(scores.map(s => ({ completed_at: s.date })));

                    document.querySelectorAll('.profil p')[1].innerHTML = `<strong>Passa:</strong> ${calculatedStreak}`;

                    const uniqueValues = new Set();
                    uniqueValues.add(0);
                    uniqueValues.add(maxCount);

                    for (let i = 1; i < ySteps; i++) {
                        uniqueValues.add(Math.ceil((maxCount / ySteps) * i));
                    }

                    const sortedValues = Array.from(uniqueValues).sort((a, b) => a - b);

                    sortedValues.forEach(value => {
                        const yValue = document.createElement('div');
                        yValue.classList.add('y-value');
                        yValue.textContent = value;
                        yAxis.appendChild(yValue);
                    });

                    scores.forEach((score, index) => {
                        const slup1Div = document.createElement('div');
                        slup1Div.classList.add('slup1');

                        const slupDiv = document.createElement('div');
                        slupDiv.classList.add('slup');
                        const heightPercentage = maxCount > 0 ? (score.distinct_count / maxCount) * 100 : 0;
                        slupDiv.style.height = `${heightPercentage}%`;

                        const span = document.createElement('span');
                        const date = new Date(score.date);
                        const day = date.getDate().toString().padStart(2, '0');
                        const month = (date.getMonth() + 1).toString().padStart(2, '0');

                        span.textContent = `${day}/${month}`;

                        if (index % 2 === 1) {
                            span.style.position = 'relative';
                            span.style.top = '1em';
                        }

                        slup1Div.title = `Date: ${score.date}, Quizzes: ${score.distinct_count}`;

                        slup1Div.appendChild(slupDiv);
                        slup1Div.appendChild(span);
                        wykresDiv.appendChild(slup1Div);
                    });
                } else {
                    const noStatsMsg = document.createElement('p');
                    noStatsMsg.textContent = 'Brak statystyk do wyświetlenia.';
                    wykresDiv.appendChild(noStatsMsg);
                    document.querySelector('.staty h3').textContent = 'Brak danych o ukończonych quizach';
                }
            });

        loadRecentQuizzes();

        loadUserAchievements();
    });
} else {
    document.querySelector('main').style.display = 'none';
    document.querySelector('.hidden').style.display = 'block';
}

function calculateMaxStreak(scores) {
    if (!scores || scores.length === 0) return 0;

    const daysWithQuizzes = new Set();
    scores.forEach(score => {
        const date = new Date(score.completed_at);
        const dateString = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        daysWithQuizzes.add(dateString);
    });

    const sortedDays = Array.from(daysWithQuizzes).sort();
    if (sortedDays.length === 0) return 0;

    let currentStreak = 1;
    let maxStreak = 1;

    for (let i = 1; i < sortedDays.length; i++) {
        const current = new Date(sortedDays[i]);
        const previous = new Date(sortedDays[i - 1]);

        const timeDiff = current.getTime() - previous.getTime();
        const diffDays = Math.round(timeDiff / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
        } else if (diffDays > 1) {
            currentStreak = 1;
        }
    }

    return maxStreak;
}

function loadRecentQuizzes() {
    if (!urlUserId) return;

    request('userScore.get', { user_id: urlUserId }, 'userRecentQuizzes')
        .then(scores => {
            const quizList = document.querySelector('.quiz-list');
            if (!quizList) return;

            if (!scores || scores.length === 0) {
                quizList.innerHTML = '<li class="quiz-item">Brak ukończonych quizów</li>';
                return;
            }

            quizList.innerHTML = '';

            scores.sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at))
                .slice(0, 5)
                .forEach(score => {
                    const li = document.createElement('li');
                    li.className = 'quiz-item';

                    const dateObj = new Date(score.completed_at);
                    const formattedDate = `${dateObj.getDate().toString().padStart(2, '0')}.${(dateObj.getMonth()+1).toString().padStart(2, '0')}.${dateObj.getFullYear()}`;

                    li.innerHTML = `
                        <span class="quiz-date">${formattedDate}</span>
                        <span class="quiz-name">Quiz #${score.quiz_id}</span>
                        <span class="quiz-score">${score.score}/${score.max_possible_score}</span>
                    `;

                    quizList.appendChild(li);
                });
        })
        .catch(error => {
            console.error("Błąd podczas pobierania ostatnich quizów:", error);
            document.querySelector('.quiz-list').innerHTML =
                '<li class="quiz-item">Błąd podczas ładowania danych</li>';
        });
}

function loadUserAchievements() {
    if (!urlUserId) return;

    request('userScore.get', { user_id: urlUserId }, 'userAchievementsData')
        .then(scores => {
            if (!scores) return;

            const achievementsContainer = document.querySelector('.achievements-container');
            if (!achievementsContainer) return;

            achievementsContainer.innerHTML = '';

            const maxStreak = calculateMaxStreak(scores);
            console.log("Max streak:", maxStreak);

            const firstQuiz = scores && scores.length > 0;
            achievementsContainer.appendChild(createAchievement(
                '🎯',
                'Pierwszy quiz',
                'Ukończony pierwszy quiz',
                firstQuiz
            ));

            const tenQuizzes = scores && scores.length >= 10;
            achievementsContainer.appendChild(createAchievement(
                '🏆',
                'Regularny quizer',
                'Ukończonych 10 quizów',
                tenQuizzes
            ));

            const perfectScore = scores && scores.some(s => s.score === s.max_possible_score);
            achievementsContainer.appendChild(createAchievement(
                '🌟',
                'Perfekcjonista',
                'Uzyskaj maksymalny wynik w quizie',
                perfectScore
            ));

            achievementsContainer.appendChild(createAchievement(
                '🔥',
                'Na fali',
                'Rozwiązuj quizy przez 3 dni z rzędu',
                maxStreak >= 3
            ));
        })
        .catch(error => {
            console.error("Błąd podczas pobierania osiągnięć:", error);
        });
}

function createAchievement(icon, title, description, isUnlocked) {
    const div = document.createElement('div');
    div.className = isUnlocked ? 'achievement' : 'achievement locked';

    div.innerHTML = `
        <div class="achievement-icon">${icon}</div>
        <div class="achievement-info">
            <h4>${title}</h4>
            <p>${description}</p>
        </div>
    `;

    return div;
}