function initScanner() {
    const startBtn = document.getElementById('startScannerBtn');
    const scannerDiv = document.getElementById('interactive');
    if (!startBtn || !scannerDiv) return;

    startBtn.addEventListener('click', () => {
        scannerDiv.style.display = 'block';
        Quagga.init({
            inputStream: { name: "Live", type: "LiveStream", target: scannerDiv, constraints: { facingMode: "environment" } },
            decoder: { readers: ["code_128_reader"] }
        }, (err) => {
            if (err) { scannerDiv.style.display = 'none'; return; }
            Quagga.start();
        });

        Quagga.onDetected(async (result) => {
            const code = result.codeResult.code;
            Quagga.stop();
            scannerDiv.style.display = 'none';

            if (code.startsWith("REQ-")) {
                const requestId = code.split("-")[1];
                if (confirm(`Маркиране на заявка ${code} като ПРЕДАДЕНА?`)) {
                    processBarcodeCheckout(requestId);
                }
            }
        });
    });
}

async function processBarcodeCheckout(requestId) {
    const token = sessionStorage.getItem("jwtToken");
    try {
        const response = await fetch(`http://localhost:9000/api/request/${requestId}/checkout`, {
            method: "PUT",
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            alert("Успешно предаване!");
            loadAdminRequests();
            fetchAndDisplayEquipment();
        }
    } catch (error) { console.error("Scanner error:", error); }
}