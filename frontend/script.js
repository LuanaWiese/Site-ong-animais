const API_URL = 'http://localhost:3000/api/pets'

const petInput = document.getElementById('pet-input');
const ageInput = document.getElementById('age-input');
const nameInput = document.getElementById('name-input');
const animalForm = document.getElementById('animal-form');
const petList = document.getElementById('pet-list');
const counterText = document.getElementById('counter-text');
const inputLabel = document.querySelector('.input-area label');

let pets = [];
let editingPetId = null;

async function savePet(e) {
    e.preventDefault();

    const animal = document.getElementById('pet-input').value.trim();
    const idade = document.getElementById('age-input').value.trim();
    const nome = document.getElementById('name-input').value.trim();

    if (!animal || !idade || !nome) return;

    try {
        if (editingPetId) {
            const petAtual = pets.find(t => t.id === editingPetId);

            await axios.put(`${API_URL}/${editingPetId}`, {
                animal: animal,
                idade: idade,
                nome: nome,
                adotado: false
            });

            editingPetId = null;
            inputLabel.innerText = "Cadastre o animal";

        } else {
            await axios.post(API_URL, {
                animal: animal,
                idade: idade,
                nome: nome
            });
        }

        // limpar inputs
        document.getElementById('pet-input').value = '';
        document.getElementById('age-input').value = '';
        document.getElementById('name-input').value = '';

        fetchPets();

    } catch (error) {
        console.log("Erro completo:", error);
        console.log("Resposta do servidor:", error.response);
        console.log("Dados:", error.response?.data);
        alert("Erro ao tentar salvar o animal");
    }
}

function renderPets() {
    petList.innerHTML = '';
    let concluidoCount = 0;
    const totalCount = pets.length;

    pets.forEach(pet => {
        if (pet.adotado) concluidoCount++;

        const li = document.createElement('li');
        li.className = `pet-item ${pet.adotado ? 'completed' : ''}`;

        const iconeEstado = pet.adotado
            ? '<i class="fa-solid fa-heart"></i>'
            : '<i class="fa-regular fa-heart"></i>';

        li.innerHTML = `
        <div class="pet-content">
            <button class="check-btn" onclick="togglePet(${pet.id})">
                ${iconeEstado}
            </button>
            <span class="pet-name">${pet.nome}</span>
            <span class="pet-text">${pet.idade}</span>
            <span class="pet-text">${pet.animal}</span>
        </div>
        <div class="pet-actions">
            <button class="edit-btn" onclick="prepareEdit(${pet.id})"><i class="fa-regular fa-pen-to-square"></i></button>
            <button class="delete-btn" onclick="deletePet(${pet.id})"><i class="fa-regular fa-trash-can"></i></button>
        </div>`;

        petList.appendChild(li);
    });

    counterText.innerHTML = `${concluidoCount}/${totalCount}`;
}

async function fetchPets() {
    try {
        const response = await axios.get(API_URL);
        pets = response.data;
        renderPets();
    } catch (error) {
        console.log("Erro ao buscar animais:", error);
        alert("Falha de conexão com a API");
    }
}

async function togglePet(id) {
    const petAtual = pets.find(t => t.id === id);
    if (!petAtual) return;

    const novoStatus = !petAtual.adotado;

    try {
        await axios.put(`${API_URL}/${id}`, {
            animal: petAtual.animal,
            idade: petAtual.idade,
            nome: petAtual.nome,
            adotado: novoStatus
        });

        fetchPets();
    } catch (error) {
        console.log("Erro ao alterar as informações:", error);
    }
}

async function deletePet(id) {
    if (!confirm("Tem certeza que deseja excluir?")) return;

    try {
        await axios.delete(`${API_URL}/${id}`);
        fetchPets();
    } catch (error) {
        console.log("Erro ao deletar:", error);
    }
}

function prepareEdit(id) {
    const petAtual = pets.find(t => t.id === id);
    if (!petAtual) return;

    editingPetId = petAtual.id;

    petInput.value = petAtual.animal;
    ageInput.value = petAtual.idade;
    nameInput.value = petAtual.nome;

    inputLabel.innerText = "Edite as informações";
    petInput.focus();
}

animalForm.addEventListener('submit', savePet);
fetchPets();