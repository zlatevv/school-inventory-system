document.addEventListener("DOMContentLoaded", () => {
    const savedUsername = localStorage.getItem("username");

    if (savedUsername) {
        const displayEl = document.getElementById("display-username");
        if (displayEl) displayEl.innerText = savedUsername;
        
        updateAvatarWithInitials(savedUsername);
        
        fetchAndDisplayEquipment();
        loadAdminRequests();
        
        if (typeof loadAvailableEquipmentNumber === 'function') {
            loadAvailableEquipmentNumber();
        }
    } else {
        window.location.href = "/frontend/html/login.html";
    }

    initNavigation();
    initActionButtons();
});

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

async function fetchAndDisplayEquipment() {
    const equipListContainer = document.getElementById('equipList');
    if (!equipListContainer) return; 

    const statNumberDivAvailable = document.getElementById("all-items-count");
    const statNumberDivCheckedOut = document.getElementById("checked_out");
    const statNumberDivUnderRepair = document.getElementById("under-repair-equipment");

    equipListContainer.innerHTML = '<p>Loading equipment...</p>';

    try {
        const response = await fetch('http://localhost:9000/api/equipment'); 
        
        if (!response.ok) {
            throw new Error('Failed to fetch equipment');
        }
        
        const equipmentData = await response.json();
        console.log("Equipment: ", equipmentData);
        
        if (statNumberDivAvailable) statNumberDivAvailable.innerText = equipmentData.filter(item => item.equipmentStatus == "AVAILABLE").length;
        if (statNumberDivCheckedOut) {
            const checkedOutCount = equipmentData.filter(item => item.equipmentStatus == 'CHECKED_OUT').length;
            statNumberDivCheckedOut.innerText = checkedOutCount;
        }
        if (statNumberDivUnderRepair) {
            const underRepairCount = equipmentData.filter(item => item.equipmentStatus == 'UNDER_REPAIR').length;
            statNumberDivUnderRepair.innerText = underRepairCount;
        }
        equipListContainer.innerHTML = '';

        equipmentData.forEach(item => {
            const status = item.equipmentStatus;

            let badgeClass = 'status-available';
            let badgeText = 'Available';
            let badgeIcon = '<i class="fa-solid fa-check"></i>';
            let bgStyle = '';

            if (status === 'CHECKED_OUT') {
                badgeClass = 'status-checkedout';
                badgeText = 'Checked Out';
                badgeIcon = '<i class="fa-solid fa-hand"></i>';
                bgStyle = 'style="background-color: #FFFDE7;"';
            } else if (status === 'UNDER_REPAIR') {
                badgeClass = 'status-pending';
                badgeText = 'Repair';
                badgeIcon = '<i class="fa-solid fa-tools"></i>';
            }

            const buttonHtml = `
                <div class="admin-actions">
                    <button class="btn-icon" onclick="editItem(${item.id})" title="Edit"><i class="fa-solid fa-pen"></i></button>
                    <button class="btn-icon delete" onclick="deleteItem(${item.id})" title="Delete"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;

            const firstWordOfName = item.name.split(' ')[0];
            const imageUrl = item.imageUrl ? item.imageUrl : `https://placehold.co/100x80?text=${firstWordOfName}`;

            const itemHtml = `
                <div class="equipment-item" ${bgStyle}>
                    <img src="${imageUrl}" alt="${item.name}">
                    <div class="equipment-details">
                        <h4>${item.name}</h4>
                        <p><i class="fa-solid fa-location-dot"></i> ${item.location || 'Storage'}</p>
                        <span class="status-badge ${badgeClass}">${badgeIcon} ${badgeText}</span>
                    </div>
                    ${buttonHtml}
                </div>
            `;
            equipListContainer.innerHTML += itemHtml;
        });
    } catch (error) {
        console.error('Error fetching equipment:', error);
        equipListContainer.innerHTML = '<p style="color: red;">Could not load equipment. Is the backend running?</p>';
    }
}

async function requestItemAPI(itemId) {
    const jwtToken = localStorage.getItem("jwtToken"); 

    if (!jwtToken) {
        alert("Трябва да влезете в профила си, за да направите заявка!");
        window.location.href = "/frontend/html/login.html"; 
        return;
    }
    const now = new Date();
    now.setSeconds(now.getSeconds() + 30); 
    
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 5);

    const formatLocalISOString = (date) => {
        const pad = (n) => n.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    const startTimeStr = formatLocalISOString(now);
    const endTimeStr = formatLocalISOString(tomorrow);

    const requestDTO = {
        equipmentId: itemId,
        borrowStartTime: startTimeStr,
        borrowEndTime: endTimeStr
    };

    try {
        const response = await fetch('http://localhost:9000/api/request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwtToken}` 
            },
            body: JSON.stringify(requestDTO)
        });

        if (response.ok) {
            fetchAndDisplayEquipment(); 
            window.location.reload();
        } else {
            const errorText = await response.text();
            console.error("Грешка от сървъра:", errorText);
            
            if (response.status === 403 || response.status === 401) {
                alert("Нямате права или сесията е изтекла. Влезте отново.");
            } else {
                alert("Грешка при заявка! Провери конзолата (F12). Код: " + response.status);
            }
        }
    } catch (error) {
        console.error('Мрежова грешка:', error);
        alert("Възникна проблем със свързването към сървъра.");
    }
}

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

    if (navItems.length > 0) {
        navItems.forEach(item => {
            item.addEventListener('click', function(e) {
                
                const targetHref = this.getAttribute('href');
                
                if (targetHref && targetHref !== '#') {
                    return; 
                }
                e.preventDefault(); 
                
                navItems.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
                
                if (!this.id || !sectionMapping[this.id]) {
                    return; 
                }

                const allSections = document.querySelectorAll('.content-section');
                allSections.forEach(sec => sec.style.display = 'none');
                
                const targetSectionId = sectionMapping[this.id];
                if (targetSectionId) {
                    const targetElement = document.getElementById(targetSectionId);
                    if (targetElement) {
                        targetElement.style.display = 'block';
                    }
                }
            });
        });
    }
}

