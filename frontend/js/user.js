/**
 * ==========================================
 * 1. КОНФИГУРАЦИЯ И УТИЛИТИ ФУНКЦИИ
 * ==========================================
 */
const CONFIG = {
    API_BASE: 'http://localhost:9000/api',
    AVATAR_BASE: 'https://placehold.co/40x40/2B8EAD/FFFFFF'
};

// Универсална функция за API заявки (автоматично добавя токена)
async function apiFetch(endpoint, options = {}) {
    const token = sessionStorage.getItem("jwtToken");
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
    };

    const response = await fetch(`${CONFIG.API_BASE}${endpoint}`, { ...options, headers });
    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            alert("Нямате права или сесията е изтекла. Влезте отново.");
            sessionStorage.clear();
            window.location.href = "/frontend/html/login.html";
        }
        throw new Error(`API Error: ${response.status}`);
    }
    
    // Връщаме JSON само ако има съдържание
    const text = await response.text();
    return text ? JSON.parse(text) : {};
}

function getInitials(fullName) {
    if (!fullName) return '';
    const parts = fullName.trim().split(' ');
    let initials = parts[0].charAt(0).toUpperCase();
    if (parts.length > 1) {
        initials += parts[parts.length - 1].charAt(0).toUpperCase();
    }
    return initials;
}

function updateAvatar(fullName) {
    const avatarImg = document.getElementById('user-avatar') || document.querySelector('.user-info img');
    if (avatarImg && fullName) {
        avatarImg.src = `${CONFIG.AVATAR_BASE}?text=${getInitials(fullName)}`;
    }
}

/**
 * ==========================================
 * 2. ГЛОБАЛНА ИНИЦИАЛИЗАЦИЯ (За всяка страница)
 * ==========================================
 */
function initGlobalUI() {
    const username = sessionStorage.getItem('username');
    if (!username || !sessionStorage.getItem('jwtToken')) {
        window.location.href = '../index.html';
        return;
    }

    // 2.1 Попълване на потребителски данни
    document.querySelectorAll('.user-info span, #display-username').forEach(el => el.innerText = username);
    document.querySelectorAll('.welcome-text h1').forEach(el => el.innerText = `Welcome back, ${username}!`);
    document.querySelectorAll('#welcome-msg').forEach(el => el.innerText = `Hello, ${username}`);
    updateAvatar(username);

    // 2.2 Активен таб в менюто
    const currentPage = window.location.pathname.split("/").pop() || "user.html";
    document.querySelectorAll('.nav-item').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === currentPage);
    });

    // 2.3 Мобилно меню
    const menuBtn = document.getElementById('menuBtn');
    const sidebar = document.querySelector('.sidebar');
    if (menuBtn && sidebar) {
        menuBtn.addEventListener('click', e => {
            e.stopPropagation();
            sidebar.classList.toggle('active');
        });
        document.addEventListener('click', e => {
            if (window.innerWidth <= 768 && !sidebar.contains(e.target) && e.target !== menuBtn) {
                sidebar.classList.remove('active');
            }
        });
    }

    // 2.4 Logout Modal
    const logoutModal = document.getElementById('logoutModal');
    document.querySelector('.logout-btn a')?.addEventListener('click', e => {
        e.preventDefault();
        if (logoutModal) logoutModal.style.display = 'flex';
    });
    document.getElementById('confirmLogout')?.addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = '/frontend/html/login.html';
    });
    document.getElementById('cancelLogout')?.addEventListener('click', () => {
        if (logoutModal) logoutModal.style.display = 'none';
    });

    // 2.5 Навигационни бутони (Dashboard)
    document.getElementById('goToBrowse')?.addEventListener('click', () => window.location.href = 'browse_equipment.html');
    document.getElementById('goToRequests')?.addEventListener('click', () => window.location.href = 'my_requests.html');
}

/**
 * ==========================================
 * 3. ЛОГИКА СПОРЕД СТРАНИЦАТА (Page Controllers)
 * ==========================================
 */

