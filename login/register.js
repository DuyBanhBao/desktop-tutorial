// Xử lý validation và lưu tài khoản đăng ký vào localStorage.
(() => {
  const form = document.querySelector("#register-form");
  const fullnameInput = document.querySelector("#fullname");
  const emailInput = document.querySelector("#email");
  const phoneInput = document.querySelector("#phone");
  const passwordInput = document.querySelector("#password");
  const confirmPasswordInput = document.querySelector("#confirm-password");
  const termsInput = document.querySelector("#terms");
  const toggleButtons = document.querySelectorAll("[data-password-toggle]");
  const submitButton = document.querySelector(".register-form__submit");
  const submitText = document.querySelector(".register-form__submit-text");
  const toast = document.querySelector("[data-toast]");

  if (!form || !fullnameInput || !emailInput || !phoneInput || !passwordInput || !confirmPasswordInput || !termsInput) {
    return;
  }

  const {
    clearFormError,
    emailPattern,
    initPasswordToggles,
    isValidPassword,
    saveRegisteredAccount,
    setFormError,
    setLoadingState,
    showToast,
  } = window.CanThoUI;

  const messages = {
    fullname: "Họ và tên phải có tối thiểu 2 ký tự.",
    email: "Vui lòng nhập email hợp lệ.",
    phone: "Số điện thoại phải gồm đúng 10 chữ số và bắt đầu bằng 0.",
    password: "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số.",
    confirmPassword: "Mật khẩu xác nhận không khớp.",
    terms: "Bạn phải đồng ý với Điều khoản sử dụng.",
  };

  // Hiển thị lỗi cho checkbox điều khoản.
  const setCheckboxError = (message) => {
    termsInput.setAttribute("aria-invalid", "true");
    document.querySelector("#terms-error").textContent = message;
  };

  // Xóa lỗi của checkbox điều khoản.
  const clearCheckboxError = () => {
    termsInput.removeAttribute("aria-invalid");
    document.querySelector("#terms-error").textContent = "";
  };

  // Kiểm tra họ tên có tối thiểu hai ký tự.
  const validateFullname = () => {
    if (fullnameInput.value.trim().length < 2) {
      setFormError(fullnameInput, messages.fullname);
      return false;
    }

    clearFormError(fullnameInput);
    return true;
  };

  // Kiểm tra định dạng email.
  const validateEmail = () => {
    if (!emailPattern.test(emailInput.value.trim())) {
      setFormError(emailInput, messages.email);
      return false;
    }

    clearFormError(emailInput);
    return true;
  };

  // Kiểm tra số điện thoại Việt Nam gồm 10 số và bắt đầu bằng 0.
  const validatePhone = () => {
    if (!/^0\d{9}$/.test(phoneInput.value.trim())) {
      setFormError(phoneInput, messages.phone);
      return false;
    }

    clearFormError(phoneInput);
    return true;
  };

  // Kiểm tra mật khẩu theo quy tắc dùng chung.
  const validatePassword = () => {
    if (!isValidPassword(passwordInput.value)) {
      setFormError(passwordInput, messages.password);
      return false;
    }

    clearFormError(passwordInput);
    return true;
  };

  // Kiểm tra mật khẩu xác nhận trùng với mật khẩu chính.
  const validateConfirmPassword = () => {
    if (!confirmPasswordInput.value || confirmPasswordInput.value !== passwordInput.value) {
      setFormError(confirmPasswordInput, messages.confirmPassword);
      return false;
    }

    clearFormError(confirmPasswordInput);
    return true;
  };

  // Kiểm tra người dùng đã đồng ý điều khoản.
  const validateTerms = () => {
    if (!termsInput.checked) {
      setCheckboxError(messages.terms);
      return false;
    }

    clearCheckboxError();
    return true;
  };

  // Lưu tài khoản đăng ký để trang đăng nhập có thể đối chiếu.
  const saveRegisterInfo = () => {
    const account = {
      fullname: fullnameInput.value.trim(),
      email: emailInput.value.trim().toLowerCase(),
      phone: phoneInput.value.trim(),
      password: passwordInput.value,
    };

    saveRegisteredAccount(account);
  };

  // Kiểm tra họ tên khi người dùng đang nhập.
  const handleFullnameInput = () => {
    if (fullnameInput.value.trim()) {
      validateFullname();
    } else {
      clearFormError(fullnameInput);
    }
  };

  // Kiểm tra email khi người dùng đang nhập.
  const handleEmailInput = () => {
    if (emailInput.value.trim()) {
      validateEmail();
    } else {
      clearFormError(emailInput);
    }
  };

  // Chỉ giữ chữ số và kiểm tra số điện thoại.
  const handlePhoneInput = () => {
    phoneInput.value = phoneInput.value.replace(/\D/g, "").slice(0, 10);
    if (phoneInput.value) {
      validatePhone();
    } else {
      clearFormError(phoneInput);
    }
  };

  // Kiểm tra mật khẩu và kiểm tra lại ô xác nhận nếu đã nhập.
  const handlePasswordInput = () => {
    if (passwordInput.value) {
      validatePassword();
    } else {
      clearFormError(passwordInput);
    }

    if (confirmPasswordInput.value) {
      validateConfirmPassword();
    }
  };

  // Kiểm tra mật khẩu xác nhận khi người dùng nhập.
  const handleConfirmPasswordInput = () => {
    if (confirmPasswordInput.value) {
      validateConfirmPassword();
    } else {
      clearFormError(confirmPasswordInput);
    }
  };

  // Xóa lỗi điều khoản sau khi người dùng đồng ý.
  const handleTermsChange = () => {
    if (termsInput.checked) {
      clearCheckboxError();
    }
  };

  // Hiển thị thông báo đăng ký thành công.
  const showRegisterSuccess = () => {
    showToast(toast);
  };

  // Kết thúc trạng thái chờ và chuyển sang trang đăng nhập.
  const finishRegister = () => {
    setLoadingState(submitButton, submitText, false, "Đang tạo tài khoản...", "ĐĂNG KÝ");
    window.location.href = "login.html";
  };

  // Kiểm tra toàn bộ form và lưu tài khoản hợp lệ.
  const handleRegisterSubmit = (event) => {
    event.preventDefault();

    const isValid = [
      validateFullname(),
      validateEmail(),
      validatePhone(),
      validatePassword(),
      validateConfirmPassword(),
      validateTerms(),
    ].every(Boolean);

    if (!isValid) {
      const firstError = form.querySelector('[aria-invalid="true"]');
      if (firstError) {
        firstError.focus();
      }
      return;
    }

    saveRegisterInfo();
    setLoadingState(submitButton, submitText, true, "Đang tạo tài khoản...", "ĐĂNG KÝ");
    window.setTimeout(showRegisterSuccess, 500);
    window.setTimeout(finishRegister, 1500);
  };

  // Tìm ô mật khẩu tương ứng với nút hiện và ẩn mật khẩu.
  const getPasswordInput = (button) => document.querySelector(`#${button.dataset.passwordToggle}`);

  fullnameInput.addEventListener("input", handleFullnameInput);
  emailInput.addEventListener("input", handleEmailInput);
  phoneInput.addEventListener("input", handlePhoneInput);
  passwordInput.addEventListener("input", handlePasswordInput);
  confirmPasswordInput.addEventListener("input", handleConfirmPasswordInput);
  termsInput.addEventListener("change", handleTermsChange);
  form.addEventListener("submit", handleRegisterSubmit);

  initPasswordToggles(toggleButtons, getPasswordInput);
})();
