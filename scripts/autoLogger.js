let userId = 0;
function storeLogin(login, password)
{
    sessionStorage.setItem('userLogin', login.toString());
    sessionStorage.setItem('userPassword', password.toString());
}

function tryLogin(login, password, callback)
{
    const user = {
        username: login,
        email: login,
        password: password,
    }

    const regEx = /^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/gm;

    const method = login.toString().match(regEx) ? 'user.getFromEmail' : 'user.getFromLogin';

    request(method , user, 'userLoginTest').then((data) =>
    {
        logUser(data)
        callback(data);
    })
}

function logUser(data){
    if(!data || !data[0]){
        alert('Nie znaleziono użytkownika w bazie danych!');
        return;
    }

    userId = data[0].id;

    // alert(`Pomyślnie zalogowano jako użytkownik: ${data[0].username}`)
    console.log(data, data[0])
    request('user.log', data[0])
}

const login = sessionStorage.getItem('userLogin');
const password = sessionStorage.getItem('userPassword');
// if(login && password) ws.addEventListener('open', () => tryLogin(login, password, () => {}));