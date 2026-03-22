document.addEventListener("DOMContentLoaded", () => {
    const savedUsername = sessionStorage.getItem("username");

    if (savedUsername) {
        const displayEl = document.getElementById("display-username");
        if (displayEl) displayEl.innerText = savedUsername;
        
        updateAvatarWithInitials(savedUsername);
        
        // Първоначално зареждане на данните
        fetchAndDisplayEquipment();
        loadAdminRequests();
        
        if (typeof loadAvailableEquipmentNumber === 'function') {
            loadAvailableEquipmentNumber();
        }
    } else {
        window.location.href = "/frontend/html/login.html";
    }

    // Инициализация на компоненти
    initNavigation();
    initScanner();
    initEditFormListener(); 
    initAddFormListener();
    fetchAndDisplayUsers();
});

/**
 * ==========================================
 * ПОМОЩНИ ФУНКЦИИ (АВАТАР И ИНИЦИАЛИ)
 * ==========================================
 */
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

/**
 * ==========================================
 * ИНВЕНТАР (FETCH, RENDER, DELETE)
 * ==========================================
 */
async function fetchAndDisplayEquipment() {
    const statNumberDivAvailable = document.getElementById("all-items-count");
    const statNumberDivCheckedOut = document.getElementById("checked_out");
    const statNumberDivUnderRepair = document.getElementById("under-repair-equipment");
    const equipListContainer = document.getElementById('equipList');

    if (equipListContainer) {
        equipListContainer.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px;">Зареждане...</td></tr>';
    }

    try {
        const response = await fetch('http://localhost:9000/api/equipment'); 
        if (!response.ok) throw new Error('Failed to fetch equipment');
        
        const equipmentData = await response.json();

        // Обновяване на статистиките
        if (statNumberDivAvailable) statNumberDivAvailable.innerText = equipmentData.filter(item => item.equipmentStatus === "AVAILABLE").length;
        if (statNumberDivCheckedOut) statNumberDivCheckedOut.innerText = equipmentData.filter(item => item.equipmentStatus === 'CHECKED_OUT').length;
        if (statNumberDivUnderRepair) statNumberDivUnderRepair.innerText = equipmentData.filter(item => item.equipmentStatus === 'UNDER_REPAIR').length;

        if (equipListContainer) {
            equipListContainer.innerHTML = '';

            equipmentData.forEach(item => {
                const status = item.equipmentStatus;
                const type = item.type ? item.type.toLowerCase() : '';

                // Логика за Статус Badge
                let badgeClass = 'status-available';
                let badgeText = 'Available';

                if (status === 'CHECKED_OUT') {
                    badgeClass = 'status-pending'; 
                    badgeText = 'On Loan';
                } else if (status === 'UNDER_REPAIR') {
                    badgeClass = 'status-rejected';
                    badgeText = 'Repair';
                } else if (status === 'RETIRED') {
                    badgeClass = 'status-rejected';
                    badgeText = 'Retired';
                }

                // Логика за Икони
                let equipIcon = 'fa-box';
                let iconColorClass = 'laptop';

                if (type.includes('laptop') || type.includes('computer')) {
                    equipIcon = 'fa-laptop';
                    iconColorClass = 'laptop';
                } else if (type.includes('multimedia') || type.includes('camera') || type.includes('whiteboard')) {
                    equipIcon = 'fa-video'; 
                    iconColorClass = 'camera';
                } else if (type.includes('peripheral') || type.includes('mouse')) {
                    equipIcon = 'fa-mouse';
                }

                const itemHtml = `
                    <tr>
                        <td>
                            <div class="equip-info">
                                <div class="equip-icon ${iconColorClass}">
                                    <i class="fa-solid ${equipIcon}"></i>
                                </div>
                                <div>
                                    <div class="equip-name">${item.name}</div>
                                    <div class="equip-serial">SN: ${item.serialNumber || 'N/A'}</div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div class="equip-location">
                                <i class="fa-solid fa-location-dot"></i> ${item.location || 'Storage'}
                            </div>
                            <div class="equip-id-tag">#EQ-${item.id}</div>
                        </td>
                        <td>
                            <span class="status-badge ${badgeClass}">${badgeText}</span>
                        </td>
                        <td>
                            <div class="table-actions">
                                <button class="btn-icon-only edit" onclick="editItem(${item.id})" title="Edit">
                                    <i class="fa-solid fa-pen"></i>
                                </button>
                                <button class="btn-icon-only delete" onclick="deleteItem(${item.id})" title="Delete">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
                equipListContainer.insertAdjacentHTML('beforeend', itemHtml);
            });
        }
    } catch (error) {
        console.error('Error:', error);
        if (equipListContainer) {
            equipListContainer.innerHTML = '<tr><td colspan="4" style="text-align:center; color:red;">Грешка при зареждане.</td></tr>';
        }
    }
}

async function deleteItem(id) {
    if (!confirm("Сигурни ли сте, че искате да изтриете този предмет?")) return;

    const token = sessionStorage.getItem("jwtToken");
    try {
        const response = await fetch(`http://localhost:9000/api/equipment/${id}`, {
            method: "DELETE",
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            fetchAndDisplayEquipment(); // Опресняваме списъка
        } else {
            alert("Грешка при изтриване. Може би предметът е свързан със заявка.");
        }
    } catch (error) {
        console.error("Delete error:", error);
    }
}

/**
 * ==========================================
 * РЕДАКТИРАНЕ (MODAL LOGIC)
 * ==========================================
 */
async function editItem(id) {
    const token = sessionStorage.getItem("jwtToken");
    
    try {
        const response = await fetch(`http://localhost:9000/api/equipment/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Could not fetch item details");

        const item = await response.json();
        console.log("Редактиране на предмет:", item);
        
        // Попълваме модала
        document.getElementById('edit-id').value = item.id;
        document.getElementById('edit-name').value = item.name;
        document.getElementById('edit-serial').value = item.serialNumber || '';
        document.getElementById('edit-location').value = item.location || '';
        document.getElementById('edit-status').value = item.equipmentStatus;
        
        // Тук четем от модела (item), затова е equipmentCondition (или както идва от бекенда)
        // Ако гърми тук, провери в console.log какво точно връща бекендът за състоянието
        document.getElementById('edit-condition').value = item.equipmentCondition; 

        document.getElementById('editModal').style.display = 'flex';
    } catch (error) {
        console.error("Error:", error);
        alert("Грешка при зареждане на данните.");
    }
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

function initEditFormListener() {
    const editForm = document.getElementById('editForm');
    if (!editForm) return;

    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = document.getElementById('edit-id').value;
        const token = sessionStorage.getItem("jwtToken");

        const updatedData = {
            name: document.getElementById('edit-name').value,
            serialNumber: document.getElementById('edit-serial').value,
            location: document.getElementById('edit-location').value,
            equipmentStatus: document.getElementById('edit-status').value,
            condition: document.getElementById('edit-condition').value // ОПРАВЕНО НА 'condition'
        };

        try {
            const response = await fetch(`http://localhost:9000/api/equipment/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(updatedData)
            });

            if (response.ok) {
                closeEditModal();
                fetchAndDisplayEquipment();
            } else {
                alert("Грешка при запис на промените.");
            }
        } catch (error) {
            console.error("Update error:", error);
        }
    });
}

