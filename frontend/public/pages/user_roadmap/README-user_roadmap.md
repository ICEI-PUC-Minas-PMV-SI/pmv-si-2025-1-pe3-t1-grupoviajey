# 📍 user_roadmap/

Este diretório contém todos os arquivos responsáveis pela página de criação e visualização do roteiro de viagem no Viajey.

---

## 📁 Estrutura dos arquivos

| Arquivo               | Responsabilidade principal |
|-----------------------|----------------------------|
| `main.js`             | Ponto de entrada da página. Executa a lógica de inicialização no DOMContentLoaded. |
| `roadmap-core.js`     | Lógica central do roteiro: dias, locais, organização principal. Orquestra chamadas para outros módulos. |
| `roadmap-events.js`   | Gerencia todos os `addEventListener()` da página. Apenas eventos globais ou principais. |
| `roadmap-checklist.js`| Lógica de múltiplos checklists, itens, drag-and-drop, salvar/check. |
| `roadmap-modals.js`   | Controle dos modais: abrir, fechar, preencher e reagir aos dados. |
| `roadmap-finance.js`  | Lógica de orçamento: cálculos, atualizações visuais, saldo. |
| `roadmap-storage.js`  | Centraliza todas as funções de salvar/carregar dados no localStorage. Organizado por tipo de dado. |
| `roadmap-utils.js`    | Funções auxiliares reutilizáveis (formatar valores, criar elementos, etc). |
| `roadmap-map.js`      | (Opcional) Lógica de integração com Google Maps e markers. |

---

## 📌 Convenções

- Cada arquivo só deve conter sua responsabilidade específica.
- Nenhum `addEventListener` deve ser criado fora de `roadmap-events.js`.
- Toda manipulação de storage deve usar `roadmap-storage.js`.
- Usar `type="module"` e `defer` em todos os scripts no HTML.
- O `DOMContentLoaded` deve ficar **apenas em `main.js`**.

---

Desenvolvido para manter organização e facilitar a escalabilidade da página de roteiro do projeto Viajey 🚀
