document.addEventListener('DOMContentLoaded', function() {
    // 1. ПРОВЕРКА ЗА ЛОГИН
    const username = localStorage.getItem('username');
    if (!username) {
        window.location.href = '../index.html';
        return;
    }

    // 2. ИЗПИСВАНЕ НА ИМЕТО
    const nameSpan = document.querySelector('.user-info span');
    const welcomeH1 = document.querySelector('.welcome-text h1');
    const welcomeMsg = document.getElementById('welcome-msg');

    if (nameSpan) nameSpan.innerText = username;
    if (welcomeH1) welcomeH1.innerText = `Welcome back, ${username}!`;
    if (welcomeMsg) welcomeMsg.innerText = "Hello, " + username;

    // 3. АКТИВЕН ТАБ (АВТОМАТИЧНО)
    const currentPage = window.location.pathname.split("/").pop() || "user.html";
    const navLinks = document.querySelectorAll('.nav-item');

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');
        if (currentPage === linkPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // 4. МОБИЛНО МЕНЮ
    const menuBtn = document.getElementById('menuBtn');
    const sidebar = document.querySelector('.sidebar');

    if (menuBtn && sidebar) {
        menuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            sidebar.classList.toggle('active');
        });

        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 768 && !sidebar.contains(e.target) && e.target !== menuBtn) {
                sidebar.classList.remove('active');
            }
        });
    }

    // LOG OUT WINDOW
const logoutTrigger = document.querySelector('.logout-btn a');
const logoutModal = document.getElementById('logoutModal');

if (logoutTrigger && logoutModal) {
    logoutTrigger.addEventListener('click', function(e) {
        e.preventDefault(); 
        logoutModal.style.display = 'flex'; 
    });
}

// Слушатели за бутоните вътре в самия прозорец
document.getElementById('confirmLogout')?.addEventListener('click', () => {
    localStorage.clear();
    window.location.href = '../index.html';
});

document.getElementById('cancelLogout')?.addEventListener('click', () => {
    logoutModal.style.display = 'none'; // Просто затваряме прозореца
});

    // 6. ТЪРСЕНЕ (ако сме на страница с търсачка)
    const searchInput = document.getElementById('equipSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const equipItems = document.querySelectorAll('.equipment-item');
            equipItems.forEach(item => {
                const title = item.querySelector('h4').innerText.toLowerCase();
                item.style.display = title.includes(searchTerm) ? 'flex' : 'none';
            });
        });
    }
});

// Глобална функция за бутона Request
function requestItem(button) {
    button.innerHTML = '<i class="fa-solid fa-check"></i> Requested';
    button.style.backgroundColor = "#10B981";
    button.disabled = true;
    button.style.cursor = "default";
    alert("Заявката е изпратена успешно!");
}

