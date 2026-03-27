/**
 * ==========================================
 * 1. КОНФИГУРАЦИЯ И УТИЛИТИ ФУНКЦИИ
 * ==========================================
 * Тази секция съдържа основните конфигурационни настройки и помощни функции,
 * които се използват в цялото приложение за потребителския интерфейс.
 */
const CONFIG = {
    API_BASE: 'https://api-gateway-production-d21a.up.railway.app/api',  // Основен URL адрес за API заявките към бекенда
    AVATAR_BASE: 'https://placehold.co/40x40/2B8EAD/FFFFFF'  // URL за генериране на аватари с инициали
};

// Универсална функция за API заявки (автоматично добавя токен за автентикация)
async function apiFetch(endpoint, options = {}) {
    // Извличаме JWT токена от sessionStorage за автентикация
    const token = sessionStorage.getItem("jwtToken");

    // Подготвяме headers с Content-Type и Authorization ако има токен
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),  // Добавяме Bearer токен ако съществува
        ...options.headers  // Разрешаваме override на headers от options
    };

    // Изпълняваме fetch заявката към API-то
    const response = await fetch(`${CONFIG.API_BASE}${endpoint}`, { ...options, headers });

    // Проверяваме за грешки в отговора
    if (!response.ok) {
        // Ако е 401 или 403, потребителят няма права или сесията е изтекла
        if (response.status === 401 || response.status === 403) {
            alert("Нямаме права или сесията е изтекла. Влезте отново.");
            sessionStorage.clear();  // Изчистваме всички данни от сесията
            window.location.href = "../login.html";  // Пренасочваме към login страницата
        }
        throw new Error(`API Error: ${response.status}`);  // Хвърляме грешка с HTTP статуса
    }

    // Връщаме JSON само ако има съдържание, иначе празен обект
    const text = await response.text();
    return text ? JSON.parse(text) : {};
}

// Функция за извличане на инициали от пълно име (например "John Doe" -> "JD")
function getInitials(fullName) {
    if (!fullName) return '';  // Ако няма име, връщаме празен string
    const parts = fullName.trim().split(' ');  // Разделяме името на части по интервали
    let initials = parts[0].charAt(0).toUpperCase();  // Първа буква от първото име
    if (parts.length > 1) {
        initials += parts[parts.length - 1].charAt(0).toUpperCase();  // Добавяме първата буква от последното име
    }
    return initials;
}

// Функция за обновяване на аватара с инициали от потребителското име
function updateAvatar(fullName) {
    // Търсим елемента за аватар (може да е img в user-info или друг елемент)
    const avatarImg = document.getElementById('user-avatar') || document.querySelector('.user-info img');
    if (avatarImg && fullName) {
        // Генерираме URL за аватар с инициали чрез placehold.co
        avatarImg.src = `${CONFIG.AVATAR_BASE}?text=${getInitials(fullName)}`;
    }
}

/**
 * ==========================================
 * 2. ГЛОБАЛНА ИНИЦИАЛИЗАЦИЯ (ЗА ВСЯКА СТРАНИЦА)
 * ==========================================
 * Тази функция се извиква при зареждане на всяка страница за потребители.
 * Отговаря за проверка на автентикация, попълване на потребителски данни,
 * активиране на навигацията и мобилното меню.
 */
