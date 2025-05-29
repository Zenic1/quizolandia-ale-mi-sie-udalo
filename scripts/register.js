window.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register');

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const pass1 = form.password.value;
        const pass2 = form.password2.value;

        if (pass1 !== pass2) {
            alert("Hasła się nie zgadzają!");
        } else {
            addUser(form)
        }
    });


});

function addUser(form)
{
    const user = {
        username: form.username.value,
        email: form.email.value,
        password: form.password.value,
        is_admin: false
    }
    console.log(user)
    request('user.add', user, 'feedback').then((response) => {
        window.location.href = '/login'
    })
}