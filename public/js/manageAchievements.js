document.addEventListener('DOMContentLoaded', () => {
    loadAchievements();
    setInterval(loadAchievements, 30000); // Refresh every 30 seconds

    // Auto-generate code from name
    const nameInput = document.getElementById('achievementName');
    const codeInput = document.getElementById('achievementCode');
    nameInput.addEventListener('input', () => {
        const code = nameInput.value.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '_');
        codeInput.value = code;
    });

    // Handle form submission
    const form = document.getElementById('addAchievementForm');
    form.addEventListener('submit', handleAddAchievement);
});

async function loadAchievements() {
    try {
        const response = await fetch('/admin/achievements', {
            method: 'GET',
            credentials: 'include'
        });
        const data = await response.json();
        displayAchievements(data.achievements || []);
    } catch (error) {
        console.error('Error loading achievements:', error);
        showToast('Failed to load achievements', 'error');
    }
}

function displayAchievements(achievements) {
    const tableBody = document.getElementById('achievementsTableBody');
    tableBody.innerHTML = '';

    if (achievements.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <div class="empty-state-content">
                        <i data-lucide="trophy"></i>
                        <h4>No achievements found</h4>
                        <p>Achievements will appear here once created</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    achievements.forEach(achievement => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="achievement-icon">
                    ${achievement.icon_url ? `<img src="${achievement.icon_url}" alt="${achievement.name}">` : '🏆'}
                </div>
            </td>
            <td>
                <div class="achievement-cell">
                    <div class="achievement-info">
                        <h4>${achievement.name}</h4>
                        <p><small>Code: ${achievement.code}</small></p>
                    </div>
                </div>
            </td>
            <td>${achievement.description}</td>
            <td>
                <div class="condition-info">
                    <strong>${achievement.condition_type.replace('_', ' ')}</strong><br>
                    <small>Target: ${achievement.target_value}</small>
                </div>
            </td>
            <td>
                <div class="rewards-info">
                    ${achievement.reward_coins > 0 ? `<span class="points-badge">${achievement.reward_coins} coins</span>` : ''}
                    ${achievement.reward_pokeballs > 0 ? `<span class="points-badge">${achievement.reward_pokeballs} balls</span>` : ''}
                    ${achievement.reward_coins === 0 && achievement.reward_pokeballs === 0 ? '<small>No rewards</small>' : ''}
                </div>
            </td>
            <td>${new Date(achievement.created_at).toLocaleDateString()}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn delete" onclick="deleteAchievement(${achievement.id})">
                        Delete
                    </button>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Re-initialize Lucide icons for dynamically added content
    lucide.createIcons();
}

async function handleAddAchievement(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const achievementData = {
        name: formData.get('name'),
        code: formData.get('code'),
        description: formData.get('description'),
        condition_type: formData.get('condition_type'),
        target_value: parseInt(formData.get('target_value')),
        reward_coins: parseInt(formData.get('reward_coins')),
        reward_pokeballs: parseInt(formData.get('reward_pokeballs')),
        icon_url: formData.get('icon_url') || null
    };

    try {
        const response = await fetch('/admin/achievements', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(achievementData)
        });

        if (response.ok) {
            showToast('Achievement added successfully!', 'success');
            event.target.reset();
            document.getElementById('achievementCode').value = ''; // Clear the code field
            loadAchievements(); // Refresh the table
        } else {
            const error = await response.json();
            showToast(error.message || 'Failed to add achievement', 'error');
        }
    } catch (error) {
        console.error('Error adding achievement:', error);
        showToast('Failed to add achievement', 'error');
    }
}

async function deleteAchievement(id) {
    if (!confirm('Are you sure you want to delete this achievement?')) {
        return;
    }

    try {
        const response = await fetch(`/admin/achievements/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (response.ok) {
            showToast('Achievement deleted successfully!', 'success');
            loadAchievements(); // Refresh the table
        } else {
            const error = await response.json();
            showToast(error.message || 'Failed to delete achievement', 'error');
        }
    } catch (error) {
        console.error('Error deleting achievement:', error);
        showToast('Failed to delete achievement', 'error');
    }
}