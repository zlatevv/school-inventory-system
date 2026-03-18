document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
        // window.location.href = "/login.html"; // Закоментирано, ако тестваш локално
        return;
    }
    loadMyData(token);
})

async function loadMyData(token) {
    const tbodyElement = document.querySelector(".requests-table tbody");
    if (!tbodyElement) return; // Предпазител: спира изпълнението, ако няма таблица на страницата

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
    
    tbodyElement.innerHTML = ""; 

    data.forEach(req => {
        const dateObj = new Date(req.requestDate);
        const formattedDate = dateObj.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });

        let badgeClass = "status-checkedout"; 
        if (req.status === "APPROVED") badgeClass = "status-available"; 
        else if (req.status === "RETURNED") badgeClass = "status-returned"; 
        else if (req.status === "REJECTED") badgeClass = "status-unavailable"; 

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
                <span class="status-badge ${badgeClass}">${req.status}</span>
            </td>
            <td style="text-align: right;">
                ${actionIcon}
            </td>
        `;

        tbodyElement.appendChild(tr);
    });
}
