document.addEventListener('DOMContentLoaded', () => {
    setupHandlers();
    loadOwnedPokemons();
});

function setupHandlers() {
    const backBtn = document.getElementById('backToDashboard');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = '/html/userDashboard.html';
        });
    }
}

async function loadOwnedPokemons() {
    const container = document.getElementById('ownedPokemonContainer');

    try {
        const response = await fetch('/user/owned-pokemons', {
            method: 'GET',
            credentials: 'include'
        });

        if (response.status === 401 || response.status === 403) {
            window.location.href = '/html/login.html';
            return;
        }

        if (!response.ok) {
            container.innerHTML = '<div class="error-state">Failed to load your Pokemon. Please try again later.</div>';
            return;
        }

        const data = await response.json();
        const pokemons = data.pokemons || [];

        const countEl = document.getElementById('pokedexCount');
        if (countEl) {
            countEl.textContent = String(data.count ?? pokemons.length ?? 0);
        }

        renderOwnedPokemons(pokemons);
    } catch (error) {
        console.error('Error loading owned pokemons:', error);
        container.innerHTML = '<div class="error-state">Error connecting to server.</div>';
    }
}

function renderOwnedPokemons(pokemons) {
    const container = document.getElementById('ownedPokemonContainer');
    container.innerHTML = '';

    if (!pokemons || pokemons.length === 0) {
        container.innerHTML = '<div class="empty-state">No Pokemon caught yet. Go catch todays Pokemon!</div>';
        return;
    }

    pokemons.forEach((pokemon) => {
        const card = document.createElement('div');
        card.className = 'pokemon-card';

        const types = Array.isArray(pokemon.types) ? pokemon.types : [];
        const caughtAt = pokemon.caught_at ? new Date(pokemon.caught_at).toLocaleString() : '';
        const dexId = pokemon.id ? String(pokemon.id).padStart(3, '0') : '';

        card.innerHTML = `
            <div class="pokemon-image-container">
                <img src="${pokemon.image}" alt="${pokemon.name}" class="pokemon-image">
            </div>
            <div class="pokemon-name">#${dexId} ${pokemon.name}</div>
            <div class="pokemon-types">
                ${types.map(type => `<span class="type-badge ${type}">${type}</span>`).join('')}
            </div>
            ${caughtAt ? `<div class="owned-meta">Caught: ${caughtAt}</div>` : ''}
        `;

        container.appendChild(card);
    });

    if (window.lucide) {
        lucide.createIcons();
    }
}

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

