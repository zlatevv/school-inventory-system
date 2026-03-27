
const API_CONFIG = {
    API_BASE_URL: "https://api-gateway-production-d21a.up.railway.app", 
    auth: "https://api-gateway-production-d21a.up.railway.app/api/auth",
    getHeaders: () => {
        const token = sessionStorage.getItem("jwtToken");
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    }
};