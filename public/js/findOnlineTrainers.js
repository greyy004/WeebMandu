
document.addEventListener('DOMContentLoaded', () => {
    setupHandlers();
    loadOnlineTrainers();
});

function setupHandlers() {
    const backBtn = document.getElementById('backToDashboard');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = '/html/userDashboard.html';
        });
    }
}
async function loadOnlineTrainers() {
    const container = document.getElementById('trainerContainer');
    try {
        const response = await fetch('/user/onlineTrainers',{
            method: 'GET',
            credentials: 'include'
        });
        if (!response.ok) {
            throw new Error('Failed to fetch online trainers');
        }
        const data = await response.json();
        const trainers = data.trainers || [];
        renderOnlineTrainers(trainers);

    }
    catch (err) {
        console.log('error fetching trainers from the database');
    }
}


function renderOnlineTrainers(trainers) {
    const container = document.getElementById('trainerContainer');
    container.innerHTML = '';

    if (!trainers || trainers.length === 0) {
        container.innerHTML = '<div class="empty-state">No online trainers found.</div>';
        return;
    }

    trainers.forEach((trainer) => {
        const card = document.createElement('div');
        card.className = 'trainer-card';

        const avatarHtml = trainer.profile_image_url 
            ? `<img src="${trainer.profile_image_url}" alt="${trainer.name}">`
            : `<div class="avatar-placeholder">T</div>`;

        card.innerHTML = `
            <div class="trainer-avatar">
                ${avatarHtml}
            </div>

            <div class="trainer-info">
                <h3>${trainer.name}</h3>
            </div>

            <div class="trainer-actions">
                <button class="view-btn">View Profile</button>
            </div>
        `;

        container.appendChild(card);
    });
}

// Logout function
async function logout() {
    if (await showConfirm('Are you sure you want to logout?')) {
        try {
            await fetch('/auth/authLogout');
            window.location.href = '/html/landingPage.html';
        } catch (err) {
            console.error('Logout failed:', err);
            window.location.href = '/html/landingPage.html';
        }
    }
}


