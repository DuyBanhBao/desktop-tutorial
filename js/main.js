// Khởi tạo các chức năng dùng chung cho toàn bộ website.
(() => {
  const loginFlagKey = "canthoLoggedIn";
  const userNameKey = "canthoUserName";
  const userEmailKey = "canthoUserEmail";
  const userPhoneKey = "canthoUserPhone";
  const accountKey = "canthoAccount";
  const favoriteKey = "canthoFavorites";
  const journeyKey = "canthoJourney";
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  let favoritePanelTrigger = null;

  // Tìm vùng hiển thị lỗi tương ứng với một ô nhập.
  const getErrorElement = (input) => {
    if (!input || !input.id) {
      return null;
    }

    return document.querySelector(`#${input.id}-error`);
  };

  // Hiển thị lỗi và đánh dấu ô nhập không hợp lệ.
  const setFormError = (input, message) => {
    const errorElement = getErrorElement(input);

    if (!input || !errorElement) {
      return;
    }

    input.classList.add("is-error");
    input.setAttribute("aria-invalid", "true");
    errorElement.textContent = message;
  };

  // Xóa thông báo lỗi khi dữ liệu đã hợp lệ.
  const clearFormError = (input) => {
    const errorElement = getErrorElement(input);

    if (!input || !errorElement) {
      return;
    }

    input.classList.remove("is-error");
    input.removeAttribute("aria-invalid");
    errorElement.textContent = "";
  };

  // Đổi trạng thái nút submit trong lúc xử lý form.
  const setLoadingState = (button, textElement, isLoading, loadingText, defaultText) => {
    if (!button || !textElement) {
      return;
    }

    button.classList.toggle("is-loading", isLoading);
    button.disabled = isLoading;
    textElement.textContent = isLoading ? loadingText : defaultText;
  };

  // Hiển thị thông báo thành công.
  const showToast = (toast) => {
    if (toast) {
      toast.classList.add("is-visible");
    }
  };

  // Bật hoặc tắt hiển thị mật khẩu.
  const togglePassword = (button, input) => {
    if (!button || !input) {
      return;
    }

    const icon = button.querySelector("i");
    const isVisible = input.type === "text";

    input.type = isVisible ? "password" : "text";
    button.setAttribute("aria-label", isVisible ? "Hiện mật khẩu" : "Ẩn mật khẩu");

    if (icon) {
      icon.classList.toggle("fa-eye", isVisible);
      icon.classList.toggle("fa-eye-slash", !isVisible);
    }

    input.focus();
  };

  // Gắn sự kiện cho các nút hiện và ẩn mật khẩu.
  const initPasswordToggles = (buttons, getInput) => {
    for (const button of buttons) {
      if (!button) {
        continue;
      }

      // Xử lý khi người dùng bấm nút hiện hoặc ẩn mật khẩu.
      const handlePasswordToggle = () => {
        togglePassword(button, getInput(button));
      };

      button.addEventListener("click", handlePasswordToggle);
    }
  };

  // Đọc một danh sách JSON từ localStorage.
  const readList = (key) => {
    try {
      const value = localStorage.getItem(key);
      // JSON.parse được đặt trong try/catch để dữ liệu lỗi không làm dừng website.
      return value ? JSON.parse(value) : [];
    } catch {
      return [];
    }
  };

  // Lưu một danh sách vào localStorage dưới dạng JSON.
  const saveList = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  // Đọc tài khoản đã đăng ký từ localStorage.
  const getRegisteredAccount = () => {
    try {
      const value = localStorage.getItem(accountKey);
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  };

  // Lưu tài khoản đăng ký để trang đăng nhập có thể kiểm tra.
  const saveRegisteredAccount = (account) => {
    // Website tĩnh chỉ mô phỏng tài khoản nên dữ liệu được lưu trong localStorage.
    localStorage.setItem(accountKey, JSON.stringify(account));
  };

  // Kiểm tra mật khẩu theo cùng một quy tắc ở đăng ký và đăng nhập.
  const isValidPassword = (password) => passwordPattern.test(password);

  // Lấy thông tin người dùng đang đăng nhập.
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

  // Xác định đường dẫn từ trang hiện tại về thư mục gốc.
  const getPagePrefix = () => {
    const folders = ["/home/", "/khampha/", "/amthuc/", "/lichtrinh/", "/luutru/", "/login/"];
    for (const folder of folders) {
      if (window.location.pathname.includes(folder)) {
        return "../";
      }
    }
    return "";
  };

  // Chuyển người dùng đến trang đăng nhập khi tính năng yêu cầu tài khoản.
  const requireLogin = () => {
    if (getCurrentUser()) {
      return true;
    }

    alert("Vui lòng đăng nhập để sử dụng tính năng này.");
    window.location.href = `${getPagePrefix()}login/login.html`;
    return false;
  };

  // Xóa trạng thái đăng nhập nhưng vẫn giữ tài khoản đã đăng ký.
  const logout = () => {
    localStorage.removeItem(loginFlagKey);
    localStorage.removeItem(userNameKey);
    localStorage.removeItem(userEmailKey);
    localStorage.removeItem(userPhoneKey);
    window.location.href = `${getPagePrefix()}home/index.html`;
  };

  // Hiển thị tên người dùng và nút đăng xuất trên navbar.
  const initNavbarByLoginState = () => {
    const loginItem = document.querySelector("[data-login-item]");
    const userMenu = document.querySelector("[data-user-menu]");
    const userName = document.querySelector("[data-user-name]");
    const logoutButton = document.querySelector("[data-logout]");
    const accountMenu = document.querySelector("[data-account-menu]");
    const accountToggle = document.querySelector("[data-account-toggle]");
    const user = getCurrentUser();

    if (!loginItem || !userMenu) {
      return;
    }

    loginItem.hidden = Boolean(user);
    userMenu.classList.toggle("navbar__user--hidden", !user);

    if (user && userName) {
      userName.textContent = user.name || user.email;
    }

    if (logoutButton) {
      logoutButton.addEventListener("click", logout);
    }

    if (!accountMenu || !accountToggle) {
      return;
    }

    // Mở hoặc đóng menu tài khoản khi bấm tên người dùng.
    const toggleAccountMenu = () => {
      const isOpen = accountMenu.classList.toggle("navbar__account--open");
      accountToggle.setAttribute("aria-expanded", String(isOpen));
      accountToggle.setAttribute("aria-label", isOpen ? "Đóng menu tài khoản" : "Mở menu tài khoản");
    };

    // Đóng menu tài khoản khi bấm ra ngoài.
    const closeAccountMenuOutside = (event) => {
      if (!accountMenu.contains(event.target)) {
        accountMenu.classList.remove("navbar__account--open");
        accountToggle.setAttribute("aria-expanded", "false");
      }
    };

    // Đóng menu tài khoản bằng phím Escape.
    const closeAccountMenuByKeyboard = (event) => {
      if (event.key === "Escape" && accountMenu.classList.contains("navbar__account--open")) {
        accountMenu.classList.remove("navbar__account--open");
        accountToggle.setAttribute("aria-expanded", "false");
        accountToggle.focus();
      }
    };

    accountToggle.addEventListener("click", toggleAccountMenu);
    document.addEventListener("click", closeAccountMenuOutside);
    document.addEventListener("keydown", closeAccountMenuByKeyboard);
  };

  // Đóng menu responsive và cập nhật thuộc tính hỗ trợ đọc màn hình.
  const closeResponsiveMenu = (navbar, toggleButton) => {
    navbar.classList.remove("navbar--menu-open");
    toggleButton.setAttribute("aria-expanded", "false");
    toggleButton.setAttribute("aria-label", "Mở menu điều hướng");
  };

  // Mở hoặc đóng menu responsive.
  const toggleResponsiveMenu = (navbar, toggleButton) => {
    const isOpen = navbar.classList.toggle("navbar--menu-open");
    toggleButton.setAttribute("aria-expanded", String(isOpen));
    toggleButton.setAttribute("aria-label", isOpen ? "Đóng menu điều hướng" : "Mở menu điều hướng");
  };

  // Gắn các sự kiện cho hamburger menu đã hardcode trong HTML.
  const initResponsiveNavbar = () => {
    const navbar = document.querySelector(".navbar");
    const menu = navbar ? navbar.querySelector(".menu") : null;
    const toggleButton = navbar ? navbar.querySelector(".navbar__toggle") : null;

    if (!navbar || !menu || !toggleButton) {
      return;
    }

    navbar.classList.add("navbar--has-toggle");

    // Xử lý nút hamburger.
    const handleToggleClick = () => {
      toggleResponsiveMenu(navbar, toggleButton);
    };

    // Đóng menu sau khi chọn một mục.
    const handleMenuClick = (event) => {
      if (event.target.closest("[data-account-toggle]")) {
        return;
      }

      if (event.target.closest("a, button")) {
        closeResponsiveMenu(navbar, toggleButton);
      }
    };

    // Đóng menu khi bấm ra ngoài navbar.
    const handleOutsideClick = (event) => {
      if (navbar.classList.contains("navbar--menu-open") && !navbar.contains(event.target)) {
        closeResponsiveMenu(navbar, toggleButton);
      }
    };

    // Đóng menu bằng phím Escape.
    const handleMenuKeydown = (event) => {
      if (event.key === "Escape") {
        closeResponsiveMenu(navbar, toggleButton);
        toggleButton.focus();
      }
    };

    toggleButton.addEventListener("click", handleToggleClick);
    menu.addEventListener("click", handleMenuClick);
    document.addEventListener("click", handleOutsideClick);
    document.addEventListener("keydown", handleMenuKeydown);
  };

  // Lấy mã yêu thích đã hardcode trên card.
  const getFavoriteId = (card) => card.dataset.favoriteId || "";

  // Lấy thông tin dự phòng từ danh sách yêu thích hardcode trong HTML.
  const getFavoriteFallbackData = (favoriteId) => {
    const item = document.querySelector(`[data-favorite-item="${favoriteId}"]`);
    const title = item ? item.querySelector(".favorites-panel__item-title") : null;
    const type = item ? item.querySelector(".favorites-panel__item-type") : null;
    const link = item ? item.querySelector(".favorites-panel__item-link") : null;

    return {
      id: favoriteId,
      title: title ? title.textContent.trim() : "Mục yêu thích",
      type: type ? type.textContent.trim() : "",
      url: link ? link.href : window.location.href,
    };
  };

  // Đọc danh sách yêu thích và hỗ trợ dữ liệu cũ chỉ lưu mã.
  const readFavorites = () => {
    const savedFavorites = readList(favoriteKey);
    const favorites = [];
    let needsMigration = false;

    for (const item of savedFavorites) {
      if (typeof item === "string") {
        favorites.push(getFavoriteFallbackData(item));
        needsMigration = true;
      } else if (item && item.id) {
        favorites.push(item);
      }
    }

    // Chuyển dữ liệu favorite dạng chuỗi của bản trước sang object đầy đủ một lần.
    if (needsMigration) {
      saveList(favoriteKey, favorites);
    }

    return favorites;
  };

  // Cập nhật số lượng yêu thích trên biểu tượng trái tim.
  const updateFavoriteBadge = () => {
    const favoriteCount = readFavorites().length;
    const badges = document.querySelectorAll("[data-favorite-count]");

    for (const badge of badges) {
      const favoriteButton = badge.closest("[data-open-favorites]");
      badge.textContent = favoriteCount > 99 ? "99+" : String(favoriteCount);
      badge.hidden = favoriteCount === 0;
      badge.setAttribute("aria-label", `${favoriteCount} mục yêu thích`);

      if (favoriteButton) {
        favoriteButton.setAttribute(
          "aria-label",
          favoriteCount > 0
            ? `Mở danh sách yêu thích, ${favoriteCount} mục`
            : "Mở danh sách yêu thích"
        );
      }
    }
  };

  // Tìm vị trí một mục yêu thích theo mã.
  const findFavoriteIndex = (favorites, favoriteId) => {
    for (let index = 0; index < favorites.length; index += 1) {
      if (favorites[index].id === favoriteId) {
        return index;
      }
    }
    return -1;
  };

  // Lấy tiêu đề từ card yêu thích.
  const getFavoriteTitle = (card) => {
    const title = card.querySelector(".card__title, .listing-card__title");
    return title ? title.textContent.trim() : "Mục yêu thích";
  };

  // Xác định loại nội dung của card yêu thích.
  const getFavoriteType = (card) => {
    if (card.classList.contains("amthuc-card")) {
      return "Ẩm thực";
    }
    if (card.classList.contains("luutru-card")) {
      return "Lưu trú";
    }
    return "Địa điểm";
  };

  // Lấy đường dẫn đầy đủ để mục yêu thích mở đúng từ mọi trang.
  const getFavoriteUrl = (card) => {
    const link = card.matches("a[href]") ? card : card.querySelector("a[href]");
    const href = link ? link.getAttribute("href") : window.location.href;
    return new URL(href, window.location.href).href;
  };

  // Gom đầy đủ thông tin của card trước khi lưu vào localStorage.
  const getFavoriteData = (card) => ({
    id: getFavoriteId(card),
    title: getFavoriteTitle(card),
    type: getFavoriteType(card),
    url: getFavoriteUrl(card),
  });

  // Cập nhật hình trái tim theo dữ liệu localStorage.
  const updateFavoriteButton = (button) => {
    const favorites = readFavorites();
    const favoriteId = button.dataset.favoriteId;
    const isActive = findFavoriteIndex(favorites, favoriteId) >= 0;

    button.classList.toggle("favorite-button--active", isActive);
    button.textContent = isActive ? "♥" : "♡";
    button.setAttribute("aria-label", isActive ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích");
  };

  // Thêm hoặc xóa một mã yêu thích trong localStorage.
  const toggleFavorite = (card, button) => {
    if (!requireLogin()) {
      return;
    }

    const favorites = readFavorites();
    const favoriteId = getFavoriteId(card);
    const foundIndex = findFavoriteIndex(favorites, favoriteId);

    if (foundIndex >= 0) {
      favorites.splice(foundIndex, 1);
    } else {
      favorites.push(getFavoriteData(card));
    }

    saveList(favoriteKey, favorites);
    updateFavoriteButton(button);
    updateFavoriteBadge();
  };

  // Gắn sự kiện cho các nút yêu thích đã có sẵn trong HTML.
  const initFavoriteButtons = () => {
    const buttons = document.querySelectorAll("[data-favorite-button]");

    for (const button of buttons) {
      const card = button.closest(".khampha-card, .amthuc-card, .luutru-card");

      if (!card) {
        continue;
      }

      updateFavoriteButton(button);

      // Ngăn card điều hướng khi người dùng chỉ bấm nút yêu thích.
      const handleFavoriteClick = (event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite(card, button);
      };

      button.addEventListener("click", handleFavoriteClick);
    }

    updateFavoriteBadge();
  };

  // Đồng bộ badge nếu favorite thay đổi ở một tab khác.
  const handleFavoriteStorageChange = (event) => {
    if (event.key === favoriteKey) {
      updateFavoriteBadge();
    }
  };

  // Hiển thị các dòng yêu thích đã hardcode trong HTML.
  const renderFavorites = (panel) => {
    const favorites = readFavorites();
    const items = panel.querySelectorAll("[data-favorite-item]");
    const emptyText = panel.querySelector("[data-favorites-empty]");
    let visibleCount = 0;

    for (const item of items) {
      const favoriteIndex = findFavoriteIndex(favorites, item.dataset.favoriteItem);
      const isVisible = favoriteIndex >= 0;
      item.hidden = !isVisible;

      if (isVisible) {
        const favorite = favorites[favoriteIndex];
        const title = item.querySelector(".favorites-panel__item-title");
        const type = item.querySelector(".favorites-panel__item-type");
        const link = item.querySelector(".favorites-panel__item-link");

        // Dữ liệu cũ chỉ có id nên giữ nội dung hardcode làm giá trị dự phòng.
        if (favorite.title && title) {
          title.textContent = favorite.title;
        }
        if (favorite.type && type) {
          type.textContent = favorite.type;
        }
        if (favorite.url && link) {
          link.href = favorite.url;
        }
        visibleCount += 1;
      }
    }

    if (emptyText) {
      emptyText.hidden = visibleCount > 0;
    }
  };

  // Mở danh sách yêu thích và đưa focus vào nút đóng.
  const openFavoritesPanel = (panel, trigger) => {
    favoritePanelTrigger = trigger;
    renderFavorites(panel);
    panel.classList.remove("favorites-panel--hidden");
    document.body.classList.add("modal-open");
    const closeButton = panel.querySelector("[data-close-favorites]");
    if (closeButton) {
      closeButton.focus();
    }
  };

  // Đóng danh sách yêu thích và trả focus về nút mở.
  const closeFavoritesPanel = (panel) => {
    panel.classList.add("favorites-panel--hidden");
    document.body.classList.remove("modal-open");
    if (favoritePanelTrigger) {
      favoritePanelTrigger.focus();
    }
  };

  // Quản lý thao tác mở, đóng và phím Tab trong danh sách yêu thích.
  const initFavoritePanel = () => {
    const panel = document.querySelector("[data-favorites-panel]");
    const openButton = document.querySelector("[data-open-favorites]");
    const closeButton = panel ? panel.querySelector("[data-close-favorites]") : null;

    if (!panel || !openButton || !closeButton) {
      return;
    }

    // Xử lý mở danh sách yêu thích.
    const handleOpenFavorites = () => {
      if (requireLogin()) {
        openFavoritesPanel(panel, openButton);
      }
    };

    // Xử lý đóng danh sách bằng nút đóng.
    const handleCloseFavorites = () => {
      closeFavoritesPanel(panel);
    };

    // Đóng danh sách khi bấm vào lớp nền.
    const handleFavoriteBackdrop = (event) => {
      if (event.target === panel) {
        closeFavoritesPanel(panel);
      }
    };

    // Đóng bằng Escape và giữ focus ở trong modal khi bấm Tab.
    const handleFavoriteKeydown = (event) => {
      if (panel.classList.contains("favorites-panel--hidden")) {
        return;
      }

      if (event.key === "Escape") {
        closeFavoritesPanel(panel);
        return;
      }

      if (event.key === "Tab") {
        const focusable = panel.querySelectorAll(
          'button:not([disabled]), [data-favorite-item]:not([hidden]) a[href]'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    openButton.addEventListener("click", handleOpenFavorites);
    closeButton.addEventListener("click", handleCloseFavorites);
    panel.addEventListener("click", handleFavoriteBackdrop);
    document.addEventListener("keydown", handleFavoriteKeydown);
  };

  // Điều hướng đến khu vực hành trình khi người dùng đã đăng nhập.
  const initJourneyNavigation = () => {
    // Xử lý nút mở hành trình.
    const handleJourneyClick = (event) => {
      const button = event.target.closest("[data-open-journey]");

      if (!button || !requireLogin()) {
        return;
      }

      if (document.querySelector("[data-journey-panel]")) {
        document.dispatchEvent(new CustomEvent("cantho:openJourney"));
      } else {
        window.location.href = `${getPagePrefix()}lichtrinh/lichtrinh.html#journey`;
      }
    };

    document.addEventListener("click", handleJourneyClick);
  };

  // Hiện nút quay lại đầu trang khi đã cuộn xuống.
  const initBackToTop = () => {
    const button = document.querySelector("[data-back-to-top]");

    if (!button) {
      return;
    }

    // Cập nhật trạng thái nút theo vị trí cuộn.
    const toggleBackToTopButton = () => {
      button.classList.toggle("button--back-to-top-visible", window.scrollY > 240);
    };

    // Cuộn mượt về đầu trang.
    const scrollBackToTop = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    button.addEventListener("click", scrollBackToTop);
    window.addEventListener("scroll", toggleBackToTopButton, { passive: true });
    toggleBackToTopButton();
  };

  // Cuộn mượt đến liên kết neo trong cùng trang.
  const initSmoothAnchors = () => {
    const links = document.querySelectorAll('a[href^="#"]');

    for (const link of links) {
      // Xử lý một liên kết neo hợp lệ trong trang.
      const handleAnchorClick = (event) => {
        const selector = link.getAttribute("href");

        if (!selector || selector === "#") {
          return;
        }

        const target = document.querySelector(selector);
        if (target) {
          event.preventDefault();
          target.scrollIntoView({ behavior: "smooth" });
        }
      };

      link.addEventListener("click", handleAnchorClick);
    }
  };

  // Các hàm dùng chung được đưa ra window để form ở từng trang sử dụng.
  window.CanThoUI = {
    accountKey,
    clearFormError,
    emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    favoriteKey,
    getCurrentUser,
    getRegisteredAccount,
    initPasswordToggles,
    isValidPassword,
    journeyKey,
    readList,
    requireLogin,
    saveList,
    saveRegisteredAccount,
    setFormError,
    setLoadingState,
    showToast,
  };

  initNavbarByLoginState();
  initResponsiveNavbar();
  initFavoriteButtons();
  window.addEventListener("storage", handleFavoriteStorageChange);
  initFavoritePanel();
  initJourneyNavigation();
  initBackToTop();
  initSmoothAnchors();
})();
