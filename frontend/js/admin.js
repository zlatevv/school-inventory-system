document.addEventListener("DOMContentLoaded", () => {
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
<<<<<<< HEAD
});
=======
});
>>>>>>> 70450907762805fcf17aaaf5b515bae2a33b2192
