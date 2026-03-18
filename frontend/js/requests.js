document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
        window.location.href = "/login.html";
        return;
    }
    loadMyData(token);
})

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
    
    const cancelContainer = document.querySelector(".cancel-request");
    
    if (cancelContainer) {
        const pendingRequests = data.filter(req => req.status === "PENDING");

        if (pendingRequests.length > 0) {
            pendingRequests.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));
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

    listContainer.innerHTML = ""; 
    data.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));

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

async function cancelEquipment(equipmentId) {

    const token = localStorage.getItem("jwtToken");
    console.log("Опитвам се да върна/отменя ID:", equipmentId);

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