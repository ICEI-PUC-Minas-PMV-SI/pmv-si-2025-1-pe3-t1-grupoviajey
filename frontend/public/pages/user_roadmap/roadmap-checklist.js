// =============================================
// CRIAÇÃO DE CHECKLISTS
// =============================================

//Lógica dos checklists e drag-and-drop

// Funções auxiliares de drag-and-drop
let dragSrcEl = null;

// Função utilitária para criar o ícone de lixeira
function getTrashSVG() {
    return `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 8.5V14.5C6 15.3284 6.67157 16 7.5 16H12.5C13.3284 16 14 15.3284 14 14.5V8.5" stroke="#e05a47" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M4 5.5H16" stroke="#e05a47" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M8.5 9.5V13.5" stroke="#e05a47" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M11.5 9.5V13.5" stroke="#e05a47" stroke-width="1.5" stroke-linecap="round"/>
    <path d="M7 5.5V4.5C7 3.94772 7.44772 3.5 8 3.5H12C12.5523 3.5 13 3.94772 13 4.5V5.5" stroke="#e05a47" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`;
}

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
export function createChecklistBlock(title = 'Check-list de Viagem', items = [
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
    console.log('[Checklist] Criando bloco:', { title, items });
    try {
        const block = document.createElement('div');
        block.className = 'checklist-details checklist-block';
        block.innerHTML = `
            <div class="checklist-title-row">
                <h3 class="checklist-title">${title}</h3>
                <button class="edit-checklist-title-btn" title="Editar título" style="background:none;border:none;cursor:pointer;margin-left:8px;vertical-align:middle;">
                    <svg width="18" height="18" viewBox="0 0 20 20"><path d="M4 14.5V16h1.5l8.1-8.1-1.5-1.5L4 14.5zM15.7 6.3a1 1 0 0 0 0-1.4l-1.6-1.6a1 1 0 0 0-1.4 0l-1.1 1.1 3 3 1.1-1.1z" fill="#0a7c6a"/></svg>
                </button>
                <button class="remove-checklist-block-btn" title="Remover checklist" style="background:none;border:none;cursor:pointer;margin-left:auto;vertical-align:middle;padding:0 0 0 8px;display:flex;align-items:center;">${getTrashSVG()}</button>
            </div>
            <div class="checklist-sections">
                <div class="checklist-section active">
                    <h4 class="checklist-section-title">Pendentes</h4>
                    <ul class="checklist-list"></ul>
                </div>
                <div class="checklist-section completed">
                    <h4 class="checklist-section-title">Concluídos</h4>
                    <ul class="checklist-list-completed"></ul>
                </div>
            </div>
            <form class="add-checklist-form" autocomplete="off">
                <input type="text" class="newChecklistInput" placeholder="Novo item..." required />
                <button type="submit" class="add-checklist-btn">Adicionar</button>
            </form>
        `;

        // Adiciona itens
        const ul = block.querySelector('.checklist-list');
        console.log('[Checklist] Adicionando itens ao bloco');
        items.forEach(text => addChecklistItemToBlock(ul, text));

        // Eventos do bloco
        console.log('[Checklist] Anexando eventos do bloco');
        attachChecklistBlockEvents(block);

        // Evento de remoção do checklist
        const removeBtn = block.querySelector('.remove-checklist-block-btn');
        if (removeBtn) {
            removeBtn.onclick = function (e) {
                e.preventDefault();
                showRemoveChecklistModal(block);
            };
        }

        console.log('[Checklist] Bloco criado com sucesso');
        return block;
    } catch (error) {
        console.error('[Checklist] Erro ao criar bloco:', error);
        throw error;
    }
}

export function addChecklistItemToBlock(ul, text, isChecked = false) {
    console.log('[Checklist] Adicionando item:', { text, isChecked });
    try {
        const li = document.createElement('li');
        li.className = 'checklist-item';
        li.setAttribute('draggable', 'true');
        li.innerHTML = `
            <span class="drag-handle" title="Arraste para mover">&#9776;</span>
            <label class="checklist-label">
                <input type="checkbox" class="checklist-checkbox" ${isChecked ? 'checked' : ''}>
                <span class="checklist-text">${text}</span>
            </label>
            <button class="remove-checklist-btn" title="Remover item">${getTrashSVG()}</button>
        `;

        // Adiciona ao container apropriado baseado no estado inicial
        const block = ul.closest('.checklist-block');
        const targetList = isChecked ?
            block.querySelector('.checklist-list-completed') :
            block.querySelector('.checklist-list');

        targetList.appendChild(li);
        addChecklistDnDHandlers(li);

        // Remover item
        li.querySelector('.remove-checklist-btn').onclick = function () {
            console.log('[Checklist] Removendo item:', text);
            li.remove();
            saveChecklistsToStorage();
        };

        // Riscar ao marcar e mover para a seção apropriada
        const checkbox = li.querySelector('.checklist-checkbox');
        const textSpan = li.querySelector('.checklist-text');

        // Aplicar estilo inicial se estiver marcado
        if (isChecked) {
            console.log('[Checklist] Aplicando estilo inicial para item marcado:', text);
            textSpan.style.textDecoration = 'line-through';
            textSpan.style.color = '#888';
        }

        // Atualiza o estilo e move o item quando o checkbox muda
        checkbox.addEventListener('change', function () {
            console.log('[Checklist] Checkbox alterado:', { text, checked: checkbox.checked });
            textSpan.style.textDecoration = checkbox.checked ? 'line-through' : 'none';
            textSpan.style.color = checkbox.checked ? '#888' : '#1a3c4e';

            // Move o item para a lista apropriada
            const targetList = checkbox.checked ?
                block.querySelector('.checklist-list-completed') :
                block.querySelector('.checklist-list');
            targetList.appendChild(li);

            saveChecklistsToStorage();
        });

        console.log('[Checklist] Item adicionado com sucesso');
    } catch (error) {
        console.error('[Checklist] Erro ao adicionar item:', error);
        throw error;
    }
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

function handleChecklistDragStart(e) {
    // ... existing code ...
}

function handleChecklistDragOver(e) {
    // ... existing code ...
}

function handleChecklistDrop(e) {
    // ... existing code ...
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