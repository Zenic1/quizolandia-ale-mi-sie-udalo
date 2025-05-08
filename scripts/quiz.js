const userId = localStorage.getItem("userId") ? localStorage.getItem("userId") : 0;
function createStarRating(rating) {
    const container = document.createElement('div');
    container.className = 'star-rating';

    for (let i = 0; i < 5; i++) {
        const star = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        star.setAttribute('class', `star ${i < rating ? 'active' : ''}`);
        star.setAttribute('viewBox', '0 0 24 24');
        star.innerHTML = '<path d="M12 0l3.09 6.26L22 7.27l-5 4.87 1.18 6.88L12 16l-6.18 3.02L7 12.14 2 7.27l6.91-1.01L12 0z"/>';
        container.appendChild(star);
    }
    return container;
}

function createComment(author, comment, rating, dateTime) {
    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment-card';

    commentDiv.innerHTML = `
        <div class="author-image" style="background-image: url('${author.avatar_url}')"></div>
        <div class="comment-content">
            <div class="comment-header">
                <h3 class="comment-author">${author.username}</h3>
                <div class="comment-meta">
                    ${createStarRating(rating).outerHTML}
                    <span class="comment-date">${formatData(dateTime)}</span>
                </div>
                <span class="comment-settings"></span>
            </div>
            <p class="comment-text">${comment}</p>
        </div>
    `;

    return commentDiv;
}

function resetComments()
{
    document.getElementById('commentList').innerHTML = '';
}

function createRatingInput() {
    const container = document.createElement('div');
    container.className = 'rating-input';

    for (let i = 5; i >= 1; i--) {
        const star = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        star.setAttribute('class', 'rating-star');
        star.setAttribute('data-value', i);
        star.setAttribute('viewBox', '0 0 24 24');
        star.innerHTML = '<path d="M12 0l3.09 6.26L22 7.27l-5 4.87 1.18 6.88L12 16l-6.18 3.02L7 12.14 2 7.27l6.91-1.01L12 0z"/>';
        container.appendChild(star);
    }

    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.name = 'rating';
    hiddenInput.value = '0';

    container.appendChild(hiddenInput);
    return container;
}

document.querySelector('.comment-form').addEventListener('submit', (event) => {
    event.preventDefault();

    if (!userId || isNaN(userId) || userId <= 0) {
        console.error("Brak userId lub nieprawidłowy userId.");
        alert("Aby dodać opinie musisz być zalogowany!")
        return;
    }
    const form = event.target;
    const rating = parseInt(form.rating.value);

    if (!rating || rating < 1 || rating > 5) {
        alert('Proszę wybrać ocenę (1-5 gwiazdek)');
        return;
    }

    request('comment.add', {
        quiz_id: quizId,
        user_id: userId,
        comment_text: form.comment_text.value,
        rating: rating,
    });
    console.log("quizId:", quizId);
    setTimeout(() => request('comment.get', {quiz_id: quizId}, 'commentList'), 1000);
    form.reset();
    form.rating.value = '0';
    document.querySelectorAll('.rating-star').forEach(star => {
        star.style.fillOpacity = '0.3';
    });
    loadComments(quizId)
});

document.addEventListener('DOMContentLoaded', () => {
    const ratingContainer = document.querySelector('.rating-input-container');
    ratingContainer.appendChild(createRatingInput());

    document.querySelectorAll('.rating-star').forEach(star => {
        star.addEventListener('click', (e) => {
            const value = parseInt(e.target.closest('.rating-star').dataset.value);
            document.querySelector('input[name="rating"]').value = value;

            document.querySelectorAll('.rating-star').forEach((s, index) => {
                s.classList.toggle('active', 5 - index <= value);
            });
        });

        star.addEventListener('mouseover', (e) => {
            const hoverValue = parseInt(e.target.closest('.rating-star').dataset.value);
            document.querySelectorAll('.rating-star').forEach((s, index) => {
                s.style.fillOpacity = 5 - index <= hoverValue ? '0.8' : '0.3';
            });
        });

        star.addEventListener('mouseout', () => {
            const currentValue = parseInt(document.querySelector('input[name="rating"]').value);
            document.querySelectorAll('.rating-star').forEach((s, index) => {
                s.style.fillOpacity = 5 - index <= currentValue ? '1' : '0.3';
            });
        });
    });
});


function copyLink()
{
    let copyText = window.location;
    navigator.clipboard.writeText(copyText);
    showCopiedText(`Skopiowano link do quizu :3`);
}

function showCopiedText(text) {
    const tooltip = document.getElementById("tooltipText");
    tooltip.textContent = text;

    tooltip.style.visibility = "visible";
    tooltip.style.opacity = "1";

    setTimeout(() => {
        tooltip.style.visibility = "hidden";
        tooltip.style.opacity = "0";
    }, 2000);
}