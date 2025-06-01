export function initDashboardNotes() {
  renderNotes();
}

function renderNotes() {
  const notesContainer = document.getElementById('dashboard-notes');
  if (!notesContainer) return;
  notesContainer.innerHTML = `
    <h4>Minhas notas</h4>
    <textarea id="user-notes" rows="8" placeholder="Escreva suas anotações..."></textarea>
    <button id="save-notes-btn">Salvar notas</button>
  `;
  document.getElementById('save-notes-btn').addEventListener('click', saveNotes);
  // Carregar notas salvas (mock)
  const saved = localStorage.getItem('userNotes') || '';
  document.getElementById('user-notes').value = saved;
}

function saveNotes() {
  const notes = document.getElementById('user-notes').value;
  localStorage.setItem('userNotes', notes);
  alert('Notas salvas!');
}

// Para este layout, as notas são salvas por viagem (input no card)
export function renderNotesInput(tripId, value) {
  // Função utilitária caso queira customizar o input de notas
}

export function saveTripNote(tripId, note) {
  // Salva nota no localStorage (mock)
  localStorage.setItem(`tripNote_${tripId}`, note);
} 