/**
 * ==========================================
 * СЪЗДАВАНЕ НА НОВ ПРЕДМЕТ
 * ==========================================
 */
function openAddModal() {
    document.getElementById('addForm').reset(); // Изчистваме старите данни
    document.getElementById('addModal').style.display = 'flex';
}

function closeAddModal() {
    document.getElementById('addModal').style.display = 'none';
}

function initAddFormListener() {
    const addForm = document.getElementById('addForm');
    if (!addForm) return;

    addForm.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        
        const token = sessionStorage.getItem("jwtToken");

        const newData = {
            name: document.getElementById('add-name').value,
            type: document.getElementById('add-type').value,
            serialNumber: document.getElementById('add-serial').value,
            location: document.getElementById('add-location').value,
            condition: document.getElementById('add-condition').value, // 'condition' заради DTO-то
            photoUrl: document.getElementById('add-photo') ? document.getElementById('add-photo').value : null
        };

        try {
            const response = await fetch(`http://localhost:9000/api/equipment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(newData)
            });

            if (response.ok) {
                closeAddModal();
                fetchAndDisplayEquipment(); 
                alert("Предметът е създаден успешно!");
            } else {
                alert("Грешка при създаване на предмета.");
            }
        } catch (error) {
            console.error("Create error:", error);
        }
    });
}

/**
 * ==========================================
 * ЗАЯВКИ (PENDING REQUESTS)
 * ==========================================
 */
async function loadAdminRequests() {
    const token = sessionStorage.getItem("jwtToken");
    if (!token) return;

    try {
        const response = await fetch("http://localhost:9000/api/manager/requests", {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) return;

        const data = await response.json();
        const pendingRequestsItem = document.getElementById("pending-requests");
        const pendingCount = data.filter(req => req.status === "PENDING").length;
        if (pendingRequestsItem) pendingRequestsItem.innerText = pendingCount;
        
        const sidebarBadge = document.getElementById("sidebar-pending-badge");
        if (sidebarBadge) {
            sidebarBadge.innerText = pendingCount;
            
            if (pendingCount > 0) {
                sidebarBadge.style.display = "inline-block"; 
            } else {
                sidebarBadge.style.display = "none";
            }
        }
        
        data.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));

        const tbodyElement = document.querySelector(".requests-table tbody");
        if (tbodyElement) {
            tbodyElement.innerHTML = ""; 

            if (data.length === 0) {
                tbodyElement.innerHTML = `<tr><td colspan="4" style="text-align:center; color:gray;">No requests found.</td></tr>`;
                return;
            }

            data.forEach(req => {
                const dateObj = new Date(req.requestDate || req.createdAt || new Date());
                const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const status = req.status ? req.status.toUpperCase() : "PENDING";
                
                let tableBadgeClass = "status-pending"; 
                if (status === "APPROVED" || status === "RETURNED") tableBadgeClass = "status-available"; 
                else if (status === "REJECTED") tableBadgeClass = "status-rejected"; 
                else if (status === "CHECKED_OUT") tableBadgeClass = "status-light-yellow";

                let actionHtml = "";
                if (status === "PENDING") {
                    actionHtml = `
                        <button onclick="handleRequestAction(${req.id}, 'APPROVE')" class="action-icon-btn approve" title="Approve"><i class="fa-solid fa-circle-check"></i></button>
                        <button onclick="handleRequestAction(${req.id}, 'REJECT')" class="action-icon-btn reject" title="Reject"><i class="fa-solid fa-circle-xmark"></i></button>
                    `;
                } else if (status === "CHECKED_OUT") {
                    actionHtml = `<button onclick="handleReturnAction(${req.id})" class="action-icon-btn return" title="Return Equipment"><i class="fa-solid fa-rotate-left"></i></button>`;
                } else {
                    actionHtml = `<span style="color: gray;">-</span>`;
                }

                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td><strong>${req.usernameRequesting}</strong><br><small>${formattedDate}</small></td>
                    <td><strong>${req.equipmentName}</strong></td>
                    <td><span class="status-badge ${tableBadgeClass}">${status}</span></td>
                    <td style="text-align: right;">${actionHtml}</td>
                `;
                tbodyElement.appendChild(tr);
            });
        }
    } catch (error) {
        console.error("Requests load error:", error);
    }
}

