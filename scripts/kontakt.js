let newUserId = localStorage.getItem("userId");
document.getElementById("contactForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const powod = document.getElementById("powod").value;
    const tresc = document.getElementById("tresc").value;

    if (!powod || !tresc) {
        alert("Proszę wypełnić wszystkie pola.");
        return;
    }

    try {
        const response = await request("ticket.add", { user_id: newUserId, subject: powod, message: tresc }, "ticketResponse");

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