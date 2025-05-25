const params = new URLSearchParams(window.location.search);
const ticketId = params.get("ticketId");
const ticketContainer = document.querySelector("main .ticket-details");

if (!ticketId) {
    alert("Brak ID zgłoszenia!");
    window.location = "/admin/tickets/";
}

if (!isLoggedIn()) {
    alert("Zaloguj się!");
    window.location = "/login";
}

isAdmin().then(isAdminUser => {
    if (isAdminUser) {
        request("ticket.getById", {ticket_id : ticketId}, "ticketList").then(tickets => {
            const ticket = tickets.find(t => t.ticket_id == ticketId);
            if (!ticket) {
                ticketContainer.innerHTML = "<p>Nie znaleziono zgłoszenia.</p>";
                return;
            }
            renderTicketDetails(ticket);
        });
    } else {
        alert("Nie masz uprawnień do tej strony!");
        window.location = "/";
    }
}).catch(error => {
    alert("Wystąpił błąd: " + error);
    window.location = "/login";
});

function renderTicketDetails(ticket) {
    const isClosed = ticket.status === "closed";
    ticketContainer.innerHTML = `
        <div class="ticket">
            <span class="id">ID: ${ticket.ticket_id}</span>
            <h3>${ticket.subject}</h3>
            <h4>${ticket.message}</h4>
            <p class="status ${ticket.status}">Status: ${ticket.status}</p>
            <div class="meta">
                <span>Użytkownik: ${ticket.username}</span>
                <span>Utworzono: ${formatData(ticket.created_at)}</span>
                <span>Aktualizacja: ${formatData(ticket.updated_at)}</span>
            </div>
            <div class="status-buttons">
                <button id="setNew" ${ticket.status === "new" ? "disabled" : ""}>Otwórz</button>
                <button id="setInProgress" ${ticket.status === "in progress" ? "disabled" : ""}>W trakcie</button>
                <button id="setClosed" ${isClosed ? "disabled" : ""}>Zamknij</button>
            </div>
        </div>
        <div id="messages"></div>
        <form id="replyForm">
            <textarea id="replyMessage" placeholder="Odpowiedź..." required ${isClosed ? "disabled" : ""}></textarea>
            <button type="submit" ${isClosed ? "disabled" : ""}>Wyślij odpowiedź</button>
        </form>
    `;

    document.getElementById("setNew").onclick = () => changeStatus("new");
    document.getElementById("setInProgress").onclick = () => changeStatus("in progress");
    document.getElementById("setClosed").onclick = () => changeStatus("closed");

    request("ticketMessage.get", { ticket_id: ticket.ticket_id }, "ticketMessages")
        .then(messages => renderMessages(messages));

    document.getElementById("replyForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        if (isClosed) return;
        const reply = document.getElementById("replyMessage").value.trim();
        if (!reply) return;

        await request("ticketMessage.add", {
            ticket_id: ticketId,
            sender_id: userId,
            message: reply
        }, "ticketMessageAddResponse");

        request("ticketMessage.get", { ticket_id: ticket.ticket_id }, "ticketMessages")
            .then(messages => renderMessages(messages));

        alert("Odpowiedź została wysłana.");
        document.getElementById("replyForm").reset();
    });

    function changeStatus(newStatus) {
        request("ticket.update", { ticket_id: ticket.ticket_id, status: newStatus }, "ticketStatusUpdate")
            .then(() => {
                request("ticket.getById", { ticket_id: ticket.ticket_id }, "ticketList").then(tickets => {
                    const updatedTicket = tickets.find(t => t.ticket_id == ticket.ticket_id);
                    renderTicketDetails(updatedTicket);
                });
            });
    }
}

function renderMessages(messages) {
    const messagesDiv = document.getElementById("messages");
    if (!messages || messages.length === 0) {
        messagesDiv.innerHTML = "<p>Brak wiadomości w tej sprawie.</p>";
        return;
    }
    messagesDiv.innerHTML = messages.map(msg => {
        const isAdmin = msg.is_admin === 1;
        const username = isAdmin ? `${msg.username} <strong>(Admin ✅)</strong>` : msg.username;
        return `
            <div class="message${isAdmin ? " admin" : ""}">
                <span class="meta">${username} (${formatData(msg.sent_at)})</span>
                <div class="text">${msg.message}</div>
            </div>
        `;
    }).join("");
}