// User Dashboard JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Initialize dashboard
    loadUserStats();
    loadDailyPokemons();
    setupUserEventListeners();
    setupUploadModal();

    // Auto-refresh stats every 30 seconds
    setInterval(loadUserStats, 30000);
});

let selectedFile = null;

function setupUploadModal() {
    const uploadArea = document.getElementById('uploadArea');
    const avatarInput = document.getElementById('avatarInput');
    const uploadModal = document.getElementById('uploadModal');

    if (!uploadArea || !avatarInput) return;

    // Click to select file
    uploadArea.addEventListener('click', () => avatarInput.click());

    // File input change
    avatarInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            selectedFile = file;
            showPreview(file);
        }
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--primary)';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = 'var(--border-main)';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--border-main)';
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            selectedFile = file;
            avatarInput.files = e.dataTransfer.files;
            showPreview(file);
        }
    });

    // Close modal on overlay click
    uploadModal.addEventListener('click', (e) => {
        if (e.target === uploadModal) closeUploadModal();
    });
}

function showPreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const preview = document.getElementById('uploadPreview');
        const previewImage = document.getElementById('previewImage');
        previewImage.src = e.target.result;
        preview.style.display = 'block';
        document.getElementById('uploadArea').style.display = 'none';
    };
    reader.readAsDataURL(file);
}

function openUploadModal() {
    const modal = document.getElementById('uploadModal');
    modal.style.display = 'flex';
    selectedFile = null;
    document.getElementById('uploadPreview').style.display = 'none';
    document.getElementById('uploadArea').style.display = 'flex';
    document.getElementById('avatarInput').value = '';
}

function closeUploadModal() {
    const modal = document.getElementById('uploadModal');
    modal.style.display = 'none';
    selectedFile = null;
}