//BROWSE EQUIPMENT
// --- ЛОГИКА ЗА BROWSE EQUIPMENT PAGE ---
// Проверяваме дали сме на правилната страница, за да не дава грешки на другите страници
if (window.location.pathname.includes('browse_equipment.html')) {
    
    const inventory = [
        { id: 1, name: "Epson EB-2250U", category: "Electronics", room: "Room 101", status: "Available", icon: "fa-video", brand: "Epson" },
        { id: 2, name: "Lenovo ThinkPad X1", category: "Computers", room: "Lab 2", status: "Checked Out", icon: "fa-laptop", brand: "Lenovo" },
        { id: 3, name: "Logitech MX Master 3", category: "Accessories", room: "Office", status: "Available", icon: "fa-mouse", brand: "Logitech" },
        { id: 4, name: "Canon EOS R5", category: "Electronics", room: "Studio", status: "Available", icon: "fa-camera", brand: "Canon" },
        { id: 5, name: "Dell UltraSharp 27", category: "Computers", room: "Library", status: "Under Repair", icon: "fa-desktop", brand: "Dell" },
        { id: 6, name: "Blue Yeti Mic", category: "Accessories", room: "Studio", status: "Available", icon: "fa-microphone", brand: "Blue" }
    ];

    const grid = document.getElementById('equipmentGrid');
    const bSearchInput = document.getElementById('equipmentSearch');
    const categorySelect = document.getElementById('categorySelect');

    function renderCards(data) {
        if(!grid) return; // Защита, ако елементът липсва
        grid.innerHTML = '';
        data.forEach((item, index) => {
            const statusClass = item.status === 'Available' ? 'status-available' : 
                               (item.status === 'Checked Out' ? 'status-light-yellow' : 'status-rejected');
            
            const card = document.createElement('div');
            card.className = 'eq-card';
            card.style.animationDelay = `${index * 0.1}s`;

            card.innerHTML = `
                <div class="eq-card-image">
                    <span class="eq-status-tag ${statusClass}">${item.status}</span>
                    <i class="fa-solid ${item.icon}"></i>
                </div>
                <div class="eq-card-content">
                    <span class="eq-category">${item.category}</span>
                    <h3>${item.name}</h3>
                    <div class="eq-details">
                        <span class="eq-location"><i class="fa-solid fa-location-dot"></i> ${item.room}</span>
                        <button class="btn btn-primary" onclick="handleRequest(${item.id})" 
                            ${item.status !== 'Available' ? 'disabled style="filter: grayscale(1); opacity: 0.5;"' : ''}>
                            ${item.status === 'Available' ? 'Reserve Now' : 'Unavailable'}
                        </button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    function filterData() {
        const searchTerm = bSearchInput.value.toLowerCase();
        const category = categorySelect.value;

        const filtered = inventory.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm);
            const matchesCategory = category === 'all' || item.category === category;
            return matchesSearch && matchesCategory;
        });
        renderCards(filtered);
    }

    if (bSearchInput) bSearchInput.addEventListener('input', filterData);
    if (categorySelect) categorySelect.addEventListener('change', filterData);

    // Стартираме рендирането
    renderCards(inventory);
}

// Глобална функция за Alert (извън IF-а, за да е достъпна от HTML-а)
function handleRequest(id) {
    alert(`Request for item ID: ${id} sent to administrator!`);
}

//MY REQUESTS
function cancelRequest(id) {
    if(confirm("Are you sure you want to cancel request #" + id + "?")) {
        alert("Request #" + id + " has been cancelled.");
        // Тук добавете логика за триене от базата
    }
}

function viewDetails(id) {
    alert("Displaying QR Code for Request #" + id + ". Present this at the IT desk.");
}

//DASHBOARD BUTTONS
const browseBtn = document.getElementById('goToBrowse');
const requestsLink = document.getElementById('goToRequests');

if (browseBtn) {
    browseBtn.onclick = () => window.location.href = 'browse_equipment.html';
}

if (requestsLink) {
    requestsLink.onclick = () => window.location.href = 'my_requests.html';
}

//HISTORY
const historySearch = document.getElementById('historySearch');
const historyRows = document.querySelectorAll('#historyBody tr');

if (historySearch) {
    historySearch.addEventListener('input', function(e) {
        const text = e.target.value.toLowerCase();
        
        historyRows.forEach(row => {
            const rowText = row.innerText.toLowerCase();
            row.style.display = rowText.includes(text) ? '' : 'none';
        });
    });
}

// --- ТЪРСЕНЕ В INBOX ---
const inboxSearch = document.getElementById('inboxSearch');
const inboxContainer = document.getElementById('inboxContainer');

if (inboxSearch && inboxContainer) {
    inboxSearch.addEventListener('input', function(e) {
        const filter = e.target.value.toLowerCase();
        const cards = inboxContainer.getElementsByClassName('notification-card');

        Array.from(cards).forEach(card => {
            const title = card.querySelector('h3').innerText.toLowerCase();
            const text = card.querySelector('p').innerText.toLowerCase();
            
            if (title.includes(filter) || text.includes(filter)) {
                card.style.display = "flex";
                card.style.animation = "fadeIn 0.3s ease";
            } else {
                card.style.display = "none";
            }
        });
    });
}