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
                wykresDiv.innerHTML = '';

                if (scores && scores.length > 0) {
                    const maxCount = Math.max(...scores.map(s => s.distinct_count));

                    scores.forEach(score => {
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
