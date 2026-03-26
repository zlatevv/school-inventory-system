document.addEventListener("DOMContentLoaded", () => {

    const token = sessionStorage.getItem("jwtToken");

    if (!token || userRole !== 'ADMIN') {
        console.warn("Unauthorized access attempt! Redirecting to login...");
        alert("Нямате достъп до тази страница. Моля, влезте като администратор.");
        window.location.replace("login.html"); 
        return;
    }
    
    const savedUsername = sessionStorage.getItem("username");

    if (savedUsername) {
        const displayEl = document.getElementById("display-username");
        if (displayEl) displayEl.innerText = savedUsername;
        
        updateAvatarWithInitials(savedUsername);
        
        // Първоначално зареждане на данните
        fetchAndDisplayEquipment();
        loadAdminRequests();
        
        if (typeof loadAvailableEquipmentNumber === 'function') {
            loadAvailableEquipmentNumber();
        }
    } else {
        window.location.href = "/frontend/html/login.html";
    }

    // Инициализация на компоненти
    initNavigation();
    initScanner();
    initEditFormListener(); 
    initAddFormListener();
    fetchAndDisplayUsers();
});
