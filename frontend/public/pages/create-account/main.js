import { includeHeader, includeFooter } from '../../js/utils/include.js';
import { createUser } from '../../js/config/firebase-config.js';
import { apiService } from '../../services/api/apiService.js';

document.addEventListener('DOMContentLoaded', () => {
  includeHeader();
  includeFooter();
  const form = document.getElementById('cadastro-form');
  const firstNameInput = document.getElementById('cadastro-nome');
  const lastNameInput = document.getElementById('cadastro-sobrenome');
  const cpfCnpjInput = document.getElementById('cadastro-cpf-cnpj');
  const emailInput = document.getElementById('cadastro-email');
  const passwordInput = document.getElementById('cadastro-senha');
  const tipoViajante = document.getElementById('tipo-viajante');
  const tipoParceiro = document.getElementById('tipo-parceiro');

  async function cadastrarUsuario(dados) {
    try {
      // Cria o usuário no Firebase Auth
      const result = await createUser(dados.email, dados.password);
      if (!result.success) {
        alert('Erro ao criar conta: ' + result.error);
        return;
      }

      // Chama o backend para criar o perfil no Firestore (deve ser feito imediatamente após o cadastro no Auth, antes de qualquer GET /me)
      await apiService.makeAuthenticatedRequest('/api/users/me', {
        method: 'PUT',
        body: JSON.stringify({
          firstName: dados.firstName,
          lastName: dados.lastName,
          email: dados.email,
          cpfCnpj: dados.cpfCnpj,
          userType: dados.userType,
          avatarUrl: "",
          isActive: true
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      window.location.href = '../user_dashboard/user-dashboard.html';
    } catch (err) {
      alert('Erro ao cadastrar usuário.');
      console.error(err);
    }
  }

  if (form) {
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      const dados = {
        firstName: firstNameInput.value.trim(),
        lastName: lastNameInput.value.trim(),
        cpfCnpj: cpfCnpjInput.value.trim(),
        email: emailInput.value.trim(),
        password: passwordInput.value.trim(),
        userType: tipoViajante.checked ? 'traveler' : 'partner'
      };

      // Validação de CPF/CNPJ (apenas números, 11 ou 14 dígitos)
      const cpfCnpjLimpo = dados.cpfCnpj.replace(/\D/g, '');
      if (!(cpfCnpjLimpo.length === 11 || cpfCnpjLimpo.length === 14)) {
        alert('Por favor, informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido, apenas números.');
        cpfCnpjInput.focus();
        return;
      }
      dados.cpfCnpj = cpfCnpjLimpo;

      cadastrarUsuario(dados);
    });
  }
}); 