/**
 * dashboard.js - Full Admin Dashboard controller
 * Handles: auth guard, panel switching, KPI/charts, and all 4 CRUD modules.
 */

// ─── Auth Guard ────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
    if (!authService.requireAuth()) return;

    const user = authService.getUser();
    if (user) {
        document.getElementById('logged-user-name').textContent = user.nome || user.usuario;
        document.getElementById('topbar-user').textContent = user.nome || user.usuario;
    }

    // Mobile sidebar toggle
    document.getElementById('sidebar-toggle')?.addEventListener('click', toggleSidebar);

    // Initialize default panel
    initDashboard();
    initAnimalsModule();
    initEspeciesModule();
    initRacasModule();
    initDenunciasModule();
    initUsuariosModule();
});

// ─── Panel Navigation ─────────────────────────────────────────────────────

const PANELS = {
    dashboard: { title: 'Dashboard', menuId: 'menu-dashboard', panelId: 'panel-dashboard' },
    animals:   { title: 'Animais',   menuId: 'menu-animals',   panelId: 'panel-animals'   },
    especies:  { title: 'Espécies',  menuId: 'menu-especies',  panelId: 'panel-especies'  },
    racas:     { title: 'Raças',     menuId: 'menu-racas',     panelId: 'panel-racas'     },
    denuncias: { title: 'Denúncias', menuId: 'menu-denuncias', panelId: 'panel-denuncias' },
    usuarios:  { title: 'Usuários',  menuId: 'menu-usuarios',  panelId: 'panel-usuarios'  },
};

function showPanel(name) {
    Object.values(PANELS).forEach(p => {
        document.getElementById(p.panelId)?.classList.remove('active');
        document.getElementById(p.menuId)?.classList.remove('active');
    });

    const p = PANELS[name];
    if (!p) return;
    document.getElementById(p.panelId)?.classList.add('active');
    document.getElementById(p.menuId)?.classList.add('active');
    document.getElementById('page-title').textContent = p.title;

    // Close sidebar on mobile
    if (window.innerWidth <= 900) {
        document.getElementById('sidebar')?.classList.remove('open');
    }
}

function toggleSidebar() {
    const sb = document.getElementById('sidebar');
    const mc = document.querySelector('.main-content');
    if (window.innerWidth <= 900) {
        sb.classList.toggle('open');
    } else {
        sb.classList.toggle('collapsed');
        mc.classList.toggle('expanded');
    }
}

function logout() {
    authService.logout();
}

// ─── DASHBOARD PANEL ──────────────────────────────────────────────────────

let chartEspecie = null, chartStatus = null, chartMonthly = null;

async function initDashboard() {
    try {
        const data = await dashboardService.getStats();
        const stats = data.data || data;

        document.getElementById('kpi-total').textContent = stats.totalAnimais ?? stats.total ?? '0';
        document.getElementById('kpi-disponiveis').textContent = stats.disponiveis ?? '0';
        document.getElementById('kpi-processo').textContent = stats.emProcesso ?? '0';
        document.getElementById('kpi-adotados').textContent = stats.adotados ?? '0';

        renderCharts(stats);
    } catch (err) {
        showToast('Erro ao carregar estatísticas: ' + err.message, 'error');
    }
}

