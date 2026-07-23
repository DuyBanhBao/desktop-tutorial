(() => {
  // Lay cac thanh phan cua form dang nhap.
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

  const { clearFormError, emailPattern, initPasswordToggles, setFormError, setLoadingState, showToast } =
    window.CanThoUI;

  const storageKey = "canthoLoginEmail";
  // Dang nhap tinh: chi luu trang thai va thong tin co ban vao localStorage.
  const loginFlagKey = "canthoLoggedIn";
  const userNameKey = "canthoUserName";
  const userEmailKey = "canthoUserEmail";
  const userPhoneKey = "canthoUserPhone";
  const messages = {
    email: "Vui lòng nhập email hợp lệ.",
    password: "Mật khẩu phải có tối thiểu 6 ký tự.",
  };

  // Kiem tra dinh dang email.
  const validateEmail = () => {
    const isValid = emailPattern.test(emailInput.value.trim());

    if (!isValid) {
      setFormError(emailInput, messages.email);
      return false;
    }

    clearFormError(emailInput);
    return true;
  };

  // Mat khau dang nhap chi can toi thieu 6 ky tu de phu hop web tinh.
  const validatePassword = () => {
    const isValid = passwordInput.value.trim().length >= 6;

    if (!isValid) {
      setFormError(passwordInput, messages.password);
      return false;
    }

    clearFormError(passwordInput);
    return true;
  };

  // Neu tick "Ghi nho dang nhap" thi luu email cho lan sau.
  const syncRememberedEmail = () => {
    if (rememberInput.checked) {
      localStorage.setItem(storageKey, emailInput.value.trim());
      return;
    }

    localStorage.removeItem(storageKey);
  };

  // Tu dong dien lai email da ghi nho.
  const fillRememberedEmail = () => {
    const rememberedEmail = localStorage.getItem(storageKey);

    if (rememberedEmail) {
      emailInput.value = rememberedEmail;
      rememberInput.checked = true;
    }
  };

  // Luu thong tin nguoi dung sau khi dang nhap thanh cong.
  const saveCurrentUser = () => {
    const email = emailInput.value.trim();
    const registeredEmail = localStorage.getItem("canthoRegisterEmail") || "";
    const registeredName = localStorage.getItem("canthoRegisterFullname") || "";
    const registeredPhone = localStorage.getItem("canthoRegisterPhone") || "";
    const fallbackName = email.split("@")[0];

    localStorage.setItem(loginFlagKey, "true");
    localStorage.setItem(userEmailKey, email);
    localStorage.setItem(userNameKey, registeredEmail === email ? registeredName : fallbackName);
    localStorage.setItem(userPhoneKey, registeredEmail === email ? registeredPhone : "");
  };

  emailInput.addEventListener("input", () => {
    if (emailInput.value.trim() !== "") {
      validateEmail();
      return;
    }

    clearFormError(emailInput);
  });

  passwordInput.addEventListener("input", () => {
    if (passwordInput.value.trim() !== "") {
      validatePassword();
      return;
    }

    clearFormError(passwordInput);
  });

  rememberInput.addEventListener("change", syncRememberedEmail);

  initPasswordToggles([toggleButton], () => passwordInput);

  // Xu ly submit form dang nhap va chuyen ve trang chu.
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    saveCurrentUser();
    syncRememberedEmail();
    setLoadingState(
      submitButton,
      submitText,
      true,
      "Đang đăng nhập...",
      "ĐĂNG NHẬP"
    );

    window.setTimeout(() => {
      showToast(toast);
    }, 500);

    window.setTimeout(() => {
      setLoadingState(
        submitButton,
        submitText,
        false,
        "Đang đăng nhập...",
        "ĐĂNG NHẬP"
      );
      window.location.href = "../home/index.html";
    }, 1500);
  });

  fillRememberedEmail();
})();
