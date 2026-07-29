// Xử lý form đăng nhập và kiểm tra tài khoản đã đăng ký.
(() => {
  const form = document.querySelector("#login-form");
  const emailInput = document.querySelector("#email");
  const passwordInput = document.querySelector("#password");
  const rememberInput = document.querySelector("#remember");
  const toggleButton = document.querySelector("[data-password-toggle]");
  const submitButton = document.querySelector(".login-form__submit");
  const submitText = document.querySelector(".login-form__submit-text");
  const toast = document.querySelector("[data-toast]");

  if (!form || !emailInput || !passwordInput || !rememberInput) {
    return;
  }

  const {
    clearFormError,
    emailPattern,
    getRegisteredAccount,
    initPasswordToggles,
    isValidPassword,
    setFormError,
    setLoadingState,
    showToast,
  } = window.CanThoUI;

  const storageKey = "canthoLoginEmail";
  const loginFlagKey = "canthoLoggedIn";
  const userNameKey = "canthoUserName";
  const userEmailKey = "canthoUserEmail";
  const userPhoneKey = "canthoUserPhone";
  const messages = {
    email: "Vui lòng nhập email hợp lệ.",
    password: "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số.",
    account: "Email hoặc mật khẩu không đúng.",
  };

  // Kiểm tra định dạng email đăng nhập.
  const validateEmail = () => {
    const isValid = emailPattern.test(emailInput.value.trim());

    if (!isValid) {
      setFormError(emailInput, messages.email);
      return false;
    }

    clearFormError(emailInput);
    return true;
  };

  // Kiểm tra mật khẩu theo cùng quy tắc với trang đăng ký.
  const validatePassword = () => {
    const isValid = isValidPassword(passwordInput.value);

    if (!isValid) {
      setFormError(passwordInput, messages.password);
      return false;
    }

    clearFormError(passwordInput);
    return true;
  };

  // Ghi nhớ hoặc xóa email đăng nhập trong localStorage.
  const syncRememberedEmail = () => {
    if (rememberInput.checked) {
      localStorage.setItem(storageKey, emailInput.value.trim().toLowerCase());
    } else {
      localStorage.removeItem(storageKey);
    }
  };

  // Điền lại email đã được người dùng chọn ghi nhớ.
  const fillRememberedEmail = () => {
    const rememberedEmail = localStorage.getItem(storageKey);

    if (rememberedEmail) {
      emailInput.value = rememberedEmail;
      rememberInput.checked = true;
    }
  };

  // Đối chiếu email và mật khẩu với tài khoản trong localStorage.
  const checkRegisteredAccount = () => {
    const account = getRegisteredAccount();
    const email = emailInput.value.trim().toLowerCase();

    if (!account || account.email !== email || account.password !== passwordInput.value) {
      setFormError(passwordInput, messages.account);
      return null;
    }

    clearFormError(passwordInput);
    return account;
  };

  // Lưu trạng thái và thông tin người dùng sau khi đăng nhập đúng.
  const saveCurrentUser = (account) => {
    localStorage.setItem(loginFlagKey, "true");
    localStorage.setItem(userEmailKey, account.email);
    localStorage.setItem(userNameKey, account.fullname);
    localStorage.setItem(userPhoneKey, account.phone);
  };

  // Kiểm tra email ngay khi người dùng nhập.
  const handleEmailInput = () => {
    if (emailInput.value.trim()) {
      validateEmail();
    } else {
      clearFormError(emailInput);
    }
  };

  // Kiểm tra mật khẩu ngay khi người dùng nhập.
  const handlePasswordInput = () => {
    if (passwordInput.value) {
      validatePassword();
    } else {
      clearFormError(passwordInput);
    }
  };

  // Kết thúc hiệu ứng đăng nhập và chuyển về trang chủ.
  const finishLogin = () => {
    setLoadingState(submitButton, submitText, false, "Đang đăng nhập...", "ĐĂNG NHẬP");
    window.location.href = "../home/index.html";
  };

  // Hiển thị toast sau khi xác thực thành công.
  const showLoginSuccess = () => {
    showToast(toast);
  };

  // Kiểm tra dữ liệu và xử lý đăng nhập.
  const handleLoginSubmit = (event) => {
    event.preventDefault();

    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();

    if (!isEmailValid || !isPasswordValid) {
      const firstError = form.querySelector('[aria-invalid="true"]');
      if (firstError) {
        firstError.focus();
      }
      return;
    }

    const account = checkRegisteredAccount();
    if (!account) {
      passwordInput.focus();
      return;
    }

    saveCurrentUser(account);
    syncRememberedEmail();
    setLoadingState(submitButton, submitText, true, "Đang đăng nhập...", "ĐĂNG NHẬP");
    window.setTimeout(showLoginSuccess, 500);
    window.setTimeout(finishLogin, 1500);
  };

  emailInput.addEventListener("input", handleEmailInput);
  passwordInput.addEventListener("input", handlePasswordInput);
  rememberInput.addEventListener("change", syncRememberedEmail);
  form.addEventListener("submit", handleLoginSubmit);

  // Trả về ô mật khẩu cho nút hiện và ẩn mật khẩu.
  const getPasswordInput = () => passwordInput;

  initPasswordToggles([toggleButton], getPasswordInput);
  fillRememberedEmail();
})();
