document.addEventListener("DOMContentLoaded", () => {
    const savedUsername = localStorage.getItem("username");

    if (savedUsername) {
        document.getElementById("display-username").innerText = savedUsername;
        
        fetchAndDisplayEquipment();
        loadAvailableEquipmentNumber();
    } else {
        window.location.href = "/frontend/html/login.html";
    }
});

async function fetchAndDisplayEquipment() {
    const equipListContainer = document.getElementById('equipList');

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
        const available_equipment = equipmentData.filter(equipment => equipment.equipmentStatus == "AVAILABLE");
        const checked_out_equipment = equipmentData.filter(equipment => equipment.equipmentStatus == "CHECKED_OUT");
        const under_repair_equipment = equipmentData.filter(equipment => equipment.equipmentStatus == "UNDER_REPAIR");
        
        statNumberDivAvailable.innerHTML = available_equipment.length;
        statNumberDivCheckedOut.innerHTML = checked_out_equipment.length;
        statNumberDivUnderRepair.innerHTML = under_repair_equipment.length;

        equipListContainer.innerHTML = '';

        equipmentData.forEach(item => {
            let bgStyle, badgeClass, badgeIcon, badgeText, buttonHtml;

            if (item.equipmentStatus === 'AVAILABLE') {
                bgStyle = '';
                badgeClass = 'status-available';
                badgeIcon = '<i class="fa-solid fa-check"></i>';
                badgeText = 'Available';
                buttonHtml = `<button class="btn btn-primary" onclick="requestItem(${item.id})">Request</button>`;
            
            } else if (item.equipmentStatus === 'RETIRED') {
                bgStyle = 'style="background-color: #F8ECEC;"';
                badgeClass = 'status-rejected';
                badgeIcon = '<i class="fa-solid fa-ban"></i>';
                badgeText = 'Retired';
                buttonHtml = `<button class="btn" style="background-color: #E74C3C; color: white; border:none; border-radius:6px; padding: 8px 16px;" disabled>Retired</button>`;
            
            } else if (item.equipmentStatus === 'UNDER_REPAIR') {
                bgStyle = 'style="background-color: #F9E79F;"'; 
                badgeClass = 'status-pending'; 
                badgeIcon = '<i class="fa-solid fa-wrench"></i>';
                badgeText = 'In Repair';
                buttonHtml = `<button class="btn" style="background-color: #E67E22; color: white; border:none; border-radius:6px; padding: 8px 16px;" disabled>In Repair</button>`;
            
            } else { 
                bgStyle = 'style="background-color: #FFFDE7;"';
                badgeClass = 'status-checkedout';
                badgeIcon = '<i class="fa-solid fa-hand"></i>';
                badgeText = 'Checked Out';
                buttonHtml = `<button class="btn" style="background-color: #F1C40F; border:none; border-radius:6px; padding: 8px 16px;" disabled>Checked Out</button>`;
            }

            const firstWordOfName = item.name.split(' ')[0];
            const imageUrl = item.imageUrl ? item.imageUrl : `https://placehold.co/100x80?text=${firstWordOfName}`;

            const itemHtml = `
                <div class="equipment-item" ${bgStyle}>
                    <img src="${imageUrl}" alt="${item.name}">
                    <div class="equipment-details">
                        <h4>${item.name}</h4>
                        <p>${item.location || 'Storage'}</p>
                        <p>Condition: ${item.condition || 'Good'}</p>
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

async function requestItem(itemId) {
    const jwtToken = localStorage.getItem("jwtToken"); // или "accessToken", "jwt"

    if (!jwtToken) {
        alert("Трябва да влезете в профила си, за да направите заявка!");
        window.location.href = "/frontend/html/login.html"; // Смени с твоя път
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