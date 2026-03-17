document.addEventListener("DOMContentLoaded", () => {
    const savedUsername = localStorage.getItem("username");

    if (savedUsername) {
        document.getElementById("display-username").innerText = savedUsername;
        
        updateAvatarWithInitials(savedUsername);
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