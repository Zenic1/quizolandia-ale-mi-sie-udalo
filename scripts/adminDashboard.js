isAdmin().then(adminStatus => {
        if (!adminStatus) {
            alert("Nie masz uprawnień administratora!");
            window.location.href = "/";
            return;
        }
        loadDashboardStats();
        loadRecentActivities();
    }).catch(error => {
        console.error("Błąd sprawdzania uprawnień:", error);
        alert("Wystąpił błąd podczas weryfikacji uprawnień.");
        window.location.href = "/login";
    });


async function loadDashboardStats() {
    try {
        const users = await request("user.get", {}, "dashboardUsers");
        document.getElementById('users-count').textContent = users.length;

        const activeUsers = users.filter(user => user.is_active === 1).length;
        const inactiveUsers = users.filter(user => user.is_active === 0).length;

        if (document.getElementById('active-users-count')) {
            document.getElementById('active-users-count').textContent = activeUsers;
        }
        if (document.getElementById('inactive-users-count')) {
            document.getElementById('inactive-users-count').textContent = inactiveUsers;
        }

        const loginsToday = users.filter(user => {
            if (!user.last_login || user.is_active === 0) return false;
            const loginDate = new Date(user.last_login);
            const today = new Date();
            return loginDate.getDate() === today.getDate() &&
                loginDate.getMonth() === today.getMonth() &&
                loginDate.getFullYear() === today.getFullYear();
        }).length;

        document.getElementById('daily-logins').textContent = loginsToday;
    } catch (error) {
        console.error("Błąd podczas ładowania statystyk:", error);
        document.querySelectorAll('.stat-value').forEach(el => {
            el.textContent = "Błąd";
        });
    }
}

async function loadRecentActivities() {
    try {
        const activitiesList = document.getElementById('recent-activities');
        activitiesList.innerHTML = '<li class="activity-item">Ładowanie aktywności...</li>';

        const users = await request("user.get", {}, "activityUsers");
        const tickets = await request("ticket.get", {}, "activityTickets");

        const activities = [];

        users
            .filter(user => user.last_login)
            .sort((a, b) => new Date(b.last_login) - new Date(a.last_login))
            .slice(0, 5)
            .forEach(user => {
                activities.push({
                    timestamp: new Date(user.last_login),
                    text: `Użytkownik ${user.username} zalogował się do systemu`,
                    type: 'login'
                });
            });

        tickets
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            .slice(0, 5)
            .forEach(ticket => {
                activities.push({
                    timestamp: new Date(ticket.created_at),
                    text: `Nowe zgłoszenie od ${ticket.username}: ${ticket.subject}`,
                    type: 'ticket'
                });
            });

        activities.sort((a, b) => b.timestamp - a.timestamp);

        activitiesList.innerHTML = '';

        if (activities.length === 0) {
            activitiesList.innerHTML = '<li class="activity-item">Brak ostatnich aktywności</li>';
            return;
        }

        activities.slice(0, 10).forEach(activity => {
            const li = document.createElement('li');
            li.className = 'activity-item';
            const iconClass = activity.type === 'login' ? 'user-icon' : 'ticket-icon';

            li.innerHTML = `
        <div class="activity-content">
          <span class="activity-time">${formatDate(activity.timestamp)}</span>
          <span class="activity-text">${activity.text}</span>
        </div>
      `;

            activitiesList.appendChild(li);
        });
    } catch (error) {
        console.error("Błąd podczas ładowania aktywności:", error);
        document.getElementById('recent-activities').innerHTML =
            '<li class="activity-item">Wystąpił błąd podczas ładowania aktywności</li>';
    }
}

function formatDate(date) {
    return date.toLocaleDateString('pl-PL') + ' ' +
        date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
}
