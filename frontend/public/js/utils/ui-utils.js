// Utilitários para UI - Loading e Toast

let loadingOverlay = null;

export function showLoading(message = 'Carregando...') {
  if (!loadingOverlay) {
    loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'loading-overlay';
    loadingOverlay.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>${message}</p>
      </div>
    `;
    loadingOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    `;
    
    const spinner = loadingOverlay.querySelector('.loading-spinner');
    spinner.style.cssText = `
      background: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;
    
    const spinnerElement = spinner.querySelector('.spinner');
    spinnerElement.style.cssText = `
      width: 40px;
      height: 40px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #004954;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 10px;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(loadingOverlay);
}

export function hideLoading() {
  if (loadingOverlay && loadingOverlay.parentNode) {
    loadingOverlay.parentNode.removeChild(loadingOverlay);
  }
}

export function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'error' ? '#f44336' : type === 'success' ? '#4caf50' : '#2196f3'};
    color: white;
    padding: 12px 20px;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    z-index: 10000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  `;
  
  document.body.appendChild(toast);
  
  // Anima entrada
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
  }, 100);
  
  // Remove após 3 segundos
  setTimeout(() => {
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

export function showErrorToast(message) {
  showToast(message, 'error');
}

export function showSuccessToast(message) {
  showToast(message, 'success');
}

export function showConfirmationModal(message, onConfirm) {
  const modal = document.createElement('div');
  modal.id = 'confirmation-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10001;
    padding: 20px;
  `;

  modal.innerHTML = `
    <div class="confirmation-modal-content" style="background: white; padding: 30px; border-radius: 8px; text-align: center; max-width: 400px; box-shadow: 0 5px 15px rgba(0,0,0,0.3);">
      <p style="margin: 0 0 20px; font-size: 16px; color: #333;">${message}</p>
      <div class="confirmation-modal-actions">
        <button id="confirm-cancel" style="padding: 10px 20px; margin-right: 10px; border-radius: 5px; border: 1px solid #ccc; background: #fff; cursor: pointer;">Cancelar</button>
        <button id="confirm-accept" style="padding: 10px 20px; border-radius: 5px; border: none; background: #d9534f; color: white; cursor: pointer;">Sim, excluir</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeModal = () => {
    if (modal.parentNode) {
      modal.parentNode.removeChild(modal);
    }
  };

  modal.querySelector('#confirm-cancel').addEventListener('click', closeModal);
  modal.querySelector('#confirm-accept').addEventListener('click', () => {
    onConfirm();
    closeModal();
  });
} 