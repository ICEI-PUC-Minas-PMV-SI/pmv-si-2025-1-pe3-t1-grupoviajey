// Configuração do Firebase para o frontend
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

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

// Função para enviar email de recuperação de senha
export async function sendPasswordReset(email) {
  const actionCodeSettings = {
    // URL para a qual o usuário será redirecionado após redefinir a senha.
    // O domínio (ex: localhost, seu-site.com) deve estar na lista de permissões do Firebase Console.
    url: `${window.location.origin}/pages/login/login.html`,
    // O Firebase cuidará da página de redefinição de senha.
    handleCodeInApp: false
  };

  try {
    await sendPasswordResetEmail(auth, email, actionCodeSettings);
    return { success: true };
  } catch (error) {
    console.error('Erro ao enviar email de recuperação:', error);
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
}

// Função para fazer logout completo
export async function logoutUser() {
  try {
    // Fazer logout do Firebase Auth
    await signOut(auth);
    
    // Limpar localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userUid');
    localStorage.removeItem('userProfile');
    
    // Opcionalmente chamar logout no backend
    try {
      const { apiService } = await import('../../services/api/apiService.js');
      await apiService.logout();
    } catch (error) {
      console.warn('Erro ao fazer logout no backend:', error);
      // Não falhar se o logout do backend der erro
    }
    
    // Redirecionar para login
    window.location.href = '/pages/login/login.html';
    
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

// Função para verificar autenticação e redirecionar se necessário
export async function checkAuthAndRedirect() {
  const token = getAuthToken();
  if (!token) {
    window.location.href = '/pages/login/login.html';
    return false;
  }
  
  try {
    const { apiService } = await import('../../services/api/apiService.js');
    await apiService.verifyToken();
    return true;
  } catch (error) {
    console.error('Token inválido:', error);
    // Limpar dados inválidos
    localStorage.removeItem('authToken');
    localStorage.removeItem('userUid');
    localStorage.removeItem('userProfile');
    
    // Redirecionar para login
    window.location.href = '/pages/login/login.html';
    return false;
  }
}

// Listener para mudanças no estado de autenticação
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export { auth, signInWithEmailAndPassword }; 