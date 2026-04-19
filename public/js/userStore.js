document.addEventListener('DOMContentLoaded', () => {
    setupHandlers();
    refreshWallet();
});

function setupHandlers() {
    const backBtn = document.getElementById('backToDashboard');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = '/html/userDashboard.html';
        });
    }

    const buyBtn = document.getElementById('buyPokeballBtn');
    if (buyBtn) {
        buyBtn.addEventListener('click', async () => {
            buyBtn.disabled = true;
            try {
                const response = await fetch('/user/store/buy-pokeball', {
                    method: 'POST',
                    credentials: 'include'
                });

                const data = await response.json().catch(() => ({}));
                if (!response.ok) {
                    showToast(data.message || 'Purchase failed', 'error');
                    return;
                }

                setWallet(data.pokeCoins, data.pokeballs);
                showToast('Purchased 1 Pokeball (-50 coins)', 'success');
            } catch (error) {
                console.error('Purchase error:', error);
                showToast('Error connecting to server.', 'error');
            } finally {
                buyBtn.disabled = false;
            }
        });
    }

    const claimBtn = document.getElementById('claimDailyRewardBtn');
    if (claimBtn) {
        claimBtn.addEventListener('click', async () => {
            claimBtn.disabled = true;
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

                setWallet(data.pokeCoins, data.pokeballs);
                showToast('Daily reward claimed (+20 coins, +1 PokÃ©ball)', 'success');
            } catch (error) {
                console.error('Claim error:', error);
                showToast('Error connecting to server.', 'error');
            } finally {
                claimBtn.disabled = false;
            }
        });
    }
}

async function refreshWallet() {
    try {
        const response = await fetch('/user/wallet', {
            method: 'GET',
            credentials: 'include'
        });

        if (response.status === 401 || response.status === 403) {
            window.location.href = '/html/login.html';
            return;
        }

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            showToast(data.message || 'Failed to load wallet', 'error');
            return;
        }

        setWallet(data.pokeCoins, data.pokeballs);
    } catch (error) {
        console.error('Wallet error:', error);
        showToast('Error connecting to server.', 'error');
    }
}

function setWallet(coins, pokeballs) {
    const coinsEl = document.getElementById('walletCoins');
    const ballsEl = document.getElementById('walletPokeballs');
    if (coinsEl) coinsEl.textContent = String(coins ?? 0);
    if (ballsEl) ballsEl.textContent = String(pokeballs ?? 0);
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

