// === ГЛОБАЛНИ НАСТРОЙКИ ===
const API_BASE_URL = 'http://localhost:9000/api/auth';

// === ИНИЦИАЛИЗАЦИЯ ПРИ ЗАРЕЖДАНЕ НА СТРАНИЦАТА ===
document.addEventListener("DOMContentLoaded", () => {
    fetchAndDisplayUsers();
    setupEventListeners();
});

// ==========================================
// 1. ВЗИМАНЕ И ПОКАЗВАНЕ НА ПОТРЕБИТЕЛИ (GET)
// ==========================================
async function fetchAndDisplayUsers() {
    const usersListContainer = document.getElementById('usersList');
    usersListContainer.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:20px;">Зареждане на потребители...</td></tr>';

    try {
        const token = sessionStorage.getItem("jwtToken"); 
        const response = await fetch(`${API_BASE_URL}/get-all`, {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }); 
        
        if (!response.ok) throw new Error('Неуспешно взимане на данните');
        
        const users = await response.json();
        usersListContainer.innerHTML = ''; 

        if(users.length === 0) {
            usersListContainer.innerHTML = '<tr><td colspan="3" style="text-align:center;">Няма намерени потребители в базата.</td></tr>';
            return;
        }

        users.forEach(user => {
            const initials = user.username.substring(0, 2).toUpperCase();
            const regDate = user.registeredOn ? user.registeredOn : 'N/A';

            const row = document.createElement('tr');
            row.style.borderBottom = '1px solid #EDF2F7';
            
            row.innerHTML = `
                <td style="padding: 30px 20px;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="width: 45px; height: 45px; background: #E0F2FE; color: #0369A1; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem;">
                            ${initials}
                        </div>
                        <div>
                            <div style="font-weight: 700; color: #1E293B; font-size: 1.05rem;">${user.username}</div>
                            <div style="color: #64748B; font-size: 0.85rem; margin-top: 4px;">${user.email}</div>
                        </div>
                    </div>
                </td>
                <td style="padding: 30px 20px;">
                    <div style="font-weight: 600; color: #475569; margin-bottom: 5px;">${user.role}</div>
                    <div style="color: #94A3B8; font-size: 0.8rem;">Registered: ${regDate}</div>
                </td>
                <td style="padding: 30px 20px; text-align: right;">
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button class="btn btn-outline" onclick="openEditModal('${user.username}', '${user.email}', '${user.role}')" style="border-color: #E2E8F0; color: #64748B;">
                            <i class="fa-solid fa-user-pen"></i> Edit
                        </button>
                        <button class="btn btn-outline delete-user-btn" onclick="deleteUser('${user.username}')" style="color: #EF4444; border-color: #FCA5A5;">
                            <i class="fa-solid fa-user-minus"></i>
                        </button>
                    </div>
                </td>
            `;
            usersListContainer.appendChild(row);
        });

    } catch (error) {
        console.error('Грешка:', error);
        usersListContainer.innerHTML = '<tr><td colspan="3" style="text-align:center; color:red;">Грешка при връзка със сървъра.</td></tr>';
    }
}

// ==========================================
// 2. ИЗТРИВАНЕ НА ПОТРЕБИТЕЛ (DELETE)
// ==========================================
async function deleteUser(username) {
    if(!confirm(`Сигурни ли сте, че искате да изтриете потребител: ${username}?`)) return;

    try {
        const token = sessionStorage.getItem("jwtToken");
        const response = await fetch(`${API_BASE_URL}/delete/${username}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            alert('Потребителят е изтрит успешно!');
            fetchAndDisplayUsers(); // Презареждаме таблицата
        } else {
            alert('Възникна грешка при изтриването.');
        }
    } catch (error) {
        console.error('Грешка:', error);
        alert('Сървърна грешка при изтриване.');
    }
}

// ==========================================
// 3. РЕГИСТРАЦИЯ НА НОВ ПОТРЕБИТЕЛ (POST)
// ==========================================
async function handleRegister(e) {
    e.preventDefault(); // Спира презареждането на страницата

    const userData = {
        username: document.getElementById('regUsername').value,
        email: document.getElementById('regEmail').value,
        password: document.getElementById('regPassword').value,
        role: document.getElementById('regRole').value
    };

    try {
        const token = sessionStorage.getItem("jwtToken");
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            alert('Потребителят е регистриран успешно!');
            closeModal('registerModal');
            document.getElementById('registerForm').reset(); // Изчистваме формата
            fetchAndDisplayUsers(); // Презареждаме таблицата
        } else {
            const errorText = await response.text();
            alert(`Грешка при регистрация: ${errorText}`);
        }
    } catch (error) {
        console.error('Грешка:', error);
        alert('Сървърна грешка при регистрация.');
    }
}

// ==========================================
// 4. РЕДАКЦИЯ НА ПОТРЕБИТЕЛ (PUT)
// ==========================================
async function handleEdit(e) {
    e.preventDefault();

    const originalUsername = document.getElementById('editOriginalUsername').value;
    const updatedData = {
        email: document.getElementById('editEmail').value,
        role: document.getElementById('editRole').value
    };

    try {
        const token = sessionStorage.getItem("jwtToken");
        const response = await fetch(`${API_BASE_URL}/update/${originalUsername}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });

        if (response.ok) {
            alert('Промените са запазени успешно!');
            closeModal('editModal');
            fetchAndDisplayUsers();
        } else {
            alert('Грешка при запазване на промените.');
        }
    } catch (error) {
        console.error('Грешка:', error);
        alert('Сървърна грешка при редакция.');
    }
}

// ==========================================
// 5. УПРАВЛЕНИЕ НА МОДАЛИ И СЪБИТИЯ (UI)
// ==========================================
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function openEditModal(username, email, role) {
    document.getElementById('editOriginalUsername').value = username;
    document.getElementById('editUsername').value = username;
    document.getElementById('editEmail').value = email;
    document.getElementById('editRole').value = role;
    document.getElementById('editModal').style.display = 'flex';
}

function setupEventListeners() {
    // Отваряне на Register модал (търси бутона по иконката)
    const registerBtnIcon = document.querySelector('.fa-user-plus');
    if(registerBtnIcon) {
        registerBtnIcon.parentElement.addEventListener('click', () => {
            document.getElementById('registerModal').style.display = 'flex';
        });
    }

    // Закачане на функциите към формите (submit)
    const registerForm = document.getElementById('registerForm');
    if(registerForm) registerForm.addEventListener('submit', handleRegister);

    const editForm = document.getElementById('editForm');
    if(editForm) editForm.addEventListener('submit', handleEdit);

    // Нотификации (Камбанка)
    const notificationBell = document.getElementById('notificationBell');
    const notificationDropdown = document.getElementById('notificationDropdown');
    if(notificationBell && notificationDropdown) {
        notificationBell.addEventListener('click', () => {
            notificationDropdown.style.display = notificationDropdown.style.display === 'block' ? 'none' : 'block';
        });
    }

    // Logout Модал
    const logoutBtn = document.querySelector('.logout-btn a');
    const logoutModal = document.getElementById('logoutModal');
    const cancelLogout = document.getElementById('cancelLogout');
    const confirmLogout = document.getElementById('confirmLogout');

    if(logoutBtn && logoutModal) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            logoutModal.style.display = 'flex';
        });
    }
    if(cancelLogout) cancelLogout.addEventListener('click', () => closeModal('logoutModal'));
    
    if(confirmLogout) {
        confirmLogout.addEventListener('click', () => {
            sessionStorage.removeItem("jwtToken"); // Трием токена
            window.location.href = "login.html";   // Връщаме към логин екрана
        });
    }
}