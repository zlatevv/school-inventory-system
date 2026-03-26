// js/admin-ui.js
document.addEventListener("DOMContentLoaded", () => {
    const savedUsername = sessionStorage.getItem("username");
    if (!savedUsername) {
        window.location.href = "login.html";
        return;
    }

    const token = sessionStorage.getItem("jwtToken");

    if (!token || userRole !== 'ADMIN') {
        console.warn("Unauthorized access attempt! Redirecting to login...");
        alert("Нямате достъп до тази страница. Моля, влезте като администратор.");
        window.location.replace("login.html"); 
        return;
    }

    document.getElementById("display-username").innerText = savedUsername;
    updateAvatarWithInitials(savedUsername);

    initNavigation();
    if (typeof fetchAndDisplayEquipment === 'function') fetchAndDisplayEquipment();
    if (typeof loadAdminRequests === 'function') loadAdminRequests();
    if (typeof fetchAndDisplayUsers === 'function') fetchAndDisplayUsers();
    
    if (document.getElementById('startScannerBtn')) initScanner();
});

function updateAvatarWithInitials(fullName) {
    const initials = fullName.trim().split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    const avatarImg = document.getElementById('user-avatar');
    if (avatarImg) avatarImg.src = `https://placehold.co/40x40/2B8EAD/FFFFFF?text=${initials}`;
}

function initNavigation() {
    const sectionMapping = {
        'nav-dashboard': 'section-dashboard', 'nav-catalog': 'section-catalog',
        'nav-pending': 'section-pending', 'nav-users': 'section-users',
        'nav-reports': 'section-reports', 'nav-settings': 'section-settings'
    };

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            if (this.getAttribute('href') && this.getAttribute('href') !== '#') return;
            e.preventDefault();
            
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            const targetId = sectionMapping[this.id];
            if (targetId) {
                document.querySelectorAll('.content-section').forEach(sec => sec.style.display = 'none');
                document.getElementById(targetId).style.display = 'block';
            }
        });
    });
}

// Logout
const logoutModal = document.getElementById('logoutModal');
document.querySelector('.logout-btn a')?.addEventListener('click', (e) => {
    e.preventDefault();
    logoutModal.style.display = 'flex';
});

document.getElementById('confirmLogout')?.addEventListener('click', () => {
    sessionStorage.clear();
    window.location.href = 'login.html';
});