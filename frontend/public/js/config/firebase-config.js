// Configuração do Firebase para o frontend
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Configuração do Firebase 
const firebaseConfig = {
    apiKey: "AIzaSyBBCZkk52Ft7FYznK7dgpGAXDtNgZJnxIo",
    authDomain: "viajey-db.firebaseapp.com",
    projectId: "viajey-db",
    storageBucket: "viajey-db.firebasestorage.app",
    messagingSenderId: "249521789505",
    appId: "1:249521789505:web:ee5685de17c5cdc92144c0"
  };

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Função para fazer login
export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Obter token de ID
    const token = await user.getIdToken();
    
    // Salvar token no localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('userUid', user.uid);
    
    return {
      success: true,
      user: user,
      token: token
    };
  } catch (error) {
    console.error('Erro no login:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Função para criar conta
export async function createUser(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Obter token de ID
    const token = await user.getIdToken();
    
    // Salvar token no localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('userUid', user.uid);
    
    return {
      success: true,
      user: user,
      token: token
    };
  } catch (error) {
    console.error('Erro ao criar conta:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Função para fazer logout
export async function logoutUser() {
  try {
    await signOut(auth);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userUid');
    return { success: true };
  } catch (error) {
    console.error('Erro no logout:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Função para obter token atual
export function getAuthToken() {
  return localStorage.getItem('authToken');
}

// Função para verificar se usuário está logado
export function isUserLoggedIn() {
  return !!getAuthToken();
}

// Listener para mudanças no estado de autenticação
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export { auth, signInWithEmailAndPassword }; 