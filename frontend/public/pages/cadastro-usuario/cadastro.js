document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('cadastro-form');
  const nomeInput = document.getElementById('cadastro-nome');
  const sobrenomeInput = document.getElementById('cadastro-sobrenome');
  const cpfCnpjInput = document.getElementById('cadastro-cpf-cnpj');
  const emailInput = document.getElementById('cadastro-email');
  const senhaInput = document.getElementById('cadastro-senha');
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
      if (!dados.nome || !dados.sobrenome || !dados.cpfCnpj || !dados.email || !dados.senha) {
        alert('Preencha todos os campos.');
        return;
      }
      window.localStorage.setItem('isAuthenticated', 'true');
      window.location.href = '../user_dashboard/user-dashboard.html';
    } catch (err) {
      alert('Erro ao cadastrar usuário.');
    }
  }

  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const dados = {
        nome: nomeInput.value.trim(),
        sobrenome: sobrenomeInput.value.trim(),
        cpfCnpj: cpfCnpjInput.value.trim(),
        email: emailInput.value.trim(),
        senha: senhaInput.value.trim(),
        tipo: tipoViajante.checked ? 'viajante' : 'parceiro'
      };
      cadastrarUsuario(dados);
    });
  }
}); 