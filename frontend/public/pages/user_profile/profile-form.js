// profile-form.js
// Handles form logic: validation, fill, and data collection

window.ProfileForm = (function() {
  const formId = 'profile-form';
  let formEl;
  let originalData = {};

  function init() {
    formEl = document.getElementById(formId);
    if (!formEl) return;
    
    // Prevent default submit for custom handling
    formEl.addEventListener('submit', (e) => {
      e.preventDefault();
    });

    // Adicionar validação em tempo real
    setupRealTimeValidation();
  }

  function setupRealTimeValidation() {
    const inputs = formEl.querySelectorAll('input[type="text"], input[type="email"]');
    const saveBtn = document.getElementById('save-btn');

    inputs.forEach(input => {
      input.addEventListener('input', () => {
        validateField(input);
        updateSaveButtonState();
      });

      input.addEventListener('blur', () => {
        validateField(input);
        updateSaveButtonState();
      });
    });

    // Validar CPF/CNPJ em tempo real com formatação
    // const cpfCnpjInput = formEl.querySelector('#cpfCnpj');
    // if (cpfCnpjInput) {
    //   cpfCnpjInput.addEventListener('input', (e) => {
    //     formatCpfCnpj(e.target);
    //     validateField(e.target);
    //     updateSaveButtonState();
    //   });
    // }
  }

  function formatCpfCnpj(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
      // Formatação CPF: 000.000.000-00
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      // Formatação CNPJ: 00.000.000/0000-00
      value = value.replace(/^(\d{2})(\d)/, '$1.$2');
      value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
      value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
      value = value.replace(/(\d{4})(\d)/, '$1-$2');
    }
    
    input.value = value;
  }

  function validateField(input) {
    const fieldName = input.name;
    const value = input.value.trim();
    let isValid = true;
    let errorMessage = '';

    // Remover classes de erro anteriores
    input.classList.remove('error', 'success');
    
    // Remover mensagem de erro anterior
    removeFieldError(input);

    // Validações específicas por campo
    switch (fieldName) {
      case 'firstName':
      case 'lastName':
        if (!value) {
          isValid = false;
          errorMessage = 'Este campo é obrigatório';
        } else if (value.length < 2) {
          isValid = false;
          errorMessage = 'Mínimo 2 caracteres';
        } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) {
          isValid = false;
          errorMessage = 'Apenas letras são permitidas';
        }
        break;

      case 'cpfCnpj':
        // A validação do CPF/CNPJ foi removida da tela de perfil
        break;

      case 'email':
        if (!value) {
          isValid = false;
          errorMessage = 'E-mail é obrigatório';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          isValid = false;
          errorMessage = 'Formato de e-mail inválido';
        }
        break;
    }

    // Aplicar classes e mensagens
    if (isValid && value) {
      input.classList.add('success');
    } else if (!isValid) {
      input.classList.add('error');
      showFieldError(input, errorMessage);
    }

    return isValid;
  }

  function validateCPF(cpf) {
    if (cpf.length !== 11) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Validar primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(9))) return false;
    
    // Validar segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.charAt(10))) return false;
    
    return true;
  }

  function validateCNPJ(cnpj) {
    if (cnpj.length !== 14) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(cnpj)) return false;
    
    // Validar primeiro dígito verificador
    let weights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cnpj.charAt(i)) * weights[i];
    }
    let remainder = sum % 11;
    let digit1 = remainder < 2 ? 0 : 11 - remainder;
    if (digit1 !== parseInt(cnpj.charAt(12))) return false;
    
    // Validar segundo dígito verificador
    weights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cnpj.charAt(i)) * weights[i];
    }
    remainder = sum % 11;
    let digit2 = remainder < 2 ? 0 : 11 - remainder;
    if (digit2 !== parseInt(cnpj.charAt(13))) return false;
    
    return true;
  }

  function showFieldError(input, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
      color: #B00020;
      font-size: 0.875rem;
      margin-top: 4px;
      margin-bottom: 8px;
    `;
    
    input.parentNode.insertBefore(errorDiv, input.nextSibling);
  }

  function removeFieldError(input) {
    const existingError = input.parentNode.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }
  }

  function updateSaveButtonState() {
    const saveBtn = document.getElementById('save-btn');
    if (!saveBtn) return;

    const isValid = validateForm();
    const hasChanges = hasFormChanges();
    
    saveBtn.disabled = !isValid || !hasChanges;
    
    if (saveBtn.disabled) {
      saveBtn.classList.add('disabled');
    } else {
      saveBtn.classList.remove('disabled');
    }
  }

  function validateForm() {
    const inputs = formEl.querySelectorAll('input[type="text"], input[type="email"]');
    let isValid = true;
    
    inputs.forEach(input => {
      if (!validateField(input)) {
        isValid = false;
      }
    });
    
    return isValid;
  }

  function hasFormChanges() {
    const currentData = getFormData();
    return JSON.stringify(currentData) !== JSON.stringify(originalData);
  }

  function updateOriginalData(newData) {
    originalData = { ...newData };
    updateSaveButtonState();
  }

  function fillForm(profile) {
    if (!formEl || !profile) return;
    
    // Salvar dados originais para comparação, garantindo que sejam strings e limpos
    originalData = {
      firstName: String(profile.firstName || ''),
      lastName: String(profile.lastName || ''),
      cpfCnpj: String(profile.cpfCnpj || profile.DocNumber || '').replace(/\D/g, ''),
      email: String(profile.email || ''),
      userType: profile.userType || 'traveler'
    };

    // Preencher campos
    const firstNameInput = formEl.querySelector('#firstName');
    const lastNameInput = formEl.querySelector('#lastName');
    const cpfCnpjInput = formEl.querySelector('#cpfCnpj');
    const emailInput = formEl.querySelector('#email');

    if (firstNameInput) firstNameInput.value = originalData.firstName;
    if (lastNameInput) lastNameInput.value = originalData.lastName;
    if (cpfCnpjInput) {
      cpfCnpjInput.value = originalData.cpfCnpj;
      // A formatação ainda pode ser útil para exibição
      formatCpfCnpj(cpfCnpjInput);
    }
    if (emailInput) emailInput.value = originalData.email;

    // Validar campos após preenchimento
    setTimeout(() => {
      validateForm();
      updateSaveButtonState();
    }, 100);
  }

  function getFormData() {
    if (!formEl) return null;
    
    const cpfCnpjInput = formEl.querySelector('#cpfCnpj');
    const cleanCpfCnpj = cpfCnpjInput ? cpfCnpjInput.value.replace(/\D/g, '') : '';
    
    return {
      firstName: formEl.querySelector('#firstName')?.value.trim() || '',
      lastName: formEl.querySelector('#lastName')?.value.trim() || '',
      cpfCnpj: cleanCpfCnpj,
      email: formEl.querySelector('#email')?.value.trim() || '',
      userType: originalData.userType
    };
  }

  function validate() {
    const isValid = validateForm();
    const hasChanges = hasFormChanges();
    
    if (!isValid) {
      return { valid: false, message: 'Por favor, corrija os erros no formulário.' };
    }
    
    if (!hasChanges) {
      return { valid: false, message: 'Nenhuma alteração foi feita.' };
    }
    
    return { valid: true };
  }

  return {
    init,
    fillForm,
    getFormData,
    validate,
    updateSaveButtonState,
    updateOriginalData
  };
})();
