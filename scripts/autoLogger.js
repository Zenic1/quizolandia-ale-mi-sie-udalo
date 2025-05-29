window.userId = 0;

const onLogin = new rxjs.Subject();

function storeLogin(login, password)
{
    localStorage.setItem('userLogin', login.toString());
    localStorage.setItem('userPassword', password.toString());
}

function tryLogin(login, password, callback, isManualLogin = false)
{
    const user = {
        username: login,
        email: login,
        password: password,
    }

    const regEx = /^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/gm;

    const method = login.toString().match(regEx) ? 'user.getFromEmail' : 'user.getFromLogin';

    request(method , user, 'userLogin').then((data) =>
    {
        logUser(data, isManualLogin)
        callback(data);
    })
}

function logUser(data, isManualLogin = false){
    if(!data || !data[0]){
        if(isManualLogin) {
            alert('Nie znaleziono użytkownika w bazie danych!');
        }
        return;
    }

    if(data[0].is_active === 0){
        if(isManualLogin) {
            alert('To konto zostało dezaktywowane przez administratora.');
        }
        localStorage.removeItem('userLogin');
        localStorage.removeItem('userPassword');
        return;
    }

    window.userId = data[0].user_id;

    if(isManualLogin) {
        alert(`Pomyślnie zalogowano jako użytkownik: ${data[0].username}`)
        request('user.log', data[0])
        window.location.href = '/';
    } else {
        request('user.log', data[0])
    }
}

function getCurrentUserId() {
    return window.userId;
}

window.getCurrentUserId = getCurrentUserId;
window.tryLogin = tryLogin;

const login = localStorage.getItem('userLogin');
const password = localStorage.getItem('userPassword');

function isLoggedIn() {
    const loginExists = localStorage.getItem('userLogin');
    const passwordExists = localStorage.getItem('userPassword');
    return loginExists && passwordExists;
}

function logout() {
    localStorage.removeItem('userLogin');
    localStorage.removeItem('userPassword');
    window.userId = 0;
    updateProfileIcon();
    // alert('Pomyślnie wylogowano');
    window.location.href = '/';
}

function updateLogoutButton() {
    const navDiv = document.querySelector('nav div');
    if (!navDiv) return;

    let logoutButton = navDiv.querySelector('button');
    let loginButton = document.getElementById('loginButton');
    let registerButton = document.getElementById('registerButton');

    if (isLoggedIn()) {
        if (logoutButton) {
            logoutButton.onclick = function(e) {
                e.preventDefault();
                logout();
            };
        } else {
            logoutButton = document.createElement('button');
            logoutButton.textContent = 'Wyloguj się';
            logoutButton.onclick = function(e) {
                e.preventDefault();
                logout();
            };
            navDiv.appendChild(logoutButton);
        }

        if (loginButton) loginButton.remove();
        if (registerButton) registerButton.remove();
    } else {
        if (logoutButton) {
            logoutButton.remove();
        }

        if (!loginButton) {
            loginButton = document.createElement('button');
            loginButton.id = 'loginButton';
            loginButton.textContent = 'Zaloguj się';
            loginButton.onclick = function() {
                window.location.href = '/login/';
            };
            navDiv.appendChild(loginButton);
        }

        if (!registerButton) {
            registerButton = document.createElement('button');
            registerButton.id = 'registerButton';
            registerButton.textContent = 'Zarejestruj się';
            registerButton.style.backgroundColor = '#f0f6ff';
            registerButton.style.color = '#2e2c2f';
            registerButton.style.border = '2px solid #2e2c2f';
            registerButton.style.marginLeft = '10px';
            registerButton.onclick = function() {
                window.location.href = '/register/';
            };
            navDiv.appendChild(registerButton);
        }
    }
    updateProfileIcon();
}
function updateProfileIcon() {
    const navDiv = document.querySelector('nav div');
    if (!navDiv) return;

    let profileImg = navDiv.querySelector('img[alt="użytkownik"]');

    if (profileImg) {
        let profileLink = profileImg.parentElement;
        if (profileLink.tagName !== 'A') {
            profileLink = document.createElement('a');
            profileImg.parentNode.insertBefore(profileLink, profileImg);
            profileLink.appendChild(profileImg);
        }

        profileLink.href = isLoggedIn() ? `/profile/?userId=${window.userId}` : '/login/';

        profileImg.style.cursor = 'pointer';
    }
}
function getValidUserId() {
    return new Promise((resolve) => {
        if (window.userId && window.userId !== 0) {
            resolve(window.userId);
            return;
        }
        const checkInterval = setInterval(() => {
            if (window.userId && window.userId !== 0) {
                clearInterval(checkInterval);
                resolve(window.userId);
            }
        }, 100);

        setTimeout(() => {
            clearInterval(checkInterval);
            resolve(null);
        }, 5000);
    });
}
function isAdmin() {
    return new Promise((resolve, reject) => {

        getValidUserId().then(userId => {
            if (!userId) {
                reject("Brak identyfikatora użytkownika");
                return;
            }

            request('user.isAdmin', { user_id: userId }, 'adminResponse')
                .then(res => {
                    if (res && res.length > 0 && res[0].is_admin === 1) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                })
                .catch(err => {
                    reject("Błąd weryfikacji uprawnień");
                });
        });
    });
}
document.addEventListener('DOMContentLoaded', () => {
    updateLogoutButton();
    updateProfileIcon();

    if(login && password) {
        console.log('b')
        ws.addEventListener('open', () => {
            tryLogin(login, password, (data) => {
                if(data && data[0]) {
                    onLogin.next()
                    console.log('Automatycznie zalogowano jako: ' + data[0].username);
                    updateProfileIcon();
                }else{
                    logout()
                }
            }, false);
        });
    }
});

window.logout = logout;