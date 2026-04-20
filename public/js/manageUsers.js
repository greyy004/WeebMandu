document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
     setInterval(loadUsers, 30000);
});

async function loadUsers() {
    try{
        const response = await fetch('/admin/userdetails', {
            method: 'GET',
            credentials: 'include'
        });
        const data = await response.json();
        displayUsers(data.users);
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
                    <div class="user-avatar-small ${user.profile_image_url ? 'has-image' : ''}">
                        ${user.profile_image_url ? `<img src="${user.profile_image_url}" alt="${user.name}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;">` : user.name.charAt(0)}
                    </div>
                    <span>${user.name}</span>
                </div>
            </td>
            <td>${user.email}</td>
            <td>${user.coins}</td>
            <td>${user.pokeballs}</td>
            <td>${new Date(user.createdAt).toLocaleDateString()}</td>
        `;
        tableBody.appendChild(row);
    });
}