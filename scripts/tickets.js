if (isLoggedIn()) {
    isAdmin().then(isAdminUser => {
        if (isAdminUser) {
            request("ticket.get", {}, "ticketList").then(tickets => {
                generateTicketHtml(tickets);
            });
        } else {
            alert("Nie masz uprawnień administracyjnych");
            window.location = "/";
        }
    }).catch(error => {
        alert("Wystąpił błąd: " + error);
        window.location = "/login";
    });

    function generateTicketHtml(tickets) {
        const ticketContainer = document.querySelector(".tickets");
        const currentTickets = Array.from(ticketContainer.children);

        const ticketsToRemove = currentTickets.filter(child => {
            const ticketId = child.dataset.ticketId;
            return !tickets.some(t => t.ticket_id == ticketId);
        });

        ticketsToRemove.forEach(child => {
            child.classList.add("exiting");
            child.addEventListener("animationend", () => {
                requestAnimationFrame(() => child.remove());
            });
        });

        const existingIds = currentTickets.map(c => c.dataset.ticketId);
        const ticketsToAdd = tickets.filter(t => !existingIds.includes(t.ticket_id.toString()));

        ticketsToAdd.forEach((ticket, index) => {
            const child = createTicketElement(ticket);
            ticketContainer.appendChild(child);

            child.style.animationDelay = `${index * 50}ms`;
        });
    }

    function createTicketElement(ticket) {
        const link = document.createElement("a");
        link.href = `/admin/tickets/ticket/?ticketId=${ticket.ticket_id}`;
        link.classList.add("ticket");
        link.dataset.ticketId = ticket.ticket_id;
        link.style.textDecoration = "none";

        const id = document.createElement("span");
        id.textContent = `ID: ${ticket.ticket_id}`;
        link.appendChild(id);

        const title = document.createElement("h3");
        title.textContent = ticket.subject;
        link.appendChild(title);

        const message = document.createElement("h4");
        message.textContent = ticket.message;
        link.appendChild(message);

        const status = document.createElement("p");
        status.textContent = `Status: ${ticket.status}`;
        if (ticket.status === "new") {
            status.classList.add("open");
        } else if (ticket.status === "closed") {
            status.classList.add("closed");
        } else if (ticket.status === "in progress") {
            status.classList.add("in-progress");
        }
        link.appendChild(status);

        const user = document.createElement("span");
        user.textContent = `Użytkownik: ${ticket.username}`;
        link.appendChild(user);

        return link;
    }
} else {
    alert("Zaloguj się!");
    window.location = "/login";
}