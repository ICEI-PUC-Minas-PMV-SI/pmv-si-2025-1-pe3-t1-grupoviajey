// =============================================
// CRIAÇÃO DE CHECKLISTS
// =============================================

//Lógica dos checklists e drag-and-drop
import { getTrashSVG } from './roadmap-utils.js';

// Funções auxiliares de drag-and-drop
let dragSrcEl = null;

function handleDragStart(e) {
  dragSrcEl = this;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.outerHTML);
  this.classList.add('dragElem');
}

function handleDragOver(e) {
  if (e.preventDefault) e.preventDefault();
  this.classList.add('over');
  e.dataTransfer.dropEffect = 'move';
  return false;
}

function handleDragLeave(e) {
  this.classList.remove('over');
}

function handleDrop(e) {
  if (e.stopPropagation) e.stopPropagation();
  if (dragSrcEl !== this) {
    this.parentNode.removeChild(dragSrcEl);
    let dropHTML = e.dataTransfer.getData('text/html');
    this.insertAdjacentHTML('beforebegin', dropHTML);
    let dropped = this.previousSibling;
    addChecklistDnDHandlers(dropped);
  }
  this.classList.remove('over');
  return false;
}

function handleDragEnd(e) {
  this.classList.remove('over');
  this.classList.remove('dragElem');
}

function addChecklistDnDHandlers(elem) {
  elem.addEventListener('dragstart', handleDragStart, false);
  elem.addEventListener('dragover', handleDragOver, false);
  elem.addEventListener('dragleave', handleDragLeave, false);
  elem.addEventListener('drop', handleDrop, false);
  elem.addEventListener('dragend', handleDragEnd, false);
}

