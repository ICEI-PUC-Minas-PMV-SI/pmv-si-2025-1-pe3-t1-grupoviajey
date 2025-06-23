// =============================================
// CRIAÇÃO DE CHECKLISTS
// =============================================

//Lógica dos checklists e drag-and-drop
import { getTrashSVG } from './roadmap-utils.js';
import { apiService } from '../../services/api/apiService.js';
import { showLoading, hideLoading, showErrorToast } from '../../js/utils/ui-utils.js';

let currentTripId = null;
let isInitialized = false; // Flag para evitar inicialização múltipla

// =============================================
// CRIAÇÃO E RENDERIZAÇÃO
// =============================================

function createChecklistBlock(checklist = {}) {
  console.log('[Checklist] createChecklistBlock chamada com:', checklist);
  const { id, title = 'Novo Checklist', items = [] } = checklist;
  
  const block = document.createElement('div');
  block.className = 'checklist-block';
  block.dataset.checklistId = id;

  block.innerHTML = `
    <div class="checklist-title-row">
      <h3 class="checklist-title">${title}</h3>
      <button class="edit-checklist-title-btn" title="Editar título">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
      </button>
      <button class="remove-checklist-block-btn" title="Remover checklist">${getTrashSVG()}</button>
    </div>
    <ul class="checklist-list"></ul>
    <form class="add-checklist-form">
      <input type="text" class="new-checklist-input" placeholder="+ Novo item">
      <button type="submit">Adicionar</button>
    </form>
  `;

  const ul = block.querySelector('.checklist-list');
  if (items && items.length > 0) {
    console.log('[Checklist] Renderizando', items.length, 'itens');
    // Ordena os itens para que os concluídos fiquem no final
    items.sort((a, b) => a.isCompleted - b.isCompleted).forEach(item => {
      const li = createChecklistItemElement(item);
      ul.appendChild(li);
      // Os eventos devem ser anexados DEPOIS que o 'li' está no DOM
      attachChecklistItemEvents(li);
    });
  }

  attachChecklistBlockEvents(block);
  console.log('[Checklist] Bloco criado com ID:', id);
  return block;
}

function createChecklistItemElement(item = {}) {
  const { id, text, isCompleted = false } = item;

  const li = document.createElement('li');
  li.className = 'checklist-item';
  li.dataset.itemId = id;
  li.draggable = true; // Habilitar drag
  if (isCompleted) {
    li.classList.add('completed');
  }

  li.innerHTML = `
    <div class="checklist-label">
      <input type="checkbox" class="checklist-checkbox" ${isCompleted ? 'checked' : ''}>
      <span class="checklist-text">${text}</span>
    </div>
    <button class="remove-checklist-btn" title="Remover item">${getTrashSVG()}</button>
  `;

  return li;
}

// =============================================
// LÓGICA DE EVENTOS
// =============================================

function attachChecklistBlockEvents(block) {
  const checklistId = block.dataset.checklistId;

  // Remover checklist
  block.querySelector('.remove-checklist-block-btn').addEventListener('click', async () => {
    if (confirm('Tem certeza que deseja remover este checklist?')) {
      showLoading('Removendo checklist...');
      try {
        await apiService.deleteRoadmapChecklist(currentTripId, checklistId);
        block.remove();
      } catch (error) {
        showErrorToast('Erro ao remover checklist.');
        console.error(error);
      } finally {
        hideLoading();
      }
    }
  });

  // Adicionar item
  const form = block.querySelector('.add-checklist-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = form.querySelector('.new-checklist-input');
    const text = input.value.trim();
    if (text) {
      showLoading('Adicionando item...');
      try {
        const newItemResponse = await apiService.addChecklistItem(currentTripId, checklistId, { text });
        if (newItemResponse.success) {
          const ul = block.querySelector('.checklist-list');
          const li = createChecklistItemElement(newItemResponse.data);
          ul.appendChild(li);
          attachChecklistItemEvents(li);
          input.value = '';
          input.focus();
        } else {
            throw new Error(newItemResponse.message || 'Falha ao adicionar item.');
        }
      } catch (error) {
        showErrorToast('Erro ao adicionar item.');
        console.error(error);
      } finally {
        hideLoading();
      }
    }
  });
  
  // Editar título
  block.querySelector('.edit-checklist-title-btn').addEventListener('click', () => {
    const titleEl = block.querySelector('.checklist-title');
    const currentTitle = titleEl.textContent;
    
    // Evita múltiplos inputs
    if (block.querySelector('.edit-title-input')) return;

    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentTitle;
    input.className = 'edit-title-input';
    
    const save = async () => {
        const newTitle = input.value.trim();
        if (newTitle && newTitle !== currentTitle) {
            await updateChecklistTitle(checklistId, newTitle, titleEl);
        }
        // Sempre restaura o h3, mesmo que não salve
        input.replaceWith(titleEl);
    };

    input.onblur = save;
    input.onkeydown = (e) => { if (e.key === 'Enter') input.blur(); };
    
    titleEl.replaceWith(input);
    input.focus();
  });
}