function renderCharts(stats) {
    const COLORS = ['#f08c67', '#e76f51', '#4ade80', '#60a5fa', '#c084fc', '#f59e0b', '#34d399'];

    // Chart 1: Doughnut – by species
    const ctxE = document.getElementById('chart-especie')?.getContext('2d');
    if (ctxE) {
        if (chartEspecie) chartEspecie.destroy();
        const especieData = stats.porEspecie || [];
        chartEspecie = new Chart(ctxE, {
            type: 'doughnut',
            data: {
                labels: especieData.map(e => e.especie || e.nome),
                datasets: [{
                    data: especieData.map(e => e.quantidade ?? e.total ?? e.count ?? 0),
                    backgroundColor: COLORS,
                    borderWidth: 0,
                    hoverOffset: 8,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { position: 'bottom', labels: { padding: 16, font: { size: 12, family: 'Inter' } } } }
            }
        });
    }

    // Chart 2: Bar – by status
    const ctxS = document.getElementById('chart-status')?.getContext('2d');
    if (ctxS) {
        if (chartStatus) chartStatus.destroy();
        const labels = ['Disponível', 'Em Processo', 'Adotado'];
        const values = [stats.disponiveis || 0, stats.emProcesso || 0, stats.adotados || 0];
        chartStatus = new Chart(ctxS, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Animais',
                    data: values,
                    backgroundColor: ['#d1fae5', '#fef3c7', '#ede9fe'],
                    borderColor: ['#22c55e', '#f59e0b', '#8b5cf6'],
                    borderWidth: 2,
                    borderRadius: 8,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 11 } } },
                    y: { beginAtZero: true, ticks: { precision: 0, font: { family: 'Inter', size: 11 } }, grid: { color: 'rgba(0,0,0,0.05)' } }
                }
            }
        });
    }

    // Chart 3: Line – monthly registrations
    const ctxM = document.getElementById('chart-monthly')?.getContext('2d');
    if (ctxM) {
        if (chartMonthly) chartMonthly.destroy();
        const monthly = stats.cadastrosMensais || stats.mensais || [];
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const labels = monthly.map(m => {
            const rawMonth = m.mes ?? m.month;
            return typeof rawMonth === 'number' ? monthNames[rawMonth - 1] : rawMonth;
        });
        const values2 = monthly.map(m => m.quantidade ?? m.total ?? m.count ?? 0);
        chartMonthly = new Chart(ctxM, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Cadastros',
                    data: values2,
                    borderColor: '#f08c67',
                    backgroundColor: 'rgba(240, 140, 103, 0.1)',
                    borderWidth: 2.5,
                    pointBackgroundColor: '#f08c67',
                    pointRadius: 5,
                    fill: true,
                    tension: 0.4,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 11 } } },
                    y: { beginAtZero: true, ticks: { precision: 0, font: { family: 'Inter', size: 11 } }, grid: { color: 'rgba(0,0,0,0.05)' } }
                }
            }
        });
    }
}

// ─── ANIMAIS CRUD ─────────────────────────────────────────────────────────

let animalsData = [], especiesData = [], racasDataAll = [];
let animalEditId = null;

async function initAnimalsModule() {
    await loadEspeciesForForm();
    await loadAnimalsTable();
    setupAnimalForm();
    setupTableSearch('search-animals', 'animals-tbody', renderAnimalsRows);
}

async function loadEspeciesForForm() {
    try {
        const res = await especieService.getAll();
        especiesData = res.data || res;
        const sel = document.getElementById('a-especie');
        sel.innerHTML = '<option value="">Selecionar</option>' +
            especiesData.map(e => `<option value="${e.id}">${e.nome}</option>`).join('');
        sel.addEventListener('change', () => loadRacasForEspecie(sel.value));

        // Also populate raças form
        const rSel = document.getElementById('r-especie');
        if (rSel) rSel.innerHTML = '<option value="">Selecionar Espécie</option>' +
            especiesData.map(e => `<option value="${e.id}">${e.nome}</option>`).join('');
    } catch (err) {
        console.warn('Species load error:', err.message);
    }
}

async function loadRacasForEspecie(especieId) {
    const sel = document.getElementById('a-raca');
    sel.innerHTML = '<option value="">Selecionar</option>';
    if (!especieId) return;
    try {
        const res = await racaService.getAll();
        const racas = (res.data || res).filter(r => String(r.especie_id) === String(especieId));
        sel.innerHTML = '<option value="">Selecionar</option>' +
            racas.map(r => `<option value="${r.id}">${r.nome}</option>`).join('');
    } catch (err) { }
}

async function loadAnimalsTable() {
    try {
        const res = await animalService.getAll();
        animalsData = res.data || res.animais || res;
        renderAnimalsRows(animalsData);
    } catch (err) {
        document.getElementById('animals-tbody').innerHTML =
            `<tr><td colspan="8" style="text-align:center;color:#ef4444">Erro ao carregar animais.</td></tr>`;
    }
}

