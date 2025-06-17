import { includeHeader, includeFooter } from '../../js/utils/include.js';

document.addEventListener('DOMContentLoaded', () => {
  includeHeader();
  includeFooter();
  const form = document.getElementById('cadastro-form');
  const firstNameInput = document.getElementById('cadastro-nome');
  const lastNameInput = document.getElementById('cadastro-sobrenome');
  const DocNumberInput = document.getElementById('cadastro-cpf-cnpj');
  const emailInput = document.getElementById('cadastro-email');
  const passwordInput = document.getElementById('cadastro-senha');
  const tipoViajante = document.getElementById('tipo-viajante');
  const tipoParceiro = document.getElementById('tipo-parceiro');

  async function cadastrarUsuario(dados) {
    // Simulação de chamada ao backend
    try {
      // Aqui você pode integrar com o backend real futuramente
      // const response = await fetch('/api/cadastro', { method: 'POST', body: JSON.stringify(dados) });
      // if (!response.ok) throw new Error('Cadastro inválido');
      // const data = await response.json(); // use data conforme necessário

      // Mock: aceita qualquer cadastro
      if (!dados.firstName || !dados.lastName || !dados.DocNumber || !dados.email || !dados.password) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
      }
      window.localStorage.setItem('isAuthenticated', 'true');
      window.location.href = '../user_dashboard/user-dashboard.html';
    } catch (err) {
      alert('Erro ao cadastrar usuário.');
    }
  }

  if (form) {
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      const dados = {
        firstName: firstNameInput.value.trim(),
        lastName: lastNameInput.value.trim(),
        DocNumber: DocNumberInput.value.trim(),
        email: emailInput.value.trim(),
        password: passwordInput.value.trim(),
        userType: tipoViajante.checked ? 'traveler' : 'partner'
      };
      cadastrarUsuario(dados);
    });
  }
}); 