(() => {
  // Cac key dung chung de luu trang thai website vao localStorage.
  const loginFlagKey = "canthoLoggedIn";
  const userNameKey = "canthoUserName";
  const userEmailKey = "canthoUserEmail";
  const userPhoneKey = "canthoUserPhone";
  const favoriteKey = "canthoFavorites";
  const journeyKey = "canthoJourney";

  // Lay the hien thi loi dua tren id cua input, vi du: email -> email-error.
  const getErrorElement = (input) => {
    if (!input || !input.id) {
      return null;
    }

    return document.querySelector(`#${input.id}-error`);
  };

  // Hien thi loi cho input va gan aria-invalid de form de truy cap hon.
  const setFormError = (input, message) => {
    const errorElement = getErrorElement(input);

    if (!input || !errorElement) {
      return;
    }

    input.classList.add("is-error");
    input.setAttribute("aria-invalid", "true");
    errorElement.textContent = message;
  };

  // Xoa trang thai loi khi nguoi dung sua dung du lieu.
  const clearFormError = (input) => {
    const errorElement = getErrorElement(input);

    if (!input || !errorElement) {
      return;
    }

    input.classList.remove("is-error");
    input.removeAttribute("aria-invalid");
    errorElement.textContent = "";
  };

  // Doi trang thai nut submit khi dang xu ly form.
  const setLoadingState = (button, textElement, isLoading, loadingText, defaultText) => {
    if (!button || !textElement) {
      return;
    }

    button.classList.toggle("is-loading", isLoading);
    button.disabled = isLoading;
    textElement.textContent = isLoading ? loadingText : defaultText;
  };

  // Toast chi can them class, CSS se phu trach phan hien thi.
  const showToast = (toast) => {
    if (toast) {
      toast.classList.add("is-visible");
    }
  };

  // Dung chung cho nut hien/an mat khau o trang dang nhap va dang ky.
  const initPasswordToggles = (buttons, getInput) => {
    buttons.forEach((button) => {
      if (!button) {
        return;
      }

      button.addEventListener("click", () => {
        const input = getInput(button);

        if (!input) {
          return;
        }

        const icon = button.querySelector("i");
        const isPasswordVisible = input.type === "text";

        input.type = isPasswordVisible ? "password" : "text";
        button.setAttribute(
          "aria-label",
          isPasswordVisible ? "Hiện mật khẩu" : "Ẩn mật khẩu"
        );

        if (icon) {
          icon.classList.toggle("fa-eye", isPasswordVisible);
          icon.classList.toggle("fa-eye-slash", !isPasswordVisible);
        }

        input.focus();
      });
    });
  };

  // Doc danh sach tu localStorage. Neu du lieu loi thi tra ve mang rong de web khong bi dung.
  const readList = (key) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : [];
    } catch {
      return [];
    }
  };

  // Chi danh sach hanh trinh/yeu thich moi duoc luu bang JSON.
  const saveList = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  // Dang nhap la dang nhap tinh, nen thong tin nguoi dung duoc lay tu localStorage.
  const getCurrentUser = () => {
    if (localStorage.getItem(loginFlagKey) !== "true") {
      return null;
    }

    return {
      name: localStorage.getItem(userNameKey) || "",
      email: localStorage.getItem(userEmailKey) || "",
      phone: localStorage.getItem(userPhoneKey) || "",
    };
  };

  // Xac dinh duong dan tu trang hien tai ve thu muc goc cua website.
  const getPagePrefix = () => {
    const folders = ["/home/", "/khampha/", "/amthuc/", "/lichtrinh/", "/luutru/", "/login/"];
    return folders.some((folder) => window.location.pathname.includes(folder)) ? "../" : "";
  };

  // Chan cac tinh nang can dang nhap nhu hanh trinh va yeu thich.
  const requireLogin = () => {
    if (getCurrentUser()) {
      return true;
    }

    alert("Vui lòng đăng nhập để sử dụng tính năng này.");
    window.location.href = `${getPagePrefix()}login/login.html`;
    return false;
  };

  // Sau khi dang nhap, thay link Dang nhap bang 2 nut icon Hanh trinh va Yeu thich.
  const initNavbarByLoginState = () => {
    const menuList = document.querySelector(".menu ul");
    const loginLink = document.querySelector('.menu a[href$="login.html"]');
    const user = getCurrentUser();

    if (!menuList || !loginLink || !user) {
      return;
    }

    const loginItem = loginLink.closest("li");
    const favoriteItem = document.createElement("li");
    const favoriteButton = document.createElement("button");
    const favoriteIcon = document.createElement("img");

    favoriteButton.type = "button";
    favoriteButton.className = "navbar__action";
    favoriteButton.dataset.openFavorites = "true";
    favoriteButton.title = "Yêu thích";
    favoriteButton.setAttribute("aria-label", "Yêu thích");
    favoriteIcon.className = "navbar__action-icon";
    favoriteIcon.src = `${getPagePrefix()}assets/icons/love.png`;
    favoriteIcon.alt = "";
    favoriteIcon.setAttribute("aria-hidden", "true");

    favoriteButton.append(favoriteIcon);
    favoriteItem.append(favoriteButton);

    if (loginItem) {
      loginItem.remove();
    }

    menuList.append(favoriteItem);
  };

  const closeResponsiveMenu = (navbar, toggleButton) => {
    navbar.classList.remove("navbar--menu-open");
    toggleButton.setAttribute("aria-expanded", "false");
    toggleButton.setAttribute("aria-label", "Mo menu dieu huong");
  };

  const initResponsiveNavbar = () => {
    const navbar = document.querySelector(".navbar");
    const menu = navbar ? navbar.querySelector(".menu") : null;

    if (!navbar || !menu || navbar.querySelector(".navbar__toggle")) {
      return;
    }

    const toggleButton = document.createElement("button");
    const menuId = menu.id || "main-navigation";

    menu.id = menuId;
    toggleButton.type = "button";
    toggleButton.className = "navbar__toggle";
    toggleButton.setAttribute("aria-controls", menuId);
    toggleButton.setAttribute("aria-expanded", "false");
    toggleButton.setAttribute("aria-label", "Mo menu dieu huong");

    for (let index = 0; index < 3; index += 1) {
      const line = document.createElement("span");
      line.className = "navbar__toggle-line";
      line.setAttribute("aria-hidden", "true");
      toggleButton.append(line);
    }

    navbar.classList.add("navbar--has-toggle");
    navbar.insertBefore(toggleButton, menu);

    toggleButton.addEventListener("click", () => {
      const isOpen = navbar.classList.toggle("navbar--menu-open");
      toggleButton.setAttribute("aria-expanded", String(isOpen));
      toggleButton.setAttribute(
        "aria-label",
        isOpen ? "Dong menu dieu huong" : "Mo menu dieu huong"
      );
    });

    menu.addEventListener("click", (event) => {
      if (event.target.closest("a, button")) {
        closeResponsiveMenu(navbar, toggleButton);
      }
    });

    document.addEventListener("click", (event) => {
      if (!navbar.classList.contains("navbar--menu-open") || navbar.contains(event.target)) {
        return;
      }

      closeResponsiveMenu(navbar, toggleButton);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeResponsiveMenu(navbar, toggleButton);
      }
    });
  };

  // Lay ten hien thi cua card de luu vao danh sach yeu thich.
  const getCardTitle = (card) => {
    const titleElement = card.querySelector(".card__title, .listing-card__title");
    return titleElement ? titleElement.textContent.trim() : "Mục yêu thích";
  };

  // Xac dinh loai noi dung dang duoc yeu thich.
  const getFavoriteType = (card) => {
    if (card.classList.contains("amthuc-card")) {
      return "Ẩm thực";
    }

    if (card.classList.contains("luutru-card")) {
      return "Lưu trú";
    }

    return "Địa điểm";
  };

  // Tao id don gian de tranh luu trung cung mot dia diem/mon an/luu tru.
  const getFavoriteId = (card) => {
    const title = getCardTitle(card).toLowerCase();
    const source = card.getAttribute("href") || card.dataset.food || title;
    return `${getFavoriteType(card)}-${source}`;
  };

  // Luu link day du de bam "Xem" van dung khi mo panel tu trang khac.
  const getFavoriteUrl = (card) => {
    const href = card.getAttribute("href");
    return href ? new URL(href, window.location.href).href : window.location.href;
  };

  // Nut trai tim duoc tao bang JS de khong phai lap lai markup tren tung card.
  const createFavoriteButton = (card) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "favorite-button";
    button.dataset.favoriteButton = "true";
    button.dataset.favoriteId = getFavoriteId(card);
    button.setAttribute("aria-label", "Thêm vào yêu thích");
    button.textContent = "♡";
    return button;
  };

  // Cap nhat trang thai trai tim dua tren du lieu yeu thich trong localStorage.
  const updateFavoriteButton = (button) => {
    const favorites = readList(favoriteKey);
    const isActive = favorites.some((item) => item.id === button.dataset.favoriteId);

    button.classList.toggle("favorite-button--active", isActive);
    button.textContent = isActive ? "♥" : "♡";
    button.setAttribute(
      "aria-label",
      isActive ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"
    );
  };

  // Them hoac bo mot muc khoi danh sach yeu thich.
  const toggleFavorite = (card, button) => {
    if (!requireLogin()) {
      return;
    }

    const favorites = readList(favoriteKey);
    const favoriteId = button.dataset.favoriteId;
    const foundIndex = favorites.findIndex((item) => item.id === favoriteId);

    if (foundIndex >= 0) {
      favorites.splice(foundIndex, 1);
    } else {
      favorites.push({
        id: favoriteId,
        title: getCardTitle(card),
        type: getFavoriteType(card),
        url: getFavoriteUrl(card),
      });
    }

    saveList(favoriteKey, favorites);
    updateFavoriteButton(button);
  };

  // Gan nut yeu thich vao cac card co class duoc ho tro.
  const initFavoriteButtons = () => {
    const cards = document.querySelectorAll(".khampha-card, .amthuc-card, .luutru-card");

    cards.forEach((card) => {
      card.classList.add("favorite-card");

      if (!card.querySelector("[data-favorite-button]")) {
        card.append(createFavoriteButton(card));
      }

      const button = card.querySelector("[data-favorite-button]");
      updateFavoriteButton(button);

      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite(card, button);
      });
    });
  };

  // Tao the text nhanh ma khong dung innerHTML.
  const createTextElement = (tagName, className, text) => {
    const element = document.createElement(tagName);
    element.className = className;
    element.textContent = text;
    return element;
  };

  // Tao modal/panel yeu thich bang DOM API de giu cay DOM an toan.
  const createFavoritesDialog = () => {
    const dialog = document.createElement("div");
    const content = document.createElement("section");
    const closeButton = document.createElement("button");
    const title = createTextElement("h2", "favorites-panel__title", "Yêu thích");
    const list = document.createElement("div");
    const emptyText = createTextElement("p", "favorites-panel__empty", "Chưa có mục yêu thích nào.");

    dialog.className = "modal favorites-panel favorites-panel--hidden";
    dialog.dataset.favoritesPanel = "true";

    content.className = "modal__content favorites-panel__content";
    closeButton.type = "button";
    closeButton.className = "modal__close favorites-panel__close";
    closeButton.setAttribute("aria-label", "Đóng danh sách yêu thích");
    closeButton.textContent = "×";
    list.className = "favorites-panel__list";
    list.dataset.favoritesList = "true";
    emptyText.dataset.favoritesEmpty = "true";

    content.append(closeButton, title, emptyText, list);
    dialog.append(content);
    document.body.append(dialog);

    closeButton.addEventListener("click", () => {
      dialog.classList.add("favorites-panel--hidden");
    });

    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) {
        dialog.classList.add("favorites-panel--hidden");
      }
    });

    return dialog;
  };

  // Ve lai danh sach yeu thich moi lan mo panel.
  const renderFavorites = (dialog) => {
    const list = dialog.querySelector("[data-favorites-list]");
    const emptyText = dialog.querySelector("[data-favorites-empty]");
    const favorites = readList(favoriteKey);

    list.textContent = "";
    emptyText.hidden = favorites.length > 0;

    favorites.forEach((item) => {
      const card = document.createElement("article");
      const title = createTextElement("h3", "favorites-panel__item-title", item.title);
      const type = createTextElement("p", "favorites-panel__item-type", item.type);
      const link = document.createElement("a");

      card.className = "favorites-panel__item";
      link.className = "favorites-panel__item-link";
      link.href = item.url;
      link.textContent = "Xem";

      card.append(title, type, link);
      list.append(card);
    });
  };

  // Lang nghe nut Yeu thich tren navbar.
  const initFavoritePanel = () => {
    let dialog = null;

    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-open-favorites]");

      if (!button) {
        return;
      }

      if (!requireLogin()) {
        return;
      }

      if (!dialog) {
        dialog = createFavoritesDialog();
      }

      renderFavorites(dialog);
      dialog.classList.remove("favorites-panel--hidden");
    });
  };

  // Nut Hanh trinh se mo panel neu dang o trang lich trinh, hoac chuyen den trang lich trinh.
  const initJourneyNavigation = () => {
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-open-journey]");

      if (!button) {
        return;
      }

      if (!requireLogin()) {
        return;
      }

      if (document.querySelector("[data-journey-panel]")) {
        document.dispatchEvent(new CustomEvent("cantho:openJourney"));
        return;
      }

      window.location.href = `${getPagePrefix()}lichtrinh/lichtrinh.html#journey`;
    });
  };

  // Nut quay lai dau trang dung chung cho cac trang co data-back-to-top.
  const initBackToTop = () => {
    const backToTopButton = document.querySelector("[data-back-to-top]");

    if (!backToTopButton) {
      return;
    }

    const toggleBackToTopButton = () => {
      backToTopButton.classList.toggle(
        "button--back-to-top-visible",
        window.scrollY > 240
      );
    };

    backToTopButton.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });

    window.addEventListener("scroll", toggleBackToTopButton, { passive: true });
    toggleBackToTopButton();
  };

  // Cuon muot cho cac link neo trong cung trang.
  const initSmoothAnchors = () => {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        const selector = link.getAttribute("href");

        if (!selector || selector === "#") {
          return;
        }

        const target = document.querySelector(selector);

        if (target) {
          event.preventDefault();
          target.scrollIntoView({ behavior: "smooth" });
        }
      });
    });
  };

  // Xuat cac ham dung chung de cac file JS rieng cua tung trang co the su dung.
  window.CanThoUI = {
    clearFormError,
    emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    favoriteKey,
    getCurrentUser,
    initPasswordToggles,
    journeyKey,
    readList,
    requireLogin,
    saveList,
    setFormError,
    setLoadingState,
    showToast,
  };

  // Khoi tao cac tinh nang chung sau khi file duoc nap.
  initNavbarByLoginState();
  initResponsiveNavbar();
  initFavoriteButtons();
  initFavoritePanel();
  initJourneyNavigation();
  initBackToTop();
  initSmoothAnchors();
})();
