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
            <div class="owned-actions">
                <button class="view-btn" onclick="showPokemonDetails(${pokemon.id})">View</button>
            </div>
        `;

        container.appendChild(card);
    });

    if (window.lucide) {
        lucide.createIcons();
    }
}

async function showPokemonDetails(id) {
    const overlay = document.createElement('div');
    overlay.className = 'pokemon-modal-overlay';
    overlay.innerHTML = `
        <div class="pokemon-modal">
            <button class="modal-close" type="button">&times;</button>
            <div class="modal-content">
                <div class="modal-header">
                    <div>
                        <h2>Loading...</h2>
                        <p class="modal-subtitle">Loading details...</p>
                    </div>
                </div>
                <div class="modal-body">
                    <div class="modal-spinner"></div>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    const closeModal = () => {
        overlay.remove();
    };

    overlay.querySelector('.modal-close').addEventListener('click', closeModal);
    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) closeModal();
    });

    try {
        const [pokemonResponse, speciesResponse] = await Promise.all([
            fetch(`https://pokeapi.co/api/v2/pokemon/${id}`),
            fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
        ]);

        if (!pokemonResponse.ok || !speciesResponse.ok) {
            throw new Error('Pokemon details not available');
        }

        const pokemonData = await pokemonResponse.json();
        const speciesData = await speciesResponse.json();

        const flavorEntry = speciesData.flavor_text_entries.find(entry => entry.language.name === 'en');
        const description = flavorEntry ? flavorEntry.flavor_text.replace(/\n|\f/g, ' ') : 'No description available.';

        const abilities = pokemonData.abilities.map(item => item.ability.name).join(', ');
        const stats = pokemonData.stats.map(item => `<li>${item.stat.name}: ${item.base_stat}</li>`).join('');
        const types = pokemonData.types.map(item => item.type.name).join(', ');
        const height = pokemonData.height / 10;
        const weight = pokemonData.weight / 10;

        const modalBody = overlay.querySelector('.modal-body');
        const subtitle = overlay.querySelector('.modal-subtitle');
        const title = overlay.querySelector('.modal-header h2');
        title.textContent = pokemonData.name.charAt(0).toUpperCase() + pokemonData.name.slice(1);
        subtitle.textContent = `Type: ${types}`;

        modalBody.innerHTML = `
            <div class="modal-grid">
                <div class="modal-image">
                    <img src="${pokemonData.sprites.other['official-artwork'].front_default || pokemonData.sprites.front_default}" alt="${pokemonData.name}">
                </div>
                <div class="modal-details">
                    <p class="modal-description">${description}</p>
                    <div class="modal-stats">
                        <div><strong>Abilities:</strong> ${abilities}</div>
                        <div><strong>Height:</strong> ${height} m</div>
                        <div><strong>Weight:</strong> ${weight} kg</div>
                        <div><strong>Base Stats:</strong></div>
                        <ul>${stats}</ul>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        const modalBody = overlay.querySelector('.modal-body');
        modalBody.innerHTML = `<div class="error-state">Unable to load details. Please try again later.</div>`;
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

