document.addEventListener('DOMContentLoaded', function() {
    ws.addEventListener("open", async () => {
        try {
            const quizzes = await request('quiz.getWithCategory', {}, 'allQuizzes');
            const categories = await request('category.get', {}, 'categories');
            const topUsers = await request('quiz.getTopTen', {}, 'topUsers');
            const quizRatings = await request('quiz.getRating', {}, 'quizRatings');

            const ratingsMap = {};
            if (quizRatings && quizRatings.length > 0) {
                quizRatings.forEach(item => {
                    ratingsMap[item.quiz_id] = parseFloat(item.rating).toFixed(1);
                });
            }

            quizzes.forEach(quiz => {
                quiz.rating = ratingsMap[quiz.quiz_id] || '0.0';
            });

            const quizzesGrid = document.querySelector('.quizzes-grid');
            if (quizzesGrid) {
                quizzesGrid.innerHTML = '';
                quizzes.slice(0, 3).forEach(quiz => {
                    quizzesGrid.appendChild(createQuizCard(quiz));
                });
            }

            if (categories && categories.length > 0) {
                const geografiaCategory = categories.find(cat =>
                    cat.name.toLowerCase() === 'geografia');

                const selectedCategory = geografiaCategory || categories[0];
                const categoryId = selectedCategory.category_id;

                const categoryName = document.getElementById('category-name');
                if (categoryName) {
                    categoryName.textContent = selectedCategory.name;
                }

                const categoryQuizzes = quizzes.filter(quiz => quiz.category_id === categoryId);
                const categoryQuizzesContainer = document.querySelector('.category-quizzes');

                if (categoryQuizzesContainer) {
                    categoryQuizzesContainer.innerHTML = '';
                    categoryQuizzes.slice(0, 2).forEach(quiz => {
                        categoryQuizzesContainer.appendChild(createQuizCard(quiz, true));
                    });
                }
            }

            const podiumContainer = document.querySelector('.podium-container');
            if (podiumContainer && topUsers && topUsers.length > 0) {
                const positions = ['pierwszy', 'drugi', 'trzeci'];
                podiumContainer.innerHTML = '';

                topUsers.slice(0, 3).forEach((user, index) => {
                    const podiumClass = positions[index] || '';
                    const podiumElement = document.createElement('div');
                    podiumElement.className = `podium ${podiumClass}`;
                    podiumElement.innerHTML = `
                        <div class="avatar-container" style="transform: translateY(-40px); margin-bottom: -15px;">
                            <img src="${user.avatar_url || 'assets/images/default-avatar.png'}" alt="${user.username}">
                        </div>
                        <p style="margin-top: -50px">${user.username}</p>
                        <span class="score" style="margin-top: -4px">${user.total_score} punktów</span>
                    `;

                    podiumElement.style.cursor = 'pointer';
                    podiumElement.addEventListener('click', () => {
                        window.location.href = `/profile/?userId=${user.user_id}`;
                    });

                    podiumContainer.appendChild(podiumElement);
                });
            }
        } catch (error) {
            console.error('Błąd podczas ładowania danych:', error);
        }

        function createQuizCard(quiz, isLarge = false) {
            const card = document.createElement('div');
            card.className = `quiz-card ${isLarge ? 'large' : ''}`;

            const imageUrl = quiz.cover_url || 'assets/images/quiz-placeholder.png';
            const title = quiz.title || 'Brak tytułu';
            const description = quiz.description || '';
            const rating = quiz.rating || '0.0';
            const stars = generateStars(parseFloat(rating));

            card.innerHTML = `
                <img src="${imageUrl}" alt="${title}">
                <div class="quiz-card-content">
                    <h3>${title}</h3>
                    <div class="quiz-card-meta">
                        <span>Kategoria: ${quiz.category || 'Ogólne'}</span>
                        <span>${stars} ${rating}</span>
                    </div>
                </div>
            `;

            card.addEventListener('click', () => {
                window.location.href = `./quiz/?quizId=${quiz.quiz_id}`;
            });

            return card;
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
    });
});