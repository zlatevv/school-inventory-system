
const API_CONFIG = {
    API_BASE_URL: "http://localhost:9000", 
    auth: "http://localhost:9000/api/auth",
    getHeaders: () => {
        const token = sessionStorage.getItem("jwtToken");
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    }
};