function toggleForm() {
    const loginBox = document.getElementById('login-box');
    const regBox = document.getElementById('register-box');
    const isLoginVisible = loginBox.style.display !== 'none';
    
    loginBox.style.display = isLoginVisible ? 'none' : 'block';
    regBox.style.display = isLoginVisible ? 'block' : 'none';
}

function checkStrength(password) {
    let strengthScore = 0;
    if (password.length >= 8) strengthScore++;
    if (/[a-z]/.test(password)) strengthScore++;
    if (/[A-Z]/.test(password)) strengthScore++;
    if (/[0-9]/.test(password)) strengthScore++;
    if (/[^a-zA-Z0-9]/.test(password)) strengthScore++;
    
    let strengthMessage = '';
    let color = '';

    if (password.length > 0) {
        if (strengthScore <= 2) { strengthMessage = 'Слаба парола'; color = 'red'; }
        else if (strengthScore <= 4) { strengthMessage = 'Средна парола'; color = 'orange'; }
        else { strengthMessage = 'Силна парола'; color = 'green'; }
    }

    const feedbackElement = document.getElementById('passwordFeedback');
    if (feedbackElement) {
        feedbackElement.innerText = strengthMessage;
        feedbackElement.style.color = color;
    }
}

async function handleLogin() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    // Изчистване на стари грешки
    document.querySelectorAll('.error-message').forEach(el => el.innerText = '');

    try {
        const response = await fetch(`${API_CONFIG.auth}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            sessionStorage.setItem("jwtToken", data.token);
            sessionStorage.setItem("userRole", data.role);
            sessionStorage.setItem("username", username);
            sessionStorage.setItem("userId", data.id);

            window.location.href = (data.role === "ADMIN") ? 'admin.html' : 'user.html';
        } else {
            handleApiErrors(data, 'log');
        }
    } catch (error) {
        console.error("Login error:", error);
        document.getElementById('general-log-error').innerText = "Няма връзка със сървъра.";
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById("reg-username").value;
    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-password").value;

    document.querySelectorAll('.error-message').forEach(el => el.innerText = '');

    try {
        const response = await fetch(`${API_CONFIG.auth}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        if (response.ok) {
            alert("Регистрацията е успешна!");
            toggleForm();
        } else {
            const errors = await response.json();
            handleApiErrors(errors, 'reg');
        }
    } catch (error) {
        document.getElementById('general-reg-error').innerText = "Грешка при регистрация.";
    }
}

// Помощна функция за обработка на грешки от Spring (валидации)
function handleApiErrors(errors, prefix) {
    const generalErrorId = `general-${prefix}-error`;
    if (errors.message) {
        document.getElementById(generalErrorId).innerText = errors.message;
    } else if (typeof errors === 'object') {
        for (const field in errors) {
            const errorElement = document.getElementById(`${prefix}-${field}-error`);
            if (errorElement) errorElement.innerText = errors[field];
        }
    }
}

async function handleLogout() {
    try {
        await fetch(`${API_CONFIG.auth}/logout`, { 
            method: 'POST',
            headers: API_CONFIG.getHeaders()
        });
    } finally {
        sessionStorage.clear();
        window.location.href = 'login.html';
    }
}