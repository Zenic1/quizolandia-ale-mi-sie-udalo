let currentUserId = null;
let users = [];

document.addEventListener('DOMContentLoaded', () => {
  isAdmin().then(adminStatus => {
    if (!adminStatus) {
      alert("Nie masz uprawnień administratora!");
      window.location.href = "/";
      return;
    }
    loadUsers();
  }).catch(error => {
    console.error("Błąd sprawdzania uprawnień:", error);
    alert("Wystąpił błąd podczas weryfikacji uprawnień.");
    window.location.href = "/login";
  });
});

function loadUsers() {
  request("user.getAll", {}, "getAllUsers").then(data => {
    users = data;
    displayUsers();
  }).catch(error => {
    console.error("Błąd podczas pobierania użytkowników:", error);
    document.getElementById('lista').innerHTML = '<p>Wystąpił błąd podczas pobierania listy użytkowników.</p>';
  });
}

function displayUsers() {
  const lista = document.getElementById('lista');
  lista.innerHTML = '';

  if (users.length === 0) {
    lista.innerHTML = '<p>Brak użytkowników do wyświetlenia.</p>';
    return;
  }

  users.forEach(user => {
    const li = document.createElement('li');
    li.className = 'user-item';

    // Dodaj klasę dla nieaktywnych użytkowników
    if (user.is_active === 0) {
      li.classList.add('inactive-user');
    }

    const adminBadge = user.is_admin ? '<span class="admin-badge">(Admin)</span>' : '';
    const statusBadge = user.is_active === 0 ? '<span class="inactive-badge">(Nieaktywny)</span>' : '';

    li.innerHTML = `
      <div class="user-info">
        <img src="${user.avatar_url || '/assets/images/user.svg'}" alt="Avatar" class="user-avatar ${user.is_active === 0 ? 'inactive' : ''}">
        <div class="user-details">
          <h3>${user.username} ${adminBadge} ${statusBadge}</h3>
          <p>${user.email}</p>
          <p>Dołączył: ${formatDate(user.created_at)}</p>
        </div>
      </div>
      <div class="user-actions">
        <button onclick="openEditor(${user.user_id})" class="button edit-btn">Edytuj</button>
        ${user.is_active === 1
        ? `<button onclick="confirmDelete(${user.user_id})" class="button delete-btn">Dezaktywuj</button>`
        : `<button onclick="reactivateUser(${user.user_id})" class="button reactivate-btn">Przywróć</button>`
    }
      </div>
    `;

    lista.appendChild(li);
  });
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString('pl-PL') + ' ' + date.toLocaleTimeString('pl-PL');
}

function openEditor(userId) {
  const panel = document.getElementById('panel');
  panel.classList.remove('hidden');

  const title = document.getElementById('edytuj');
  const nameInput = document.getElementById('nazwa');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('haslo');
  const adminCheckbox = document.getElementById('admin-status');

  currentUserId = userId;

  if (userId === null) {
    // Tryb dodawania nowego użytkownika
    title.textContent = "Dodaj użytkownika";
    nameInput.value = '';
    emailInput.value = '';
    passwordInput.value = '';
    passwordInput.required = true;
    adminCheckbox.checked = false;
  } else {
    // Tryb edycji
    const user = users.find(u => u.user_id === userId);
    if (!user) {
      alert("Nie znaleziono użytkownika!");
      return;
    }

    title.textContent = `Edytuj użytkownika: ${user.username}`;
    nameInput.value = user.username;
    emailInput.value = user.email;
    passwordInput.value = '';
    passwordInput.required = false;
    adminCheckbox.checked = user.is_admin === 1;
  }

  // Przewiń do panelu edycji z płynną animacją
  setTimeout(() => {
    panel.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });
  }, 100);
}

function anuluj() {
  document.getElementById('panel').classList.add('hidden');
  currentUserId = null;
}

function zapisz() {
  const username = document.getElementById('nazwa').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('haslo').value;
  const isAdmin = document.getElementById('admin-status').checked ? 1 : 0;

  if (!username || !email) {
    alert("Nazwa użytkownika i email są wymagane!");
    return;
  }

  if (currentUserId === null) {
    // Dodawanie nowego użytkownika
    if (!password) {
      alert("Hasło jest wymagane przy tworzeniu nowego użytkownika!");
      return;
    }

    request("user.add", {
      username,
      email,
      password,
      is_admin: isAdmin
    }, "addUserResult").then(result => {
      alert("Użytkownik został dodany pomyślnie.");
      document.getElementById('panel').classList.add('hidden');
      loadUsers();
    }).catch(error => {
      console.error("Błąd podczas dodawania użytkownika:", error);
      alert("Wystąpił błąd podczas dodawania użytkownika.");
    });
  } else {
    // Aktualizacja istniejącego użytkownika
    const params = {
      user_id: currentUserId,
      username,
      email,
      is_admin: isAdmin,
      update_password: false // Dodajemy flagę informującą, czy aktualizujemy hasło
    };

    // Dodaj hasło do parametrów tylko jeśli zostało podane
    if (password) {
      params.password = password;
      params.update_password = true; // Ustawiamy flagę na true
    }

    request("user.update", params, "updateUserResult").then(result => {
      alert("Dane użytkownika zostały zaktualizowane.");
      document.getElementById('panel').classList.add('hidden');
      loadUsers();
    }).catch(error => {
      console.error("Błąd podczas aktualizacji użytkownika:", error);
      alert("Wystąpił błąd podczas aktualizacji danych użytkownika.");
    });
  }
}

function confirmDelete(userId) {
  const user = users.find(u => u.user_id === userId);
  if (!user) {
    alert("Nie znaleziono użytkownika!");
    return;
  }

  const confirmation = confirm(`Czy na pewno chcesz dezaktywować użytkownika ${user.username}? Użytkownik nie będzie mógł się logować, ale jego dane pozostaną w systemie.`);
  if (confirmation) {
    request("user.delete", { user_id: userId }, "deleteUserResult")
        .then(result => {
          alert("Użytkownik został dezaktywowany.");
          loadUsers();
        })
        .catch(error => {
          console.error("Błąd podczas dezaktywacji użytkownika:", error);
          alert("Wystąpił błąd podczas dezaktywacji użytkownika.");
        });
  }
}

// Dodaj funkcję do przywracania konta
function reactivateUser(userId) {
  const user = users.find(u => u.user_id === userId);
  if (!user) {
    alert("Nie znaleziono użytkownika!");
    return;
  }

  const confirmation = confirm(`Czy na pewno chcesz przywrócić konto użytkownika ${user.username}?`);
  if (confirmation) {
    request("user.update", {
      user_id: userId,
      username: user.username,
      email: user.email,
      is_admin: user.is_admin,
      update_active: true,
      is_active: 1
    }, "reactivateUserResult")
        .then(result => {
          alert("Konto użytkownika zostało przywrócone.");
          loadUsers();
        })
        .catch(error => {
          console.error("Błąd podczas przywracania konta:", error);
          alert("Wystąpił błąd podczas przywracania konta użytkownika.");
        });
  }
}