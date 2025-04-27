const params = new URLSearchParams(window.location.search);
const urlUserId = parseInt(params.get('userId') ?? 0);

if (urlUserId) {
    ws.addEventListener('open', () => {
        request('user.getMinimum', { user_ids: [urlUserId] }, 'profileUser')
            .then(users => {
                if (!users || !users.length) return;
                const user = users[0];
                document.querySelector('.profil img.avatar').src = user.avatar_url || '../assets/images/default.png';
                document.querySelector('.profil p strong').textContent = 'Nick:';
                document.querySelector('.profil p').append(` ${user.username}`);
            });
    });
}else {
    document.querySelector('main').style.display = 'none';
    document.querySelector('.hidden').style.display = 'block';
}