// MULTI CHECKLISTS - NOVA LÓGICA
export function createChecklistBlock(checklistTitle = 'Check-list de Viagem', checklistItems = [
  'Passagem comprada',
  'Reserva de hotel',
  'Documentos separados',
  'Roupas adequadas',
  'Carregador de celular',
  'Medicamentos necessários',
  'Seguro viagem',
  'Dinheiro/cartões',
  'Mapas e guias',
  'Adaptador de tomada'
]) {
  const checklistId = `checklist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  console.log('[Checklist] Criando bloco:', { checklistTitle, checklistItems });

  const block = document.createElement('div');
  block.className = 'checklist-block';
  block.dataset.checklistId = checklistId;

  block.innerHTML = `
    <div class="checklist-title-row">
      <h3 class="checklist-title">${checklistTitle}</h3>
      <button class="edit-checklist-title-btn" title="Editar título" style="background:none;border:none;cursor:pointer;margin-left:8px;vertical-align:middle;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
      </button>
      <button class="remove-checklist-block-btn" title="Remover checklist" style="background:none;border:none;cursor:pointer;margin-left:auto;vertical-align:middle;padding:0 0 0 8px;display:flex;align-items:center;">${getTrashSVG()}</button>
    </div>
    <div class="checklist-sections">
      <div class="checklist-section">
        <h4 class="checklist-section-title">Pendentes</h4>
        <ul class="checklist-list" data-section="pending"></ul>
      </div>
      <div class="checklist-section completed">
        <h4 class="checklist-section-title">Concluídos</h4>
        <ul class="checklist-list-completed" data-section="completed"></ul>
      </div>
    </div>
  `;

  // Adiciona os itens iniciais
  const ul = block.querySelector('[data-section="pending"]');
  checklistItems.forEach(checklistText => addChecklistItemToBlock(ul, checklistText));

  attachChecklistBlockEvents(block);
  return block;
}

export function addChecklistItemToBlock(ul, checklistText, checklistChecked = false) {
  console.log('[Checklist] Adicionando item:', { checklistText, checklistChecked });

  const li = document.createElement('li');
  li.className = 'checklist-item';
  li.draggable = true;

  li.innerHTML = `
    <div class="checklist-label">
      <input type="checkbox" class="checklist-checkbox" ${checklistChecked ? 'checked' : ''}>
      <span class="checklist-text">${checklistText}</span>
    </div>
    <button class="remove-checklist-btn" title="Remover item">${getTrashSVG()}</button>
  `;

  // Aplica estilo inicial se estiver marcado
  if (checklistChecked) {
    li.style.textDecoration = 'line-through';
    li.style.opacity = '0.6';
  }

  // Adiciona event listeners
  const checkbox = li.querySelector('.checklist-checkbox');
  checkbox.addEventListener('change', function() {
    console.log('[Checklist] Checkbox alterado:', { checklistText, checked: checkbox.checked });
    if (checkbox.checked) {
      li.style.textDecoration = 'line-through';
      li.style.opacity = '0.6';
      // Move para a seção de concluídos
      const completedSection = ul.closest('.checklist-sections').querySelector('[data-section="completed"]');
      completedSection.appendChild(li);
    } else {
      li.style.textDecoration = 'none';
      li.style.opacity = '1';
      // Move de volta para a seção de pendentes
      const pendingSection = ul.closest('.checklist-sections').querySelector('[data-section="pending"]');
      pendingSection.appendChild(li);
    }
    saveChecklistsToStorage();
  });

  // Remover item
  li.querySelector('.remove-checklist-btn').onclick = function () {
    console.log('[Checklist] Removendo item:', checklistText);
    li.remove();
    saveChecklistsToStorage();
  };

  // Adiciona event listeners para o drag-and-drop
  addChecklistDnDHandlers(li);
}

export function attachChecklistBlockEvents(block) {
  console.log('[Checklist] Anexando eventos ao bloco');
  try {
    // Delegação para editar título
    block.addEventListener('click', function (e) {
      if (e.target.closest('.edit-checklist-title-btn')) {
        console.log('[Checklist] Editando título do bloco');
        const titleEl = block.querySelector('.checklist-title');
        if (!titleEl) return;
        // Evita múltiplos inputs
        if (block.querySelector('.edit-title-input')) return;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = titleEl.textContent;
        input.className = 'edit-title-input';
        input.style.fontSize = '1.1rem';
        input.style.fontWeight = '600';
        input.style.marginRight = '8px';
        titleEl.replaceWith(input);
        input.focus();
        input.onblur = save;
        input.onkeydown = function (e) { if (e.key === 'Enter') save(); };
        function save() {
          const newTitle = input.value.trim() || 'Checklist';
          console.log('[Checklist] Salvando novo título:', newTitle);
          const h3 = document.createElement('h3');
          h3.className = 'checklist-title';
          h3.textContent = newTitle;
          input.replaceWith(h3);
          saveChecklistsToStorage();
        }
      }
    });

    // Adicionar item
    const form = block.querySelector('.add-checklist-form');
    const input = form.querySelector('.newChecklistInput');
    const ul = block.querySelector('.checklist-list');
    form.onsubmit = function (e) {
      e.preventDefault();
      const value = input.value.trim();
      if (value) {
        console.log('[Checklist] Adicionando novo item:', value);
        addChecklistItemToBlock(ul, value);
        input.value = '';
        input.focus();
        saveChecklistsToStorage();
      }
    };

    // Drag and drop para novos itens
    ul.querySelectorAll('.checklist-item').forEach(addChecklistDnDHandlers);

    console.log('[Checklist] Eventos anexados com sucesso');
  } catch (error) {
    console.error('[Checklist] Erro ao anexar eventos:', error);
    throw error;
  }
}

// Modal de confirmação de remoção de checklist
function ensureRemoveChecklistModal() {
  if (document.getElementById('removeChecklistModal')) return;
  const modal = document.createElement('div');
  modal.id = 'removeChecklistModal';
  modal.className = 'modal-add-place';
  modal.style.display = 'none';
  modal.innerHTML = `
      <div class="modal-content" style="max-width:340px;align-items:center;">
        <h2 class="modal-title" style="margin-bottom:18px;">Remover checklist</h2>
        <p style="font-size:1.05rem;margin-bottom:18px;text-align:center;">Tem certeza que deseja remover este checklist? Esta ação é <b>irreversível</b> e todos os itens serão apagados.</p>
        <div class="modal-actions" style="justify-content:center;">
          <button id="cancelRemoveChecklistBtn" class="modal-cancel-btn">Cancelar</button>
          <button id="confirmRemoveChecklistBtn" class="modal-confirm-btn" style="background:#e05a47;border-color:#e05a47;">Remover</button>
        </div>
      </div>
    `;
  document.body.appendChild(modal);
}

let _checklistBlockToRemove = null;
function showRemoveChecklistModal(block) {
  ensureRemoveChecklistModal();
  const modal = document.getElementById('removeChecklistModal');
  _checklistBlockToRemove = block;
  modal.style.display = 'flex';
  // Botões
  const cancelBtn = document.getElementById('cancelRemoveChecklistBtn');
  const confirmBtn = document.getElementById('confirmRemoveChecklistBtn');
  if (cancelBtn) {
    cancelBtn.onclick = function () {
      modal.style.display = 'none';
      _checklistBlockToRemove = null;
    };
  }
  if (confirmBtn) {
    confirmBtn.onclick = function () {
      if (_checklistBlockToRemove) {
        _checklistBlockToRemove.remove();
      }
      modal.style.display = 'none';
      _checklistBlockToRemove = null;
    };
  }
  // Fecha ao clicar fora
  window.addEventListener('click', function handler(e) {
    if (e.target === modal) {
      modal.style.display = 'none';
      _checklistBlockToRemove = null;
      window.removeEventListener('click', handler);
    }
  });
}

// Inicialização dos checklists
export function initMultiChecklists() {
  console.log('[Checklist] Iniciando inicialização dos checklists');
  try {
    const container = document.getElementById('checklistsContainer');
    if (!container) {
      console.error('[Checklist] Container não encontrado');
      return;
    }

    console.log('[Checklist] Container encontrado, tentando carregar dados salvos');
    const loaded = loadChecklistsFromStorage();

    if (!loaded) {
      console.log('[Checklist] Nenhum dado salvo encontrado, criando checklist padrão');
      const defaultBlock = createChecklistBlock('Checklist');
      if (defaultBlock) {
        container.appendChild(defaultBlock);
        console.log('[Checklist] Checklist padrão criado');
        saveChecklistsToStorage(); // Salva o checklist padrão
      }
    }

    console.log('[Checklist] Inicialização concluída');
  } catch (error) {
    console.error('[Checklist] Erro ao inicializar checklists:', error);
  }
}

// Botão para novo checklist
export function setupAddChecklistBlockBtn() {
  const btn = document.getElementById('addChecklistBlockBtn');
  if (btn) {
    btn.onclick = function () {
      const container = document.getElementById('checklistsContainer');
      container.appendChild(createChecklistBlock('Novo checklist', []));
    };
  }
}

// =============================================
// MANIPULAÇÃO DE ITENS
// =============================================

function handleAddChecklistItem(e) {
  // ... existing code ...
}

function handleRemoveChecklistItem(e) {
  // ... existing code ...
}

function handleChecklistItemCheck(e) {
  // ... existing code ...
}

// =============================================
// DRAG AND DROP
// =============================================

export function handleChecklistItemDragStart(e) {
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', '');
  this.classList.add('dragging');
}

export function handleChecklistItemDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  this.classList.add('over');
}

export function handleChecklistItemDrop(e) {
  e.preventDefault();
  this.classList.remove('over');
  const dragged = document.querySelector('.dragging');
  if (dragged && dragged !== this) {
    const allItems = [...this.parentNode.querySelectorAll('.checklist-item')];
    const draggedIndex = allItems.indexOf(dragged);
    const droppedIndex = allItems.indexOf(this);

    if (draggedIndex < droppedIndex) {
      this.parentNode.insertBefore(dragged, this.nextSibling);
    } else {
      this.parentNode.insertBefore(dragged, this);
    }
  }
}

// =============================================
// STORAGE
// =============================================

function saveChecklistsToStorage() {
  console.log('[Checklist] Iniciando salvamento dos checklists');
  try {
    const checklistBlocks = document.querySelectorAll('.checklist-block');
    console.log('[Checklist] Encontrados blocos:', checklistBlocks.length);

    const checklistData = Array.from(checklistBlocks).map(block => {
      const title = block.querySelector('.checklist-title').textContent;
      const items = Array.from(block.querySelectorAll('.checklist-item')).map(item => {
        const text = item.querySelector('.checklist-text').textContent;
        const isChecked = item.querySelector('.checklist-checkbox').checked;
        return { text, isChecked };
      });
      return { title, items };
    });

    console.log('[Checklist] Dados a serem salvos:', checklistData);
    localStorage.setItem('roadmap_checklists', JSON.stringify(checklistData));
    console.log('[Checklist] Dados salvos com sucesso');
  } catch (error) {
    console.error('[Checklist] Erro ao salvar checklists:', error);
    throw error;
  }
}

function loadChecklistsFromStorage() {
  console.log('[Checklist] Iniciando carregamento dos checklists');
  try {
    const savedData = localStorage.getItem('roadmap_checklists');
    console.log('[Checklist] Dados encontrados:', savedData);

    if (!savedData) {
      console.log('[Checklist] Nenhum dado encontrado');
      return false;
    }

    const checklistData = JSON.parse(savedData);
    console.log('[Checklist] Dados parseados:', checklistData);

    if (!Array.isArray(checklistData) || checklistData.length === 0) {
      console.log('[Checklist] Dados inválidos ou vazios');
      return false;
    }

    const container = document.getElementById('checklistsContainer');
    if (!container) {
      console.error('[Checklist] Container não encontrado');
      return false;
    }

    container.innerHTML = '';
    console.log('[Checklist] Container limpo');

    checklistData.forEach(blockData => {
      console.log('[Checklist] Criando bloco:', blockData.title);
      const block = createChecklistBlock(blockData.title, []);
      if (block) {
        const ul = block.querySelector('.checklist-list');
        blockData.items.forEach(item => {
          console.log('[Checklist] Adicionando item:', item.text);
          addChecklistItemToBlock(ul, item.text, item.isChecked);
        });
        container.appendChild(block);
      }
    });

    console.log('[Checklist] Checklists carregados com sucesso');
    return true;
  } catch (error) {
    console.error('[Checklist] Erro ao carregar checklists:', error);
    return false;
  }
}

export function createChecklistItem(text) {
  const li = document.createElement('li');
  li.className = 'checklist-item';
  li.setAttribute('draggable', 'true');

  // Criar o drag handle
  const dragHandle = document.createElement('span');
  dragHandle.className = 'drag-handle';
  dragHandle.textContent = '☰';

  // Criar o checkbox
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'checklist-checkbox';

  // Criar o texto
  const textSpan = document.createElement('span');
  textSpan.className = 'checklist-text';
  textSpan.textContent = text;

  // Criar o label
  const label = document.createElement('label');
  label.className = 'checklist-label';
  label.appendChild(checkbox);
  label.appendChild(textSpan);

  // Criar o botão de remover
  const removeBtn = document.createElement('button');
  removeBtn.className = 'remove-checklist-btn';
  removeBtn.innerHTML = getTrashSVG();

  // Adicionar o event listener para o checkbox
  checkbox.addEventListener('change', function () {
    if (this.checked) {
      textSpan.style.textDecoration = 'line-through';
      textSpan.style.color = '#888';
    } else {
      textSpan.style.textDecoration = 'none';
      textSpan.style.color = '#1a3c4e';
    }
  });

  // Montar a estrutura
  li.appendChild(dragHandle);
  li.appendChild(label);
  li.appendChild(removeBtn);

  return li;
}