function initGlobalUI() {
    // Проверяваме дали потребителят е логнат (има username и token)
    const username = sessionStorage.getItem('username');
    if (!username || !sessionStorage.getItem('jwtToken')) {
        window.location.href = '../index.html';  // Пренасочваме към началната страница ако не е логнат
        return;
    }

    // 2.1 Попълване на потребителски данни в UI елементите
    // Обновяваме всички елементи с класове .user-info span, #display-username и др.
    document.querySelectorAll('.user-info span, #display-username').forEach(el => el.innerText = username);
    document.querySelectorAll('.welcome-text h1').forEach(el => el.innerText = `Welcome back, ${username}!`);
    document.querySelectorAll('#welcome-msg').forEach(el => el.innerText = `Hello, ${username}`);
    updateAvatar(username);  // Обновяваме аватара с инициали

    // 2.2 Активен таб в менюто - маркираме текущата страница като активна
    const currentPage = window.location.pathname.split("/").pop() || "user.html";
    document.querySelectorAll('.nav-item').forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === currentPage);
    });

    // 2.3 Мобилно меню - обработка на кликвания за отваряне/затваряне
    const menuBtn = document.getElementById('menuBtn');
    const sidebar = document.querySelector('.sidebar');
    if (menuBtn && sidebar) {
        // Добавяме event listener за бутона на менюто
        menuBtn.addEventListener('click', e => {
            e.stopPropagation();  // Предотвратяваме bubbling на event-а
            sidebar.classList.toggle('active');  // Toggle на класа 'active'
        });
        // Затваряме менюто при клик извън него на мобилни устройства
        document.addEventListener('click', e => {
            if (window.innerWidth <= 768 && !sidebar.contains(e.target) && e.target !== menuBtn) {
                sidebar.classList.remove('active');
            }
        });
    }

    // 2.4 Logout Modal - управление на модалния прозорец за изход
    const logoutModal = document.getElementById('logoutModal');
    // Отваряме модала при клик на logout бутона
    document.querySelector('.logout-btn a')?.addEventListener('click', e => {
        e.preventDefault();  // Предотвратяваме стандартното поведение на линка
        if (logoutModal) logoutModal.style.display = 'flex';
    });
    // Потвърждаваме logout при клик на confirm бутона
    document.getElementById('confirmLogout')?.addEventListener('click', () => {
        sessionStorage.clear();  // Изчистваме всички данни от сесията
        window.location.href = '../login.html';  // Пренасочваме към login
    });
    // Затваряме модала при клик на cancel
    document.getElementById('cancelLogout')?.addEventListener('click', () => {
        if (logoutModal) logoutModal.style.display = 'none';
    });

    // 2.5 Навигационни бутони (Dashboard) - бутони за бърза навигация
    document.getElementById('goToBrowse')?.addEventListener('click', () => window.location.href = 'browse_equipment.html');
    document.getElementById('goToRequests')?.addEventListener('click', () => window.location.href = 'my_requests.html');
}

/**
 * ==========================================
 * 3. ЛОГИКА СПОРЕД СТРАНИЦАТА (Page Controllers)
 * ==========================================
 * Тази секция съдържа специфични функции за всяка страница в потребителския интерфейс.
 * Всяка функция обработва логиката за зареждане и взаимодействие със съответната страница.
 */