function renderAnimalsRows(animals) {
    const tbody = document.getElementById('animals-tbody');
    if (!animals || animals.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:32px">Nenhum animal cadastrado.</td></tr>`;
        return;
    }
    tbody.innerHTML = animals.map(a => {
        const foto = getAnimalImageUrl(a.foto);
        const sc = getStatusClass(a.status);
        return `<tr>
            <td><img src="${foto}" alt="${a.nome}" class="animal-img" onerror="this.src='https://placehold.co/56x44/fff5ef/f08c67?text=Sem'"></td>
            <td><strong>${a.nome}</strong></td>
            <td>${a.especie_nome || a.especie || '—'}</td>
            <td>${a.raca_nome || a.raca || '—'}</td>
            <td>${a.sexo}</td>
            <td>${a.porte}</td>
            <td><span class="badge-status badge-${sc}">${a.status}</span></td>
            <td>
                <div class="table-actions">
                    <button class="action-btn btn-edit" onclick="editAnimal(${a.id})"><i class="fa-solid fa-pen"></i> Editar</button>
                    <button class="action-btn btn-delete" onclick="deleteAnimal(${a.id}, '${a.nome}')"><i class="fa-solid fa-trash"></i></button>
                </div>
            </td>
        </tr>`;
    }).join('');
}

function setupAnimalForm() {
    document.getElementById('animal-form')?.addEventListener('submit', handleAnimalSubmit);
}

