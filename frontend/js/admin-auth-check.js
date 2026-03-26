/**
 * Admin Authorization Check
 * Must be loaded FIRST on all admin pages before any other scripts
 * Redirects non-admin users to login page
 */

(function() {
    'use strict';
    
    // Check if user is logged in and has ADMIN role
    const token = sessionStorage.getItem("jwtToken");
    const userRole = sessionStorage.getItem("userRole");
    
    // Make userRole available globally for other scripts
    window.userRole = userRole;
    
    console.log("Admin Auth Check - Token:", !!token, "Role:", userRole);
    
    // Redirect if not authenticated or not admin
    if (!token || userRole !== 'ADMIN') {
        console.warn("Unauthorized access attempt! User role:", userRole);
        alert("Нямате достъп до тази страница. Моля, влезте като администратор.");
        sessionStorage.clear(); // Clear session for security
        window.location.replace("/login.html");
        return false;
    }
    
    return true;
})();
