// --- SIDEBAR ACTIVE LINK ---
const navItems = document.querySelectorAll('.nav-item');

navItems.forEach(item => {
    item.addEventListener('click', function () {
        navItems.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
    });
});

// --- MOBILE SIDEBAR TOGGLE ---
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.querySelector('.sidebar');

if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        sidebar.classList.toggle('active');
    });
}

// --- CLOSE SIDEBAR WHEN CLICK OUTSIDE ---
document.addEventListener('click', function (e) {
    if (window.innerWidth <= 768) {
        if (sidebar && !sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
            sidebar.classList.remove('active');
        }
    }
});

// --- BUTTON ACTIONS (Dashboard Alerts) ---
const actionButtons = document.querySelectorAll('.btn-primary');
actionButtons.forEach(button => {
    button.addEventListener('click', function () {
        const btnText = this.innerText.trim();
        if (btnText === "Manage Inventory") {
            window.location.href = 'catalog.html';
        } else if (btnText === "View All Requests") {
            window.location.href = 'requests.html';
        }
    });
});

// --- LOGOUT MODAL LOGIC ---
const logoutTrigger = document.querySelector('.logout-btn .nav-item');
const logoutModal = document.getElementById('logoutModal');
const confirmLogout = document.getElementById('confirmLogout');
const cancelLogout = document.getElementById('cancelLogout');

if (logoutTrigger && logoutModal) {
    // Open Modal
    logoutTrigger.addEventListener('click', function(e) {
        e.preventDefault(); 
        logoutModal.style.display = 'flex'; 
    });

    // Close Modal (Cancel)
    cancelLogout.addEventListener('click', function() {
        logoutModal.style.display = 'none';
    });

    // Confirm Logout (Redirect)
    confirmLogout.addEventListener('click', function() {
        // Here you would clear your backend session/token
        window.location.href = 'login.html'; 
    });

    // Close if clicking the dark overlay background
    window.addEventListener('click', function(e) {
        if (e.target === logoutModal) {
            logoutModal.style.display = 'none';
        }
    });
}

// NOTIFICATION DROPDOWN LOGIC
const bell = document.getElementById('notificationBell');
const dropdown = document.getElementById('notificationDropdown');

if (bell && dropdown) {
    bell.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent immediate closing
        // Toggle between flex and none
        if (dropdown.style.display === 'flex') {
            dropdown.style.display = 'none';
        } else {
            dropdown.style.display = 'flex';
        }
    });

    // Close the dropdown if you click anywhere else on the screen
    document.addEventListener('click', function(e) {
        if (!dropdown.contains(e.target) && e.target !== bell) {
            dropdown.style.display = 'none';
        }
    });
}

document.addEventListener('click', function(e) {
    const approveBtn = e.target.closest('.approve-btn');
    const rejectBtn = e.target.closest('.reject-btn');

    if (approveBtn || rejectBtn) {
        const row = e.target.closest('tr');
        const action = approveBtn ? "Approve" : "Reject";
        
        if (confirm(`Are you sure you want to ${action} this request?`)) {
            row.style.transition = "all 0.4s ease";
            row.style.opacity = "0";
            row.style.transform = "translateX(20px)";
            
            setTimeout(() => {
                row.remove();
                // Update the sidebar badge count automatically
                updateBadge(); 
            }, 400);
        }
    }
});

document.addEventListener('click', function(e) {
    const deleteBtn = e.target.closest('.delete-btn');
    if (deleteBtn) {
        const row = deleteBtn.closest('tr');
        if (confirm("Are you sure you want to remove this equipment from the system?")) {
            row.style.opacity = '0';
            row.style.transform = 'scale(0.95)';
            setTimeout(() => row.remove(), 300);
        }
    }
});

document.addEventListener('click', function(e) {
    const deleteUserBtn = e.target.closest('.delete-user-btn');
    if (deleteUserBtn) {
        const row = deleteUserBtn.closest('tr');
        const userName = row.querySelector('div[style*="font-weight: 700"]').innerText;
        
        if (confirm(`Are you sure you want to remove ${userName} from the system?`)) {
            row.style.transition = "all 0.3s ease";
            row.style.opacity = '0';
            row.style.transform = 'translateX(-10px)';
            setTimeout(() => row.remove(), 300);
        }
    }
});

