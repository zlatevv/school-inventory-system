// Намиране на всички бутони с клас btn-primary
const actionButtons = document.querySelectorAll('.btn-primary');

// Добавяне на базова интерактивност (Feedback при кликване)
actionButtons.forEach(button => {
    button.addEventListener('click', function() {
        const btnText = this.innerText.trim();
        
        if (btnText === "Manage Inventory") {
            alert("Отваряне на модула за управление на инвентара...");
        } else if (btnText === "View All Requests") {
            alert("Пренасочване към пълния списък със заявки...");
        } else if (btnText.includes("View Reports")) {
            alert("Зареждане на детайлните справки...");
        }
    });
});

// --- НОВАТА ЛОГИКА ЗА МЕНЮТО (SPA) ---
const navItems = document.querySelectorAll('.nav-item');

const sectionMapping = {
    'nav-dashboard': 'section-dashboard',
    'nav-reports': 'section-reports',
    'nav-settings': 'section-settings'
};

if (navItems.length > 0) {
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault(); 
            
            if (!this.id || !sectionMapping[this.id]) {
                navItems.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
                return; 
            }

            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            const allSections = document.querySelectorAll('.content-section');
            allSections.forEach(sec => sec.style.display = 'none');
            
            const targetSectionId = sectionMapping[this.id];
            if (targetSectionId) {
                const targetElement = document.getElementById(targetSectionId);
                if (targetElement) {
                    targetElement.style.display = 'block';
                }
            }
        });
    });
}
