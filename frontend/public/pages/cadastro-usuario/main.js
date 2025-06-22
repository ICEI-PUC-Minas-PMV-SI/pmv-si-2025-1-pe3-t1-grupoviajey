import { includeHeader, includeFooter } from '../../js/utils/include.js';
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
      console.log('Iniciando cadastro de usuário:', dados.email);
      
      // Chamar o endpoint de signup que cria usuário no Auth e perfil no Firestore
      const result = await apiService.signup({
        firstName: dados.firstName,
        lastName: dados.lastName,
        email: dados.email,
        password: dados.password,
        cpfCnpj: dados.cpfCnpj,
        userType: dados.userType
      });

      if (!result.success) {
        alert('Erro ao criar conta: ' + result.message);
        return;
      }

      console.log('Usuário criado com sucesso:', result.data);
      
      // Salvar token no localStorage (o backend retorna um customToken)
      if (result.data.customToken) {
        // Para customToken, precisamos trocar por idToken
        const { auth } = await import('../../js/config/firebase-config.js');
        const { signInWithCustomToken } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
        
        const userCredential = await signInWithCustomToken(auth, result.data.customToken);
        const idToken = await userCredential.user.getIdToken();
        
        localStorage.setItem('authToken', idToken);
        localStorage.setItem('userUid', result.data.uid);
      }

      // Buscar perfil do usuário
      try {
        const userProfile = await apiService.getUserProfile();
        localStorage.setItem('userProfile', JSON.stringify(userProfile.data));
      } catch (error) {
        console.warn('Não foi possível buscar perfil do usuário:', error);
      }

      alert('Conta criada com sucesso!');
      window.location.href = '../user_dashboard/user-dashboard.html';
    } catch (err) {
      console.error('Erro ao cadastrar usuário:', err);
      
      if (err.message.includes('Email já está em uso')) {
        alert('Este email já está cadastrado. Tente fazer login ou use outro email.');
      } else if (err.message.includes('Senha muito fraca')) {
        alert('A senha deve ter pelo menos 6 caracteres.');
      } else if (err.message.includes('Email inválido')) {
        alert('Por favor, informe um email válido.');
      } else {
        alert('Erro ao cadastrar usuário. Tente novamente.');
      }
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

      // Validações básicas
      if (!dados.firstName || !dados.lastName || !dados.email || !dados.password || !dados.cpfCnpj) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
      }

      if (dados.password.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres.');
        passwordInput.focus();
        return;
      }

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