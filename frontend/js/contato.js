/**
 * contato.js - Contact page logic with form validation
 */

document.addEventListener('DOMContentLoaded', async () => {
    await initPublicComponents();
    setupContactForm();
});

function setupContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', handleSubmit);

    // Live validation
    ['contact-nome', 'contact-email', 'contact-assunto', 'contact-mensagem'].forEach(id => {
        document.getElementById(id)?.addEventListener('blur', () => validateField(id));
    });
}

function validateField(id) {
    const el = document.getElementById(id);
    if (!el) return true;
    const val = el.value.trim();
    let errorId = 'error-' + id.replace('contact-', '');
    let errorEl = document.getElementById(errorId);

    if (!errorEl) return true;

    let error = '';
    if (!val) {
        error = 'Este campo é obrigatório.';
    } else if (id === 'contact-email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val)) error = 'Insira um e-mail válido.';
    }

    errorEl.textContent = error;
    if (error) {
        el.classList.add('invalid');
    } else {
        el.classList.remove('invalid');
    }

    return !error;
}

function validateAll() {
    const fields = ['contact-nome', 'contact-email', 'contact-assunto', 'contact-mensagem'];
    return fields.map(id => validateField(id)).every(Boolean);
}

async function handleSubmit(e) {
    e.preventDefault();

    if (!validateAll()) {
        showToast('Por favor, corrija os erros no formulário.', 'error');
        return;
    }

    const btn = document.getElementById('contact-submit');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';

    // Simulate sending (no real email endpoint)
    await new Promise(r => setTimeout(r, 1200));

    // Show success state
    const formCard = document.querySelector('.contact-form-card');
    formCard.innerHTML = `
        <div class="form-success">
            <i class="fa-solid fa-circle-check success-icon"></i>
            <h3>Mensagem Enviada!</h3>
            <p>Obrigado por entrar em contato, <strong>${document.getElementById('contact-nome').value}</strong>!<br>
            Responderemos em até 24 horas pelo e-mail <strong>${document.getElementById('contact-email').value}</strong>.</p>
        </div>
    `;
    showToast('Mensagem enviada com sucesso!', 'success');
}
