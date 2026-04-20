// Admin Dashboard JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Initialize dashboard
    loadAdminStats();
    setupAdminEventListeners();

    // Auto-refresh stats every 30 seconds
    setInterval(loadAdminStats, 30000);
});

async function loadAdminStats() {
    try {
        const response = await fetch('/admin/stats', {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            updateAdminStats(data);
        } else {
            console.log('Failed to load admin stats');
            // Set default values
            setDefaultAdminStats();
        }
    } catch (error) {
        console.error('Error loading admin stats:', error);
        setDefaultAdminStats();
    }
}

function updateAdminStats(data) {
    // Update stat values with data from backend
    document.getElementById('totalUsers').textContent = data.totalUsers || '0';
    document.getElementById('totalAchievements').textContent = data.totalAchievements || '0';

    // Update last updated timestamp
    const now = new Date();
    document.getElementById('lastUpdate').textContent = now.toLocaleTimeString();
}

function setDefaultAdminStats() {
    // Set default values when backend is unavailable
    document.getElementById('totalUsers').textContent = '0';
    document.getElementById('totalAchievements').textContent = '0';
    document.getElementById('lastUpdate').textContent = 'Just now';
}

function setupAdminEventListeners() {
    // Add click handlers for admin actions
    const manageUsersBtn = document.querySelector('.card-users .card-btn');
    const gameDataBtn = document.querySelector('.card-pokemon .card-btn');

    if (manageUsersBtn) {
        manageUsersBtn.addEventListener('click', () => {
            showToast('User management feature coming soon!', 'info');
        });
    }



    if (gameDataBtn) {
        gameDataBtn.addEventListener('click', () => {
            showToast('Game data analytics coming soon!', 'info');
        });
    }



    // Add click handlers for navigation items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.textContent.trim().toLowerCase();

            // Remove active class from all items
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active class to clicked item
            item.classList.add('active');

            // Show corresponding section (placeholder for now)
            showToast(`${section} section coming soon!`, 'info');
        });
    });
}

// Logout function (already defined in HTML, but keeping here for completeness)
async function logout() {
    if (await showConfirm('Are you sure you want to logout?')) {
        try {
            await fetch('/auth/authLogout');
            window.location.href = '/html/landingpage.html';
        } catch (err) {
            console.error('Logout failed:', err);
            window.location.href = '/html/landingpage.html';
        }
    }
}