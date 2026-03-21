if (window.location.pathname.includes('equipment_admin.html')) {
    
    const inventory = [
        { id: 1, name: "Epson EB-2250U", category: "Electronics", room: "Room 101", status: "Available", icon: "fa-video" },
        { id: 2, name: "Lenovo ThinkPad X1", category: "Computers", room: "Lab 2", status: "Checked Out", icon: "fa-laptop" },
        { id: 3, name: "Logitech MX Master 3", category: "Accessories", room: "Office", status: "Available", icon: "fa-mouse" },
        { id: 4, name: "Canon EOS R5", category: "Electronics", room: "Studio", status: "Available", icon: "fa-camera" },
        { id: 5, name: "Dell UltraSharp 27", category: "Computers", room: "Library", status: "Under Repair", icon: "fa-desktop" }
    ];

    const grid = document.getElementById('adminEquipmentGrid');
    const bSearchInput = document.getElementById('equipmentSearch');
    const categorySelect = document.getElementById('categorySelect');

    function renderAdminCards(data) {
        if(!grid) return;
        grid.innerHTML = '';
        data.forEach((item, index) => {
            const statusClass = item.status === 'Available' ? 'status-available' : 
                               (item.status === 'Checked Out' ? 'status-light-yellow' : 'status-rejected');
            
            const card = document.createElement('div');
            card.className = 'eq-card';
            card.style.animationDelay = `${index * 0.05}s`;

            card.innerHTML = `
    <div class="eq-card-image">
        <span class="eq-status-tag ${statusClass}">${item.status}</span>
        <i class="fa-solid ${item.icon}"></i>
    </div>
    <div class="eq-card-content">
        <span class="eq-category">${item.category}</span>
        <h3>${item.name}</h3>
        <div class="eq-location"><i class="fa-solid fa-location-dot"></i> ${item.room}</div>
        
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

    // Търсене и Филтър
    function filterAdminData() {
        const searchTerm = bSearchInput.value.toLowerCase();
        const category = categorySelect.value;
        const filtered = inventory.filter(item => {
            return (category === 'all' || item.category === category) && 
                   item.name.toLowerCase().includes(searchTerm);
        });
        renderAdminCards(filtered);
    }

    if (bSearchInput) bSearchInput.addEventListener('input', filterAdminData);
    if (categorySelect) categorySelect.addEventListener('change', filterAdminData);

    renderAdminCards(inventory);
}

// Админ функции
function editItem(id) { alert("Opening edit modal for item ID: " + id); }
function deleteItem(id) { if(confirm("Are you sure you want to delete this asset?")) alert("Deleted!"); }
function addNewItem() { alert("Redirecting to 'Add New Asset' form..."); }

// Logout Modal Logic
const modal = document.getElementById('logoutModal');
const openBtn = document.getElementById('openLogout');
const closeBtn = document.getElementById('cancelLogout');

if(openBtn) openBtn.onclick = () => modal.style.display = 'flex';
if(closeBtn) closeBtn.onclick = () => modal.style.display = 'none';

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

