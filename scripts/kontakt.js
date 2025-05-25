document.addEventListener("DOMContentLoaded", () => {
    if (!isLoggedIn()) {
        alert("Zaloguj się!");
        window.location = "/login";
    }

    document.getElementById("contactForm").addEventListener("submit", async (event) => {
        event.preventDefault();

        const powod = document.getElementById("powod").value;
        const tresc = document.getElementById("tresc").value;

        if (!powod || !tresc) {
            alert("Proszę wypełnić wszystkie pola.");
            return;
        }

        try {
            const response = await request("ticket.add", { user_id: userId, subject: powod, message: tresc }, "ticketResponse");

            if (response) {
                alert("Wiadomość została wysłana!");
                document.getElementById("contactForm").reset();
            } else {
                alert("Wystąpił błąd podczas wysyłania wiadomości.");
            }
        } catch (error) {
            console.error("Błąd:", error);
            alert("Nie udało się połączyć z serwerem.");
        }
    });

    const tabContact = document.getElementById('tabContact');
    const tabTickets = document.getElementById('tabTickets');

    tabContact.classList.add('active');

    tabContact.onclick = () => {
        document.getElementById('contactContent').style.display = '';
        document.getElementById('ticketsContent').style.display = 'none';
        tabContact.classList.add('active');
        tabTickets.classList.remove('active');
    };

    tabTickets.onclick = () => {
        document.getElementById('contactContent').style.display = 'none';
        document.getElementById('ticketsContent').style.display = '';
        tabTickets.classList.add('active');
        tabContact.classList.remove('active');

        request('ticket.get', {}, 'ticketList').then(tickets => {
            const userTickets = tickets.filter(t => t.user_id === userId);
            renderUserTickets(userTickets);
        });
    };

    function renderUserTickets(tickets) {
        const container = document.querySelector('.user-tickets');
        if (!tickets.length) {
            container.innerHTML = '<p>Brak zgłoszonych spraw.</p>';
            return;
        }
        container.innerHTML = tickets.map(t =>
            `<div class="ticket">
                <span>ID: ${t.ticket_id}</span>
                <strong>${t.subject}</strong>
                <span class="${t.status}">Status: ${t.status}</span>
                <a href="/tickets/ticket/?ticketId=${t.ticket_id}">Szczegóły</a>
            </div>`
        ).join('');
    }
});