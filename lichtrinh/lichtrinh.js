// Xử lý tìm kiếm tour, hành trình và form đặt tour.
(() => {
  const {
    clearFormError,
    emailPattern,
    getCurrentUser,
    journeyKey,
    readList,
    requireLogin,
    saveList,
    setFormError,
  } = window.CanThoUI;

  const tourCards = document.querySelectorAll(".tour-card");
  const previewTourCards = document.querySelectorAll(".tour-preview > .tour-card");
  const searchInput = document.querySelector("#search");
  const durationFilter = document.querySelector("#durationFilter");
  const sortFilter = document.querySelector("#sortFilter");
  const filterButton = document.querySelector("#filterBtn");
  const noResultText = document.querySelector("[data-tour-empty]");
  const journeyPanel = document.querySelector("[data-journey-panel]");
  const journeyItems = document.querySelectorAll("[data-journey-item]");
  const journeyEmpty = document.querySelector("[data-journey-empty]");
  const clearJourneyButton = document.querySelector("[data-clear-journey]");
  const openBookingButton = document.querySelector("[data-open-booking]");
  const bookingModal = document.querySelector("#bookingModal");
  const bookingForm = document.querySelector("#bookingForm");
  const bookingCloseButton = document.querySelector(".booking-modal__close");
  const nameInput = document.querySelector("#name");
  const emailInput = document.querySelector("#email");
  const phoneInput = document.querySelector("#phone");
  const termsInput = document.querySelector("#bookingTerms");
  let bookingTrigger = null;

  // Đọc mã tour từ localStorage và hỗ trợ dữ liệu cũ dạng object.
  const readJourneyIds = () => {
    const savedJourney = readList(journeyKey);
    const journeyIds = [];

    for (const item of savedJourney) {
      const tourId = typeof item === "string" ? item : item.id;
      if (tourId && !journeyIds.includes(tourId)) {
        journeyIds.push(tourId);
      }
    }

    return journeyIds;
  };

  // Ẩn tất cả timeline trước khi mở timeline mới.
  const closeAllTimelines = () => {
    const timelines = document.querySelectorAll(".timeline");
    for (const timeline of timelines) {
      timeline.classList.add("timeline-hidden");
    }
  };

  // Mở timeline đã hardcode ngay sau card tương ứng.
  const openTimeline = (card) => {
    const targetTimeline = card ? document.getElementById(card.dataset.target) : null;

    if (!targetTimeline) {
      return;
    }

    closeAllTimelines();
    targetTimeline.classList.remove("timeline-hidden");
    targetTimeline.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Lọc tour theo từ khóa và số ngày.
  const filterTours = () => {
    const keyword = searchInput.value.trim().toLowerCase();
    const duration = durationFilter.value;
    let visibleCount = 0;

    for (const card of tourCards) {
      const matchKeyword = !keyword || card.textContent.toLowerCase().includes(keyword);
      const matchDuration = !duration || card.dataset.duration === duration;
      const isVisible = matchKeyword && matchDuration;

      card.hidden = !isVisible;
      if (isVisible && card.closest(".tour-preview")) {
        visibleCount += 1;
      }
    }

    if (noResultText) {
      noResultText.hidden = visibleCount > 0;
    }

    closeAllTimelines();
  };

  // So sánh hai card theo mức giá đang chọn.
  const compareTourPrice = (firstCard, secondCard) => {
    const firstPrice = Number(firstCard.dataset.price || 0);
    const secondPrice = Number(secondCard.dataset.price || 0);
    return sortFilter.value === "priceAsc" ? firstPrice - secondPrice : secondPrice - firstPrice;
  };

  // Sắp xếp card bằng thuộc tính CSS order, không thay đổi cây DOM.
  const sortTours = () => {
    if (!sortFilter.value) {
      for (let index = 0; index < previewTourCards.length; index += 1) {
        const card = previewTourCards[index];
        const timeline = document.getElementById(card.dataset.target);
        card.style.order = String(index * 2);
        if (timeline) {
          timeline.style.order = String(index * 2 + 1);
        }
      }
      return;
    }

    const sortedCards = Array.from(previewTourCards);
    sortedCards.sort(compareTourPrice);

    for (let index = 0; index < sortedCards.length; index += 1) {
      const card = sortedCards[index];
      const timeline = document.getElementById(card.dataset.target);
      card.style.order = String(index * 2);
      if (timeline) {
        timeline.style.order = String(index * 2 + 1);
      }
    }

    closeAllTimelines();
  };

  // Hiển thị các tour trong hành trình bằng những dòng đã hardcode.
  const renderJourney = () => {
    const journeyIds = readJourneyIds();

    for (const item of journeyItems) {
      item.hidden = !journeyIds.includes(item.dataset.journeyItem);
    }

    journeyEmpty.hidden = journeyIds.length > 0;
    openBookingButton.disabled = journeyIds.length === 0;
    clearJourneyButton.disabled = journeyIds.length === 0;
  };

  // Cuộn đến khu vực hành trình.
  const openJourneyPanel = () => {
    renderJourney();
    journeyPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Thêm mã tour vào hành trình nếu chưa có.
  const addTourToJourney = (card) => {
    if (!card || !requireLogin()) {
      return;
    }

    const journeyIds = readJourneyIds();
    const tourId = card.dataset.target;

    if (!journeyIds.includes(tourId)) {
      journeyIds.push(tourId);
      saveList(journeyKey, journeyIds);
    }

    openJourneyPanel();
  };

  // Xóa một mã tour khỏi hành trình.
  const removeTourFromJourney = (tourId) => {
    const journeyIds = readJourneyIds();
    const foundIndex = journeyIds.indexOf(tourId);

    if (foundIndex >= 0) {
      journeyIds.splice(foundIndex, 1);
      saveList(journeyKey, journeyIds);
    }

    renderJourney();
  };

  // Điền thông tin tài khoản vào form đặt tour.
  const fillAccountInfo = () => {
    const user = getCurrentUser();
    if (user) {
      nameInput.value = user.name;
      emailInput.value = user.email;
      phoneInput.value = user.phone;
    }
  };

  // Xóa thông tin để người dùng nhập dữ liệu mới.
  const clearBookingInfo = () => {
    nameInput.value = "";
    emailInput.value = "";
    phoneInput.value = "";
  };

  // Chuyển cách điền thông tin đặt tour.
  const updateBookingInfoMode = () => {
    if (bookingForm.elements.bookingInfoMode.value === "account") {
      fillAccountInfo();
    } else {
      clearBookingInfo();
    }
  };

  // Mở modal đặt tour khi đã đăng nhập và có hành trình.
  const openBookingModal = () => {
    if (!requireLogin()) {
      return;
    }

    if (readJourneyIds().length === 0) {
      alert("Vui lòng thêm ít nhất một tour vào hành trình.");
      return;
    }

    bookingTrigger = document.activeElement;
    bookingModal.classList.remove("timeline-hidden");
    document.body.classList.add("modal-open");
    updateBookingInfoMode();
    nameInput.focus();
  };

  // Đóng modal đặt tour và trả focus về nút mở.
  const closeBookingModal = () => {
    bookingModal.classList.add("timeline-hidden");
    document.body.classList.remove("modal-open");
    if (bookingTrigger) {
      bookingTrigger.focus();
    }
  };

  // Kiểm tra họ tên trong form đặt tour.
  const validateName = () => {
    if (nameInput.value.trim().length < 2) {
      setFormError(nameInput, "Vui lòng nhập họ tên.");
      return false;
    }
    clearFormError(nameInput);
    return true;
  };

  // Kiểm tra email trong form đặt tour.
  const validateEmail = () => {
    if (!emailPattern.test(emailInput.value.trim())) {
      setFormError(emailInput, "Vui lòng nhập email hợp lệ.");
      return false;
    }
    clearFormError(emailInput);
    return true;
  };

  // Kiểm tra số điện thoại trong form đặt tour.
  const validatePhone = () => {
    if (!/^0\d{9}$/.test(phoneInput.value.trim())) {
      setFormError(phoneInput, "Số điện thoại phải gồm 10 số và bắt đầu bằng 0.");
      return false;
    }
    clearFormError(phoneInput);
    return true;
  };

  // Kiểm tra điều khoản đặt tour.
  const validateTerms = () => {
    const errorElement = document.querySelector("#bookingTerms-error");
    if (!termsInput.checked) {
      termsInput.setAttribute("aria-invalid", "true");
      errorElement.textContent = "Bạn cần đồng ý với Điều khoản sử dụng.";
      return false;
    }
    termsInput.removeAttribute("aria-invalid");
    errorElement.textContent = "";
    return true;
  };

  // Kiểm tra form, thông báo đặt tour và xóa hành trình đã đặt.
  const submitBooking = (event) => {
    event.preventDefault();

    const isValid = [validateName(), validateEmail(), validatePhone(), validateTerms()].every(Boolean);
    if (!isValid) {
      const firstError = bookingForm.querySelector('[aria-invalid="true"]');
      if (firstError) {
        firstError.focus();
      }
      return;
    }

    const journeyCount = readJourneyIds().length;
    alert(`Đặt tour thành công! Hành trình của bạn có ${journeyCount} tour.`);
    saveList(journeyKey, []);
    bookingForm.reset();
    closeBookingModal();
    renderJourney();
  };

  // Xử lý các nút chi tiết, thêm tour, đóng timeline và xóa tour.
  const handleDocumentClick = (event) => {
    const detailButton = event.target.closest(".btn-detail");
    const addButton = event.target.closest(".btn-add-journey");
    const closeTimelineButton = event.target.closest(".btn-close-timeline");
    const removeButton = event.target.closest("[data-remove-journey]");

    if (detailButton) {
      openTimeline(detailButton.closest(".tour-card"));
    } else if (addButton) {
      addTourToJourney(addButton.closest(".tour-card"));
    } else if (closeTimelineButton) {
      closeTimelineButton.closest(".timeline").classList.add("timeline-hidden");
    } else if (removeButton) {
      removeTourFromJourney(removeButton.dataset.removeJourney);
    }
  };

  // Xóa toàn bộ hành trình sau khi người dùng xác nhận.
  const clearJourney = () => {
    if (window.confirm("Bạn có muốn xóa toàn bộ hành trình không?")) {
      saveList(journeyKey, []);
      renderJourney();
    }
  };

  // Cập nhật cách điền thông tin khi đổi lựa chọn.
  const handleBookingChange = (event) => {
    if (event.target.name === "bookingInfoMode") {
      updateBookingInfoMode();
    }
  };

  // Chỉ giữ tối đa 10 chữ số trong ô điện thoại.
  const handlePhoneInput = () => {
    phoneInput.value = phoneInput.value.replace(/\D/g, "").slice(0, 10);
    if (phoneInput.value) {
      validatePhone();
    }
  };

  // Đóng modal khi bấm vào lớp nền.
  const handleBookingBackdrop = (event) => {
    if (event.target === bookingModal) {
      closeBookingModal();
    }
  };

  // Đóng modal bằng Escape và giữ focus trong modal khi bấm Tab.
  const handleBookingKeydown = (event) => {
    if (bookingModal.classList.contains("timeline-hidden")) {
      return;
    }

    if (event.key === "Escape") {
      closeBookingModal();
      return;
    }

    if (event.key === "Tab") {
      const focusable = bookingModal.querySelectorAll("button:not([disabled]), input:not([disabled])");
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

  document.addEventListener("click", handleDocumentClick);
  filterButton.addEventListener("click", filterTours);
  searchInput.addEventListener("input", filterTours);
  durationFilter.addEventListener("change", filterTours);
  sortFilter.addEventListener("change", sortTours);
  clearJourneyButton.addEventListener("click", clearJourney);
  openBookingButton.addEventListener("click", openBookingModal);
  bookingCloseButton.addEventListener("click", closeBookingModal);
  bookingForm.addEventListener("change", handleBookingChange);
  bookingForm.addEventListener("submit", submitBooking);
  phoneInput.addEventListener("input", handlePhoneInput);
  bookingModal.addEventListener("click", handleBookingBackdrop);
  document.addEventListener("keydown", handleBookingKeydown);
  document.addEventListener("cantho:openJourney", openJourneyPanel);

  if (window.location.hash === "#journey") {
    openJourneyPanel();
  }

  sortTours();
  renderJourney();
})();
