// 1. Смяна на бутона Request при кликване
function requestItem(button) {
    button.innerText = "Requested";
    button.style.backgroundColor = "#27AE60"; // Става зелен
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