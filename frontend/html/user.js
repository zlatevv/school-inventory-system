



// защита на страницата
if(localStorage.getItem("loggedIn")!=="true"){
window.location.href="login.html"
}

// logout
function logout(){

localStorage.removeItem("loggedIn")

window.location.href="login.html"

}
// 1. Смяна на бутона Request при кликване
function requestItem(button) {
    button.innerHTML = '<i class="fa-solid fa-check"></i> Requested';
    button.style.backgroundColor = "#10B981"; // Става зелен
    button.disabled = true;
    button.style.cursor = "default";
    alert("Заявката е изпратена успешно!");
}

// 2. Базово търсене (Филтриране) в списъка с оборудване
const searchInput = document.getElementById('equipSearch');
const equipItems = document.querySelectorAll('.equipment-item');

searchInput.addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    
    equipItems.forEach(item => {
        const title = item.querySelector('h4').innerText.toLowerCase();
        if(title.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
});
// 3. Управление на мобилното меню (Sidebar Toggle)
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.querySelector('.sidebar');

if(menuBtn) {
    menuBtn.addEventListener('click', function(e) {
        e.stopPropagation(); // Спира събитието да се предаде към body
        sidebar.classList.toggle('active');
    });
}

// Затваряне на менюто при клик някъде другаде по екрана
document.addEventListener('click', function(e) {
    if (window.innerWidth <= 768) {
        if (!sidebar.contains(e.target) && e.target !== menuBtn) {
            sidebar.classList.remove('active');
        }
    }
});