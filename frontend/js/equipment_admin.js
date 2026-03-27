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
        const eqRes = await fetch("https://api-gateway-production-d21a.up.railway.app/api/equipment");
        const equipment = await eqRes.json();
        
        // Взимаме заявките (за да намерим кой е взел предмета и кога)
        let token = localStorage.getItem('token');
        if (token === "null" || token === "undefined") token = null;

        let requests = [];
        if (token) {
            const reqRes = await fetch("https://api-gateway-production-d21a.up.railway.app/api/manager/requests", {
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

    if (!data || data.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: gray;">
                <i class="fa-solid fa-box-open" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.3;"></i>
                <p>Няма намерено оборудване.</p>
            </div>`;
        return;
    }

    data.forEach((item, index) => {
        // 1. Определяне на цвят спрямо статуса
        let statusClass = 'status-available';
        const status = (item.equipmentStatus || 'AVAILABLE').toUpperCase();
        
        if (status === 'CHECKED_OUT') statusClass = 'status-light-yellow';
        else if (status === 'RETIRED' || status === 'UNDER_REPAIR' || status === 'DAMAGED') statusClass = 'status-rejected';

        // 2. Форматиране на дати (ако съществуват)
        const dateRange = (item.dateFrom && item.dateTo) 
            ? `${item.dateFrom} - ${item.dateTo}` 
            : 'No active loan';

        const card = document.createElement('div');
        card.className = 'eq-card';
        // Добавяме плавна поява
        card.style.animationDelay = `${index * 0.05}s`;

        card.innerHTML = `
            <div class="eq-card-image">
                <span class="eq-status-tag ${statusClass}">${status.replace('_', ' ')}</span>
                <i class="fa-solid ${item.icon || 'fa-laptop'}"></i>
            </div>
            <div class="eq-card-content">
                <span class="eq-category">${item.category || item.type || 'General'}</span>
                <h3>${item.name || 'Unnamed Item'}</h3>
                
                <div class="eq-info-row">
                    <div class="eq-location">
                        <i class="fa-solid fa-location-dot"></i> 
                        <span>${item.location || 'N/A'}</span>
                    </div>
                    <div class="eq-serial" style="font-size: 0.8rem; color: #94a3b8;">
                        <i class="fa-solid fa-barcode"></i> 
                        <span>${item.serialNumber || 'No ID'}</span>
                    </div>
                </div>
                
                <div class="assignment-info">
                    <div class="user-assigned" title="Assigned User">
                        <i class="fa-solid fa-user-tag"></i>
                        <span>${item.assignedTo || 'Available'}</span>
                    </div>
                    <div class="assignment-dates" title="Loan Period">
                        <i class="fa-solid fa-calendar-days"></i>
                        <span>${dateRange}</span>
                    </div>
                </div>

                <div class="admin-actions">
                    <button class="btn-edit" onclick="editItem(${item.id})" aria-label="Edit Item">
                        <i class="fa-solid fa-pen"></i> Edit
                    </button>
                    <button class="btn-delete" onclick="deleteItem(${item.id})" aria-label="Delete Item">
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
            const response = await fetch(`https://api-gateway-production-d21a.up.railway.app/api/equipment/${id}`, {
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
            const response = await fetch(`https://api-gateway-production-d21a.up.railway.app/api/equipment/${id}`, {
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