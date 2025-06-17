import { saveUserToStorage, loadUserFromStorage } from '../storage/userStorage.js';

export function salvarPerfil({ firstName, lastName, DocNumber, email, password }) {
  const dados = { firstName, lastName, DocNumber, email, password };
  saveUserToStorage(dados);
}

export function carregarPerfil() {
  return loadUserFromStorage();
}