async function uploadProfilePicture() {
    if (!selectedFile) {
        showToast('Please select an image', 'warning');
        return;
    }

    const uploadBtn = document.getElementById('uploadBtn');
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Uploading...';

    const formData = new FormData();
    formData.append('avatar', selectedFile);

    try {
        const response = await fetch('/auth/profile-picture', {
            method: 'POST',
            credentials: 'include',
            body: formData
        });

        const data = await response.json();

        if (response.ok) {
            showToast('Profile picture updated!', 'success');
            displayAvatar(data.user.profileImageUrl);
            closeUploadModal();
            selectedFile = null;
        } else {
            showToast(data.message || 'Upload failed', 'error');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showToast('Error uploading image', 'error');
    } finally {
        uploadBtn.disabled = false;
        uploadBtn.textContent = 'Upload';
    }
}

function displayAvatar(profileImageUrl) {
    const userAvatar = document.getElementById('userAvatar');
    if (!userAvatar) return;

    if (profileImageUrl) {
        userAvatar.innerHTML = `<img src="${profileImageUrl}" alt="Profile" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
    } else {
        userAvatar.innerHTML = '<i data-lucide="user"></i>';
        if (window.lucide) lucide.createIcons();
    }
}

async function loadUserStats() {
    try {
        const response = await fetch('/user/stats', {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            updateUserStats(data);
            if (data.profileImageUrl) {
                displayAvatar(data.profileImageUrl);
            }
        } else {
            console.log('Failed to load user stats');
            setDefaultUserStats();
        }
    } catch (error) {
        console.error('Error loading user stats:', error);
        setDefaultUserStats();
    }
}

let currentDailyPokemons = [];
let ownedPokemonIds = new Set();

async function loadOwnedPokemons() {
    try {
        const response = await fetch('/user/owned-pokemons', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            return;
        }

        const data = await response.json();
        const pokemons = Array.isArray(data.pokemons) ? data.pokemons : [];
        ownedPokemonIds = new Set(pokemons.map((pokemon) => Number(pokemon.id)));
    } catch (error) {
        console.error('Error loading owned pokemons:', error);
    }
}

async function loadDailyPokemons() {
    const container = document.getElementById('dailyPokemonContainer');
    
    try {
        await loadOwnedPokemons();

        const response = await fetch('/user/daily-pokemons', {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            currentDailyPokemons = await response.json();
            displayDailyPokemons(currentDailyPokemons);
        } else {
            container.innerHTML = '<div class="error-state">Failed to load daily Pokemon. Please try again later.</div>';
        }
    } catch (error) {
        console.error('Error loading daily pokemons:', error);
        container.innerHTML = '<div class="error-state">Error connecting to server.</div>';
    }
}

function displayDailyPokemons(pokemons) {
    const container = document.getElementById('dailyPokemonContainer');
    container.innerHTML = '';

    if (!pokemons || pokemons.length === 0) {
        container.innerHTML = '<div class="empty-state">No Pokemon available today.</div>';
        return;
    }

    pokemons.forEach(pokemon => {
        const isClaimed = ownedPokemonIds.has(Number(pokemon.id));
        const card = document.createElement('div');
        card.className = 'pokemon-card';
        card.innerHTML = `
            <div class="pokemon-image-container">
                <img src="${pokemon.image}" alt="${pokemon.name}" class="pokemon-image">
            </div>
            <div class="pokemon-name">${pokemon.name}</div>
            <div class="pokemon-types">
                ${pokemon.types.map(type => `<span class="type-badge ${type}">${type}</span>`).join('')}
            </div>
            <div class="catch-info">
                <button class="catch-btn" onclick="catchPokemon(${pokemon.id})" ${isClaimed ? 'disabled' : ''}>
                    <span>${isClaimed ? 'Claimed' : 'Catch'}</span>
                    ${isClaimed ? '' : `<span class="catch-cost">(${pokemon.catch_cost})</span>`}
                </button>
            </div>
        `;
        container.appendChild(card);
    });

    // Re-initialize icons for new elements
    if (window.lucide) {
        lucide.createIcons();
    }
}

async function catchPokemon(id) {
    const pokemon = currentDailyPokemons.find(p => p.id === id);
    if (!pokemon) return;

    try {
        const response = await fetch('/user/catch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pokemon }),
            credentials: 'include'
        });

        const data = await response.json();

        if (response.ok) {
            ownedPokemonIds.add(Number(pokemon.id));
            showToast(`Success! You caught ${pokemon.name}!`, 'success');
            displayDailyPokemons(currentDailyPokemons);
            loadUserStats(); // Refresh user stats (coins, etc.)
        } else {
            showToast(data.message || 'Catch failed. Do you have enough Pokeballs?', 'error');
        }
    } catch (error) {
        console.error('Error catching pokemon:', error);
        showToast('An error occurred while catching the Pokémon.', 'error');
    }
}

function updateUserStats(data) {
    // Update stat values with data from backend
    document.getElementById('userName').textContent = data.name || 'Trainer';
    document.getElementById('pokedexProgress').textContent = data.pokedexProgress || '0';
    document.getElementById('achievements').textContent = data.achievements || '0';
    document.getElementById('pokeCoins').textContent = data.pokeCoins || '0';
    document.getElementById('activeQuests').textContent = data.activeQuests || '0';
    document.getElementById('onlineFriends').textContent = data.onlineFriends || '0';
}

function setDefaultUserStats() {
    // Set default values when backend is unavailable
    document.getElementById('pokedexProgress').textContent = '0';
    document.getElementById('achievements').textContent = '0';
    document.getElementById('pokeCoins').textContent = '0';
    document.getElementById('activeQuests').textContent = '0';
    document.getElementById('onlineFriends').textContent = '0';
}

function setupUserEventListeners() {
    const dailyRewardBtn = document.getElementById('dailyRewardBtn');
    if (dailyRewardBtn) {
        dailyRewardBtn.addEventListener('click', async () => {
            dailyRewardBtn.disabled = true;
            try {
                const response = await fetch('/user/daily-reward/claim', {
                    method: 'POST',
                    credentials: 'include'
                });

                const data = await response.json().catch(() => ({}));
                if (!response.ok) {
                    showToast(data.message || 'Failed to claim daily reward', 'error');
                    return;
                }

                showToast('Daily reward claimed (+20 coins, +1 Pokeball)', 'success');
                loadUserStats();
            } catch (error) {
                console.error('Error claiming daily reward:', error);
                showToast('Error connecting to server.', 'error');
            } finally {
                dailyRewardBtn.disabled = false;
            }
        });
    }

    // Add click handlers for stat cards
    const statCards = document.querySelectorAll('.stat-card');
    
    const actions = [
        'View your Pokedex details',
        'Browse your achievement gallery',
        'Exchange your Pokecoins',
        'Check your active quests',
        'Message your online friends',
        'Open account settings'
    ];

    statCards.forEach((card, index) => {
        const button = card.querySelector('.card-btn');
        if (button) {
            button.addEventListener('click', () => {
                if (button.id === 'pokedexDetailsBtn') {
                    window.location.href = '/html/userPokedex.html';
                    return;
                }

                if (button.id === 'storeBtn') {
                    window.location.href = '/html/userStore.html';
                    return;
                }

                showToast(`${actions[index]} feature coming soon!`, 'info');
            });
        }
    });

    // Welcome actions
    const welcomeButtons = document.querySelectorAll('.welcome-actions .btn');
    welcomeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            showToast('This feature will be available in the full release!', 'warning');
        });
    });
}

// Logout function
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
