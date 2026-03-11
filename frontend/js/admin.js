// Намиране на всички бутони с клас btn-primary
const actionButtons = document.querySelectorAll('.btn-primary');

// Добавяне на базова интерактивност (Feedback при кликване)
actionButtons.forEach(button => {
    button.addEventListener('click', function() {
        // Проверяваме текста на бутона, за да покажем съответното съобщение
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

// Ефект за страничното меню (Sidebar) - добавяне на активен клас при клик
const navItems = document.querySelectorAll('.nav-item');

navItems.forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault(); // Спира презареждането на страницата (тъй като линковете са с href="#")
        
        // Премахваме active от всички
        navItems.forEach(nav => nav.classList.remove('active'));
        
        // Добавяме active на кликнатия
        this.classList.add('active');
    });
});