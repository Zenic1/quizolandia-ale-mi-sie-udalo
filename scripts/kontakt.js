document.addEventListener("DOMContentLoaded",  () => {
userId = parseInt(localStorage.getItem("userId")) ?? 0;
if (!userId || userId === 0) {
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
    document.getElementById('tabContact').onclick = () => {
        document.getElementById('contactContent').style.display = '';
        document.getElementById('ticketsContent').style.display = 'none';
    };
    document.getElementById('tabTickets').onclick = () => {
        document.getElementById('contactContent').style.display = 'none';
        document.getElementById('ticketsContent').style.display = '';

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
      <span>Status: ${t.status}</span>
      <a href="/tickets/ticket/?ticketId=${t.ticket_id}">Szczegóły</a>
    </div>`
        ).join('');
    }
})