function attachChecklistItemEvents(li) {
    const itemId = li.dataset.itemId;
    const checklistId = li.closest('.checklist-block').dataset.checklistId;

    // Marcar/desmarcar item
    li.querySelector('.checklist-checkbox').addEventListener('change', async function() {
        const isCompleted = this.checked;
        showLoading();
        try {
            await apiService.updateChecklistItem(currentTripId, checklistId, itemId, { isCompleted });
            li.classList.toggle('completed', isCompleted);
            
            // Move para o final da lista se completado
            const list = li.parentNode;
            if(isCompleted) {
                list.appendChild(li);
            } else {
                list.insertBefore(li, list.querySelector('.checklist-item.completed'));
            }

        } catch (error) {
            showErrorToast('Erro ao atualizar item.');
            console.error(error);
            this.checked = !isCompleted; // Reverte a mudança visual
        } finally {
            hideLoading();
        }
    });

    // Remover item
    li.querySelector('.remove-checklist-btn').addEventListener('click', async () => {
        showLoading();
        try {
            await apiService.deleteChecklistItem(currentTripId, checklistId, itemId);
            li.remove();
        } catch (error) {
            showErrorToast('Erro ao remover item.');
            console.error(error);
        } finally {
            hideLoading();
        }
    });

    // Eventos de Drag and Drop
    addChecklistDnDHandlers(li);
}

async function updateChecklistTitle(checklistId, newTitle, titleEl) {
    showLoading('Salvando...');
    try {
        await apiService.updateRoadmapChecklist(currentTripId, checklistId, { title: newTitle });
        titleEl.textContent = newTitle;
    } catch (error) {
        showErrorToast('Erro ao salvar o título.');
        console.error(error);
    } finally {
        hideLoading();
    }
}

// =============================================
// DRAG AND DROP (VISUAL ONLY FOR NOW)
// =============================================
let dragSrcEl = null;

function handleDragStart(e) {
  dragSrcEl = this;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', this.innerHTML);
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
    dragSrcEl.innerHTML = this.innerHTML;
    this.innerHTML = e.dataTransfer.getData('text/html');

    // Troca os data-attributes e estado do checkbox
    const oldData = {
        id: dragSrcEl.dataset.itemId,
        completed: dragSrcEl.classList.contains('completed'),
        checked: dragSrcEl.querySelector('.checklist-checkbox').checked
    };
    dragSrcEl.dataset.itemId = this.dataset.itemId;
    dragSrcEl.classList.toggle('completed', this.classList.contains('completed'));
    dragSrcEl.querySelector('.checklist-checkbox').checked = this.querySelector('.checklist-checkbox').checked;

    this.dataset.itemId = oldData.id;
    this.classList.toggle('completed', oldData.completed);
    this.querySelector('.checklist-checkbox').checked = oldData.checked;

    // TODO: Adicionar chamada à API para salvar a nova ordem quando o endpoint existir
  }
  this.classList.remove('over');
  return false;
}

function handleDragEnd(e) {
  this.classList.remove('over');
  this.classList.remove('dragElem');
  
  const items = this.closest('.checklist-list').querySelectorAll('.checklist-item');
  items.forEach(item => item.classList.remove('over'));
}