// --- BROWSE EQUIPMENT ---
async function initBrowseEquipment() {
    const grid = document.getElementById('equipmentGrid');
    const searchInput = document.getElementById('equipmentSearch') || document.getElementById('equipSearch');
    const categorySelect = document.getElementById('categorySelect');
    let inventory = [];

    async function loadEquipment() {
        try {
            inventory = await apiFetch('/equipment');
            renderCards(inventory);
        } catch (error) {
            if (grid) grid.innerHTML = '<p style="color:red;">Грешка при зареждане на базата данни.</p>';
            console.error(error);
        }
    }

    function renderCards(data) {
        if (!grid) return;
        grid.innerHTML = '';
        
        data.forEach((item, index) => {
            const isAvailable = item.equipmentStatus === 'AVAILABLE';
            const iconClass = item.type?.toLowerCase().includes('computer') ? "fa-laptop" :
                              item.type?.toLowerCase().includes('camera') ? "fa-camera" : "fa-box";

            let statusClass = 'status-rejected', statusText = 'Unavailable', btnHtml = `<button class="btn" disabled style="opacity: 0.5; cursor: not-allowed;">Unavailable</button>`;
            
            if (isAvailable) {
                statusClass = 'status-available'; statusText = 'Available';
                btnHtml = `<button class="btn btn-primary" onclick="requestItemAPI(${item.id})">Reserve Now</button>`;
            } else if (item.equipmentStatus === 'CHECKED_OUT') {
                statusClass = 'status-light-yellow'; statusText = 'Checked Out';
            } else if (item.equipmentStatus === 'UNDER_REPAIR') {
                statusClass = 'status-pending'; statusText = 'Under Repair';
            }

            grid.innerHTML += `
                <div class="eq-card" style="animation-delay: ${index * 0.1}s">
                    <div class="eq-card-image">
                        <span class="eq-status-tag ${statusClass}">${statusText}</span>
                        <i class="fa-solid ${iconClass}"></i>
                    </div>
                    <div class="eq-card-content">
                        <span class="eq-category">${item.type || 'General'}</span>
                        <h3>${item.name}</h3>
                        <div class="eq-details">
                            <span class="eq-location"><i class="fa-solid fa-location-dot"></i> ${item.location || 'Storage'}</span>
                            ${btnHtml}
                        </div>
                    </div>
                </div>
            `;
        });
    }

    function filterData() {
        const term = searchInput?.value.toLowerCase() || '';
        const status = categorySelect?.value.toLowerCase() || 'all';
        const filtered = inventory.filter(item => {
            const matchName = item.name.toLowerCase().includes(term);
            const matchStatus = status === 'all' || (item.equipmentStatus || '').toLowerCase() === status;
            return matchName && matchStatus;
        });
        renderCards(filtered);
    }

    searchInput?.addEventListener('input', filterData);
    categorySelect?.addEventListener('change', filterData);

    loadEquipment();
}

