let inventoryData = [];

document.addEventListener('DOMContentLoaded', () => {
    // 1. Закачаме слушатели за търсачката и филтъра
    const searchInput = document.getElementById('equipmentSearch');
    const categorySelect = document.getElementById('categorySelect');

    if (searchInput) searchInput.addEventListener('input', filterCatalog);
    if (categorySelect) categorySelect.addEventListener('change', filterCatalog);

    // 2. Изтегляме данните от бекенда
    loadEquipmentCatalog();
    
    // 3. Закачаме логиката за Logout прозореца
    initLogoutModal();

    // 4. ИНИЦИАЛИЗИРАМЕ МОДАЛА ЗА РЕДАКЦИЯ (Това оправя проблема със Save бутона!)
    initEditModal();
});

// --- ИЗТЕГЛЯНЕ И ОБЕДИНЯВАНЕ НА ДАННИТЕ ---
async function loadEquipmentCatalog() {
    const grid = document.getElementById('adminEquipmentGrid');
    if (!grid) return;
    grid.innerHTML = '<p>Зареждане на инвентара...</p>';

    try {
        // Взимаме инвентара
        const eqRes = await fetch("http://localhost:9000/api/equipment");
        const equipment = await eqRes.json();
        
        // Взимаме заявките (за да намерим кой е взел предмета и кога)
        let token = localStorage.getItem('token');
        if (token === "null" || token === "undefined") token = null;

        let requests = [];
        if (token) {
            const reqRes = await fetch("http://localhost:9000/api/manager/requests", {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (reqRes.ok) requests = await reqRes.json();
        }

        // Обединяваме двете неща
        inventoryData = equipment.map(item => {
            const activeRequest = requests.find(req => 
                req.equipmentId === item.id && 
                (req.status === 'APPROVED' || req.status === 'CHECKED_OUT') 
            );

            return {
                ...item,
                assignedTo: activeRequest ? activeRequest.username : null,
                dateFrom: activeRequest ? activeRequest.startDate : null,
                dateTo: activeRequest ? activeRequest.endDate : null
            };
        });

        // Показваме ги на екрана
        renderCards(inventoryData);
    } catch (error) {
        console.error("Грешка при зареждане на данните:", error);
        grid.innerHTML = '<p style="color:red;">Грешка при връзката със сървъра.</p>';
    }
}

// --- РЕНДЕРИРАНЕ НА КАРТИТЕ ---
function renderCards(data) {
    const grid = document.getElementById('adminEquipmentGrid');
    if (!grid) return;
    grid.innerHTML = '';

    data.forEach((item, index) => {
        // Определяне на цвят спрямо статуса
        let statusClass = 'status-available';
        if (item.equipmentStatus === 'CHECKED_OUT') statusClass = 'status-light-yellow';
        if (item.equipmentStatus === 'RETIRED' || item.equipmentStatus === 'UNDER_REPAIR') statusClass = 'status-rejected';

        const card = document.createElement('div');
        card.className = 'eq-card';
        card.style.animationDelay = `${index * 0.05}s`;

        card.innerHTML = `
            <div class="eq-card-image">
                <span class="eq-status-tag ${statusClass}">${item.equipmentStatus || 'AVAILABLE'}</span>
                <i class="fa-solid ${item.icon || 'fa-box'}"></i>
            </div>
            <div class="eq-card-content">
                <span class="eq-category">${item.category || item.type || ''}</span>
                <h3>${item.name || item.type || 'Неизвестен предмет'}</h3>
                <div class="eq-location"><i class="fa-solid fa-location-dot"></i> ${item.location || 'Склад'}</div>
                
                <div class="assignment-info">
                    <div class="user-assigned">
                        <i class="fa-solid fa-user-tag"></i>
                        <span>${item.assignedTo || 'Available'}</span>
                    </div>
                    <div class="assignment-dates">
                        <i class="fa-solid fa-calendar-days"></i>
                        <span>${item.dateFrom || '-'} to ${item.dateTo || '-'}</span>
                    </div>
                </div>

                <div class="admin-actions">
                    <button class="btn-edit" onclick="editItem(${item.id})">
                        <i class="fa-solid fa-pen"></i> Edit
                    </button>
                    <button class="btn-delete" onclick="deleteItem(${item.id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// --- ТЪРСЕНЕ И ФИЛТРИРАНЕ ---
function filterCatalog() {
    const searchInput = document.getElementById('equipmentSearch');
    const categorySelect = document.getElementById('categorySelect');

    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const selectedStatus = categorySelect ? categorySelect.value.toLowerCase() : 'all';

    const filtered = inventoryData.filter(item => {
        const itemName = (item.name || item.type || '').toLowerCase();
        const matchesSearch = itemName.includes(searchTerm);
        
        const itemStatus = (item.equipmentStatus || '').toLowerCase();
        const matchesStatus = (selectedStatus === 'all') || (itemStatus === selectedStatus);

        return matchesSearch && matchesStatus;
    });

    renderCards(filtered);
}

// --- АДМИН БУТОНИ И РЕДАКЦИЯ ---
function editItem(id) {
    const item = inventoryData.find(eq => eq.id === id);
    if (!item) {
        alert("Предметът не е намерен!");
        return;
    }

    document.getElementById('editId').value = item.id;
    document.getElementById('editName').value = item.name || '';
    document.getElementById('editType').value = item.type || '';
    document.getElementById('editSerial').value = item.serialNumber || '';
    document.getElementById('editCondition').value = item.equipmentCondition || 'GOOD';
    document.getElementById('editLocation').value = item.location || '';
    document.getElementById('editPhoto').value = item.photoURL || ''; 

    document.getElementById('editModal').style.display = 'flex';
}

function initEditModal() {
    document.getElementById('cancelEdit')?.addEventListener('click', () => {
        document.getElementById('editModal').style.display = 'none';
    });

    document.getElementById('editEquipmentForm')?.addEventListener('submit', async (e) => {
        e.preventDefault(); 

        const id = document.getElementById('editId').value;
        
        const updatedData = {
            name: document.getElementById('editName').value,
            type: document.getElementById('editType').value,
            serialNumber: document.getElementById('editSerial').value,
            condition: document.getElementById('editCondition').value,
            location: document.getElementById('editLocation').value,
            photoUrl: document.getElementById('editPhoto').value
        };

        let token = localStorage.getItem('token');
        if (token === "null" || token === "undefined") token = null;

        try {
            const response = await fetch(`http://localhost:9000/api/equipment/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(updatedData)
            });

            if (response.ok) {
                document.getElementById('editModal').style.display = 'none';
                loadEquipmentCatalog(); 
            } else {
                alert("Грешка при запазване! Сървърът върна код: " + response.status);
            }
        } catch (error) {
            console.error("Грешка при изпращане:", error);
            alert("Грешка при връзката със сървъра!");
        }
    });
}

// --- ТРИЕНЕ НА ПРЕДМЕТ ---
async function deleteItem(id) {
    if (confirm("Сигурни ли сте, че искате да изтриете този предмет?")) {
        let token = localStorage.getItem('token');
        if (token === "null" || token === "undefined") token = null;

        try {
            const response = await fetch(`http://localhost:9000/api/equipment/${id}`, {
                method: "DELETE",
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });
            
            if (response.ok) {
                window.location.reload(); 
            } else {
                alert("Грешка при изтриване! Код: " + response.status);
            }
        } catch (error) {
            console.error("Мрежова грешка:", error);
            alert("Грешка при връзката със сървъра!");
        }
    }
}

function addNewItem() { 
    alert("Пренасочване към форма за добавяне..."); 
}

// --- LOGOUT ПРОЗОРЕЦ ---
function initLogoutModal() {
    const modal = document.getElementById('logoutModal');
    const openBtn = document.getElementById('openLogout');
    const confirmBtn = document.getElementById('confirmLogout');
    const cancelBtn = document.getElementById('cancelLogout');

    if(openBtn) {
        openBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.style.display = 'flex';
        });
    }
    
    if(cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    if(confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'login.html';
        });
    }
}