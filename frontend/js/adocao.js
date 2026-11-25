/**
 * adocao.js - Adoption catalog page logic
 * Handles search, filters, pagination, and animal detail modal.
 */

const ITEMS_PER_PAGE = 9;
let allAnimals = [];
let filteredAnimals = [];
let currentPage = 1;

document.addEventListener('DOMContentLoaded', async () => {
    await initPublicComponents();
    await loadEspeciesFilter();
    await loadAnimals();
    setupFilters();
    checkHashLink();
});

async function loadEspeciesFilter() {
    try {
        const data = await especieService.getAll();
        const especies = data.data || data;
        const select = document.getElementById('filter-especie');
        if (!select) return;
        especies.forEach(e => {
            const opt = document.createElement('option');
            opt.value = e.nome;
            opt.textContent = e.nome;
            select.appendChild(opt);
        });
    } catch (err) {
        console.warn('Could not load species:', err.message);
    }
}

async function loadAnimals() {
    const grid = document.getElementById('animals-grid');
    try {
        const data = await animalService.getAll();
        allAnimals = data.data || data.animais || data || [];
        applyFilters();
    } catch (err) {
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
            <i class="fa-solid fa-circle-exclamation"></i>
            <p>Erro ao carregar os animais. Verifique se o servidor está rodando.</p>
        </div>`;
    }
}

function setupFilters() {
    const inputs = ['search-input', 'filter-especie', 'filter-porte', 'filter-sexo', 'filter-status'];
    inputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', () => { currentPage = 1; applyFilters(); });
    });

    document.getElementById('btn-clear-filters')?.addEventListener('click', clearFilters);
}

function clearFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('filter-especie').value = '';
    document.getElementById('filter-porte').value = '';
    document.getElementById('filter-sexo').value = '';
    document.getElementById('filter-status').value = 'Disponível';
    currentPage = 1;
    applyFilters();
}

function applyFilters() {
    const search = document.getElementById('search-input')?.value.toLowerCase().trim() || '';
    const especie = document.getElementById('filter-especie')?.value || '';
    const porte = document.getElementById('filter-porte')?.value || '';
    const sexo = document.getElementById('filter-sexo')?.value || '';
    const status = document.getElementById('filter-status')?.value || '';

    filteredAnimals = allAnimals.filter(a => {
        if (search && !a.nome.toLowerCase().includes(search)) return false;
        if (especie && (a.especie_nome || a.especie) !== especie) return false;
        if (porte && a.porte !== porte) return false;
        if (sexo && a.sexo !== sexo) return false;
        if (status && a.status !== status) return false;
        return true;
    });

    renderAnimals();
    renderPagination();
    updateResultsCount();
}

function renderAnimals() {
    const grid = document.getElementById('animals-grid');
    if (!grid) return;

    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageAnimals = filteredAnimals.slice(start, start + ITEMS_PER_PAGE);

    if (pageAnimals.length === 0) {
        grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
            <i class="fa-solid fa-paw"></i>
            <h4>Nenhum animal encontrado</h4>
            <p>Tente ajustar os filtros de busca.</p>
        </div>`;
        return;
    }

    grid.innerHTML = pageAnimals.map(a => buildCard(a)).join('');
}

function buildCard(a) {
    const foto = getAnimalImageUrl(a.foto);
    const statusClass = getStatusClass(a.status);
    const sexoClass = getSexoClass(a.sexo);
    const porteClass = getPorteClass(a.porte);
    const idadeLabel = a.idade === 1 ? 'ano' : 'anos';

    return `
    <div class="animal-card" id="animal-${a.id}">
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
            <button class="btn btn-primary btn-block" onclick="openAnimalModal(${a.id})">
                <i class="fa-solid fa-eye"></i> Ver Detalhes
            </button>
        </div>
    </div>`;
}

