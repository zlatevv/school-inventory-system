const API_BASE_URL = "http://localhost:9000";

document.addEventListener("DOMContentLoaded", () => {
    const token = sessionStorage.getItem("jwtToken");
    const role = sessionStorage.getItem("userRole");
    const username = sessionStorage.getItem("username");

    if (!token) {
        window.location.href = "html/login.html";
        return;
    }

    if (role !== "ADMIN") {
        window.location.href = "html/user.html";
        return;
    }

    setUserInfo(username);
    initLogout();
    initExportButtons(token);
    loadReports(token);
});

function setUserInfo(username) {
    const displayUsername = document.getElementById("display-username");
    const avatar = document.getElementById("user-avatar");
    const safeUsername = username || "Admin";

    if (displayUsername) {
        displayUsername.innerText = safeUsername;
    }

    if (avatar) {
        const initials = safeUsername
            .trim()
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map(part => part[0].toUpperCase())
            .join("") || "AD";

        avatar.src = `https://placehold.co/40x40/2B8EAD/FFFFFF?text=${initials}`;
    }
}

function initLogout() {
    const logoutLink = document.getElementById("logoutLink");
    if (!logoutLink) {
        return;
    }

    logoutLink.addEventListener("click", async (event) => {
        event.preventDefault();
        sessionStorage.clear();

        try {
            await fetch(`${API_BASE_URL}/api/auth/logout`, { method: "POST" });
        } catch (error) {
            console.error("Logout request failed:", error);
        }

        window.location.href = "/html/login.html";
    });
}

async function loadReports(token) {
    const messageElement = document.getElementById("reportsMessage");

    try {
        const [usageResponse, historyResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/api/reports/usage`, {
                headers: { Authorization: `Bearer ${token}` }
            }),
            fetch(`${API_BASE_URL}/api/reports/history`, {
                headers: { Authorization: `Bearer ${token}` }
            })
        ]);

        if (usageResponse.status === 403 || historyResponse.status === 403) {
            throw new Error("You do not have permission to access reports.");
        }

        if (!usageResponse.ok || !historyResponse.ok) {
            throw new Error("Failed to load reports from the server.");
        }

        const usageData = await usageResponse.json();
        const historyData = await historyResponse.json();

        renderUsageReport(usageData);
        renderHistoryReport(historyData);
        renderUsageStats(usageData);

        if (messageElement) {
            messageElement.textContent = `Loaded ${usageData.length} usage rows and ${historyData.length} history rows.`;
            messageElement.style.color = "#64748B";
        }
    } catch (error) {
        console.error("Report error:", error);
        renderUsageError(error.message);
        renderHistoryError(error.message);

        if (messageElement) {
            messageElement.textContent = error.message;
            messageElement.style.color = "#DC2626";
        }
    }
}

function renderUsageStats(usageData) {
    const totalRequests = usageData.reduce((sum, row) => sum + (row.totalRequests || 0), 0);
    const approvedRequests = usageData.reduce((sum, row) => sum + (row.approvedRequests || 0), 0);
    const returnedRequests = usageData.reduce((sum, row) => sum + (row.returnedRequests || 0), 0);
    const avgDuration = usageData.length
        ? usageData.reduce((sum, row) => sum + (row.averageBorrowDuration || 0), 0) / usageData.length
        : 0;

    setText("total-requests-stat", totalRequests);
    setText("approved-requests-stat", approvedRequests);
    setText("returned-requests-stat", returnedRequests);
    setText("avg-duration-stat", avgDuration.toFixed(2));
}

function renderUsageReport(usageData) {
    const tbody = document.getElementById("usageReportBody");
    if (!tbody) {
        return;
    }

    if (!usageData.length) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">No usage report data found.</td></tr>';
        return;
    }

    tbody.innerHTML = usageData.map(row => `
        <tr>
            <td><strong>${escapeHtml(row.equipmentName || "-")}</strong></td>
            <td>${escapeHtml(row.equipmentType || "-")}</td>
            <td>${row.totalRequests ?? 0}</td>
            <td>${row.approvedRequests ?? 0}</td>
            <td>${row.returnedRequests ?? 0}</td>
            <td>${formatNumber(row.averageBorrowDuration)}</td>
            <td>${formatDateTime(row.lastUsed)}</td>
        </tr>
    `).join("");
}

function renderHistoryReport(historyData) {
    const tbody = document.getElementById("historyReportBody");
    if (!tbody) {
        return;
    }

    if (!historyData.length) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px;">No history report data found.</td></tr>';
        return;
    }

    tbody.innerHTML = historyData.map(row => `
        <tr>
            <td><strong>${escapeHtml(row.username || "-")}</strong></td>
            <td>${escapeHtml(row.equipmentName || "-")}</td>
            <td>${formatDateTime(row.requestDate)}</td>
            <td>${formatDateTime(row.borrowStartTime)}</td>
            <td>${formatDateTime(row.borrowEndTime)}</td>
            <td>${escapeHtml(row.status || "-")}</td>
            <td>${formatDateTime(row.returnDate)}</td>
            <td>${escapeHtml(row.returnCondition || "-")}</td>
        </tr>
    `).join("");
}

function renderUsageError(message) {
    const tbody = document.getElementById("usageReportBody");
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 20px; color: #DC2626;">${escapeHtml(message)}</td></tr>`;
    }
}

function renderHistoryError(message) {
    const tbody = document.getElementById("historyReportBody");
    if (tbody) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 20px; color: #DC2626;">${escapeHtml(message)}</td></tr>`;
    }
}

function initExportButtons(token) {
    const buttons = document.querySelectorAll("[data-export-type]");
    const messageElement = document.getElementById("reportsMessage");

    buttons.forEach(button => {
        button.addEventListener("click", async () => {
            const type = button.dataset.exportType;
            const format = button.dataset.exportFormat;

            try {
                button.disabled = true;
                if (messageElement) {
                    messageElement.textContent = `Exporting ${type} report as ${format.toUpperCase()}...`;
                    messageElement.style.color = "#64748B";
                }

                const response = await fetch(
                    `${API_BASE_URL}/api/reports/export?type=${encodeURIComponent(type)}&format=${encodeURIComponent(format)}`,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );

                if (!response.ok) {
                    throw new Error(`Failed to export ${type} report.`);
                }

                const blob = await response.blob();
                const contentDisposition = response.headers.get("Content-Disposition");
                const fileName = extractFilename(contentDisposition) || `${type}_report.${format}`;
                downloadBlob(blob, fileName);

                if (messageElement) {
                    messageElement.textContent = `${fileName} downloaded successfully.`;
                    messageElement.style.color = "#16A34A";
                }
            } catch (error) {
                console.error("Export error:", error);
                if (messageElement) {
                    messageElement.textContent = error.message;
                    messageElement.style.color = "#DC2626";
                }
            } finally {
                button.disabled = false;
            }
        });
    });
}

function extractFilename(contentDisposition) {
    if (!contentDisposition) {
        return null;
    }

    const match = contentDisposition.match(/filename="?(.*?)"?$/i);
    return match ? match[1] : null;
}

function downloadBlob(blob, fileName) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

function formatDateTime(value) {
    if (!value) {
        return "-";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toLocaleString();
}

function formatNumber(value) {
    const number = Number(value || 0);
    return Number.isFinite(number) ? number.toFixed(2) : "0.00";
}

function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
    }
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}