async function handleRequestAction(requestId, actionType) {
    if(!confirm(`Are you sure you want to ${actionType} request #${requestId}?`)) return;
    const token = sessionStorage.getItem("jwtToken");
    
    try {
        const url = `http://localhost:9000/api/request/${requestId}/${actionType.toLowerCase()}`;
        const response = await fetch(url, {
            method: "PUT",
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            loadAdminRequests();
            fetchAndDisplayEquipment();
        }
    } catch (error) {
        console.error("Action error:", error);
    }
}

async function handleReturnAction(requestId) {
    const condition = prompt("Въведете състояние на върнатата техника:", "Върнато без забележки");
    if (condition === null) return; 

    const token = sessionStorage.getItem("jwtToken");
    try {
        const response = await fetch(`http://localhost:9000/api/request/${requestId}/return?condition=${encodeURIComponent(condition)}`, {
            method: "PUT",
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            alert("Успешно върната техника!");
            loadAdminRequests();
            fetchAndDisplayEquipment();
        }
    } catch (error) {
        console.error("Return error:", error);
    }
}

/**
 * ==========================================
 * НАВИГАЦИЯ И ДРУГИ (SCANNER, LOGOUT)
 * ==========================================
 */
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sectionMapping = {
        'nav-dashboard': 'section-dashboard',
        'nav-catalog': 'section-catalog',
        'nav-pending': 'section-pending',
        'nav-users': 'section-users',
        'nav-reports': 'section-reports',
        'nav-settings': 'section-settings'
    };

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            const targetHref = this.getAttribute('href');
            if (targetHref && targetHref !== '#') return; 
            
            e.preventDefault(); 
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            const targetSectionId = sectionMapping[this.id];
            if (targetSectionId) {
                document.querySelectorAll('.content-section').forEach(sec => sec.style.display = 'none');
                const target = document.getElementById(targetSectionId);
                if (target) target.style.display = 'block';
            }
        });
    });
}

