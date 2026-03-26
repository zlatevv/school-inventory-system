document.addEventListener("DOMContentLoaded", async () => {
    const token = sessionStorage.getItem("jwtToken");
    if (!token) window.location.href = "../login.html";

    try {
        const response = await fetch('http://localhost:9000/api/equipment', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        const tbody = document.getElementById('conditionReportBody');
        // Example: Simple grouping logic
        const categories = [...new Set(data.map(item => item.type || 'Other'))];
        
        categories.forEach(cat => {
            const items = data.filter(i => i.type === cat);
            const row = `<tr>
                <td><strong>${cat}</strong></td>
                <td>${items.filter(i => i.equipmentCondition === 'NEW').length}</td>
                <td>${items.filter(i => i.equipmentCondition === 'GOOD').length}</td>
                <td style="color:red;">${items.filter(i => i.equipmentStatus === 'UNDER_REPAIR').length}</td>
            </tr>`;
            tbody.insertAdjacentHTML('beforeend', row);
        });
    } catch (e) { console.error("Report error", e); }
});