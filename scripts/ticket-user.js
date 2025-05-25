const params = new URLSearchParams(window.location.search);
const ticketId = params.get("ticketId");
const ticketContainer = document.querySelector("main .ticket-details");

userId = window.userId
if (!isLoggedIn()) {
    alert("Zaloguj się!");
    window.location = "/login";
}

ws.addEventListener("open", () => {
    hasTicketAccess(ticketId).then(hasAccess => {
        if (!hasAccess) {
            ticketContainer.innerHTML = "<p>Nie masz dostępu do tej sprawy.</p>";
            return;
        }

        request("ticket.getById", { ticket_id: ticketId }, "ticketList").then(tickets => {
            const ticket = tickets.find(t => t.ticket_id == ticketId);
            if (!ticket) {
                ticketContainer.innerHTML = "<p>Nie znaleziono zgłoszenia.</p>";
                return;
            }
            renderTicketDetails(ticket);
        }).catch(err => {
            ticketContainer.innerHTML = "<p>Błąd podczas pobierania danych zgłoszenia.</p>";
        });
    }).catch(error => {
        ticketContainer.innerHTML = `<p>Błąd: ${error}</p>`;
    });
});

const replyForm = document.getElementById("replyForm");
const replyMessage = document.getElementById("replyMessage");
const replyError = document.getElementById("replyError");

if (replyForm) {
    replyForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        replyError.textContent = "";
        const message = replyMessage.value.trim();
        if (!message) {
            replyError.textContent = "Wiadomość nie może być pusta.";
            return;
        }
        try {
            await request(
                "ticketMessage.add",
                { ticket_id: ticketId, sender_id: userId, message },
                "ticketMessageAddResult"
            );
            replyMessage.value = "";
            location.reload();
        } catch (err) {
            replyError.textContent = "Błąd podczas wysyłania odpowiedzi.";
        }
    });
}
function hasTicketAccess(ticketId) {
    return new Promise((resolve, reject) => {
        getValidUserId().then(userId => {
            if (!userId) {
                reject("Brak identyfikatora użytkownika");
                return;
            }

            request("ticket.getById", { ticket_id: ticketId }, "ticketAccess").then(tickets => {
                const ticket = tickets.find(t => t.ticket_id == ticketId);
                if (!ticket) {
                    reject("Nie znaleziono zgłoszenia");
                    return;
                }

                if (ticket.user_id === userId) {
                    resolve(true);
                    return;
                }else{
                    reject("Nie masz dostępu do tej sprawy");
                    return;
                }

            }).catch(err => {
                reject("Błąd podczas pobierania danych zgłoszenia");
            });
        });
    });
}
function renderTicketDetails(ticket) {
    const isClosed = ticket.status === "closed";
    ticketContainer.innerHTML = `
        <div class="ticket">
            <span class="id">ID: ${ticket.ticket_id}</span>
            <h3>${ticket.subject}</h3>
            <h4>${ticket.message}</h4>
            <p class="status ${ticket.status}">Status: ${ticket.status}</p>
            <div class="meta">
                <span>Utworzono: ${formatData(ticket.created_at)}</span>
                <span>Aktualizacja: ${formatData(ticket.updated_at)}</span>
            </div>
        </div>
        <div id="messages"></div>
    `;

    request("ticketMessage.get", { ticket_id: ticket.ticket_id }, "ticketMessages")
        .then(messages => renderMessages(messages));
    if (isClosed) {
        replyMessage.disabled = true;
        replyForm.querySelector("button[type='submit']").disabled = true;
        replyError.textContent = "Sprawa została zamknięta. Nie można już odpowiadać.";
    } else {
        replyMessage.disabled = false;
        replyForm.querySelector("button[type='submit']").disabled = false;
        replyError.textContent = "";
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