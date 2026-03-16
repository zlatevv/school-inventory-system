function toggleForm() {
    const loginBox = document.getElementById('login-box');
    const regBox = document.getElementById('register-box');
    loginBox.style.display = loginBox.style.display === 'none' ? 'block' : 'none';
    regBox.style.display = regBox.style.display === 'none' ? 'block' : 'none';
}

function handleLogin() {
    const u = document.getElementById('login-username').value;
    const p = document.getElementById('login-password').value;

    console.log("Опит за вход с:", u, p); // За проверка в конзолата (F12)

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