function renderPagination() {
    const container = document.getElementById('pagination');
    if (!container) return;
    const totalPages = Math.ceil(filteredAnimals.length / ITEMS_PER_PAGE);
    if (totalPages <= 1) { container.innerHTML = ''; return; }

    let html = '';
    if (currentPage > 1) html += `<button onclick="goToPage(${currentPage - 1})"><i class="fa-solid fa-chevron-left"></i></button>`;
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    }
    if (currentPage < totalPages) html += `<button onclick="goToPage(${currentPage + 1})"><i class="fa-solid fa-chevron-right"></i></button>`;
    container.innerHTML = html;
}

function goToPage(page) {
    currentPage = page;
    renderAnimals();
    renderPagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateResultsCount() {
    const el = document.getElementById('results-count');
    if (el) el.textContent = `${filteredAnimals.length} animal(is) encontrado(s)`;
}

// ─── Modal ─────────────────────────────────────────────────────────────────

async function openAnimalModal(id) {
    const modal = document.getElementById('animal-modal');
    const body = document.getElementById('modal-animal-body');
    const nameEl = document.getElementById('modal-animal-name');

    modal.classList.add('open');
    body.innerHTML = '<div class="loading-state"><div class="spinner"></div></div>';

    try {
        const data = await animalService.getById(id);
        const a = data.data || data;

        nameEl.textContent = a.nome;
        const foto = getAnimalImageUrl(a.foto);
        const statusClass = getStatusClass(a.status);
        const sexoClass = getSexoClass(a.sexo);
        const porteClass = getPorteClass(a.porte);
        const idadeLabel = a.idade === 1 ? 'ano' : 'anos';
        const adoptionAction = isAvailableStatus(a.status)
            ? `<a href="contato.html" class="modal-adopt-btn">
                <i class="fa-solid fa-heart"></i> Quero Adotar ${a.nome}!
            </a>`
            : '';

        body.innerHTML = `
            <img src="${foto}" alt="${a.nome}" class="modal-detail-img"
                 onerror="this.src='https://placehold.co/400x300/fff5ef/f08c67?text=Sem+Foto'">
            <div class="modal-detail-badges">
                <span class="card-status status-${statusClass}">${a.status}</span>
                <span class="badge sexo-${sexoClass}"><i class="fa-solid fa-venus-mars"></i> ${a.sexo}</span>
                <span class="badge size-${porteClass}"><i class="fa-solid fa-ruler"></i> ${a.porte}</span>
                <span class="badge age"><i class="fa-solid fa-calendar"></i> ${a.idade} ${idadeLabel}</span>
            </div>
            <div class="modal-detail-info">
                <div class="detail-item">
                    <span class="detail-label">Espécie</span>
                    <span class="detail-value">${a.especie_nome || a.especie || '—'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Raça</span>
                    <span class="detail-value">${a.raca_nome || a.raca || '—'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Cadastrado em</span>
                    <span class="detail-value">${formatDate(a.created_at)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Status</span>
                    <span class="detail-value">${a.status}</span>
                </div>
            </div>
            ${a.descricao ? `<div class="modal-description">${a.descricao}</div>` : ''}
            ${adoptionAction}
        `;
    } catch (err) {
        body.innerHTML = `<p style="color:var(--text-muted);text-align:center;">Erro ao carregar detalhes.</p>`;
    }
}

function isAvailableStatus(status) {
    return String(status || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase() === 'disponivel';
}

function closeAnimalModal() {
    document.getElementById('animal-modal')?.classList.remove('open');
}

// Close modal on overlay click
document.getElementById('animal-modal')?.addEventListener('click', function(e) {
    if (e.target === this) closeAnimalModal();
});

// Close on Escape key
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAnimalModal();
});

// Check if hash is pointing to a specific animal
function checkHashLink() {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#animal-')) {
        const id = parseInt(hash.replace('#animal-', ''));
        if (id) setTimeout(() => openAnimalModal(id), 800);
    }
}
