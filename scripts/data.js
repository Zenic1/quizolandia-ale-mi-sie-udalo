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

    ws.onopen = function () {
        console.log("WebSocket opened");
        initAllGetData()
    };

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
    const [sector, dataPool, operation] = method.split(".");
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
    if (operation !== "get") {
        const getMethod = sector + "." + dataPool + ".get";
        request(getMethod, {}, responseVar);
    }
}

async function initAllGetData() {
    request("user.get", {}, "studentList");
}

let cachedData = new Map();
let dataChange = new rxjs.Subject();


initializeWebSocket();