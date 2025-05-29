const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const parsedUserId = parseInt(urlParams.get("userId") ?? 0);

let avatar_preview = document.getElementById("avatar-preview");
let avatar_url_input = document.getElementById("avatar-url");

let username_input = document.getElementById("username");
let email_input = document.getElementById("email");
let password_input = document.getElementById("password");
let confirm_password_input = document.getElementById("confirm-password");

let toggleButton = document.getElementById("toggle-password");

let user;

function loadUser(userInfo) {
    user = userInfo;
    console.log("user", userInfo);
    avatar_preview.setAttribute('src', userInfo.avatar_url)
    username_input.value = userInfo.username;
    email_input.value = userInfo.email;
    avatar_url_input.value = userInfo.avatar_url
}

ws.addEventListener('open', () => {
    request('user.getFromId', {user_id: parsedUserId}, 'UserInfo').then((response) => loadUser(response[0]));
})

function saveChanges() {
    let parameters = {
        user_id: parsedUserId,
        username: username_input.value,
        email: email_input.value,
        avatar_url: avatar_url_input.value,
        is_admin: user.is_admin ?? false,
    }
    if(!!password_input.value)
    {
        if(password_input.value === confirm_password_input.value){
            parameters.update_password = password_input.value;
        } else {
            alert("Hasla nie sa takie same");
            return;
        }
    }
    console.log(parameters);
    request('user.update', parameters, 'feedback').then((response) => {
        alert("Update successfully");
        request('user.getFromId', {user_id: parsedUserId}, 'UserInfo').then((response) => loadUser(response[0]));
    })
}

function togglePassword() {
    console.log(getCurrentUserId() !== parsedUserId, getCurrentUserId(), parsedUserId)
    if (password_input.getAttribute('type') === 'password') {
        password_input.setAttribute('type', 'text');
        confirm_password_input.setAttribute('type', 'text');
        toggleButton.innerHTML = 'Hide'
    } else{
        password_input.setAttribute('type', 'password');
        confirm_password_input.setAttribute('type', 'password');
        toggleButton.innerHTML = 'Show'
    }
}
onLogin.subscribe(() => {
    if(getCurrentUserId() === 0 || getCurrentUserId() !== parsedUserId){
        window.location.href = '../'
    }
})