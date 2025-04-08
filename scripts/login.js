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

    console.log(user)

    request(method , user, 'userLoginTest').then((data) => logUser(data))
}

function logUser(data){
    if(!data || !data[0]){
        alert('Nie znaleziono użytkownika w bazie danych!');
        return;
    }

    alert(`Znaleziono użytkownika: ${data[0].username}`)
    console.log(data, data[0])
    request('user.log', data[0])
}

