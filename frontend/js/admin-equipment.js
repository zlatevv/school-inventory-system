document.addEventListener("DOMContentLoaded", () => {
    console.log("Checking page elements...");

    // Търсим формите - ако ги няма, просто не стартираме listeners
    const addForm = document.getElementById('addForm');
    const editForm = document.getElementById('editForm');

    const token = sessionStorage.getItem("jwtToken");

    if (!token || userRole !== 'ADMIN') {
        console.warn("Unauthorized access attempt! Redirecting to login...");
        alert("Нямате достъп до тази страница. Моля, влезте като администратор.");
        window.location.replace("login.html"); 
        return;
    }

    if (addForm) {
        console.log("Add form detected - initializing listener");
        initAddFormListener();
    }

    if (editForm) {
        console.log("Edit form detected - initializing listener");
        initEditFormListener();
    }

    if (document.getElementById('equipList')) {
        fetchAndDisplayEquipment();
    }

    refreshEquipmentStats(); 
});
async function refreshEquipmentStats() {
    try {
        const response = await fetch(`${API_CONFIG.API_BASE_URL}/api/equipment`, {
            headers: API_CONFIG.getHeaders()
        });
        const data = await response.json();
        updateEquipmentStats(data);
        console.log("Stats updated successfully");
    } catch (error) {
        console.error("Stats fetch error:", error);
    }
}
async function fetchAndDisplayEquipment() {
    const container = document.getElementById('equipList');
    if (!container) return;

    try {
        const response = await fetch(`${API_CONFIG.API_BASE_URL}/api/equipment`, {
            headers: API_CONFIG.getHeaders()
        });
        const data = await response.json();
        updateEquipmentStats(data);
        
        renderEquipmentTable(data);
    } catch (error) {
        console.log(error);
        
        container.innerHTML = '<tr><td colspan="4" style="color:red;">Грешка при зареждане.</td></tr>';
    }
}

function updateEquipmentStats(data) {
    const total = data.length;
    const checkedOut = data.filter(item => item.equipmentStatus === 'CHECKED_OUT').length;
    const underRepair = data.filter(item => item.equipmentStatus === 'UNDER_REPAIR').length;

    if (document.getElementById("all-items-count")) 
        document.getElementById("all-items-count").innerHTML = `${total} <span>items</span>`;
    
    if (document.getElementById("checked_out")) 
        document.getElementById("checked_out").innerHTML = `${checkedOut} <span>items</span>`;
    
    if (document.getElementById("under-repair-equipment")) 
        document.getElementById("under-repair-equipment").innerHTML = `${underRepair} <span>items</span>`;
}

function renderEquipmentTable(data) {
    const container = document.getElementById('equipList');
    container.innerHTML = data.map(item => `
        <tr>
            <td>
                <div class="equip-info">
                    <div class="equip-name">${item.name}</div>
                    <div class="equip-serial">SN: ${item.serialNumber || 'N/A'}</div>
                </div>
            </td>
            <td>#EQ-${item.id}</td>
            <td><span class="status-badge status-${item.equipmentStatus.toLowerCase()}">${item.equipmentStatus}</span></td>
            <td>
                <button onclick="editItem(${item.id})" class="btn-icon-only edit"><i class="fa-solid fa-pen"></i></button>
                <button onclick="deleteItem(${item.id})" class="btn-icon-only delete"><i class="fa-solid fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

async function deleteItem(id) {
    if (!confirm("Изтриване?")) return;
    const response = await fetch(`${API_CONFIG.API_BASE_URL}/api/equipment/${id}`, {
        method: "DELETE",
        headers: API_CONFIG.getHeaders()
    });
    if (response.ok) fetchAndDisplayEquipment();
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
