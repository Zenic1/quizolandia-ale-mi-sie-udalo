function fetchRankingData() {
    return new Promise((resolve, reject) => {
        if (ws.readyState === WebSocket.OPEN) {
            sendRankingRequest();
        } else {
            ws.addEventListener("open", sendRankingRequest);
        }

        function sendRankingRequest() {
            const responseId = "rankingResponse_" + Date.now();

            request('quiz.getTopTen', {}, responseId)
                .then(data => {
                    if (Array.isArray(data)) {
                        const ranking = data.map((item, index) => ({
                            ...item,
                            rank: index + 1
                        }));

                        resolve(ranking);
                    } else {
                        reject("Nieprawidłowy format danych");
                    }
                })
                .catch(err => {
                    console.error("Błąd pobierania rankingu:", err);
                    reject(err);
                });
        }
    });
}

function displayRanking(ranking) {
    const podiumContainer = document.querySelector('.podium-container');
    const graczeContainer = document.querySelector('.gracze');

    podiumContainer.innerHTML = '';
    graczeContainer.innerHTML = '<h3>Pozostali gracze:</h3>';

    const podium = ranking.slice(0, 3);

    const podiumOrder = [1, 0, 2];

    podiumOrder.forEach(idx => {
        if (podium[idx]) {
            const item = podium[idx];
            const pozycja = idx === 0 ? 'pierwszy' : idx === 1 ? 'drugi' : 'trzeci';
            const miejsce = idx + 1;

            const podiumDiv = document.createElement('div');
            podiumDiv.className = `podium ${pozycja}`;
            podiumDiv.dataset.userId = item.user_id;
            podiumDiv.onclick = () => navigateToUserProfile(item.user_id);
            podiumDiv.style.cursor = 'pointer';

            const zdjecie = item.avatar_url || 'default_avatar.png';

            podiumDiv.innerHTML = `
                <span>${miejsce}</span>
                <img src="${zdjecie}" alt="${item.username || 'Użytkownik'}" />
                <p>${item.username || 'Użytkownik'}</p>
                <div class="score-badge">${item.total_score} pkt</div>
            `;
            podiumContainer.appendChild(podiumDiv);
        }
    });

    const gracze = ranking.slice(3);
    gracze.forEach((item, index) => {
        const gracz = document.createElement('div');
        gracz.className = 'ranking-item';
        gracz.dataset.userId = item.user_id;
        gracz.onclick = () => navigateToUserProfile(item.user_id);
        gracz.style.cursor = 'pointer';

        const zdjecie = item.avatar_url || 'default_avatar.png';

        gracz.innerHTML = `
            <div class="ranking-position">${index + 4}</div>
            <div class="ranking-user">
                <img src="${zdjecie}" alt="${item.username || 'Użytkownik'}" />
                <div class="user-details">
                    <h3>${item.username || 'Użytkownik'}</h3>
                </div>
            </div>
            <div class="ranking-score">${item.total_score} pkt</div>
        `;
        graczeContainer.appendChild(gracz);
    });
}

function navigateToUserProfile(userId) {
    if (userId) {
        window.location.href = `/profile/?id=${userId}`;
    }
}

function showLoading() {
    const rankingContainer = document.querySelector('.ranking-container');
    if (rankingContainer) {
        rankingContainer.innerHTML = '<div class="loading-spinner"><div></div><div></div><div></div><div></div></div>';
    }
}

function showError(message) {
    const rankingContainer = document.querySelector('.ranking-container');
    if (rankingContainer) {
        rankingContainer.innerHTML = `<div class="error-message">${message || 'Wystąpił błąd podczas pobierania rankingu. Spróbuj ponownie później.'}</div>`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    showLoading();

    fetchRankingData()
        .then(ranking => {
            displayRanking(ranking);
        })
        .catch(error => {
            console.error('Błąd pobierania rankingu:', error);
            showError();
        });
});