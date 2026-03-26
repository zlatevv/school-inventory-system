async function loadAdminRequests() {
    const token = sessionStorage.getItem("jwtToken");
    if (!token) return;

    try {
        const response = await fetch(`${API_CONFIG.API_BASE_URL}/api/manager/requests`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) return;

        const data = await response.json();
        
        // Актуализиране на броячите за чакащи заявки
        const pendingRequestsItem = document.getElementById("pending-requests");
        const pendingCount = data.filter(req => req.status === "PENDING").length;
        if (pendingRequestsItem) pendingRequestsItem.innerText = pendingCount;
        
        const sidebarBadge = document.getElementById("sidebar-pending-badge");
        if (sidebarBadge) {
            sidebarBadge.innerText = pendingCount;
            sidebarBadge.style.display = pendingCount > 0 ? "inline-block" : "none";
        }
        
        // Сортиране по дата (най-новите отгоре)
        data.sort((a, b) => new Date(b.requestDate || b.createdAt) - new Date(a.requestDate || a.createdAt));

        const tbodyElement = document.querySelector(".requests-table tbody");
        if (tbodyElement) {
            tbodyElement.innerHTML = ""; 

            if (data.length === 0) {
                tbodyElement.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 20px; color:gray;">No requests found.</td></tr>`;
                return;
            }

            data.forEach(req => {
                const dateObj = new Date(req.requestDate || req.createdAt || new Date());
                const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const status = req.status ? req.status.toUpperCase() : "PENDING";
                
                // Избор на клас за значката
                let tableBadgeClass = "status-pending"; 
                if (status === "APPROVED" || status === "RETURNED") tableBadgeClass = "status-available"; 
                else if (status === "REJECTED") tableBadgeClass = "status-rejected"; 
                else if (status === "CHECKED_OUT") tableBadgeClass = "status-light-yellow";

                // Логика за бутоните за действие
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
                
                // ТУК СА КЛЮЧОВИТЕ ПРОМЕНИ: добавени data-label и структура за мобилни
                tr.innerHTML = `
                    <td data-label="USER">
                        <strong>${req.usernameRequesting || 'User'}</strong><br>
                        <small style="color: var(--text-gray);">${formattedDate}</small>
                    </td>
                    <td data-label="EQUIPMENT">
                        <strong>${req.equipmentName}</strong>
                    </td>
                    <td data-label="STATUS">
                        <span class="status-badge ${tableBadgeClass}">${status.replace('_', ' ')}</span>
                    </td>
                    <td data-label="ACTIONS" style="text-align: right;">
                        <div class="actions-wrapper">
                            ${actionHtml}
                        </div>
                    </td>
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
    
    console.log("Токенът, който пращам, е:", token);
    if (!token || token === "null" || token === "undefined") return;

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