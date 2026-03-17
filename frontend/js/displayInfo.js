document.addEventListener("DOMContentLoaded", () => {
    const savedUsername = localStorage.getItem("username");

    if (savedUsername) {
        document.getElementById("display-username").innerText = savedUsername;
        
        updateAvatarWithInitials(savedUsername);
        fetchAndDisplayEquipment();
    } else {
        window.location.href = "/frontend/html/login.html";
    }
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
    
    equipListContainer.innerHTML = '<p>Loading equipment...</p>';

    try {
        const response = await fetch('http://localhost:9000/api/equipment'); 
        
        if (!response.ok) {
            throw new Error('Failed to fetch equipment');
        }
        
        const equipmentData = await response.json();

        console.log("Equipment: ", equipmentData);
        
        
        equipListContainer.innerHTML = '';

        equipmentData.forEach(item => {
            
            const isAvailable = item.equipmentStatus === 'AVAILABLE';

            const bgStyle = isAvailable ? '' : 'style="background-color: #FFFDE7;"';
            const badgeClass = isAvailable ? 'status-available' : 'status-checkedout';
            const badgeIcon = isAvailable ? '<i class="fa-solid fa-check"></i>' : '<i class="fa-solid fa-hand"></i>';
            const badgeText = isAvailable ? 'Available' : 'Checked Out';

            let buttonHtml = '';
            if (isAvailable) {
                buttonHtml = `<button class="btn btn-primary" onclick="requestItem(${item.id})">Request</button>`;
            } else {
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
    now.setMinutes(now.getSeconds() + 10); 
    
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