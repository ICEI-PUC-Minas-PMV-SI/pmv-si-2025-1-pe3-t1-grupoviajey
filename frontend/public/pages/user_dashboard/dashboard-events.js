export function initDashboardEvents() {
  // Exemplo: listener global para atalhos de teclado
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      // Salvar todas as notas visíveis
      document.querySelectorAll('.trip-notes-input').forEach(input => {
        input.dispatchEvent(new Event('change'));
      });
      alert('Notas salvas!');
    }
  });
} 