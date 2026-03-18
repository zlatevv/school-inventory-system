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

    updateAvatarWithInitials(username);

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
    window.location.href = '/frontend/html/index.html';
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

function getInitials(fullName) {
    const nameParts = fullName.trim().split(' ');
    
    let initials = '';

    if (nameParts.length > 0) {
        initials += nameParts[0].charAt(0).toUpperCase();
        
        if (nameParts.length > 1) {
            initials += nameParts[nameParts.length - 1].charAt(0).toUpperCase();
        }
    }

    return initials;
}

function updateAvatarWithInitials(fullName) {
    const initials = getInitials(fullName);
    
    const avatarImg = document.getElementById('user-avatar');

    const newUrl = `https://placehold.co/40x40/2B8EAD/FFFFFF?text=${initials}`;
    
    if (avatarImg) {
        avatarImg.src = newUrl;
    }
}

if (window.location.pathname.includes('browse_equipment.html')) {
    
    let inventory = []; 

    const grid = document.getElementById('equipmentGrid');
    const bSearchInput = document.getElementById('equipmentSearch');
    const categorySelect = document.getElementById('categorySelect');

    async function fetchBrowseEquipment() {
        try {
            const response = await fetch('http://localhost:9000/api/equipment');
            if (!response.ok) throw new Error('Грешка при зареждане на оборудването');
            
            inventory = await response.json();
            renderCards(inventory); 
        } catch (error) {
            console.error("Грешка:", error);
            if (grid) grid.innerHTML = '<p style="color:red;">Грешка при зареждане на базата данни.</p>';
        }
    }

    function renderCards(data) {
        if (!grid) return; 
        grid.innerHTML = '';
        
        data.forEach((item, index) => {
            let statusClass, statusText, buttonHtml;
            
            let iconClass = "fa-box"; 
            if (item.type && item.type.toLowerCase().includes('computer')) iconClass = "fa-laptop";
            else if (item.type && item.type.toLowerCase().includes('camera')) iconClass = "fa-camera";
            else if (item.type && item.type.toLowerCase().includes('accessory')) iconClass = "fa-mouse";

            if (item.equipmentStatus === 'AVAILABLE') {
                statusClass = 'status-available';
                statusText = 'Available';
                buttonHtml = `<button class="btn btn-primary" onclick="requestItem(${item.id})">Reserve Now</button>`;
            
            } else if (item.equipmentStatus === 'CHECKED_OUT') {
                statusClass = 'status-light-yellow'; 
                statusText = 'Checked Out';
                buttonHtml = `<button class="btn" disabled style="filter: grayscale(1); opacity: 0.5; cursor: not-allowed;">Unavailable</button>`;
            
            } else if (item.equipmentStatus === 'UNDER_REPAIR') {
                statusClass = 'status-pending'; 
                statusText = 'Under Repair';
                buttonHtml = `<button class="btn" disabled style="filter: grayscale(1); opacity: 0.5; cursor: not-allowed;">Unavailable</button>`;
            
            } else if (item.equipmentStatus === 'RETIRED') {
                statusClass = 'status-rejected'; 
                statusText = 'Retired';
                buttonHtml = `<button class="btn" disabled style="filter: grayscale(1); opacity: 0.5; cursor: not-allowed;">Unavailable</button>`;
            }

            const card = document.createElement('div');
            card.className = 'eq-card';
            card.style.animationDelay = `${index * 0.1}s`;

            card.innerHTML = `
                <div class="eq-card-image">
                    <span class="eq-status-tag ${statusClass}">${statusText}</span>
                    <i class="fa-solid ${iconClass}"></i>
                </div>
                <div class="eq-card-content">
                    <span class="eq-category">${item.type || 'General'}</span>
                    <h3>${item.name}</h3>
                    <div class="eq-details">
                        <span class="eq-location"><i class="fa-solid fa-location-dot"></i> ${item.location || 'Storage'}</span>
                        ${buttonHtml}
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    function filterData() {
        if (!bSearchInput || !categorySelect) return;
        
        const searchTerm = bSearchInput.value.toLowerCase();
        const selectedStatus = categorySelect.value.toLowerCase(); // Това вече взима статуса (напр. 'available')

        const filtered = inventory.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm);
            
            const itemStatus = item.equipmentStatus ? item.equipmentStatus.toLowerCase() : '';
            const matchesStatus = selectedStatus === 'all' || itemStatus === selectedStatus;
            
            return matchesSearch && matchesStatus;
        });
        
        renderCards(filtered);
    }

    if (bSearchInput) bSearchInput.addEventListener('input', filterData);
    if (categorySelect) categorySelect.addEventListener('change', filterData);

    fetchBrowseEquipment();
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

if (window.location.pathname.includes('my_requests.html')) {
    const requestsContainer = document.getElementById('requestsContainer');

    async function fetchMyRequests() {
        const jwtToken = localStorage.getItem("jwtToken");
        if (!jwtToken) {
            window.location.href = "login.html";
            return;
        }

        try {
            const response = await fetch('http://localhost:9000/api/requests', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${jwtToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Грешка при зареждане на заявките');

            const requestsData = await response.json();
            renderRequests(requestsData);

        } catch (error) {
            console.error("Грешка:", error);
            if (requestsContainer) requestsContainer.innerHTML = '<p style="color:red;">Грешка при връзката със сървъра.</p>';
        }
    }

    function renderRequests(data) {
        if (!requestsContainer) return;
        requestsContainer.innerHTML = '';

        if (data.length === 0) {
            requestsContainer.innerHTML = '<p style="color: var(--text-gray);">You have no active requests at the moment.</p>';
            return;
        }
        data.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));
        
        data.forEach(req => {
            const eqName = req.equipmentName;
            const eqType = req.equipment ? req.equipment.type : '';
            const eqLocation = req.equipment ? req.equipment.location : 'IT Desk';
            
            const dateObj = new Date(req.borrowStartTime || req.createdAt || new Date());
            const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            let iconClass = "fa-box"; 
            if (eqType.toLowerCase().includes('computer') || eqType.toLowerCase().includes('laptop')) iconClass = "fa-laptop";
            else if (eqType.toLowerCase().includes('camera') || eqType.toLowerCase().includes('video')) iconClass = "fa-video";

            let badgeHtml, stepperHtml, footerBtnHtml;
            const status = req.status ? req.status.toUpperCase() : 'PENDING';

            if (status === 'PENDING') {
                badgeHtml = `<div class="status-badge status-pending">Pending Approval</div>`;
                stepperHtml = `
                    <div class="step completed"><i class="fa-solid fa-check"></i><p>Requested</p></div>
                    <div class="step active"><i class="fa-solid fa-clock"></i><p>Admin Review</p></div>
                    <div class="step"><i class="fa-solid fa-box-open"></i><p>Ready</p></div>
                    <div class="step"><i class="fa-solid fa-handshake"></i><p>Received</p></div>
                `;
                footerBtnHtml = `<button class="btn btn-danger-outline" onclick="cancelRequest(${req.id})">Cancel Request</button>`;
            
            } else if (status === 'APPROVED') {
                badgeHtml = `<div class="status-badge status-approved">Ready for Pickup</div>`;
                stepperHtml = `
                    <div class="step completed"><i class="fa-solid fa-check"></i><p>Requested</p></div>
                    <div class="step completed"><i class="fa-solid fa-check"></i><p>Approved</p></div>
                    <div class="step active"><i class="fa-solid fa-location-dot"></i><p>${eqLocation}</p></div>
                    <div class="step"><i class="fa-solid fa-handshake"></i><p>Received</p></div>
                `;
                footerBtnHtml = `<button class="btn btn-primary" onclick="viewDetails(${req.id})">Get QR Code</button>`;
            
            } else if (status === 'REJECTED') {
                badgeHtml = `<div class="status-badge status-rejected">Rejected</div>`;
                stepperHtml = `
                    <div class="step completed"><i class="fa-solid fa-check"></i><p>Requested</p></div>
                    <div class="step" style="color: #E74C3C; border-color: #E74C3C;"><i class="fa-solid fa-xmark"></i><p>Declined</p></div>
                `;
                footerBtnHtml = `<button class="btn" disabled style="cursor: not-allowed; opacity: 0.5;">Cannot Proceed</button>`;
            }

            const card = document.createElement('div');
            card.className = 'request-card';
            card.innerHTML = `
                <div class="req-header">
                    <div class="req-title">
                        <i class="fa-solid ${iconClass}"></i>
                        <div>
                            <h3>${eqName}</h3>
                            <span>Request ID: #${req.id}</span>
                        </div>
                    </div>
                    ${badgeHtml}
                </div>
                
                <div class="req-body">
                    <div class="status-stepper">
                        ${stepperHtml}
                    </div>
                </div>

                <div class="req-footer">
                    <div class="req-info">
                        <p><i class="fa-regular fa-calendar"></i> Date: <strong>${formattedDate}</strong></p>
                    </div>
                    ${footerBtnHtml}
                </div>
            `;
            
            requestsContainer.appendChild(card);
        });
    }
    fetchMyRequests();
}