async function handleAnimalSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('animal-submit-btn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';

    try {
        const formData = new FormData();
        formData.append('nome', document.getElementById('a-nome').value);
        formData.append('especie_id', document.getElementById('a-especie').value);
        formData.append('raca_id', document.getElementById('a-raca').value);
        formData.append('sexo', document.getElementById('a-sexo').value);
        formData.append('porte', document.getElementById('a-porte').value);
        formData.append('idade', document.getElementById('a-idade').value);
        formData.append('status', document.getElementById('a-status').value);
        formData.append('descricao', document.getElementById('a-descricao').value);
        const fotoFile = document.getElementById('a-foto').files[0];
        if (fotoFile) formData.append('foto', fotoFile);

        if (animalEditId) {
            await animalService.update(animalEditId, formData);
            showToast('Animal atualizado com sucesso!', 'success');
        } else {
            await animalService.create(formData);
            showToast('Animal cadastrado com sucesso!', 'success');
        }

        resetAnimalForm();
        await loadAnimalsTable();
        await initDashboard();
    } catch (err) {
        showToast('Erro: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Salvar';
    }
}

async function editAnimal(id) {
    try {
        const res = await animalService.getById(id);
        const a = res.data || res;
        animalEditId = id;

        document.getElementById('animal-id').value = a.id;
        document.getElementById('a-nome').value = a.nome;
        document.getElementById('a-sexo').value = a.sexo;
        document.getElementById('a-porte').value = a.porte;
        document.getElementById('a-idade').value = a.idade;
        document.getElementById('a-status').value = a.status;
        document.getElementById('a-descricao').value = a.descricao || '';

        // Set species then race
        const especieSel = document.getElementById('a-especie');
        especieSel.value = a.especie_id;
        await loadRacasForEspecie(a.especie_id);
        document.getElementById('a-raca').value = a.raca_id;

        document.getElementById('animal-form-title').innerHTML = '<i class="fa-solid fa-pen"></i> Editar Animal';
        document.getElementById('animal-form-close').style.display = 'block';
        document.getElementById('animal-form-card').scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
        showToast('Erro ao carregar animal: ' + err.message, 'error');
    }
}

async function deleteAnimal(id, nome) {
    if (!confirm(`Deseja excluir o animal "${nome}"? Esta ação não pode ser desfeita.`)) return;
    try {
        await animalService.delete(id);
        showToast('Animal excluído com sucesso!', 'success');
        await loadAnimalsTable();
        await initDashboard();
    } catch (err) {
        showToast('Erro ao excluir: ' + err.message, 'error');
    }
}

function resetAnimalForm() {
    animalEditId = null;
    document.getElementById('animal-form').reset();
    document.getElementById('animal-id').value = '';
    document.getElementById('animal-form-title').innerHTML = '<i class="fa-solid fa-plus"></i> Novo Animal';
    document.getElementById('animal-form-close').style.display = 'none';
    document.getElementById('a-raca').innerHTML = '<option value="">Selecionar</option>';
}

// ─── ESPÉCIES CRUD ────────────────────────────────────────────────────────

let especiesTableData = [];
let especieEditId = null;

async function initEspeciesModule() {
    await loadEspeciesTable();
    document.getElementById('especie-form')?.addEventListener('submit', handleEspecieSubmit);
    setupTableSearch('search-especies', 'especies-tbody', renderEspeciesRows);
}

async function loadEspeciesTable() {
    try {
        const res = await especieService.getAll();
        especiesTableData = res.data || res;
        renderEspeciesRows(especiesTableData);
    } catch (err) {
        document.getElementById('especies-tbody').innerHTML =
            `<tr><td colspan="5" style="text-align:center;color:#ef4444">Erro ao carregar espécies.</td></tr>`;
    }
}

function renderEspeciesRows(rows) {
    const tbody = document.getElementById('especies-tbody');
    if (!rows || rows.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:32px">Nenhuma espécie cadastrada.</td></tr>`;
        return;
    }
    tbody.innerHTML = rows.map(e => `<tr>
        <td>${e.id}</td>
        <td><strong>${e.nome}</strong></td>
        <td>${e.descricao || '—'}</td>
        <td>${formatDate(e.created_at)}</td>
        <td>
            <div class="table-actions">
                <button class="action-btn btn-edit" onclick="editEspecie(${e.id})"><i class="fa-solid fa-pen"></i> Editar</button>
                <button class="action-btn btn-delete" onclick="deleteEspecie(${e.id}, '${e.nome}')"><i class="fa-solid fa-trash"></i></button>
            </div>
        </td>
    </tr>`).join('');
}

async function handleEspecieSubmit(e) {
    e.preventDefault();
    const nome = document.getElementById('e-nome').value.trim();
    const descricao = document.getElementById('e-descricao').value.trim();
    if (!nome) return;

    try {
        if (especieEditId) {
            await especieService.update(especieEditId, { nome, descricao });
            showToast('Espécie atualizada!', 'success');
        } else {
            await especieService.create({ nome, descricao });
            showToast('Espécie cadastrada!', 'success');
        }
        resetEspecieForm();
        await loadEspeciesTable();
        await loadEspeciesForForm();
    } catch (err) {
        showToast('Erro: ' + err.message, 'error');
    }
}

function editEspecie(id) {
    const e = especiesTableData.find(x => x.id === id);
    if (!e) return;
    especieEditId = id;
    document.getElementById('especie-id').value = e.id;
    document.getElementById('e-nome').value = e.nome;
    document.getElementById('e-descricao').value = e.descricao || '';
    document.getElementById('especie-form-title').innerHTML = '<i class="fa-solid fa-pen"></i> Editar Espécie';
    document.getElementById('panel-especies').scrollTo({ top: 0, behavior: 'smooth' });
}

async function deleteEspecie(id, nome) {
    if (!confirm(`Deseja excluir a espécie "${nome}"?`)) return;
    try {
        await especieService.delete(id);
        showToast('Espécie excluída!', 'success');
        await loadEspeciesTable();
        await loadEspeciesForForm();
    } catch (err) {
        showToast('Erro: ' + err.message, 'error');
    }
}

function resetEspecieForm() {
    especieEditId = null;
    document.getElementById('especie-form').reset();
    document.getElementById('especie-id').value = '';
    document.getElementById('especie-form-title').innerHTML = '<i class="fa-solid fa-plus"></i> Nova Espécie';
}

// ─── RAÇAS CRUD ───────────────────────────────────────────────────────────

let racasTableData = [];
let racaEditId = null;

async function initRacasModule() {
    await loadRacasTable();
    document.getElementById('raca-form')?.addEventListener('submit', handleRacaSubmit);
    setupTableSearch('search-racas', 'racas-tbody', renderRacasRows);
}

async function loadRacasTable() {
    try {
        const res = await racaService.getAll();
        racasTableData = res.data || res;
        renderRacasRows(racasTableData);
    } catch (err) {
        document.getElementById('racas-tbody').innerHTML =
            `<tr><td colspan="5" style="text-align:center;color:#ef4444">Erro ao carregar raças.</td></tr>`;
    }
}

function renderRacasRows(rows) {
    const tbody = document.getElementById('racas-tbody');
    if (!rows || rows.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:32px">Nenhuma raça cadastrada.</td></tr>`;
        return;
    }
    tbody.innerHTML = rows.map(r => `<tr>
        <td>${r.id}</td>
        <td><strong>${r.nome}</strong></td>
        <td>${r.especie_nome || r.especie || '—'}</td>
        <td>${r.descricao || '—'}</td>
        <td>
            <div class="table-actions">
                <button class="action-btn btn-edit" onclick="editRaca(${r.id})"><i class="fa-solid fa-pen"></i> Editar</button>
                <button class="action-btn btn-delete" onclick="deleteRaca(${r.id}, '${r.nome}')"><i class="fa-solid fa-trash"></i></button>
            </div>
        </td>
    </tr>`).join('');
}

async function handleRacaSubmit(e) {
    e.preventDefault();
    const nome = document.getElementById('r-nome').value.trim();
    const especie_id = document.getElementById('r-especie').value;
    const descricao = document.getElementById('r-descricao').value.trim();
    if (!nome || !especie_id) { showToast('Nome e Espécie são obrigatórios.', 'warning'); return; }

    try {
        if (racaEditId) {
            await racaService.update(racaEditId, { nome, especie_id, descricao });
            showToast('Raça atualizada!', 'success');
        } else {
            await racaService.create({ nome, especie_id, descricao });
            showToast('Raça cadastrada!', 'success');
        }
        resetRacaForm();
        await loadRacasTable();
    } catch (err) {
        showToast('Erro: ' + err.message, 'error');
    }
}

function editRaca(id) {
    const r = racasTableData.find(x => x.id === id);
    if (!r) return;
    racaEditId = id;
    document.getElementById('raca-id').value = r.id;
    document.getElementById('r-nome').value = r.nome;
    document.getElementById('r-especie').value = r.especie_id;
    document.getElementById('r-descricao').value = r.descricao || '';
    document.getElementById('raca-form-title').innerHTML = '<i class="fa-solid fa-pen"></i> Editar Raça';
}

async function deleteRaca(id, nome) {
    if (!confirm(`Deseja excluir a raça "${nome}"?`)) return;
    try {
        await racaService.delete(id);
        showToast('Raça excluída!', 'success');
        await loadRacasTable();
    } catch (err) {
        showToast('Erro: ' + err.message, 'error');
    }
}

function resetRacaForm() {
    racaEditId = null;
    document.getElementById('raca-form').reset();
    document.getElementById('raca-id').value = '';
    document.getElementById('raca-form-title').innerHTML = '<i class="fa-solid fa-plus"></i> Nova Raça';
}

// ─── DENÚNCIAS MODULE ──────────────────────────────────────────────────────

let denunciasData = [];

function escapeHtml(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getDenunciaStatusClass(status) {
    const map = {
        'Pendente': 'pendente',
        'Em Análise': 'em-analise',
        'Em Atendimento': 'em-atendimento',
        'Resolvida': 'resolvida',
        'Arquivada': 'arquivada'
    };
    return map[status] || 'pendente';
}

async function initDenunciasModule() {
    await loadDenunciasTable();

    document.getElementById('search-denuncias')?.addEventListener('input', applyDenunciasFilters);
    document.getElementById('filter-denuncias-status')?.addEventListener('change', applyDenunciasFilters);

    document.getElementById('denuncia-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'denuncia-modal') closeDenunciaModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeDenunciaModal();
    });
}

async function loadDenunciasTable() {
    try {
        const res = await denunciaService.getAll();
        denunciasData = res.data || res || [];
        updateDenunciasSummary(denunciasData);
        applyDenunciasFilters();
    } catch (err) {
        const tbody = document.getElementById('denuncias-tbody');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:#ef4444">Erro ao carregar denúncias.</td></tr>`;
        }
    }
}

