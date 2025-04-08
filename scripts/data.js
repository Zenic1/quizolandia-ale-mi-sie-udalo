let ws = new WebSocket("ws://localhost:8080");
function initializeWebSocket() {
    const RECONNECT_INTERVAL = 2500;
    ws = new WebSocket("ws://localhost:8080");

    ws.onclose = function () {
        console.log("WebSocket closed, reconnecting...");
        rxjs.timer(RECONNECT_INTERVAL).subscribe(() => initializeWebSocket());
    };

    ws.onerror = function (event) {
        console.error("WebSocket error", event);
        ws.close();
    };

    // ws.addEventListener('open', initAllGetData)

    ws.onmessage = function (event) {
        const response = JSON.parse(event.data);
        if (response.action === "response") {
            const { variable, value } = response.params;
            handleResponse(variable, value);
        }
    };
}

function handleResponse(variable, value) {
    console.log(variable, value);
    cachedData.set(variable, value);
    dataChange.next(variable);
}

function get(variable) {
    if (cachedData.has(variable)) return cachedData.get(variable);
    return [];
}

function request(method, params = {}, responseVar = "N/A") {
    if (ws.readyState !== WebSocket.OPEN) return;
    ws.send(
        JSON.stringify({
            action: "request",
            params: {
                method,
                params,
                responseVar,
            },
        })
    );
    return new Promise((resolve, reject) => {
        ws.addEventListener('message', (event) => {
            if(!event.data) {
                reject(new Error('Error in data', event.data));
                return;
            }
            const data = JSON.parse(event.data);

            const { variable, value } = data.params;
            console.log('WebSocket message received:', value, variable, event.data, data);
            if(variable === responseVar)
            {
                resolve(value);
            }
        })
    });
}

function initAllGetData() {
    request("user.get", {}, "studentList");
    request("category.get", {}, "categories");
    request("answer.get", {}, "answerList");
    request("question.get", {}, "questionList");
    request("quiz.getWithCategory", {}, "quizList");
    request('comment.get', {}, "commentList");
}

let cachedData = new Map();
let dataChange = new rxjs.Subject();


initializeWebSocket();