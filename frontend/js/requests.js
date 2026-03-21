document.addEventListener("DOMContentLoaded", () => {
    const token = sessionStorage.getItem("jwtToken");
    if (!token) {
        // window.location.href = "/login.html"; // Закоментирано, ако тестваш локално
        return;
    }
    loadMyData(token);
});

async function loadMyData(token) {
    const result = await fetch("http://localhost:9000/api/requests", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        }
    });

    if (!result.ok) {
        console.error("Грешка при зареждане на данните:", result.status);
        return;
    }

    const data = await result.json();
    console.log("Данни от сървъра:", data);
    
    data.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));

    const cancelContainer = document.querySelector(".cancel-request");
    if (cancelContainer) {
        const pendingRequests = data.filter(req => req.status === "PENDING");

        if (pendingRequests.length > 0) {
            const latestPending = pendingRequests[0];
            const cancelInfo = cancelContainer.querySelector(".cancel-info");
            cancelInfo.innerHTML = `<i class="fa-solid fa-box" style="color: var(--text-gray);"></i> ${latestPending.equipmentName}`;

            const cancelBtn = cancelContainer.querySelector(".btn-outline");
            cancelBtn.onclick = () => {
                cancelEquipment(latestPending.id);
            };

            cancelContainer.style.display = "flex"; 
        } else {
            cancelContainer.style.display = "none";
        }
    }
    const listContainer = document.querySelector(".simple-list");
    if (listContainer) {
        listContainer.innerHTML = ""; 
        
        data.forEach(req => {
            let badgeClass = "status-pending"; 
            let badgeIcon = '<i class="fa-regular fa-clock" style="margin-right:4px;"></i>';

            if (req.status === "APPROVED") {
                badgeClass = "status-approved"; 
                badgeIcon = '';
            } else if (req.status === "REJECTED") {
                badgeClass = "status-rejected"; 
                badgeIcon = '';
            } else if (req.status === "RETURNED") {
                badgeClass = "status-available"; 
                badgeIcon = '';
            }

            const listItem = document.createElement("div");
            listItem.className = "simple-list-item";

            listItem.innerHTML = `
                <div class="item-left">
                    <i class="fa-solid fa-box"></i> ${req.equipmentName}
                </div>
                <span class="status-badge ${badgeClass}">${badgeIcon} ${req.status}</span>
            `;

            listContainer.appendChild(listItem);
        });
    }

    const tbodyElement = document.querySelector(".requests-table tbody");
    if (tbodyElement) {
        tbodyElement.innerHTML = ""; 

        data.forEach(req => {
            const dateObj = new Date(req.requestDate);
            const formattedDate = dateObj.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
            });

            // Статуси за таблицата
            let tableBadgeClass = "status-checkedout"; 
            if (req.status === "APPROVED") tableBadgeClass = "status-available"; 
            else if (req.status === "RETURNED") tableBadgeClass = "status-returned"; 
            else if (req.status === "REJECTED") tableBadgeClass = "status-unavailable"; 
            else if (req.status === "PENDING") tableBadgeClass = "status-pending";

            let actionIcon = "";
            if (req.status === "PENDING") {
                actionIcon = `<i class="fa-solid fa-rotate-right" style="color: var(--text-gray); cursor:pointer;"></i>`;
            }

            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>
                    ${req.equipmentName} 
                    <br>
                    <small style="color: var(--text-gray);">${formattedDate}</small>
                </td>
                <td>
                    <span class="status-badge ${tableBadgeClass}">${req.status}</span>
                </td>
                <td style="text-align: right;">
                    ${actionIcon}
                </td>
            `;

            tbodyElement.appendChild(tr);
        });
    }
}

async function cancelEquipment(equipmentId) {
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
            loadMyData(token); 
            window.location.reload();
        } else {
            console.error("Грешка при връщане:", result.status);
        }
    } catch (error) {
        console.error("Мрежова грешка:", error);
    }
}