function updateDenunciasSummary(rows) {
    const total = rows.length;
    const pendentes = rows.filter(d => d.status === 'Pendente').length;
    const andamento = rows.filter(d => d.status === 'Em Análise' || d.status === 'Em Atendimento').length;
    const resolvidas = rows.filter(d => d.status === 'Resolvida').length;

    const setEl = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };
    setEl('den-kpi-total', total);
    setEl('den-kpi-pendentes', pendentes);
    setEl('den-kpi-andamento', andamento);
    setEl('den-kpi-resolvidas', resolvidas);

    const badge = document.getElementById('denuncias-pending-badge');
    if (badge) {
        if (pendentes > 0) {
            badge.textContent = pendentes;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
}

function applyDenunciasFilters() {
    const q = (document.getElementById('search-denuncias')?.value || '').toLowerCase().trim();
    const statusFilter = document.getElementById('filter-denuncias-status')?.value || '';

    const filtered = denunciasData.filter(d => {
        if (statusFilter && d.status !== statusFilter) return false;
        if (q) {
            const searchable = [
                `#den-${d.id}`,
                d.tipo_maus_tratos,
                d.especie_animal,
                d.endereco,
                d.bairro_cidade,
                d.denunciante_nome,
                d.descricao,
                d.status
            ].join(' ').toLowerCase();
            if (!searchable.includes(q)) return false;
        }
        return true;
    });

    renderDenunciasRows(filtered);
}

function renderDenunciasRows(rows) {
    const tbody = document.getElementById('denuncias-tbody');
    if (!tbody) return;

    if (!rows || rows.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:32px">Nenhuma denúncia encontrada.</td></tr>`;
        return;
    }

    tbody.innerHTML = rows.map(d => {
        const sc = getDenunciaStatusClass(d.status);
        const denunciante = d.anonima
            ? '<span style="color:var(--text-muted);font-style:italic">Anônimo</span>'
            : escapeHtml(d.denunciante_nome || 'Não informado');

        return `<tr>
            <td><strong>#DEN-${d.id}</strong></td>
            <td>${formatDate(d.created_at)}</td>
            <td>${escapeHtml(d.tipo_maus_tratos)}</td>
            <td>${escapeHtml(d.especie_animal)}</td>
            <td>
                <div>${escapeHtml(d.endereco)}</div>
                <small style="color:var(--text-muted)">${escapeHtml(d.bairro_cidade)}</small>
            </td>
            <td>${denunciante}</td>
            <td><span class="badge-status badge-${sc}">${escapeHtml(d.status)}</span></td>
            <td>
                <div class="table-actions">
                    <button class="action-btn btn-edit" onclick="openDenunciaModal(${d.id})">
                        <i class="fa-solid fa-eye"></i> Ver
                    </button>
                    <button class="action-btn btn-delete" onclick="deleteDenuncia(${d.id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>`;
    }).join('');
}

function openDenunciaModal(id) {
    const d = denunciasData.find(item => item.id === id);
    if (!d) return;

    const modal = document.getElementById('denuncia-modal');
    const title = document.getElementById('denuncia-modal-title');
    const body = document.getElementById('denuncia-modal-body');

    title.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Denúncia #DEN-${d.id}`;

    const denunciante = d.anonima
        ? 'Denúncia Anônima'
        : escapeHtml(d.denunciante_nome || 'Não informado');
    const contato = d.anonima
        ? 'Sigiloso / Não informado'
        : escapeHtml(d.denunciante_contato || 'Não informado');
    const dataOcorrencia = d.data_ocorrencia ? formatDate(d.data_ocorrencia) : 'Não informada';
    const fotoHtml = d.foto
        ? `<div class="denuncia-detail-item full">
                <span class="label">Foto / Evidência</span>
                <img src="${escapeHtml(getAnimalImageUrl(d.foto))}" alt="Evidência da denúncia #DEN-${d.id}" class="denuncia-photo-preview" onerror="this.style.display='none'">
           </div>`
        : '';

    body.innerHTML = `
        <div class="denuncia-detail-grid">
            <div class="denuncia-detail-item">
                <span class="label">Status Atual</span>
                <div class="value"><span class="badge-status badge-${getDenunciaStatusClass(d.status)}">${escapeHtml(d.status)}</span></div>
            </div>
            <div class="denuncia-detail-item">
                <span class="label">Registrada em</span>
                <div class="value">${formatDate(d.created_at)}</div>
            </div>
            <div class="denuncia-detail-item">
                <span class="label">Denunciante</span>
                <div class="value">${denunciante}</div>
            </div>
            <div class="denuncia-detail-item">
                <span class="label">Contato</span>
                <div class="value">${contato}</div>
            </div>
            <div class="denuncia-detail-item">
                <span class="label">Tipo de Maus-Tratos</span>
                <div class="value">${escapeHtml(d.tipo_maus_tratos)}</div>
            </div>
            <div class="denuncia-detail-item">
                <span class="label">Animal / Espécie</span>
                <div class="value">${escapeHtml(d.especie_animal)}</div>
            </div>
            <div class="denuncia-detail-item">
                <span class="label">Endereço / Referência</span>
                <div class="value">${escapeHtml(d.endereco)}</div>
            </div>
            <div class="denuncia-detail-item">
                <span class="label">Bairro / Cidade</span>
                <div class="value">${escapeHtml(d.bairro_cidade)}</div>
            </div>
            <div class="denuncia-detail-item full">
                <span class="label">Data Aproximada da Ocorrência</span>
                <div class="value">${escapeHtml(dataOcorrencia)}</div>
            </div>
            <div class="denuncia-detail-item full">
                <span class="label">Descrição dos Fatos</span>
                <div class="value">${escapeHtml(d.descricao)}</div>
            </div>
            ${fotoHtml}
        </div>

        <form id="denuncia-status-form" class="denuncia-status-form">
            <div class="form-grid-2">
                <div class="form-group">
                    <label for="d-status">Atualizar Status *</label>
                    <select id="d-status" required>
                        <option value="Pendente" ${d.status === 'Pendente' ? 'selected' : ''}>Pendente</option>
                        <option value="Em Análise" ${d.status === 'Em Análise' ? 'selected' : ''}>Em Análise</option>
                        <option value="Em Atendimento" ${d.status === 'Em Atendimento' ? 'selected' : ''}>Em Atendimento</option>
                        <option value="Resolvida" ${d.status === 'Resolvida' ? 'selected' : ''}>Resolvida</option>
                        <option value="Arquivada" ${d.status === 'Arquivada' ? 'selected' : ''}>Arquivada</option>
                    </select>
                </div>
                <div class="form-group form-span-2">
                    <label for="d-observacoes">Observações Internas da Equipe</label>
                    <textarea id="d-observacoes" rows="3" placeholder="Registre ações tomadas, equipe encaminhada ou observações...">${escapeHtml(d.observacoes_admin || '')}</textarea>
                </div>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary" id="denuncia-save-btn">
                    <i class="fa-solid fa-check"></i> Salvar Atualização
                </button>
                <button type="button" class="btn btn-outline" onclick="closeDenunciaModal()">
                    Fechar
                </button>
            </div>
        </form>
    `;

    document.getElementById('denuncia-status-form')?.addEventListener('submit', (e) => handleDenunciaStatusUpdate(e, d.id));
    modal.classList.add('open');
}

function closeDenunciaModal() {
    document.getElementById('denuncia-modal')?.classList.remove('open');
}

async function handleDenunciaStatusUpdate(e, id) {
    e.preventDefault();
    const btn = document.getElementById('denuncia-save-btn');
    const status = document.getElementById('d-status').value;
    const observacoes_admin = document.getElementById('d-observacoes').value.trim();

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';

    try {
        await denunciaService.updateStatus(id, { status, observacoes_admin });
        showToast(`Denúncia #DEN-${id} atualizada com sucesso!`, 'success');
        closeDenunciaModal();
        await loadDenunciasTable();
    } catch (err) {
        showToast('Erro ao atualizar denúncia: ' + err.message, 'error');
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Salvar Atualização';
    }
}

async function deleteDenuncia(id) {
    if (!confirm(`Deseja excluir a denúncia #DEN-${id}? Esta ação não pode ser desfeita.`)) return;
    try {
        await denunciaService.delete(id);
        showToast('Denúncia excluída com sucesso!', 'success');
        await loadDenunciasTable();
    } catch (err) {
        showToast('Erro ao excluir denúncia: ' + err.message, 'error');
    }
}

// ─── USUÁRIOS CRUD ────────────────────────────────────────────────────────

let usuariosData = [];
let usuarioEditId = null;

async function initUsuariosModule() {
    await loadUsuariosTable();
    document.getElementById('usuario-form')?.addEventListener('submit', handleUsuarioSubmit);
    setupTableSearch('search-usuarios', 'usuarios-tbody', renderUsuariosRows);
}

async function loadUsuariosTable() {
    try {
        const res = await usuarioService.getAll();
        usuariosData = res.data || res;
        renderUsuariosRows(usuariosData);
    } catch (err) {
        document.getElementById('usuarios-tbody').innerHTML =
            `<tr><td colspan="6" style="text-align:center;color:#ef4444">Erro ao carregar usuários.</td></tr>`;
    }
}

function renderUsuariosRows(rows) {
    const tbody = document.getElementById('usuarios-tbody');
    if (!rows || rows.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:32px">Nenhum usuário cadastrado.</td></tr>`;
        return;
    }
    tbody.innerHTML = rows.map(u => {
        const sc = u.status === 'Ativo' ? 'ativo' : 'inativo';
        return `<tr>
            <td><strong>${u.nome}</strong></td>
            <td>${u.usuario}</td>
            <td>${u.perfil}</td>
            <td><span class="badge-status badge-${sc}">${u.status}</span></td>
            <td>${formatDate(u.created_at)}</td>
            <td>
                <div class="table-actions">
                    <button class="action-btn btn-edit" onclick="editUsuario(${u.id})"><i class="fa-solid fa-pen"></i> Editar</button>
                    ${u.usuario !== 'admin' ? `<button class="action-btn btn-delete" onclick="deleteUsuario(${u.id}, '${u.nome}')"><i class="fa-solid fa-trash"></i></button>` : '<span style="color:var(--text-muted);font-size:0.8rem">Protegido</span>'}
                </div>
            </td>
        </tr>`;
    }).join('');
}

async function handleUsuarioSubmit(e) {
    e.preventDefault();
    const nome = document.getElementById('u-nome').value.trim();
    const usuario = document.getElementById('u-usuario').value.trim();
    const senha = document.getElementById('u-senha').value;
    const perfil = document.getElementById('u-perfil').value;
    const status = document.getElementById('u-status').value;

    if (!nome || !usuario) { showToast('Nome e Usuário são obrigatórios.', 'warning'); return; }

    const payload = { nome, usuario, perfil, status };
    if (senha) payload.senha = senha;

    try {
        if (usuarioEditId) {
            await usuarioService.update(usuarioEditId, payload);
            showToast('Usuário atualizado!', 'success');
        } else {
            if (!senha) { showToast('Senha é obrigatória para novo usuário.', 'warning'); return; }
            await usuarioService.create(payload);
            showToast('Usuário cadastrado!', 'success');
        }
        resetUsuarioForm();
        await loadUsuariosTable();
    } catch (err) {
        showToast('Erro: ' + err.message, 'error');
    }
}

function editUsuario(id) {
    const u = usuariosData.find(x => x.id === id);
    if (!u) return;
    usuarioEditId = id;
    document.getElementById('usuario-id').value = u.id;
    document.getElementById('u-nome').value = u.nome;
    document.getElementById('u-usuario').value = u.usuario;
    document.getElementById('u-senha').value = '';
    document.getElementById('u-perfil').value = u.perfil;
    document.getElementById('u-status').value = u.status;
    document.getElementById('usuario-form-title').innerHTML = '<i class="fa-solid fa-pen"></i> Editar Usuário';
    document.getElementById('senha-hint').style.display = 'inline';
}

async function deleteUsuario(id, nome) {
    if (!confirm(`Deseja excluir o usuário "${nome}"?`)) return;
    try {
        await usuarioService.delete(id);
        showToast('Usuário excluído!', 'success');
        await loadUsuariosTable();
    } catch (err) {
        showToast('Erro: ' + err.message, 'error');
    }
}

function resetUsuarioForm() {
    usuarioEditId = null;
    document.getElementById('usuario-form').reset();
    document.getElementById('usuario-id').value = '';
    document.getElementById('usuario-form-title').innerHTML = '<i class="fa-solid fa-plus"></i> Novo Usuário';
}

// ─── Table Search Utility ─────────────────────────────────────────────────

function setupTableSearch(inputId, tbodyId, renderFn) {
    const input = document.getElementById(inputId);
    if (!input) return;

    let data;
    if (tbodyId === 'animals-tbody') data = () => animalsData;
    else if (tbodyId === 'especies-tbody') data = () => especiesTableData;
    else if (tbodyId === 'racas-tbody') data = () => racasTableData;
    else if (tbodyId === 'usuarios-tbody') data = () => usuariosData;
    else return;

    input.addEventListener('input', () => {
        const q = input.value.toLowerCase().trim();
        const rows = data();
        const filtered = q
            ? rows.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(q)))
            : rows;
        renderFn(filtered);
    });
}
