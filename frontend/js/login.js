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

function handleLogin() {
    const u = document.getElementById('login-username').value;
    const p = document.getElementById('login-password').value;

    console.log("Опит за вход с:", u, p);

    // ТЕСТОВИ ДАННИ (понеже нямаме бекенд още)
    if (u === "admin" && p === "1234") {
        localStorage.setItem('username', 'Админ Георгиев');
        localStorage.setItem('role', 'ADMIN');
        alert("Успешен вход като Админ!");
        window.location.href = 'admin.html'; 
    } 
    else if (u === "user" && p === "1234") {
        localStorage.setItem('username', 'Иван Иванов');
        localStorage.setItem('role', 'USER');
        alert("Успешен вход като Потребител!");
        window.location.href = 'user.html';
    } 
    else {
        alert("Грешно име или парола! Опитай admin / 1234");
    }
}

async function handleRegister(event) {

    event.preventDefault();

    const username = document.getElementById("reg-username").value;
    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-password").value

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
        const message = await response.text();

        alert(message);
    }
}