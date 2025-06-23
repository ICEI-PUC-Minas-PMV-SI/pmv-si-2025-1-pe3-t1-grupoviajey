import {
  attachLocalCardActions,
  formatTripPeriod,
} from "./roadmap-utils.js";
import {
  createLocalCard,
  getPlaceData
} from "./roadmap-core.js";
import {
  initializeGoogleMapsAutocomplete,
  getLastSelectedPlace,
  clearLastSelectedPlace,
} from "./roadmap-map.js";
import { searchDestinationImage } from "../../services/api/unsplash.js";
import { updateFinanceSummary } from "./roadmap-finance.js";
import {
  initEventListeners,
  attachRoadmapEventListeners,
  initLocalCardDnD,
} from "./roadmap-events.js";
import { apiService } from "../../services/api/apiService.js";
import {
  showLoading,
  hideLoading,
  showErrorToast,
  showSuccessToast,
  showConfirmationModal,
} from "../../js/utils/ui-utils.js";

// Estado dos modais
const modalState = {
  targetDayContent: null,
  targetDayId: null,
  isAddingToSavedPlaces: false,
};

// Funções de utilidade
function getRandomPlaceImage() {
  const rand = Math.floor(Math.random() * 10000);
  return `https://source.unsplash.com/400x300/?travel,city,landscape&sig=${rand}`;
}

// =============================================
// MODAL DE EDIÇÃO DE VIAGEM
// =============================================

export function openEditTripModal() {
  const modal = document.getElementById("editTripModal");
  if (!modal) return;

  const popup = document.getElementById("edit-photo-requirements-popup");
  if (popup) popup.classList.remove("active");
  const overlay = document.getElementById("edit-photo-requirements-overlay");
  if (overlay) overlay.style.display = "none";

  const tripNameInput = document.getElementById("tripName");
  const tripDestinationInput = document.getElementById("tripDestination");
  const tripNameBanner = document.getElementById("tripNameBanner");
  const tripDestinationBanner =
    document.getElementById("tripDestinationBanner");
  const tripDateBanner = document.getElementById("tripDateBanner");
  const tripDescriptionInput = document.getElementById("edit-trip-description");
  const tripDescriptionBanner = document.getElementById(
    "tripDescriptionBanner"
  );

  if (tripNameInput && tripNameBanner) {
    tripNameInput.value = tripNameBanner.textContent;
  }

  if (tripDestinationInput && tripDestinationBanner) {
    tripDestinationInput.value = tripDestinationBanner.innerText.trim();
  }

  if (tripDescriptionInput && tripDescriptionBanner) {
    tripDescriptionInput.value = tripDescriptionBanner.textContent;
  }

  const tripDateInput = document.getElementById("editTripDateRange");
  if (tripDateInput && window.flatpickr) {
    let start = null,
      end = null;
    if (
      tripDateBanner &&
      tripDateBanner.textContent &&
      tripDateBanner.textContent.includes("-")
    ) {
      const parts = tripDateBanner.textContent.split("-").map((p) => p.trim());
      if (parts.length === 2) {
        const parseDate = (str) => {
          const [dia, mes, ano] = str.split(" ");
          const meses = [
            "jan",
            "fev",
            "mar",
            "abr",
            "mai",
            "jun",
            "jul",
            "ago",
            "set",
            "out",
            "nov",
            "dez",
          ];
          const idx = meses.findIndex((m) => mes.toLowerCase().startsWith(m));
          if (idx !== -1) {
            return new Date(Number(ano), idx, parseInt(dia));
          }
          return null;
        };
        start = parseDate(parts[0]);
        end = parseDate(parts[1]);
      }
    }

    if (tripDateInput._flatpickr) {
      tripDateInput._flatpickr.set("minDate", "today");
      tripDateInput._flatpickr.setDate([start, end].filter(Boolean), true);
      tripDateInput._flatpickr.set("position", "below");
    } else {
      window.flatpickr(tripDateInput, {
        mode: "range",
        dateFormat: "d M Y",
        locale: "pt",
        minDate: "today",
        defaultDate: [start, end].filter(Boolean),
        position: "below",
      });
    }
  }

  const destInput = document.getElementById("tripDestination");
  if (destInput && !destInput._autocompleteInitialized) {
    initializeGoogleMapsAutocomplete(null, "#tripDestination");
    destInput._autocompleteInitialized = true;
  }

  const searchPhotoBtn = document.getElementById(
    "edit-search-destination-photo"
  );
  if (searchPhotoBtn) {
    searchPhotoBtn.onclick = async function () {
      const destination = document.getElementById("tripDestination").value;
      if (!destination) {
        alert("Por favor, selecione um destino primeiro.");
        return;
      }

      const searchButton = this;
      const originalText = searchButton.innerHTML;
      searchButton.disabled = true;
      searchButton.innerHTML = "<span>Buscando...</span>";

      try {
        const imageData = await searchDestinationImage(destination);
        if (imageData && imageData.length > 0) {
          const photoPreview = document.getElementById("edit-photo-preview");
          photoPreview.innerHTML = `
                        <div class="unsplash-gallery">
                            ${imageData
                              .map(
                                (img, idx) => `
                                <img src="${img.thumb}"
                                     data-url="${img.url}"
                                     data-photographer="${img.photographer}"
                                     data-photographer-link="${img.photographerLink}"
                                     class="unsplash-thumb"
                                     style="cursor:pointer; border-radius:8px; margin:4px; border:2px solid transparent;"
                                     ${
                                       idx === 0
                                         ? 'data-selected="true" style="border:2px solid #004954;"'
                                         : ""
                                     }
                                />
                            `
                              )
                              .join("")}
                        </div>
                    `;
          photoPreview.classList.add("active");

          document.getElementById("edit-photo-url-hidden").value =
            imageData[0].url;

          document.querySelectorAll(".unsplash-thumb").forEach((img) => {
            img.addEventListener("click", function () {
              document
                .querySelectorAll(".unsplash-thumb")
                .forEach((i) => (i.style.border = "2px solid transparent"));
              this.style.border = "2px solid #004954";
              document.getElementById("edit-photo-url-hidden").value =
                this.dataset.url;
            });
          });
        } else {
          alert("Não foi possível encontrar uma imagem para este destino.");
        }
      } catch (error) {
        console.error("Erro ao buscar imagem:", error);
        alert("Erro ao buscar imagem do destino. Tente novamente.");
      } finally {
        searchButton.disabled = false;
        searchButton.innerHTML = originalText;
      }
    };
  }

  modal.style.display = "flex";
}

