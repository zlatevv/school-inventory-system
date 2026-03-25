document.addEventListener("DOMContentLoaded", () => {
    // 1. Load existing data
    document.getElementById('set-username').value = sessionStorage.getItem("username");
    
    // 2. Register User Logic
    const regForm = document.getElementById('registerUserForm');
    regForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = sessionStorage.getItem("jwtToken");
        
        const payload = {
            username: document.getElementById('reg-username').value,
            email: document.getElementById('reg-email').value,
            password: document.getElementById('reg-password').value,
            role: document.getElementById('reg-role').value
        };

        try {
            const res = await fetch('http://localhost:9000/api/auth/register', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert("User created successfully!");
                regForm.reset();
            } else {
                alert("Registration failed. Check if user already exists.");
            }
        } catch (err) { console.error(err); }
    });
});