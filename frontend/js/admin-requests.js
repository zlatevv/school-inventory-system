async function loadAdminRequests() {
    const token = sessionStorage.getItem("jwtToken");
    if (!token) return;

    try {
        const response = await fetch(`${API_CONFIG.API_BASE_URL}/api/manager/requests`, {
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