// --- BROWSE EQUIPMENT ---
// Функция за инициализация на страницата за разглеждане на оборудване
async function initBrowseEquipment() {
    // DOM елементи за grid и филтри
    const grid = document.getElementById('equipmentGrid');
    const searchInput = document.getElementById('equipmentSearch') || document.getElementById('equipSearch');
    const categorySelect = document.getElementById('categorySelect');
    let inventory = [];  // Масив за съхранение на зареденото оборудване

    // Вътрешна функция за зареждане на оборудване от API-то
    async function loadEquipment() {
        try {
            inventory = await apiFetch('/equipment');  // Зареждаме всички елементи от API-то
            renderCards(inventory);  // Рендерираме картите в grid-а
        } catch (error) {
            // При грешка показваме съобщение в grid-а
            if (grid) grid.innerHTML = '<p style="color:red;">Грешка при зареждане на базата данни.</p>';
            console.error(error);
        }
    }

    // Функция за рендериране на картите с оборудване
    function renderCards(data) {
        if (!grid) return;  // Ако няма grid елемент, излизаме
        grid.innerHTML = '';  // Изчистваме предишното съдържание

        // Обхождаме всеки елемент и създаваме HTML карта
        data.forEach((item, index) => {
            const isAvailable = item.equipmentStatus === 'AVAILABLE';  // Проверяваме дали е налично
            // Определяме иконата според типа оборудване
            const safeItemType = (item.type || '').toLowerCase();
            const iconClass = safeItemType.includes('computer') || safeItemType.includes('laptop') ? "fa-laptop" :
                  safeItemType.includes('camera') ? "fa-camera" : "fa-box";

            // Определяме статус класа и бутона според наличността
            let statusClass = 'status-rejected', statusText = 'Unavailable', btnHtml = `<button class="btn" disabled style="opacity: 0.5; cursor: not-allowed;">Unavailable</button>`;

            if (isAvailable) {
                statusClass = 'status-available'; statusText = 'Available';
                btnHtml = `<button class="btn btn-primary" onclick="requestItemAPI(${item.id})">Reserve Now</button>`;
            } else if (item.equipmentStatus === 'CHECKED_OUT') {
                statusClass = 'status-light-yellow'; statusText = 'Checked Out';
            } else if (item.equipmentStatus === 'UNDER_REPAIR') {
                statusClass = 'status-pending'; statusText = 'Under Repair';
            }

            const visualContent = item.photoURL 
                ? `<img src="${item.photoURL}" alt="${item.name}" class="eq-photo" />`
                : `<i class="fa-solid ${iconClass}"></i>`;

            grid.innerHTML += `
                <div class="eq-card" style="animation-delay: ${index * 0.1}s">
                    <div class="eq-card-image">
                        <span class="eq-status-tag ${statusClass}">${statusText}</span>
                        ${visualContent}
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

    // Функция за филтриране на данните по търсене и статус
    function filterData() {
        const term = searchInput?.value.toLowerCase() || '';  
        const status = categorySelect?.value.toLowerCase() || 'all';  

        const filtered = inventory.filter(item => {
            const safeName = (item.name || '').toLowerCase();
            const safeType = (item.type || '').toLowerCase();
            const safeSerial = (item.serialNumber || '').toLowerCase();

            const matchSearch = safeName.includes(term) || safeType.includes(term) || safeSerial.includes(term);  
            
            const matchStatus = status === 'all' || (item.equipmentStatus || '').toLowerCase() === status;  
            
            return matchSearch && matchStatus;  
        });

        renderCards(filtered);  
    }

    // Добавяме event listeners за търсене и филтриране
    searchInput?.addEventListener('input', filterData);
    categorySelect?.addEventListener('change', filterData);

    loadEquipment();  // Зареждаме оборудването при инициализация
}

// --- MY REQUESTS ---
// Функция за инициализация на страницата с потребителските заявки
async function initMyRequests() {
    const container = document.getElementById('requestsContainer');
    if (!container) return;  // Ако няма контейнер, излизаме

    try {
        const data = await apiFetch('/requests');  // Зареждаме заявките от API-то

        if (!data || data.length === 0) {
            // Ако няма заявки, показваме подходящо съобщение
            container.innerHTML = '<p style="color: var(--text-gray);">You have no active requests at the moment.</p>';
            return;
        }

        container.innerHTML = '';  // Изчистваме контейнера

        // Сортираме заявките по дата (най-новите отгоре) и ги обхождаме
        data.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate)).forEach(req => {
            // Форматираме датата за показване
            const dateStr = new Date(req.borrowStartTime || req.createdAt || new Date()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const status = (req.status || 'PENDING').toUpperCase();  // Нормализираме статуса

            // Определяме badge, stepper и бутон според статуса
            let badgeHtml = '', stepperHtml = '', footerBtnHtml = '';

            if (status === 'PENDING') {
                // Заявката чака одобрение
                badgeHtml = `<div class="status-badge status-pending">Pending Approval</div>`;
                stepperHtml = `
                    <div class="step completed"><i class="fa-solid fa-check"></i><p>Requested</p></div>
                    <div class="step active"><i class="fa-solid fa-clock"></i><p>Admin Review</p></div>
                    <div class="step"><i class="fa-solid fa-box-open"></i><p>Ready</p></div>
                `;
                footerBtnHtml = `<button class="btn btn-danger-outline" onclick="cancelRequest(${req.id})">Cancel</button>`;
            } else if (status === 'APPROVED') {
                // Заявката е одобрена и чака вземане
                badgeHtml = `<div class="status-badge status-approved">Ready for Pickup</div>`;
                stepperHtml = `
                    <div class="step completed"><i class="fa-solid fa-check"></i><p>Approved</p></div>
                    <div class="step active"><i class="fa-solid fa-location-dot"></i><p>${req.equipment?.location || 'Desk'}</p></div>
                    <div class="step"><i class="fa-solid fa-handshake"></i><p>Received</p></div>
                `;
                footerBtnHtml = `<button class="btn btn-primary" onclick="viewDetails(${req.id})">Barcode</button>`;
            } else if (status === 'CHECKED_OUT') {
                // Оборудването е взето
                badgeHtml = `<div class="status-badge status-available" style="background-color: #d1fae5; color: #065f46;">In Possession</div>`;
                stepperHtml = `
                    <div class="step completed"><i class="fa-solid fa-check"></i><p>Approved</p></div>
                    <div class="step completed"><i class="fa-solid fa-check"></i><p>Picked Up</p></div>
                    <div class="step active" style="color: #10B981;"><i class="fa-solid fa-handshake"></i><p>Received</p></div>
                `;
                footerBtnHtml = `<button class="btn" disabled style="opacity: 0.8; background-color: #10B981; color: white; border: none;"><i class="fa-solid fa-check"></i> Equipment Received</button>`;
            } else if (status === 'RETURNED') {
                // Оборудването е върнато
                badgeHtml = `<div class="status-badge status-available" style="background-color: #e5e7eb; color: #374151;">Returned</div>`;
                stepperHtml = `
                    <div class="step completed"><i class="fa-solid fa-check"></i><p>Approved</p></div>
                    <div class="step completed"><i class="fa-solid fa-check"></i><p>Used</p></div>
                    <div class="step completed"><i class="fa-solid fa-rotate-left"></i><p>Returned</p></div>
                `;
                footerBtnHtml = `<button class="btn" disabled style="opacity: 0.5;">Completed</button>`;
            } else {
                // Отхвърлена заявка
                badgeHtml = `<div class="status-badge status-rejected">Rejected</div>`;
                stepperHtml = `<div class="step" style="color: #E74C3C; border-color: #E74C3C;"><i class="fa-solid fa-xmark"></i><p>Declined</p></div>`;
                footerBtnHtml = `<button class="btn" disabled style="opacity: 0.5;">Cannot Proceed</button>`;
            }

            // Създаваме HTML за картата на заявката
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
        // При грешка показваме съобщение за грешка
        container.innerHTML = '<p style="color:red;">Error loading requests.</p>';
    }
}

// --- INBOX ---
// Функция за инициализация на страницата с нотификации (inbox)
async function initInbox() {
    const container = document.getElementById('inboxContainer');
    const search = document.getElementById('inboxSearch');

    if (!container) return;  // Ако няма контейнер, излизаме

    // 1. Показваме, че зарежда - индикатор за зареждане
    container.innerHTML = '<p style="text-align: center; color: var(--text-gray);">Зареждане на съобщения...</p>';

    try {
        const username = sessionStorage.getItem("username");
        const token = sessionStorage.getItem("jwtToken"); // Взимаме токена за автентикация

        if (!username) {
            // Ако няма username, показваме съобщение да се логне отново
            container.innerHTML = '<p style="text-align: center; color: var(--text-gray);">Моля, излезте от профила си и влезте отново, за да заредите данните.</p>';
            return;
        }

        // 2. Правим директен fetch към бекенда през Gateway-я (порт 9000)
        // Използваме директен fetch вместо apiFetch за по-голяма контрол
        const response = await fetch(`https://api-gateway-production-d21a.up.railway.app/api/notifications/user/${username}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`  // Добавяме Bearer токен
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const notifications = await response.json(); // Парсваме JSON отговора

        if (!notifications || notifications.length === 0) {
            // Ако няма нотификации, показваме подходящо съобщение
            container.innerHTML = '<p style="text-align: center; color: var(--text-gray); margin-top: 20px;">Нямаме нови нотификации.</p>';
            updateBadges(0);  // Обновяваме брояча на 0
            return;
        }

        container.innerHTML = ''; // Изчистваме "Зареждане..."
        let unreadCount = 0;  // Брояч за непрочетени нотификации

        // 3. Обхождаме всяка нотификация и я рисуваме като карта
        notifications.forEach(notif => {
            // Определяме иконата на базата на заглавието на нотификацията
            let iconClass = 'system';  // По подразбиране системна икона
            let iconHtml = '<i class="fa-solid fa-info-circle"></i>';

            const titleLower = (notif.title || '').toLowerCase();

            if (titleLower.includes('approve') || titleLower.includes('одобрен') || titleLower.includes('approved')) {
                iconClass = 'approved';
                iconHtml = '<i class="fa-solid fa-circle-check"></i>';  // Икона за одобрение
            } else if (titleLower.includes('reject') || titleLower.includes('отказан') || titleLower.includes('rejected')) {
                iconClass = 'warning';
                iconHtml = '<i class="fa-solid fa-circle-xmark" style="color: #e74c3c;"></i>';  // Икона за отказ
            } else if (titleLower.includes('reminder') || titleLower.includes('напомняне')) {
                iconClass = 'warning';
                iconHtml = '<i class="fa-solid fa-triangle-exclamation"></i>';  // Икона за напомняне
            }

            // Форматираме датата (ако бекендът върне дата, напр. createdAt)
            let dateStr = 'Скоро';  // По подразбиране "Скоро"
            if (notif.createdAt) {
                const dateObj = new Date(notif.createdAt);
                dateStr = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            }

            // Проверяваме дали е прочетено (ако има такова поле в базата, напр. isRead)
            const isUnread = notif.isRead === false || notif.read === false ? 'unread' : '';
            if (isUnread) unreadCount++;  // Увеличаваме брояча за непрочетени

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
            container.innerHTML += cardHtml;  // Добавяме картата към контейнера
        });

        // 4. Обновяваме брояча в лявото меню
        updateBadges(unreadCount || notifications.length);

        // 5. Активираме търсачката - филтриране на нотификациите по текст
        if (search) {
            search.addEventListener('input', e => {
                const filter = e.target.value.toLowerCase();
                const cards = container.getElementsByClassName('notification-card');
                // Показваме/скриваме карти според филтъра
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
                    this.classList.remove('unread');  // Премахваме класа 'unread'
                    const notifId = this.getAttribute('data-id');

                    decrementBadge();  // Намаляваме брояча в менюто

                    try {
                        // Маркираме нотификацията като прочетена в бекенда
                        await fetch(`https://api-gateway-production-d21a.up.railway.app/api/notifications/${notifId}/read`, {
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

// Функция за обновяване на броячите за нотификации в менюто
function updateBadges(count) {
    const badges = document.querySelectorAll('.nav-item .red-badge');  // Намираме всички badge елементи
    badges.forEach(b => {
        if (count <= 0) {
            b.style.display = 'none';  // Скриваме badge ако няма нотификации
        } else {
            b.style.display = 'inline-block';  // Показваме badge
            b.textContent = count;  // Задаваме броя
        }
    });
}

// Функция за намаляване на брояча с 1 (при маркиране като прочетено)
function decrementBadge() {
    const badges = document.querySelectorAll('.nav-item .red-badge');
    badges.forEach(b => {
        let currentCount = parseInt(b.textContent) || 0;  // Взимаме текущия брой
        let newCount = currentCount - 1;  // Намаляваме с 1
        if (newCount <= 0) {
            b.style.display = 'none';  // Скриваме ако стане 0 или по-малко
        } else {
            b.textContent = newCount;  // Обновяваме броя
        }
    });
}

// --- HISTORY ---
// Функция за инициализация на страницата с историята на заявките
async function initHistory() {
    const search = document.getElementById('historySearch');
    const tbody = document.getElementById('historyBody');
    const message = document.getElementById('historyMessage');
    let historyItems = [];  // Масив за съхранение на историята

    if (!tbody) return;  // Ако няма таблица, излизаме

    // Помощни функции за форматиране
    const formatDate = value => {
        if (!value) return '-';  // Ако няма дата, връщаме тире
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric'
        });
    };

    const formatPeriod = item => {
        const start = formatDate(item.borrowStartTime || item.requestDate);
        const end = formatDate(item.borrowEndTime);
        return end === '-' ? start : `${start} - ${end}`;  // Ако няма крайна дата, показваме само началната
    };

    // Функция за определяне на иконата според типа оборудване
    const getIconClass = equipmentName => {
        const value = String(equipmentName || '').toLowerCase();
        if (value.includes('laptop') || value.includes('macbook') || value.includes('computer')) return 'fa-laptop';
        if (value.includes('camera')) return 'fa-camera';
        if (value.includes('projector')) return 'fa-video';
        if (value.includes('tablet') || value.includes('ipad')) return 'fa-tablet-screen-button';
        if (value.includes('phone')) return 'fa-mobile-screen-button';
        if (value.includes('printer')) return 'fa-print';
        return 'fa-box';  // По подразбиране кутия
    };

    // Функция за генериране на статус badge
    const getStatusBadge = status => {
        switch (String(status || '').toUpperCase()) {
            case 'RETURNED':
                return '<span class="status-badge status-approved">Returned</span>';
            case 'CHECKED_OUT':
                return '<span class="status-badge status-available" style="background-color: #d1fae5; color: #065f46;">Checked Out</span>';
            case 'APPROVED':
                return '<span class="status-badge status-approved">Approved</span>';
            case 'PENDING':
                return '<span class="status-badge status-pending">Pending</span>';
            case 'REJECTED':
                return '<span class="status-badge status-rejected">Rejected</span>';
            default:
                return `<span class="status-badge">${status || 'Unknown'}</span>`;
        }
    };

    // Функция за определяне на условието при връщане
    const getConditionLabel = item => {
        if (item.returnCondition) return item.returnCondition;  // Ако има конкретно условие
        return String(item.status || '').toUpperCase() === 'RETURNED' ? 'Returned without notes' : 'Pending return';
    };

    // Функция за escaping на HTML символи за безопасност
    const escapeHtml = value => String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');

    // Функция за обновяване на статистиките
    const updateStats = items => {
        const total = items.length;
        const completed = items.filter(item => String(item.status || '').toUpperCase() === 'RETURNED').length;
        const active = items.filter(item => ['PENDING', 'APPROVED', 'CHECKED_OUT'].includes(String(item.status || '').toUpperCase())).length;
        const completedRate = total ? Math.round((completed / total) * 100) : 0;

        const totalElement = document.getElementById('historyTotalItems');
        const completedElement = document.getElementById('historyCompletedRate');
        const activeElement = document.getElementById('historyActiveItems');

        if (totalElement) totalElement.textContent = total;
        if (completedElement) completedElement.textContent = String(completedRate) + '%';
        if (activeElement) activeElement.textContent = active;
    };

    // Функция за рендериране на редовете в таблицата
    const renderRows = items => {
    const tbody = document.getElementById('historyBody'); // Увери се, че имаш дефиниран tbody
    
    if (!items || !items.length) {
        tbody.innerHTML = '<tr><td colspan="5" style="padding: 24px; text-align: center; color: var(--text-gray);">No history records match your search.</td></tr>';
        return;
    }

    tbody.innerHTML = items.map(item => `
        <tr>
            <td data-label="ITEM" style="padding: 15px;">
                <div class="td-item">
                    <div class="item-icon-small"><i class="fa-solid ${getIconClass(item.equipmentName)}"></i></div>
                    <div>
                        <p class="item-name" style="margin: 0; font-weight: 600;">${escapeHtml(item.equipmentName || 'Equipment')}</p>
                        <p class="item-sub" style="margin: 0; font-size: 11px; color: var(--text-gray);">Request #${item.id}</p>
                    </div>
                </div>
            </td>
            <td data-label="PERIOD" style="padding: 15px;">
                ${escapeHtml(formatPeriod(item))}
            </td>
            <td data-label="CONDITION" style="padding: 15px;">
                <span class="condition-tag">${escapeHtml(getConditionLabel(item))}</span>
            </td>
            <td data-label="STATUS" style="padding: 15px;">
                ${getStatusBadge(item.status)}
            </td>
            <td data-label="ACTIONS" style="padding: 15px;">
                <button class="btn-icon" onclick="downloadHistoryEntry(${item.id})" title="Download history">
                    <i class="fa-solid fa-download"></i>
                </button>
            </td>
        </tr>
    `).join('');
};

    // Функция за прилагане на филтъра
    const applyFilter = () => {
        const filter = String(search?.value || '').trim().toLowerCase();
        const filtered = !filter
            ? historyItems  // Ако няма филтър, показваме всички
            : historyItems.filter(item => {
                const haystack = [
                    item.equipmentName,
                    item.status,
                    item.returnCondition,
                    item.id,
                    formatPeriod(item)
                ].join(' ').toLowerCase();
                return haystack.includes(filter);  // Търсим филтъра в обединения текст
            });

        renderRows(filtered);
        if (message) {
            message.textContent = filter
                ? `Showing ${filtered.length} of ${historyItems.length} history records.`
                : `Loaded ${historyItems.length} history records.`;
        }
    };

    // Функция за сваляне на запис от историята като текст файл
    window.downloadHistoryEntry = function(id) {
        const item = historyItems.find(entry => entry.id === id);
        if (!item) return;

        const lines = [
            `Request ID: ${item.id}`,
            `Equipment: ${item.equipmentName || 'Equipment'}`,
            `Status: ${item.status || 'Unknown'}`,
            `Period: ${formatPeriod(item)}`,
            `Condition: ${getConditionLabel(item)}`,
            `Requested On: ${formatDate(item.requestDate)}`
        ];

        const blob = new Blob([lines.join('\r\n')], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `history-request-${id}.txt`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    };

    try {
        historyItems = await apiFetch('/requests');  // Зареждаме всички заявки
        historyItems.sort((a, b) => new Date(b.requestDate || 0) - new Date(a.requestDate || 0));  // Сортираме по дата
        updateStats(historyItems);  // Обновяваме статистиките
        applyFilter();  // Прилагаме филтъра (първоначално без филтър)
    } catch (error) {
        console.error('History load error:', error);
        tbody.innerHTML = '<tr><td colspan="5" style="padding: 24px; text-align: center; color: #DC2626;">Error loading history from the server.</td></tr>';
        if (message) {
            message.textContent = 'Unable to load history right now.';
            message.style.color = '#DC2626';
        }
    }

    search?.addEventListener('input', applyFilter);  // Добавяме event listener за търсене
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
        alert("Р—Р°СЏРІРєР°С‚Р° Рµ РёР·РїСЂР°С‚РµРЅР° СѓСЃРїРµС€РЅРѕ!");
        window.location.reload();
    } catch (error) {
        console.error(error);
        alert("Р“СЂРµС€РєР° РїСЂРё Р·Р°СЏРІРєР°! РџСЂРѕРІРµСЂРё РєРѕРЅР·РѕР»Р°С‚Р°.");
    }
};

async function cancelRequest(equipmentId) {
    const token = sessionStorage.getItem("jwtToken");

    if (!token) {
        alert("РќСЏРјР°С‚Рµ РґРѕСЃС‚СЉРї. РњРѕР»СЏ, РІР»РµР·С‚Рµ РѕС‚РЅРѕРІРѕ.");
        window.location.href = "../login.html";
        return;
    }

    try {
        const result = await fetch(`https://api-gateway-production-d21a.up.railway.app/api/request/${equipmentId}/cancel`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            }
        });
        
        if (result.ok) {
            window.location.reload();
        } else {
            console.error("Р“СЂРµС€РєР° РїСЂРё РІСЂСЉС‰Р°РЅРµ:", result.status);
        }
    } catch (error) {
        console.error("РњСЂРµР¶РѕРІР° РіСЂРµС€РєР°:", error);
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

        // РР·РѕР±СЂР°Р¶РµРЅРёРµС‚Рѕ РЅР° Р‘Р°СЂРєРѕРґР°
        const barcodeImg = document.createElement('img');
        barcodeImg.id = 'barcodeImage';
        barcodeImg.style.width = '100%'; 
        barcodeImg.style.height = '100px'; // Р‘Р°СЂРєРѕРґРѕРІРµС‚Рµ СЃР° РїРѕ-С€РёСЂРѕРєРё
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
 * 5. РЎРўРђР РўРР РђРќР• РќРђ РџР РР›РћР–Р•РќРР•РўРћ
 * ==========================================
 */
document.addEventListener('DOMContentLoaded', () => {
    initGlobalUI(); // Р—Р°СЂРµР¶РґР° РјРµРЅСЋС‚Р°, РёРјРµРЅР°, logout

    const path = window.location.pathname;

    if (path.includes('browse_equipment.html')) {
        initBrowseEquipment();
    } else if (path.includes('my_requests.html')) {
        initMyRequests();
        setInterval(initMyRequests, 10000);
    } else if (path.includes('inbox.html')) {
        initInbox();
        setInterval(initMyRequests, 10000);
    } else if (path.includes('history_user.html')) {
        initHistory();
    } else {
        initBrowseEquipment();
    }
});