function addChecklistDnDHandlers(elem) {
  elem.addEventListener('dragstart', handleDragStart, false);
  elem.addEventListener('dragover', handleDragOver, false);
  elem.addEventListener('dragleave', handleDragLeave, false);
  elem.addEventListener('drop', handleDrop, false);
  elem.addEventListener('dragend', handleDragEnd, false);
}

// =============================================
// INICIALIZAÇÃO
// =============================================

export async function initMultiChecklists() {
    console.log('[Checklist] initMultiChecklists chamada, isInitialized:', isInitialized);
    // Evita inicialização múltipla
    if (isInitialized) {
        console.log('[Checklist] Já inicializado, pulando...');
        return;
    }

    const container = document.getElementById('checklistsContainer');
    if (!container) {
      console.error('[Checklist] Container não encontrado');
      return;
    }

  const urlParams = new URLSearchParams(window.location.search);
  currentTripId = urlParams.get('tripId');
  console.log('[Checklist] currentTripId:', currentTripId);

  if (!currentTripId) {
    container.innerHTML = '<p>ID da viagem não encontrado. Verifique a URL.</p>';
    return;
  }

  showLoading('Carregando checklists...');
  container.innerHTML = '';
  
  try {
    console.log('[Checklist] Fazendo chamada para API...');
    const checklistsResponse = await apiService.getRoadmapChecklists(currentTripId);
    console.log('[Checklist] Resposta da API:', checklistsResponse);

    if (checklistsResponse.success && checklistsResponse.data.length > 0) {
      console.log('[Checklist] Renderizando', checklistsResponse.data.length, 'checklists');
      checklistsResponse.data.forEach(checklist => {
        const block = createChecklistBlock(checklist);
        container.appendChild(block);
      });
    } else if (checklistsResponse.success) {
      container.innerHTML = '<p>Nenhum checklist criado para esta viagem ainda. Crie o primeiro!</p>';
    } else {
        throw new Error(checklistsResponse.message || 'Falha ao buscar checklists.');
    }
  } catch (error) {
    console.error('[Checklist] Erro ao carregar checklists:', error);
    container.innerHTML = `<p class="error-message">Não foi possível carregar os checklists. ${error.message}</p>`;
    showErrorToast('Erro ao carregar checklists.');
  } finally {
    hideLoading();
    isInitialized = true; // Marca como inicializado
    console.log('[Checklist] Inicialização concluída, isInitialized:', isInitialized);
  }
}

export function setupAddChecklistBlockBtn() {
  console.log('[Checklist] setupAddChecklistBlockBtn chamada');
  const addBtn = document.getElementById('addChecklistBlockBtn');
  if (!addBtn) {
    console.log('[Checklist] Botão addChecklistBlockBtn não encontrado');
    return;
  }

  // Remove event listeners anteriores para evitar duplicação
  const newAddBtn = addBtn.cloneNode(true);
  addBtn.parentNode.replaceChild(newAddBtn, addBtn);
  console.log('[Checklist] Botão clonado e substituído');

  newAddBtn.addEventListener('click', async () => {
    console.log('[Checklist] Botão de criar checklist clicado');
    showLoading('Criando checklist...');
    try {
        const newChecklistResponse = await apiService.createRoadmapChecklist(currentTripId, { title: 'Novo Checklist' });
        console.log('[Checklist] Resposta da API:', newChecklistResponse);
        if (newChecklistResponse.success) {
      const container = document.getElementById('checklistsContainer');
            // Limpa a mensagem "nenhum checklist" se for o primeiro
            if (container.querySelector('p')) {
                container.innerHTML = '';
            }
            const block = createChecklistBlock(newChecklistResponse.data);
            container.appendChild(block);
            console.log('[Checklist] Checklist criado e adicionado ao DOM');
        } else {
            throw new Error(newChecklistResponse.message || 'Falha ao criar checklist.');
        }
    } catch (error) {
        showErrorToast('Erro ao criar checklist.');
        console.error('[Checklist] Erro ao criar checklist:', error);
    } finally {
        hideLoading();
    }
  });
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