// --- MY REQUESTS ---
async function initMyRequests() {
    const container = document.getElementById('requestsContainer');
    if (!container) return;

    try {
        const data = await apiFetch('/requests');
        
        if (!data || data.length === 0) {
            container.innerHTML = '<p style="color: var(--text-gray);">You have no active requests at the moment.</p>';
            return;
        }

        container.innerHTML = '';
        data.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate)).forEach(req => {
            const dateStr = new Date(req.borrowStartTime || req.createdAt || new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const status = (req.status || 'PENDING').toUpperCase();
            
            let badgeHtml = '', stepperHtml = '', footerBtnHtml = '';

           if (status === 'PENDING') {
                badgeHtml = `<div class="status-badge status-pending">Pending Approval</div>`;
                stepperHtml = `
                    <div class="step completed"><i class="fa-solid fa-check"></i><p>Requested</p></div>
                    <div class="step active"><i class="fa-solid fa-clock"></i><p>Admin Review</p></div>
                    <div class="step"><i class="fa-solid fa-box-open"></i><p>Ready</p></div>
                `;
                footerBtnHtml = `<button class="btn btn-danger-outline" onclick="cancelRequest(${req.id})">Cancel</button>`;
                
            } else if (status === 'APPROVED') {
                badgeHtml = `<div class="status-badge status-approved">Ready for Pickup</div>`;
                stepperHtml = `
                    <div class="step completed"><i class="fa-solid fa-check"></i><p>Approved</p></div>
                    <div class="step active"><i class="fa-solid fa-location-dot"></i><p>${req.equipment?.location || 'Desk'}</p></div>
                    <div class="step"><i class="fa-solid fa-handshake"></i><p>Received</p></div>
                `;
                footerBtnHtml = `<button class="btn btn-primary" onclick="viewDetails(${req.id})">QR Code</button>`;
                
            } else if (status === 'CHECKED_OUT') {
                badgeHtml = `<div class="status-badge status-available" style="background-color: #d1fae5; color: #065f46;">In Possession</div>`;
                stepperHtml = `
                    <div class="step completed"><i class="fa-solid fa-check"></i><p>Approved</p></div>
                    <div class="step completed"><i class="fa-solid fa-check"></i><p>Picked Up</p></div>
                    <div class="step active" style="color: #10B981;"><i class="fa-solid fa-handshake"></i><p>Received</p></div>
                `;
                footerBtnHtml = `<button class="btn" disabled style="opacity: 0.8; background-color: #10B981; color: white; border: none;"><i class="fa-solid fa-check"></i> Equipment Received</button>`;
                
            } else if (status === 'RETURNED') {
                badgeHtml = `<div class="status-badge status-available" style="background-color: #e5e7eb; color: #374151;">Returned</div>`;
                stepperHtml = `
                    <div class="step completed"><i class="fa-solid fa-check"></i><p>Approved</p></div>
                    <div class="step completed"><i class="fa-solid fa-check"></i><p>Used</p></div>
                    <div class="step completed"><i class="fa-solid fa-rotate-left"></i><p>Returned</p></div>
                `;
                footerBtnHtml = `<button class="btn" disabled style="opacity: 0.5;">Completed</button>`;
                
            } else {
                badgeHtml = `<div class="status-badge status-rejected">Rejected</div>`;
                stepperHtml = `<div class="step" style="color: #E74C3C; border-color: #E74C3C;"><i class="fa-solid fa-xmark"></i><p>Declined</p></div>`;
                footerBtnHtml = `<button class="btn" disabled style="opacity: 0.5;">Cannot Proceed</button>`;
            }

            container.innerHTML += `
                <div class="request-card">
                    <div class="req-header">
                        <div class="req-title">
                            <i class="fa-solid fa-box"></i>
                            <div>
                                <h3>${req.equipmentName || 'Equipment'}</h3>
                                <span>ID: #${req.id}</span>
                            </div>
                        </div>
                        ${badgeHtml}
                    </div>
                    <div class="req-body"><div class="status-stepper">${stepperHtml}</div></div>
                    <div class="req-footer">
                        <p><i class="fa-regular fa-calendar"></i> Date: <strong>${dateStr}</strong></p>
                        ${footerBtnHtml}
                    </div>
                </div>
            `;
        });
    } catch (error) {
        container.innerHTML = '<p style="color:red;">Error loading requests.</p>';
    }
}

