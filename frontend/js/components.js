/**
 * components.js - Dynamic component loader & global utilities
 * Loads header/footer into pages, sets active nav links, and provides
 * showToast() and other global helpers.
 */

// ─── Component Loader ──────────────────────────────────────────────────────

async function loadComponent(selector, url) {
    try {
        const el = document.querySelector(selector);
        if (!el) return;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to load ${url}`);
        el.innerHTML = await res.text();
    } catch (err) {
        console.warn('Component load error:', err);
    }
}

function setActiveNav() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-menu a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === path || (path === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

function initMobileMenu() {
    const toggle = document.getElementById('menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    if (!toggle || !navMenu) return;
    toggle.addEventListener('click', () => {
        navMenu.classList.toggle('open');
        const icon = toggle.querySelector('i');
        icon.className = navMenu.classList.contains('open')
            ? 'fa-solid fa-xmark'
            : 'fa-solid fa-bars';
    });
}

async function initPublicComponents() {
    const basePath = getBasePath();
    await Promise.all([
        loadComponent('#header-placeholder', `${basePath}components/header.html`),
        loadComponent('#footer-placeholder', `${basePath}components/footer.html`),
    ]);
    setActiveNav();
    initMobileMenu();
}

function getBasePath() {
    // Determine relative path to frontend root
    const depth = window.location.pathname.split('/').filter(Boolean).length;
    // For pages at root level: no prefix needed (if served from frontend/)
    return '';
}

// ─── Toast Notifications ──────────────────────────────────────────────────

function showToast(message, type = 'info', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-circle-xmark',
        warning: 'fa-triangle-exclamation',
        info: 'fa-circle-info'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fa-solid ${icons[type] || icons.info}" style="color: ${getToastColor(type)}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease reverse forwards';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function getToastColor(type) {
    const map = { success: '#22c55e', error: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };
    return map[type] || map.info;
}

// ─── Confirm Dialog ────────────────────────────────────────────────────────

function confirmAction(message) {
    return window.confirm(message);
}

// ─── Format Helpers ────────────────────────────────────────────────────────

function formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR');
}

function getAnimalImageUrl(foto) {
    if (!foto) return 'https://placehold.co/400x300/fff5ef/f08c67?text=Sem+Foto';
    if (foto.startsWith('http')) return foto;
    if (foto.startsWith('/uploads/')) return `http://localhost:3000${foto}`;
    return `http://localhost:3000/uploads/${foto}`;
}

function getStatusClass(status) {
    const map = {
        'Disponível': 'disponivel',
        'Em Processo': 'em-processo',
        'Adotado': 'adotado'
    };
    return map[status] || 'disponivel';
}

function getSexoClass(sexo) {
    return sexo === 'Macho' ? 'macho' : 'femea';
}

function getPorteClass(porte) {
    const map = { 'Pequeno': 'pequeno', 'Médio': 'medio', 'Grande': 'grande' };
    return map[porte] || 'pequeno';
}
