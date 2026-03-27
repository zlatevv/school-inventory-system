document.addEventListener("DOMContentLoaded", async () => {
    const token = sessionStorage.getItem("jwtToken");
    if (!token) {
        window.location.href = "../login.html";
        return;
    }

    try {
        // Зареждаме данните (Equipment)
        const response = await fetch('https://api-gateway-production-d21a.up.railway.app/api/equipment', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error("Грешка при зареждане на оборудването");
        const equipmentData = await response.json();

        // --- 1. КАРТИТЕ СЪС СТАТИСТИКА (Примерна логика) ---
        document.getElementById('total-requests-stat').textContent = equipmentData.length;
        document.getElementById('approved-requests-stat').textContent = 
            equipmentData.filter(i => i.equipmentStatus === 'CHECKED_OUT').length;
        document.getElementById('returned-requests-stat').textContent = 
            equipmentData.filter(i => i.equipmentStatus === 'AVAILABLE').length;

        // --- 2. USAGE REPORT ТАБЛИЦА ---
        const usageBody = document.getElementById('usageReportBody');
        if (usageBody) {
            usageBody.innerHTML = '';
            const categories = [...new Set(equipmentData.map(item => item.type || 'Other'))];
            
            categories.forEach(cat => {
                const items = equipmentData.filter(i => (i.type || 'Other') === cat);
                const countNew = items.filter(i => i.equipmentCondition === 'NEW').length;
                const countGood = items.filter(i => i.equipmentCondition === 'GOOD').length;
                const countRepair = items.filter(i => i.equipmentStatus === 'UNDER_REPAIR').length;

                // Example for the Usage Report Table
const row = `
    <tr>
        <td data-label="Equipment"><strong>${item.name}</strong></td>
        <td data-label="Type">${item.type}</td>
        <td data-label="Total">${item.total}</td>
        <td data-label="Approved">${item.approved}</td>
        <td data-label="Returned">${item.returned}</td>
        <td data-label="Avg Hours">${item.avgHours}</td>
        <td data-label="Last Used">${item.lastUsed}</td>
    </tr>`;
                usageBody.insertAdjacentHTML('beforeend', row);
            });
        }

        // --- 3. BORROWING HISTORY ТАБЛИЦА (Примерна структура) ---
        const historyBody = document.getElementById('historyReportBody');
        if (historyBody) {
            // За момента ще покажем празен стейт или пример
            historyBody.innerHTML = `
                <tr>
                    <td data-label="User">Admin Test</td>
                    <td data-label="Equipment">Laptop Dell</td>
                    <td data-label="Request Date">2023-10-25</td>
                    <td data-label="Start">2023-10-26</td>
                    <td data-label="End">2023-10-30</td>
                    <td data-label="Status"><span class="status-badge status-approved">RETURNED</span></td>
                    <td data-label="Return Date">2023-10-30</td>
                    <td data-label="Condition">Good</td>
                </tr>`;
        }

    } catch (e) { 
        console.error("Report error", e);
    }
});

// Експорт функции (Placeholder)
document.querySelectorAll('[data-export-type]').forEach(btn => {
    btn.addEventListener('click', async () => {
        const type = btn.getAttribute('data-export-type'); // 'usage' or 'history'
        const format = btn.getAttribute('data-export-format'); // 'csv' or 'pdf'
        
        const messageEl = document.getElementById('reportsMessage');
        messageEl.textContent = `Preparing your ${type} report...`;

        try {
            // Adjust this URL to match your Backend Export Controller
            const exportUrl = `https://api-gateway-production-d21a.up.railway.app/api/reports/export?type=${type}&format=${format}`;
            
            const response = await fetch(exportUrl, {
                headers: { 'Authorization': `Bearer ${sessionStorage.getItem("jwtToken")}` }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${type}-report.${format}`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                messageEl.textContent = "Download started successfully.";
            } else {
                throw new Error("Export failed");
            }
        } catch (err) {
            messageEl.textContent = "Error: Could not export data.";
            messageEl.style.color = "#ef4444";
        }
    });
});