// User Dashboard JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Initialize dashboard
    loadUserStats();
    loadDailyPokemons();
    setupUserEventListeners();

    // Auto-refresh stats every 30 seconds
    setInterval(loadUserStats, 30000);
});

async function loadUserStats() {
    try {
        const response = await fetch('/user/stats', {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            updateUserStats(data);
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

async function loadDailyPokemons() {
    const container = document.getElementById('dailyPokemonContainer');
    
    try {
        const response = await fetch('/user/daily-pokemons', {
            method: 'GET',
            credentials: 'include'
        });

        if (response.ok) {
            currentDailyPokemons = await response.json();
            displayDailyPokemons(currentDailyPokemons);
        } else {
            container.innerHTML = '<div class="error-state">Failed to load daily Pokémon. Please try again later.</div>';
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
        container.innerHTML = '<div class="empty-state">No Pokémon available today.</div>';
        return;
    }

    pokemons.forEach(pokemon => {
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
                <button class="catch-btn" onclick="catchPokemon(${pokemon.id})">
                    <i data-lucide="zap"></i>
                    <span>Catch</span>
                    <span class="catch-cost">(${pokemon.catch_cost})</span>
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
            showToast(`Success! You caught ${pokemon.name}!`, 'success');
            loadUserStats(); // Refresh user stats (coins, etc.)
        } else {
            showToast(data.message || 'Catch failed. Do you have enough Pokéballs?', 'error');
        }
    } catch (error) {
        console.error('Error catching pokemon:', error);
        showToast('An error occurred while catching the Pokémon.', 'error');
    }
}

function updateUserStats(data) {
    // Update stat values with data from backend
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
    // Add click handlers for stat cards
    const statCards = document.querySelectorAll('.stat-card');
    
    const actions = [
        'View your Pokédex details',
        'Browse your achievement gallery',
        'Exchange your Pokécoins',
        'Check your active quests',
        'Message your online friends',
        'Open account settings'
    ];

    statCards.forEach((card, index) => {
        const button = card.querySelector('.card-btn');
        if (button) {
            button.addEventListener('click', () => {
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