// --- INBOX ---
async function initInbox() {
    const container = document.getElementById('inboxContainer');
    const search = document.getElementById('inboxSearch');
    
    if (!container) return;

    // 1. Показваме, че зарежда
    container.innerHTML = '<p style="text-align: center; color: var(--text-gray);">Зареждане на съобщения...</p>';

    try {
        const username = sessionStorage.getItem("username");
        const token = sessionStorage.getItem("jwtToken"); // Взимаме токена
        
        if (!username) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-gray);">Моля, излезте от профила си и влезте отново, за да заредите данните.</p>';
            return;
        }
        // 2. Правим директен fetch към бекенда през Gateway-я (порт 9000)
        const response = await fetch(`http://localhost:9000/api/notifications/user/${username}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const notifications = await response.json(); // Парсваме JSON отговора

        if (!notifications || notifications.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-gray); margin-top: 20px;">Нямате нови нотификации.</p>';
            updateBadges(0);
            return;
        }

        container.innerHTML = ''; // Изчистваме "Зареждане..."
        let unreadCount = 0;

        // 3. Обхождаме всяка нотификация и я рисуваме
        notifications.forEach(notif => {
            // Определяме иконата на базата на заглавието
            let iconClass = 'system';
            let iconHtml = '<i class="fa-solid fa-info-circle"></i>';
            
            const titleLower = (notif.title || '').toLowerCase();
            
            if (titleLower.includes('approve') || titleLower.includes('одобрен') || titleLower.includes('approved')) {
                iconClass = 'approved';
                iconHtml = '<i class="fa-solid fa-circle-check"></i>';
            } else if (titleLower.includes('reject') || titleLower.includes('отказан') || titleLower.includes('rejected')) {
                iconClass = 'warning'; 
                iconHtml = '<i class="fa-solid fa-circle-xmark" style="color: #e74c3c;"></i>';
            } else if (titleLower.includes('reminder') || titleLower.includes('напомняне')) {
                iconClass = 'warning';
                iconHtml = '<i class="fa-solid fa-triangle-exclamation"></i>';
            }

            // Форматираме датата (ако бекендът връща дата, напр. createdAt)
            let dateStr = 'Скоро';
            if (notif.createdAt) {
                const dateObj = new Date(notif.createdAt);
                dateStr = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            }

            // Проверяваме дали е прочетено (ако имаш такова поле в базата, напр. isRead)
            const isUnread = notif.isRead === false || notif.read === false ? 'unread' : '';
            if (isUnread) unreadCount++;

            // Сглобяваме HTML-а за конкретната карта
            const cardHtml = `
                <div class="notification-card ${isUnread}" data-id="${notif.id}">
                    <div class="notif-icon ${iconClass}">${iconHtml}</div>
                    <div class="notif-content">
                        <div class="notif-header">
                            <h3>${notif.title}</h3>
                            <span>${dateStr}</span>
                        </div>
                        <p>${notif.message}</p>
                    </div>
                </div>
            `;
            container.innerHTML += cardHtml;
        });

        // 4. Обновяваме брояча в лявото меню
        updateBadges(unreadCount || notifications.length);

        // 5. Активираме търсачката
        if (search) {
            search.addEventListener('input', e => {
                const filter = e.target.value.toLowerCase();
                const cards = container.getElementsByClassName('notification-card');
                Array.from(cards).forEach(card => {
                    const text = card.innerText.toLowerCase();
                    card.style.display = text.includes(filter) ? "flex" : "none";
                });
            });
        }

        // 6. Активираме кликането върху карта (за маркиране като прочетено)
        const drawnCards = container.getElementsByClassName('notification-card');
        Array.from(drawnCards).forEach(card => {
            card.addEventListener('click', async function() {
                if (this.classList.contains('unread')) {
                    this.classList.remove('unread');
                    const notifId = this.getAttribute('data-id');
                    
                    decrementBadge();

                    try {
                         await fetch(`http://localhost:9000/api/notifications/${notifId}/read`, { 
                             method: 'PUT',
                             headers: {
                                 'Authorization': `Bearer ${token}`
                             }
                         });
                    } catch (e) { 
                        console.error("Не успя да се маркира като прочетено", e); 
                    }
                }
            });
        });

    } catch (error) {
        console.error("Грешка при зареждане на нотификациите:", error);
        container.innerHTML = '<p style="color: red; text-align: center;">Възникна грешка при свързването със сървъра.</p>';
    }
}

function updateBadges(count) {
    const badges = document.querySelectorAll('.nav-item .red-badge');
    badges.forEach(b => {
        if (count <= 0) {
            b.style.display = 'none';
        } else {
            b.style.display = 'inline-block';
            b.textContent = count;
        }
    });
}

function decrementBadge() {
    const badges = document.querySelectorAll('.nav-item .red-badge');
    badges.forEach(b => {
        let currentCount = parseInt(b.textContent) || 0;
        let newCount = currentCount - 1;
        if (newCount <= 0) {
            b.style.display = 'none';
        } else {
            b.textContent = newCount;
        }
    });
}

