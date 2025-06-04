import { saveUserToStorage, loadUserFromStorage } from '../storage/userStorage.js';

export function salvarPerfil({ nome, sobrenome, cpf, email, senha }) {
  const dados = { nome, sobrenome, cpf, email, senha };
  saveUserToStorage(dados);
}

export function carregarPerfil() {
  return loadUserFromStorage();
}
