/**
 * index.js - Home page logic
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Load components (header + footer)
    await initPublicComponents();

    // Load stats
    loadStats();

    // Load featured animals (up to 6)
    loadFeaturedAnimals();
});

async function loadStats() {
    try {
        const data = await dashboardService.getStats();
        const stats = data.data || data;

        const totalAnimais = stats.totalAnimais ?? stats.total ?? 0;

        animateCounter('stat-total', totalAnimais);
        animateCounter('stat-disponiveis', stats.disponiveis || 0);
        animateCounter('stat-adotados', stats.adotados || 0);

        animateCounter('card-total', totalAnimais);
        animateCounter('card-disponiveis', stats.disponiveis || 0);
        animateCounter('card-processo', stats.emProcesso || 0);
        animateCounter('card-adotados', stats.adotados || 0);
    } catch (err) {
        console.warn('Stats unavailable:', err.message);
    }
}

function animateCounter(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    let current = 0;
    const step = Math.ceil(target / 30);
    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            el.textContent = target;
            clearInterval(timer);
        } else {
            el.textContent = current;
        }
    }, 40);
}

async function loadFeaturedAnimals() {
    const container = document.getElementById('featured-animals');
    if (!container) return;

    try {
        const data = await animalService.getAll({ status: 'Disponível', limit: 6 });
        const animals = data.data || data.animais || data;
        const availableAnimals = animals.filter(a => isAvailableStatus(a.status));

        if (!availableAnimals || availableAnimals.length === 0) {
            container.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
                <i class="fa-solid fa-paw"></i>
                <p>Nenhum animal disponível no momento. Volte em breve!</p>
            </div>`;
            return;
        }

        container.innerHTML = availableAnimals.slice(0, 6).map(a => buildAnimalCard(a)).join('');
    } catch (err) {
        container.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
            <i class="fa-solid fa-circle-exclamation"></i>
            <p>Não foi possível carregar os animais.</p>
        </div>`;
    }
}

function buildAnimalCard(a) {
    const foto = getAnimalImageUrl(a.foto);
    const statusClass = getStatusClass(a.status);
    const sexoClass = getSexoClass(a.sexo);
    const porteClass = getPorteClass(a.porte);
    const idadeLabel = a.idade === 1 ? 'ano' : 'anos';
    const adoptionAction = isAvailableStatus(a.status)
        ? `<a href="adocao.html#animal-${a.id}" class="btn btn-primary btn-block">
                <i class="fa-solid fa-heart"></i> Quero Adotar
            </a>`
        : '';

    return `
    <div class="animal-card" data-id="${a.id}">
        <div class="card-image">
            <img src="${foto}" alt="${a.nome}" class="pet-photo" loading="lazy"
                 onerror="this.src='https://placehold.co/400x300/fff5ef/f08c67?text=Sem+Foto'">
            <span class="card-status status-${statusClass}">${a.status}</span>
        </div>
        <div class="card-content">
            <h3 class="pet-name">${a.nome}</h3>
            <div class="card-badges">
                <span class="badge sexo-${sexoClass}"><i class="fa-solid fa-venus-mars"></i> ${a.sexo}</span>
                <span class="badge size-${porteClass}"><i class="fa-solid fa-ruler"></i> ${a.porte}</span>
                <span class="badge age"><i class="fa-solid fa-calendar"></i> ${a.idade} ${idadeLabel}</span>
            </div>
            <p class="card-breed"><strong>Espécie:</strong> ${a.especie_nome || a.especie || '—'} | <strong>Raça:</strong> ${a.raca_nome || a.raca || '—'}</p>
            <p class="card-description">${a.descricao || ''}</p>
            ${adoptionAction}
        </div>
    </div>`;
}

function isAvailableStatus(status) {
    return String(status || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase() === 'disponivel';
}