export function closeEditTripModal() {
  const modal = document.getElementById("editTripModal");
  if (modal) modal.style.display = "none";
}

async function handleEditTripFormSubmit(event) {
  event.preventDefault();

  showLoading("Salvando alterações...");
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const tripId = urlParams.get("tripId");
    if (!tripId) {
      throw new Error("ID da viagem não encontrado.");
    }

    const dateInput = document.getElementById("editTripDateRange");

    const tripData = {
      title: document.getElementById("tripName")?.value,
      destination: document.getElementById("tripDestination")?.value,
      description: document.getElementById("edit-trip-description")?.value,
      photo: document.getElementById("edit-photo-url-hidden")?.value,
    };

    if (dateInput?._flatpickr?.selectedDates?.length === 2) {
      tripData.startDate = dateInput._flatpickr.selectedDates[0]
        .toISOString()
        .split("T")[0];
      tripData.endDate = dateInput._flatpickr.selectedDates[1]
        .toISOString()
        .split("T")[0];
    }

    const response = await apiService.updateTrip(tripId, tripData);
    if (response.success) {
      showSuccessToast("Viagem atualizada!");
      window.location.reload();
    } else {
      throw new Error(response.message || "Falha ao atualizar a viagem.");
    }
  } catch (error) {
    console.error("Erro ao atualizar viagem:", error);
    showErrorToast(error.message || "Não foi possível salvar as alterações.");
  } finally {
    hideLoading();
  }
}

function handlePhotoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const photoPreview = document.getElementById("edit-photo-preview");
    if (photoPreview) {
      photoPreview.innerHTML = `<img src="${e.target.result}" style="max-width: 100%; border-radius: 8px;">`;
      photoPreview.classList.add("active");
    }
    document.getElementById("edit-photo-url-hidden").value = e.target.result;
  };
  reader.readAsDataURL(file);
}

