/**
 * denuncias.js - Public animal abuse report page logic
 */

document.addEventListener('DOMContentLoaded', async () => {
    await initPublicComponents();
    setupDenunciaForm();
});

function setupDenunciaForm() {
    const form = document.getElementById('denuncia-form');
    if (!form) return;

    const anonCheckbox = document.getElementById('denuncia-anonima');
    const identFields = document.getElementById('identificacao-fields');
    const nomeInput = document.getElementById('denuncia-nome');
    const contatoInput = document.getElementById('denuncia-contato');

    anonCheckbox?.addEventListener('change', () => {
        if (anonCheckbox.checked) {
            identFields?.classList.add('identificacao-hidden');
            if (nomeInput) nomeInput.value = '';
            if (contatoInput) contatoInput.value = '';
        } else {
            identFields?.classList.remove('identificacao-hidden');
        }
    });

    ['denuncia-tipo', 'denuncia-especie', 'denuncia-endereco', 'denuncia-bairro-cidade', 'denuncia-descricao'].forEach(id => {
        document.getElementById(id)?.addEventListener('blur', () => validateField(id));
    });

    form.addEventListener('submit', handleDenunciaSubmit);
}

const FIELD_ERROR_MAP = {
    'denuncia-tipo': 'error-tipo',
    'denuncia-especie': 'error-especie',
    'denuncia-endereco': 'error-endereco',
    'denuncia-bairro-cidade': 'error-bairro-cidade',
    'denuncia-descricao': 'error-descricao'
};

function validateField(id) {
    const el = document.getElementById(id);
    const errorEl = document.getElementById(FIELD_ERROR_MAP[id]);
    if (!el || !errorEl) return true;

    const val = el.value.trim();
    let error = '';

    if (!val) {
        error = 'Este campo é obrigatório.';
    } else if (id === 'denuncia-endereco' && val.length < 5) {
        error = 'Informe um endereço ou referência mais detalhado (mín. 5 caracteres).';
    } else if (id === 'denuncia-descricao' && val.length < 10) {
        error = 'Descreva a situação com pelo menos 10 caracteres.';
    }

    errorEl.textContent = error;
    el.classList.toggle('invalid', Boolean(error));
    return !error;
}

function validateAll() {
    return Object.keys(FIELD_ERROR_MAP).map(id => validateField(id)).every(Boolean);
}

async function handleDenunciaSubmit(e) {
    e.preventDefault();

    if (!validateAll()) {
        showToast('Por favor, preencha os campos obrigatórios corretamente.', 'error');
        return;
    }

    const btn = document.getElementById('denuncia-submit');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';

    try {
        const formData = new FormData();
        const isAnonima = document.getElementById('denuncia-anonima')?.checked;
        formData.append('anonima', isAnonima ? 'true' : 'false');

        if (!isAnonima) {
            formData.append('denunciante_nome', document.getElementById('denuncia-nome')?.value.trim() || '');
            formData.append('denunciante_contato', document.getElementById('denuncia-contato')?.value.trim() || '');
        }

        formData.append('tipo_maus_tratos', document.getElementById('denuncia-tipo').value);
        formData.append('especie_animal', document.getElementById('denuncia-especie').value);
        formData.append('endereco', document.getElementById('denuncia-endereco').value.trim());
        formData.append('bairro_cidade', document.getElementById('denuncia-bairro-cidade').value.trim());
        formData.append('data_ocorrencia', document.getElementById('denuncia-data')?.value || '');
        formData.append('descricao', document.getElementById('denuncia-descricao').value.trim());

        const fotoFile = document.getElementById('denuncia-foto')?.files[0];
        if (fotoFile) {
            formData.append('foto', fotoFile);
        }

        const res = await denunciaService.create(formData);
        const denunciaId = res?.denuncia?.id || '—';

        const card = document.getElementById('report-form-card');
        card.innerHTML = `
            <div class="form-success">
                <i class="fa-solid fa-circle-check success-icon"></i>
                <h3>Denúncia Registrada!</h3>
                <p>Recebemos sua denúncia e nossa equipe do <strong>Grupo de Resgates</strong> irá analisá-la o quanto antes.</p>
                <div class="protocol-badge">Protocolo #DEN-${denunciaId}</div>
                <p style="font-size:0.9rem;">Caso haja risco imediato à vida do animal, acione também a Polícia Militar pelo <strong>190</strong>.</p>
                <div style="margin-top:24px;">
                    <a href="denuncias.html" class="btn btn-outline">
                        <i class="fa-solid fa-plus"></i> Fazer Nova Denúncia
                    </a>
                </div>
            </div>
        `;
        showToast('Denúncia enviada com sucesso!', 'success');
    } catch (err) {
        showToast('Erro ao enviar denúncia: ' + err.message, 'error');
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Enviar Denúncia';
    }
}
