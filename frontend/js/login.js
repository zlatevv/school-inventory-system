function toggleForm() {
    const loginBox = document.getElementById('login-box');
    const regBox = document.getElementById('register-box');
    loginBox.style.display = loginBox.style.display === 'none' ? 'block' : 'none';
    regBox.style.display = regBox.style.display === 'none' ? 'block' : 'none';
}
function checkStrength(password) {
    let strengthScore = 0;

    // 1. Проверяваме дължината (минимум 8 символа)
    if (password.length >= 8) {
        strengthScore += 1;
    }
    
    // 2. Проверяваме за малки букви
    if (/[a-z]/.test(password)) {
        strengthScore += 1;
    }
    
    // 3. Проверяваме за главни букви
    if (/[A-Z]/.test(password)) {
        strengthScore += 1;
    }
    
    // 4. Проверяваме за цифри
    if (/[0-9]/.test(password)) {
        strengthScore += 1;
    }
    
    // 5. Проверяваме за специални символи (всичко, което не е буква или цифра)
    if (/[^a-zA-Z0-9]/.test(password)) {
        strengthScore += 1;
    }
    
    let strengthMessage = '';
    let color = '';

    if (password.length === 0) {
        strengthMessage = '';
    } else if (strengthScore <= 2) {
        strengthMessage = 'Слаба парола';
        color = 'red';
    } else if (strengthScore === 3 || strengthScore === 4) {
        strengthMessage = 'Средна парола';
        color = 'orange';
    } else if (strengthScore === 5) {
        strengthMessage = 'Силна парола';
        color = 'green';
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

    const errorMessages = document.querySelectorAll('#login-box .error-message');
    errorMessages.forEach(el => el.innerText = '');

    const response = await fetch("http://localhost:9000/api/auth/login", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username, password: password })
    });

    if (response.ok) {
        const data = await response.json();
        console.log(data);

        localStorage.setItem("jwtToken", data.token);
        localStorage.setItem("userRole", data.role);
        localStorage.setItem("username", username);
        localStorage.setItem("userId", data.id);

        if (data.role == "ADMIN") {
            window.location.href = '/frontend/html/admin.html';
        } else {
            window.location.href = '/frontend/html/user.html';
        }
    } else {
        if (response.status === 400 || response.status === 401 || response.status === 403) {
            try {
                const rawText = await response.text();
                console.log("Отговор от сървъра:", rawText);

                const errors = JSON.parse(rawText);

                if (errors.message) {
                    document.getElementById('general-log-error').innerText = errors.message;
                } 
                else if (typeof errors === 'object' && errors !== null && !errors.timestamp) {
                    for (const field in errors) {
                        const errorElement = document.getElementById(`log-${field}-error`);
                        if (errorElement) {
                            errorElement.innerText = errors[field];
                        }
                    }
                } else {
                    document.getElementById('general-log-error').innerText = "Грешни данни за вход.";
                }

            } catch (e) {
                console.error("Грешка при парсване:", e);
                document.getElementById('general-log-error').innerText = "Грешно потребителско име или парола.";
            }
        } else {
            document.getElementById('general-log-error').innerText = "Възникна неочаквана грешка със сървъра!";
        }
    }
}

async function handleRegister(event) {

    event.preventDefault();

    const username = document.getElementById("reg-username").value;
    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-password").value

    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(el => el.innerText = '');

    const response = await fetch ("http://localhost:9000/api/auth/register", {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify({ username: username, email: email, password: password})
    })

    if (response.ok){
        const message = await response.text();

        alert(message);

        window.location.href = '/frontend/html/login.html'
    } else {
            if (response.status === 400) {
                try {
                    const rawText = await response.text();
                    console.log("Отговор от сървъра:", rawText); 

                    const errors = JSON.parse(rawText);
                    
                    // Проверяваме дали грешките са във формата, който очакваме (ключ-стойност)
                    if (typeof errors === 'object' && errors !== null && !errors.timestamp) {
                        for (const field in errors) {
                            const errorElement = document.getElementById(`reg-${field}-error`);
                            if (errorElement) {
                                errorElement.innerText = errors[field];
                            }
                        }
                    } else {
                        document.getElementById('general-reg-error').innerText = errors.message || "Грешка при валидацията.";
                    }

                } catch (e) {
                    console.error("Грешка при парсване:", e);
                    document.getElementById('general-reg-error').innerText = "Невалидни данни за регистрация (Bad Request).";
                }
            } else {
                document.getElementById('general-reg-error').innerText = "Възникна неочаквана грешка със сървъра!";
            }
    }
}

async function handleLogout() {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userRole");

    await fetch("http://localhost:9000/api/auth/logout", { method: 'POST' })
    window.location.href = '/frontend/html/login.html';
}