// =============================================
// MODAL DE COMPARTILHAMENTO
// =============================================

export function openShareModal() {
  const modal = document.getElementById("shareModal");
  const input = document.getElementById("shareLinkInput");
  const copyBtn = document.getElementById("copyShareLinkBtn");

  if (modal && input && copyBtn) {
    input.value = window.location.href;
    modal.style.display = "flex";
    copyBtn.textContent = "Copiar link";
    input.select();
  }
}

export function closeShareModal() {
  const modal = document.getElementById("shareModal");
  if (modal) modal.style.display = "none";
}

// =============================================
// MODAL DE COLABORAÇÃO
// =============================================

export function openCollabModal() {
  const modal = document.getElementById("collabModal");
  const input = document.getElementById("collabLinkInput");
  const copyBtn = document.getElementById("copyCollabLinkBtn");

  if (modal && input && copyBtn) {
    input.value = window.location.href;
    modal.style.display = "flex";
    copyBtn.textContent = "Copiar";
    input.select();
  }
}

export function closeCollabModal() {
  const modal = document.getElementById("collabModal");
  if (modal) modal.style.display = "none";
}

// =============================================
// MODAL DE ADIÇÃO DE LOCAL
// =============================================

export function openAddPlaceModal(
  targetDayContent = null,
  isAddingToSavedPlaces = false
) {
  const modal = document.getElementById("addPlaceModal");
  if (!modal) return;

  modalState.targetDayContent = targetDayContent;
  modalState.isAddingToSavedPlaces = isAddingToSavedPlaces;

  if (targetDayContent) {
    const daySection = targetDayContent.closest(".day-section");
    if (daySection) {
      modalState.targetDayId = daySection.dataset.dayId;
    }
  } else {
    modalState.targetDayId = null;
  }

  clearLastSelectedPlace();
  const input = document.getElementById("autocomplete");
  if (input) input.value = "";

  const destination = document.getElementById("tripDestinationBanner")
    ?.innerText;

  if (input && !input._autocompleteInitialized) {
    initializeGoogleMapsAutocomplete(destination, "#autocomplete");
    input._autocompleteInitialized = true;
  }

  modal.style.display = "flex";
  if (input) input.focus();
}

export function closeAddPlaceModal() {
  const modal = document.getElementById("addPlaceModal");
  if (modal) modal.style.display = "none";
}

