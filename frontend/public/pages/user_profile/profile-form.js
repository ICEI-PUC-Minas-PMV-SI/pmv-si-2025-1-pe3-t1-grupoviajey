// profile-form.js
// Handles form logic: validation, fill, and data collection

window.ProfileForm = (function() {
  const formId = 'profile-form';
  let formEl;

  function init() {
    formEl = document.getElementById(formId);
    if (!formEl) return;
    // Prevent default submit for custom handling
    formEl.addEventListener('submit', (e) => {
      e.preventDefault();
    });
  }

  function fillForm(profile) {
    if (!formEl || !profile) return;
    formEl.firstName.value = profile.firstName || '';
    formEl.lastName.value = profile.lastName || '';
    formEl.cpfCnpj.value = profile.cpfCnpj || '';
    formEl.email.value = profile.email || '';
  }

  function getFormData() {
    if (!formEl) return null;
    return {
      firstName: formEl.firstName.value.trim(),
      lastName: formEl.lastName.value.trim(),
      cpfCnpj: formEl.cpfCnpj.value.trim(),
      email: formEl.email.value.trim(),
    };
  }

  function validate() {
    // Simple validation (expand as needed)
    const data = getFormData();
    if (!data.firstName || !data.lastName || !data.cpfCnpj || !data.email) {
      return { valid: false, message: 'All fields are required.' };
    }
    // Email format
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) {
      return { valid: false, message: 'Invalid email format.' };
    }
    // CPF/CNPJ basic check (only numbers, length)
    if (!/^\d{11,14}$/.test(data.cpfCnpj.replace(/\D/g, ''))) {
      return { valid: false, message: 'CPF/CNPJ must have 11 to 14 digits.' };
    }
    return { valid: true };
  }

  return {
    init,
    fillForm,
    getFormData,
    validate
  };
})();
