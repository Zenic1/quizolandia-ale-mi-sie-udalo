let userId = 0;

let userHTMLList = document.getElementById('czaty');

async function init(){
    let userList = Array.from(await request('user.get', {}, 'userList'));
    userList.splice(userList.indexOf(userList.find(item => item.user_id === userId)), 1);
    console.table(userList);
    createUsers(userList);
}

async function createUsers(userList){
    userHTMLList.innerHTML = '<h4>Czat</h4>'
    userList.forEach((user) => {
        userHTMLList.innerHTML += `
            <div onclick="selectUser(${user.user_id})">
                <div class="osoba">
                    <img src="${user.avatar_url}" alt="profilowe">
                    <p>${user.username}</p>
                </div>
            </div>`
    })
}

async function selectUser(user_id){
    let messages = Array.from(await request('message.getFromReceiverID', {receiver_id: userId}, 'messages'))
    console.table(messages);
    let distinctUserMessages = messages.filter(message => message.sender_id === user_id || message.receiver_id === user_id || message.sender_id === user_id || message.sender_id === user_id);
    console.table(distinctUserMessages);
}

if(!login || !password)
    window.location.href = '/login';
onLogin.subscribe(() => {
    if(getCurrentUserId() !== 0){
        userId = getCurrentUserId();
        console.log(userId);
        init()
    }
    else{
        window.location.href = '/login';
    }
})