// Logout Logic
const logoutTrigger = document.querySelector('.logout-btn a');
const logoutModal = document.getElementById('logoutModal');
if (logoutTrigger && logoutModal) {
    logoutTrigger.addEventListener('click', (e) => { e.preventDefault(); logoutModal.style.display = 'flex'; });
    document.getElementById('cancelLogout').addEventListener('click', () => logoutModal.style.display = 'none');
    document.getElementById('confirmLogout').addEventListener('click', () => {
        sessionStorage.clear();
        window.location.href = '/frontend/html/login.html';
    });
}

/**
 * БАРКОД СКЕНЕР (Quagga)
 */
function initScanner() {
    const startBtn = document.getElementById('startScannerBtn');
    const scannerDiv = document.getElementById('interactive');
    if (!startBtn || !scannerDiv) return;

    startBtn.addEventListener('click', () => {
        scannerDiv.style.display = 'block';
        Quagga.init({
            inputStream: { name: "Live", type: "LiveStream", target: scannerDiv, constraints: { facingMode: "environment" } },
            decoder: { readers: ["code_128_reader"] }
        }, (err) => {
            if (err) { scannerDiv.style.display = 'none'; return; }
            Quagga.start();
        });

        Quagga.onDetected(async (result) => {
            const code = result.codeResult.code;
            Quagga.stop();
            scannerDiv.style.display = 'none';

            if (code.startsWith("REQ-")) {
                const requestId = code.split("-")[1];
                if (confirm(`Маркиране на заявка ${code} като ПРЕДАДЕНА?`)) {
                    processBarcodeCheckout(requestId);
                }
            }
        });
    });
}

async function processBarcodeCheckout(requestId) {
    const token = sessionStorage.getItem("jwtToken");
    try {
        const response = await fetch(`http://localhost:9000/api/request/${requestId}/checkout`, {
            method: "PUT",
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            alert("Успешно предаване!");
            loadAdminRequests();
            fetchAndDisplayEquipment();
        }
    } catch (error) { console.error("Scanner error:", error); }
}

async function fetchAndDisplayUsers() {
    const usersListContainer = document.getElementById('usersList');
    usersListContainer.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:20px;">Зареждане на потребители...</td></tr>';

    try {
        const token = sessionStorage.getItem("jwtToken"); 
        
        // Правим заявка към новия ни ендпойнт
        const response = await fetch('http://localhost:9000/api/auth/get-all', {
            method: 'GET',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }); 
        
        if (!response.ok) throw new Error('Неуспешно взимане на данните');
        
        const users = await response.json();
        usersListContainer.innerHTML = ''; 

        if(users.length === 0) {
            usersListContainer.innerHTML = '<tr><td colspan="3" style="text-align:center;">Няма намерени потребители в базата.</td></tr>';
            return;
        }

        users.forEach(user => {
            const initials = user.username.substring(0, 2).toUpperCase();
            
            // Ако няма дата, слагаме N/A
            const regDate = user.registeredOn ? user.registeredOn : 'N/A';

            const row = document.createElement('tr');
            row.style.borderBottom = '1px solid #EDF2F7';
            
            row.innerHTML = `
                <td style="padding: 30px 20px;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="width: 45px; height: 45px; background: #E0F2FE; color: #0369A1; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem;">
                            ${initials}
                        </div>
                        <div>
                            <div style="font-weight: 700; color: #1E293B; font-size: 1.05rem;">${user.username}</div>
                            <div style="color: #64748B; font-size: 0.85rem; margin-top: 4px;">${user.email}</div>
                        </div>
                    </div>
                </td>
                <td style="padding: 30px 20px;">
                    <div style="font-weight: 600; color: #475569; margin-bottom: 5px;">${user.role}</div>
                    <div style="color: #94A3B8; font-size: 0.8rem;">Registered: ${regDate}</div>
                </td>
                <td style="padding: 30px 20px; text-align: right;">
                    <div style="display: flex; gap: 10px; justify-content: flex-end;">
                        <button class="btn btn-outline" style="border-color: #E2E8F0; color: #64748B;"><i class="fa-solid fa-user-pen"></i> Edit</button>
                        <button class="btn btn-outline delete-user-btn" style="color: #EF4444; border-color: #FCA5A5;"><i class="fa-solid fa-user-minus"></i></button>
                    </div>
                </td>
            `;
            
            usersListContainer.appendChild(row);
        });

    } catch (error) {
        console.error('Грешка:', error);
        usersListContainer.innerHTML = '<tr><td colspan="3" style="text-align:center; color:red;">Грешка при връзка със сървъра. Провери конзолата.</td></tr>';
    }
}