function initActionButtons() {
    const actionButtons = document.querySelectorAll('.btn-primary');

    actionButtons.forEach(button => {
        if (!button.hasAttribute('onclick')) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                const btnText = this.innerText.trim();
                
                if (btnText === "Manage Inventory") {
                    alert("Отваряне на модула за управление на инвентара...");
                } else if (btnText === "View All Requests") {
                    alert("Пренасочване към пълния списък със заявки...");
                } else if (btnText.includes("View Reports")) {
                    alert("Зареждане на детайлните справки...");
                }
            });
        }
    });
}

async function loadAdminRequests() {
    const token = localStorage.getItem("jwtToken");
    
    if (!token) {
        console.error("Липсва токен! Администраторът не е логнат.");
        return;
    }

    try {
        const response = await fetch("http://localhost:9000/api/manager/requests", {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            }
        });

        if (!response.ok) {
            console.error("Грешка при зареждане на данните:", response.status);
            return;
        }

        const data = await response.json();
        
        data.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));

        const tbodyElement = document.querySelector(".requests-table tbody");
        
        if (tbodyElement) {
            tbodyElement.innerHTML = ""; 

            if (data.length === 0) {
                tbodyElement.innerHTML = `<tr><td colspan="3" style="text-align:center; color:gray;">No requests found.</td></tr>`;
                return;
            }

            data.forEach(req => {
                const dateObj = new Date(req.requestDate || req.createdAt || new Date());
                const formattedDate = dateObj.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                });

                const status = req.status ? req.status.toUpperCase() : "PENDING";
                let tableBadgeClass = "status-pending"; 

                if (status === "APPROVED") tableBadgeClass = "status-approved"; 
                else if (status === "RETURNED") tableBadgeClass = "status-available"; 
                else if (status === "REJECTED") tableBadgeClass = "status-rejected"; 
                else if (status === "CHECKED_OUT") tableBadgeClass = "status-light-yellow";

                let actionHtml = "";
                if (status === "PENDING") {
                    actionHtml = `
                        <button onclick="handleRequestAction(${req.id}, 'APPROVE')" style="color: #10B981; background: none; border: none; font-size: 1.2rem; cursor: pointer; margin-right: 8px;" title="Approve">
                            <i class="fa-solid fa-circle-check"></i>
                        </button>
                        <button onclick="handleRequestAction(${req.id}, 'REJECT')" style="color: #EF4444; background: none; border: none; font-size: 1.2rem; cursor: pointer;" title="Reject">
                            <i class="fa-solid fa-circle-xmark"></i>
                        </button>
                    `;
                } else {
                    actionHtml = `<span style="color: var(--text-gray); font-size: 0.9rem;">-</span>`;
                }

                const requestedBy = req.userName || req.userEmail || "User";

                const tr = document.createElement("tr");
                tr.innerHTML = `
                    <td>
                        <strong><i class="fa-solid fa-box" style="color: var(--text-gray); font-size: 0.8rem; margin-right: 5px;"></i> ${req.equipmentName}</strong> 
                        <br>
                        <small style="color: var(--text-gray);"><i class="fa-solid fa-user" style="margin-right: 3px;"></i> ${requestedBy} &bull; ${formattedDate}</small>
                    </td>
                    <td>
                        <span class="status-badge ${tableBadgeClass}">${status}</span>
                    </td>
                    <td style="text-align: right;">
                        ${actionHtml}
                    </td>
                `;

                tbodyElement.appendChild(tr);
            });
        }

    } catch (error) {
        console.error("Грешка при мрежовата заявка:", error);
    }
}

async function handleRequestAction(requestId, actionType) {
    if(!confirm(`Are you sure you want to ${actionType} request #${requestId}?`)) return;
    
    const token = localStorage.getItem("jwtToken");
    
    switch (actionType) {
        case "APPROVE":
            await fetch(`http://localhost:9000/api/request/${requestId}/approve`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                }
            })
            break;
        case "REJECT":
             await fetch(`http://localhost:9000/api/request/${requestId}/reject`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                }
            })
            break;
    }
    loadAdminRequests(); 
}

// logout
const logoutTrigger = document.querySelector('.logout-btn a');
const logoutModal = document.getElementById('logoutModal');
const confirmBtn = document.getElementById('confirmLogout');
const cancelBtn = document.getElementById('cancelLogout');

if (logoutTrigger && logoutModal) {
    // Отваряне
    logoutTrigger.addEventListener('click', function(e) {
        e.preventDefault(); 
        logoutModal.style.display = 'flex'; 
    });

    // Затваряне при отказ
    cancelBtn.addEventListener('click', () => {
        logoutModal.style.display = 'none';
    });

    // Изход при потвърждение
    confirmBtn.addEventListener('click', () => {
        localStorage.clear(); // Трием всичко (токени, роли)
        window.location.href = '/frontend/html/login.html'; 
    });

    // Затваряне при клик в сивото
    window.addEventListener('click', (e) => {
        if (e.target === logoutModal) logoutModal.style.display = 'none';
    });
}