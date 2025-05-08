const params = new URLSearchParams(window.location.search);
const urlUserId = parseInt(params.get('userId') ?? 0);

if (urlUserId) {
    ws.addEventListener('open', () => {
        request('user.getMinimum', { user_ids: [urlUserId] }, 'profileUser')
            .then(users => {
                if (!users || users.length == 0){
                    document.querySelector('main').style.display = 'none';
                    document.querySelector('.hidden').style.display = 'block';
                }
                const user = users[0];
                document.querySelector('.profil img.avatar').src = user.avatar_url || '../assets/images/default.png';
                document.querySelector('.profil p strong').textContent = 'Nick:';
                document.querySelector('.profil p').append(` ${user.username}`);
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
                    const dates = scores
                        .map(s => new Date(s.date))
                        .sort((a, b) => a - b);
                    let currentStreak = 1;
                    let maxStreak = 1;

                    for (let i = 1; i < dates.length; i++) {
                        const diffDays = Math.floor((dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24));
                        if (diffDays === 1) {
                            currentStreak++;
                        } else if (diffDays > 1) {
                            currentStreak = 1;
                        }
                        if (currentStreak > maxStreak) {
                            maxStreak = currentStreak;
                        }
                    }
                    const today = new Date();
                    today.setHours(0,0,0,0);
                    const lastDate = dates[dates.length - 1];
                    lastDate.setHours(0,0,0,0);
                    const diffToToday = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
                    const streakToShow = (diffToToday === 0 || diffToToday === 1) ? currentStreak : 0;

                    document.querySelectorAll('.profil p')[1].innerHTML = `<strong>Passa:</strong> ${streakToShow}`;

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
    });
}else {
    document.querySelector('main').style.display = 'none';
    document.querySelector('.hidden').style.display = 'block';
}