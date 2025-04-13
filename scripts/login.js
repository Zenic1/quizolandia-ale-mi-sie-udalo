function getUsers(event){
    event.preventDefault();
    const form = event.target;

    const user = {
        username: form.text.value,
        email: form.text.value,
        password: form.password.value,
    }

    const regEx = /^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/gm;

    const method = form.text.value.toString().match(regEx) ? 'user.getFromEmail' : 'user.getFromLogin';

    form.text.value.toString().match(regEx) ? storeLogin(user.email, user.password) : storeLogin(user.username, user.password);

    console.log(user)



    request(method , user, 'userLoginTest').then((data) => logUser(data))
}
// if(login && password) ws.addEventListener('open', () => tryLogin(login, password, () => {window.location.href = '../search/'}));