async function handleAddPlaceConfirm() {
  const confirmButton = document.getElementById("confirmAddPlaceModal");
  if (confirmButton) {
    confirmButton.disabled = true;
    confirmButton.textContent = 'Adicionando...';
  }

  const tripId = new URLSearchParams(window.location.search).get("tripId");
  const selectedPlace = getLastSelectedPlace();
  
  if (!tripId || !selectedPlace || !selectedPlace.placeId) {
    alert("Erro: Dados da viagem ou do local estão incompletos.");
    if (confirmButton) {
        confirmButton.disabled = false;
        confirmButton.textContent = 'Adicionar';
    }
    return;
  }

  // Cria uma cópia do objeto do local e remove a propriedade 'photo'
  // para alinhar com a validação do backend que não permite mais este campo.
  const payload = { ...selectedPlace };
  delete payload.photo;

  // Se o destino for a lista de "locais não atribuídos"
  if (modalState.isAddingToSavedPlaces) {
    try {
      const addedPlace = await apiService.addUnassignedPlace(tripId, payload);
      if (addedPlace && addedPlace.placeId) {
        const unassignedContainer = document.getElementById("unassigned-places-container");
        if (unassignedContainer) {
          const card = createLocalCard(addedPlace);
          unassignedContainer.appendChild(card);
          attachLocalCardActions(card);
        }
        showSuccessToast("Local salvo!");
        closeAddPlaceModal();
      } else {
        throw new Error('A API não retornou um local salvo válido.');
      }
    } catch (error) {
      console.error('Erro ao salvar local:', error);
      showErrorToast(`Não foi possível salvar o local. Motivo: ${error.message}`);
    } finally {
      confirmButton.disabled = false;
      confirmButton.textContent = 'Adicionar';
      clearLastSelectedPlace();
    }
    return;
  }

  // Se o destino for um dia específico
  const dayId = modalState.targetDayId;
  if (!dayId) {
    alert("Erro: O dia de destino não foi especificado.");
    if (confirmButton) {
        confirmButton.disabled = false;
        confirmButton.textContent = 'Adicionar';
    }
    return;
  }

  try {
    const addedPlace = await apiService.addPlaceToDay(tripId, dayId, payload);
    if (addedPlace && addedPlace.placeId) {
      const dayContainer = document.querySelector(`[data-day-id="${dayId}"]`);
      if (dayContainer) {
        const dayTimeline = dayContainer.querySelector('.day-timeline');
        if (dayTimeline) {
          const card = createLocalCard(addedPlace);
          dayTimeline.appendChild(card);
          attachLocalCardActions(card);
          showSuccessToast("Local adicionado ao dia!");
          closeAddPlaceModal();
        } else {
          console.error(`Container .day-timeline não encontrado dentro de [data-day-id="${dayId}"]`);
          showErrorToast("Erro ao exibir o local. Recarregando a página...");
          setTimeout(() => window.location.reload(), 2000);
        }
      } else {
        console.error(`Container do dia [data-day-id="${dayId}"] não encontrado.`);
        showErrorToast("Erro ao exibir o local. Recarregando a página...");
        setTimeout(() => window.location.reload(), 2000);
      }
    } else {
      throw new Error('A API não retornou um local adicionado válido.');
    }
  } catch (error) {
    console.error('Erro ao adicionar local ao dia:', error);
    showErrorToast(`Não foi possível adicionar o local. Motivo: ${error.message}`);
  } finally {
    confirmButton.disabled = false;
    confirmButton.textContent = 'Adicionar';
    clearLastSelectedPlace();
  }
}

// =============================================
// MODAL DE ALERTA DE LOCAIS MOVIDOS
// =============================================
export function showPlacesMovedAlert() {
  const modal = document.getElementById("placesMovedAlertModal");
  if (modal) modal.style.display = "flex";
}

export function closePlacesMovedAlert() {
  const modal = document.getElementById("placesMovedAlertModal");
  if (modal) modal.style.display = "none";
}

function initPlacesMovedAlertModal() {
  const closeBtn = document.getElementById("closePlacesMovedAlertModal");
  const confirmBtn = document.getElementById("confirmPlacesMovedAlert");
  const modal = document.getElementById("placesMovedAlertModal");

  if (closeBtn) closeBtn.onclick = closePlacesMovedAlert;
  if (confirmBtn) confirmBtn.onclick = closePlacesMovedAlert;
  if (modal)
    modal.onclick = (e) => {
      if (e.target === modal) closePlacesMovedAlert();
    };
}

// =============================================
// INICIALIZAÇÃO DOS MODAIS
// =============================================