// --- HISTORY ---
function initHistory() {
    const search = document.getElementById('historySearch');
    const rows = document.querySelectorAll('#historyBody tr');
    
    search?.addEventListener('input', e => {
        const filter = e.target.value.toLowerCase();
        rows.forEach(row => {
            row.style.display = row.innerText.toLowerCase().includes(filter) ? '' : 'none';
        });
    });
}

/**
 * ==========================================
 * 4. ГЛОБАЛНИ ФУНКЦИИ (За HTML onclick събития)
 * ==========================================
 */
window.requestItemAPI = async function(itemId) {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 5);

    const pad = n => n.toString().padStart(2, '0');
    const formatStr = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;

    try {
        await apiFetch('/request', {
            method: 'POST',
            body: JSON.stringify({ equipmentId: itemId, borrowStartTime: formatStr(now), borrowEndTime: formatStr(tomorrow) })
        });
        alert("Заявката е изпратена успешно!");
        window.location.reload();
    } catch (error) {
        console.error(error);
        alert("Грешка при заявка! Провери конзолата.");
    }
};

async function cancelRequest(equipmentId) {
    const token = sessionStorage.getItem("jwtToken");

    if (!token) {
        alert("Нямате достъп. Моля, влезте отново.");
        window.location.href = "/login.html";
        return;
    }

    try {
        const result = await fetch(`http://localhost:9000/api/request/${equipmentId}/cancel`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            }
        });
        
        if (result.ok) {
            window.location.reload();
        } else {
            console.error("Грешка при връщане:", result.status);
        }
    } catch (error) {
        console.error("Мрежова грешка:", error);
    }
}

window.viewDetails = function(id) {
    let barcodeModal = document.getElementById('barcodeModal');
    
    if (!barcodeModal) {
        barcodeModal = document.createElement('div');
        barcodeModal.id = 'barcodeModal';
        barcodeModal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(0, 0, 0, 0.6); display: none;
            justify-content: center; align-items: center; z-index: 9999;
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: #fff; padding: 30px; border-radius: 12px;
            text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            max-width: 90%; width: 350px;
        `;

        const title = document.createElement('h3');
        title.innerText = 'Scan Barcode at IT Desk';
        title.style.margin = '0 0 5px 0';
        title.style.color = '#2B8EAD';

        const subtitle = document.createElement('p');
        subtitle.id = 'barcodeSubtitle';
        subtitle.style.margin = '0 0 20px 0';
        subtitle.style.color = '#666';

        // Изображението на Баркода
        const barcodeImg = document.createElement('img');
        barcodeImg.id = 'barcodeImage';
        barcodeImg.style.width = '100%'; 
        barcodeImg.style.height = '100px'; // Баркодовете са по-широки
        barcodeImg.style.marginBottom = '20px';

        const closeBtn = document.createElement('button');
        closeBtn.innerText = 'Close';
        closeBtn.className = 'btn btn-primary';
        closeBtn.style.width = '100%';
        closeBtn.onclick = () => barcodeModal.style.display = 'none';

        modalContent.append(title, subtitle, barcodeImg, closeBtn);
        barcodeModal.appendChild(modalContent);
        document.body.appendChild(barcodeModal);
        
        barcodeModal.addEventListener('click', (e) => {
            if (e.target === barcodeModal) barcodeModal.style.display = 'none';
        });
    }

    const barcodeUrl = `https://barcode.tec-it.com/barcode.ashx?data=REQ-${id}&code=Code128`;
    
    document.getElementById('barcodeImage').src = barcodeUrl;
    document.getElementById('barcodeSubtitle').innerText = `Request #${id}`;
    barcodeModal.style.display = 'flex';
};


/**
 * ==========================================
 * 5. СТАРТИРАНЕ НА ПРИЛОЖЕНИЕТО
 * ==========================================
 */
document.addEventListener('DOMContentLoaded', () => {
    initGlobalUI(); // Зарежда менюта, имена, logout

    const path = window.location.pathname;

    if (path.includes('browse_equipment.html')) {
        initBrowseEquipment();
    } else if (path.includes('my_requests.html')) {
        initMyRequests();
    } else if (path.includes('inbox.html')) {
        initInbox();
    } else if (path.includes('history_user.html')) {
        initHistory();
    } else {
        initBrowseEquipment();
    }
});