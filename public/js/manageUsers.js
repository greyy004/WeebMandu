document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
});

async function loadUsers() {
    try{
        const response = await fetch('/admin/usersdetails', {
            method: 'GET',
            credentials: 'include'
        });
        const users = await response.json();
        displayUsers(users);
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

async function displayUsers(users) {
    const tableBody = document.getElementById('usersTableBody');
    tableBody.innerHTML = '';
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="user-cell">
                    <div class="user-avatar-small">${user.name.charAt(0)}</div>
                    <span>${user.name}</span>
                </div>
            </td>
            <td>${user.email}</td>
            <td>${user.coins}</td>
            <td>${user.pokeballs}</td>
            <td>${new Date(user.joined).toLocaleDateString()}</td>
        `;
        tableBody.appendChild(row);
    });
}