export function initModals() {
  // Botão de deletar viagem
  const deleteTripBtn = document.getElementById("deleteTripBtn");
  if (deleteTripBtn) {
    deleteTripBtn.addEventListener("click", (e) => {
      e.preventDefault(); // Prevenir qualquer comportamento padrão do botão
      showConfirmationModal(
        "Tem certeza que deseja excluir esta viagem? Esta ação é irreversível.",
        handleDeleteTrip
      );
    });
  }
  // Eventos de clique para fechar modais (fora do conteúdo)
  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-add-place")) closeAddPlaceModal();
    if (e.target.classList.contains("modal-edit-trip")) closeEditTripModal();
    if (e.target.classList.contains("modal-share")) closeShareModal();
    if (e.target.classList.contains("modal-collab")) closeCollabModal();
  });

  // Eventos de teclado para fechar modais (ESC)
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAddPlaceModal();
      closeEditTripModal();
      closeShareModal();
      closeCollabModal();
    }
  });

  // Botões de Fechar
  document
    .getElementById("closeAddPlaceModal")
    ?.addEventListener("click", closeAddPlaceModal);
  document
    .getElementById("closeEditTripModal")
    ?.addEventListener("click", closeEditTripModal);
  document
    .getElementById("closeShareModal")
    ?.addEventListener("click", closeShareModal);
  document
    .getElementById("closeCollabModal")
    ?.addEventListener("click", closeCollabModal);

  // Botões de Abrir
  document
    .querySelector('.cover-action-btn[title="Configurações"]')
    ?.addEventListener("click", openEditTripModal);
  document
    .querySelector('.cover-action-btn[title="Compartilhar"]')
    ?.addEventListener("click", openShareModal);
  document
    .querySelector('.cover-action-btn[title="Adicionar pessoa"]')
    ?.addEventListener("click", openCollabModal);

  // Botões para adicionar local (em cada dia e nos locais salvos)
  document.querySelectorAll(".add-place-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const dayContent = this.closest(".day-content");
      openAddPlaceModal(dayContent, false);
    });
  });

  document.getElementById("addSavedPlaceBtn")?.addEventListener("click", () => {
    openAddPlaceModal(null, true);
  });

  // Botões de Confirmação e Ação
  document
    .getElementById("confirmAddPlaceModal")
    ?.addEventListener("click", handleAddPlaceConfirm);

  const editTripForm = document.getElementById("editTripForm");
  if (editTripForm) {
    editTripForm.addEventListener("submit", handleEditTripFormSubmit);
  }

  // Lógica de Copiar Link
  const copyShareBtn = document.getElementById("copyShareLinkBtn");
  if (copyShareBtn) {
    copyShareBtn.addEventListener("click", function () {
      const shareInput = document.getElementById("shareLinkInput");
      shareInput.select();
      document.execCommand("copy");
      copyShareBtn.textContent = "Link copiado!";
      setTimeout(() => (copyShareBtn.textContent = "Copiar link"), 1800);
    });
  }

  const copyCollabBtn = document.getElementById("copyCollabLinkBtn");
  if (copyCollabBtn) {
    copyCollabBtn.addEventListener("click", function () {
      const collabInput = document.getElementById("collabLinkInput");
      collabInput.select();
      document.execCommand("copy");
      copyCollabBtn.textContent = "Link copiado!";
      setTimeout(() => (copyCollabBtn.textContent = "Copiar"), 1800);
    });
  }

  // Upload de foto
  document
    .getElementById("edit-trip-photo")
    ?.addEventListener("change", handlePhotoUpload);

  // Popups
  setupEditPhotoRequirementsPopup();
  initPlacesMovedAlertModal();

  initLocalCardDnD();
}

async function handleDeleteTrip() {
  const urlParams = new URLSearchParams(window.location.search);
  const tripId = urlParams.get("tripId");
  if (!tripId) {
    showErrorToast("ID da viagem não encontrado.");
    return;
  }

  showLoading("Excluindo viagem...");
  try {
    const response = await apiService.deleteTrip(tripId);
    // O deleteTrip no backend não retorna um objeto com `success`, apenas status 200 ou erro
    // A própria apiService já trata o erro se a resposta não for .ok
    showSuccessToast("Viagem excluída com sucesso!");
    // Timeout para dar tempo do usuário ver o toast
    setTimeout(() => {
      window.location.href = "/pages/user_dashboard/user-dashboard.html";
    }, 1000);
  } catch (error) {
    console.error("Erro ao excluir viagem:", error);
    showErrorToast(
      error.message || "Erro ao excluir viagem. Tente novamente."
    );
  } finally {
    hideLoading();
  }
}

function setupEditPhotoRequirementsPopup() {
  const photoInput = document.getElementById("edit-trip-photo");
  const popup = document.getElementById("edit-photo-requirements-popup");
  const closeBtn = document.querySelector(
    "#edit-photo-requirements-popup .close-popup"
  );
  const overlay = document.getElementById("edit-photo-requirements-overlay");

  photoInput.addEventListener("click", () => {
    popup.classList.add("active");
    overlay.style.display = "block";
  });

  closeBtn.addEventListener("click", () => {
    popup.classList.remove("active");
    overlay.style.display = "none";
  });

  overlay.addEventListener("click", () => {
    popup.classList.remove("active");
    overlay.style.display = "none";
  });
}
