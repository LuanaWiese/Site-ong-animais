/**
 * login.js - Login page logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // Redirect if already authenticated
    if (authService.isAuthenticated()) {
        window.location.href = 'admin/dashboard.html';
        return;
    }

    setupForm();
    setupPasswordToggle();
});

function setupForm() {
    const form = document.getElementById('login-form');
    form?.addEventListener('submit', handleLogin);
}

function setupPasswordToggle() {
    const btn = document.getElementById('toggle-pass');
    const input = document.getElementById('login-senha');
    const icon = document.getElementById('toggle-pass-icon');
    if (!btn || !input) return;

    btn.addEventListener('click', () => {
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        icon.className = isPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
    });
}

async function handleLogin(e) {
    e.preventDefault();

    const usuario = document.getElementById('login-usuario')?.value.trim();
    const senha = document.getElementById('login-senha')?.value;
    const errorDiv = document.getElementById('login-error');
    const errorMsg = document.getElementById('login-error-msg');
    const btn = document.getElementById('login-btn');

    // Hide any previous error
    errorDiv.style.display = 'none';

    if (!usuario || !senha) {
        errorMsg.textContent = 'Por favor, preencha usuário e senha.';
        errorDiv.style.display = 'flex';
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Entrando...';

    try {
        await authService.login(usuario, senha);
        showToast('Login realizado com sucesso!', 'success', 1500);
        setTimeout(() => {
            window.location.href = 'admin/dashboard.html';
        }, 800);
    } catch (err) {
        errorMsg.textContent = err.message || 'Usuário ou senha inválidos.';
        errorDiv.style.display = 'flex';
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket"></i> Entrar';

        // Shake animation on error
        const form = document.getElementById('login-form');
        form.style.animation = 'shake 0.4s ease';
        setTimeout(() => form.style.animation = '', 400);
    }
}
