(() => {
  // Lay cac ham dung chung tu main.js de khong viet lap lai.
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

  // Gom cac thanh phan DOM can dung tren trang Lich trinh.
  const tourCards = document.querySelectorAll(".tour-card");
  const previewTourCards = document.querySelectorAll(".tour-preview > .tour-card");
  const tourPreview = document.querySelector(".tour-preview");
  const searchInput = document.querySelector("#search");
  const durationFilter = document.querySelector("#durationFilter");
  const sortFilter = document.querySelector("#sortFilter");
  const filterButton = document.querySelector("#filterBtn");
  const journeyPanel = document.querySelector("[data-journey-panel]");
  const journeyList = document.querySelector("[data-journey-list]");
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

  // Dat timeline ngay sau card dang duoc xem chi tiet.
  const placeTimelineAfterCard = (card, timeline) => {
    if (card && timeline) {
      card.insertAdjacentElement("afterend", timeline);
    }
  };

  // Khi loc/sap xep xong, dua cac timeline ve lai dung vi tri sau card goc.
  const restorePreviewTimelinePositions = () => {
    previewTourCards.forEach((card) => {
      const timeline = document.getElementById(card.dataset.target);
      placeTimelineAfterCard(card, timeline);
    });
  };

  // An tat ca timeline truoc khi mo timeline moi.
  const closeAllTimelines = () => {
    document.querySelectorAll(".timeline").forEach((timeline) => {
      timeline.classList.add("timeline-hidden");
    });
  };

  // Mo timeline cua tour duoc bam "Xem chi tiet".
  const openTimeline = (card) => {
    const targetTimeline = document.getElementById(card.dataset.target);

    if (!targetTimeline) {
      return;
    }

    closeAllTimelines();
    placeTimelineAfterCard(card, targetTimeline);
    targetTimeline.classList.remove("timeline-hidden");
    targetTimeline.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Loc tour theo tu khoa va so ngay.
  const filterTours = () => {
    const keyword = searchInput.value.trim().toLowerCase();
    const duration = durationFilter.value;

    tourCards.forEach((card) => {
      const cardDuration = card.dataset.duration;
      const matchKeyword = keyword === "" || card.textContent.toLowerCase().includes(keyword);
      const matchDuration = duration === "" || cardDuration === duration;

      card.style.display = matchKeyword && matchDuration ? "block" : "none";
    });

    closeAllTimelines();
    restorePreviewTimelinePositions();
  };

  // Sap xep tour theo gia nhung van giu timeline di kem dung card.
  const sortTours = () => {
    if (!tourPreview || !sortFilter.value) {
      return;
    }

    const cards = Array.from(tourPreview.querySelectorAll(".tour-card"));

    cards.sort((firstCard, secondCard) => {
      const firstPrice = Number(firstCard.dataset.price || 0);
      const secondPrice = Number(secondCard.dataset.price || 0);

      return sortFilter.value === "priceAsc"
        ? firstPrice - secondPrice
        : secondPrice - firstPrice;
    });

    cards.forEach((card) => {
      const timeline = document.getElementById(card.dataset.target);

      if (timeline) {
        timeline.classList.add("timeline-hidden");
      }

      tourPreview.append(card);
      placeTimelineAfterCard(card, timeline);
    });
  };

  // Lay thong tin tour tu HTML da hardcode san.
  const getTourInfo = (card) => {
    const title = card.querySelector(".card__title");
    const image = card.querySelector(".tour-card__image");
    const text = card.querySelector(".tour-card__text");
    const details = card.querySelectorAll("span");

    return {
      id: card.dataset.target,
      title: title ? title.textContent.trim() : "Tour Cần Thơ",
      image: image ? image.getAttribute("src") : "",
      text: text ? text.textContent.trim() : "",
      duration: details[0] ? details[0].textContent.trim() : "",
      price: details[1] ? details[1].textContent.trim() : "",
    };
  };

  // Tao mot dong tour trong panel Hanh trinh bang DOM API, khong dung innerHTML.
  const createJourneyItem = (tour) => {
    const item = document.createElement("article");
    const image = document.createElement("img");
    const body = document.createElement("div");
    const title = document.createElement("h3");
    const text = document.createElement("p");
    const duration = document.createElement("p");
    const price = document.createElement("p");
    const removeButton = document.createElement("button");

    item.className = "journey-panel__item";
    image.className = "journey-panel__image";
    body.className = "journey-panel__body";
    title.className = "journey-panel__item-title";
    text.className = "journey-panel__item-text";
    duration.className = "journey-panel__item-meta";
    price.className = "journey-panel__item-meta";
    removeButton.className = "button button--outline journey-panel__remove";

    image.src = tour.image;
    image.alt = tour.title;
    title.textContent = tour.title;
    text.textContent = tour.text;
    duration.textContent = tour.duration;
    price.textContent = tour.price;
    removeButton.type = "button";
    removeButton.dataset.removeJourney = tour.id;
    removeButton.textContent = "Xóa";

    body.append(title, text, duration, price, removeButton);
    item.append(image, body);
    return item;
  };

  // Ve lai panel Hanh trinh dua tren danh sach trong localStorage.
  const renderJourney = () => {
    const journey = readList(journeyKey);

    journeyList.textContent = "";
    journeyEmpty.hidden = journey.length > 0;
    openBookingButton.disabled = journey.length === 0;
    clearJourneyButton.disabled = journey.length === 0;

    journey.forEach((tour) => {
      journeyList.append(createJourneyItem(tour));
    });
  };

  // Cuon den panel Hanh trinh sau khi them tour hoac bam icon tren navbar.
  const openJourneyPanel = () => {
    renderJourney();
    journeyPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Them tour vao Hanh trinh, neu tour da co thi khong them trung.
  const addTourToJourney = (card) => {
    if (!requireLogin()) {
      return;
    }

    const tour = getTourInfo(card);
    const journey = readList(journeyKey);
    const isAdded = journey.some((item) => item.id === tour.id);

    if (!isAdded) {
      journey.push(tour);
      saveList(journeyKey, journey);
    }

    openJourneyPanel();
  };

  // Xoa mot tour khoi Hanh trinh.
  const removeTourFromJourney = (tourId) => {
    const journey = readList(journeyKey).filter((tour) => tour.id !== tourId);
    saveList(journeyKey, journey);
    renderJourney();
  };

  // Dien thong tin nguoi dang nhap vao form dat tour.
  const fillAccountInfo = () => {
    const user = getCurrentUser();

    if (!user) {
      return;
    }

    nameInput.value = user.name;
    emailInput.value = user.email;
    phoneInput.value = user.phone;
  };

  // Xoa form khi nguoi dung muon nhap thong tin moi.
  const clearBookingInfo = () => {
    nameInput.value = "";
    emailInput.value = "";
    phoneInput.value = "";
  };

  // Chuyen giua 2 cach dat tour: dung thong tin dang nhap hoac thong tin moi.
  const updateBookingInfoMode = () => {
    const selectedMode = bookingForm.elements.bookingInfoMode.value;

    if (selectedMode === "account") {
      fillAccountInfo();
      return;
    }

    clearBookingInfo();
  };

  // Chi cho mo modal dat tour khi da dang nhap va co it nhat mot tour trong Hanh trinh.
  const openBookingModal = () => {
    if (!requireLogin()) {
      return;
    }

    if (readList(journeyKey).length === 0) {
      alert("Vui lòng thêm ít nhất một tour vào hành trình.");
      return;
    }

    bookingModal.classList.remove("timeline-hidden");
    updateBookingInfoMode();
    nameInput.focus();
  };

  // Dong modal dat tour.
  const closeBookingModal = () => {
    bookingModal.classList.add("timeline-hidden");
  };

  // Cac ham validate rieng cho form dat tour.
  const validateName = () => {
    if (nameInput.value.trim().length < 2) {
      setFormError(nameInput, "Vui lòng nhập họ tên.");
      return false;
    }

    clearFormError(nameInput);
    return true;
  };

  const validateEmail = () => {
    if (!emailPattern.test(emailInput.value.trim())) {
      setFormError(emailInput, "Vui lòng nhập email hợp lệ.");
      return false;
    }

    clearFormError(emailInput);
    return true;
  };

  const validatePhone = () => {
    if (!/^0\d{9}$/.test(phoneInput.value.trim())) {
      setFormError(phoneInput, "Số điện thoại phải gồm 10 số và bắt đầu bằng 0.");
      return false;
    }

    clearFormError(phoneInput);
    return true;
  };

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

  // Xu ly dat tour thanh cong: thong bao, xoa hanh trinh va reset form.
  const submitBooking = (event) => {
    event.preventDefault();

    const isValid = [
      validateName(),
      validateEmail(),
      validatePhone(),
      validateTerms(),
    ].every(Boolean);

    if (!isValid) {
      return;
    }

    const journeyCount = readList(journeyKey).length;

    alert(`Đặt tour thành công! Hành trình của bạn có ${journeyCount} tour.`);
    saveList(journeyKey, []);
    bookingForm.reset();
    closeBookingModal();
    renderJourney();
  };

  // Dung event delegation cho cac nut tren card/timeline/hanh trinh.
  document.addEventListener("click", (event) => {
    const detailButton = event.target.closest(".btn-detail");
    const addJourneyButton = event.target.closest(".btn-add-journey");
    const closeTimelineButton = event.target.closest(".btn-close-timeline");
    const removeJourneyButton = event.target.closest("[data-remove-journey]");

    if (detailButton) {
      openTimeline(detailButton.closest(".tour-card"));
      return;
    }

    if (addJourneyButton) {
      addTourToJourney(addJourneyButton.closest(".tour-card"));
      return;
    }

    if (closeTimelineButton) {
      closeTimelineButton.closest(".timeline").classList.add("timeline-hidden");
      return;
    }

    if (removeJourneyButton) {
      removeTourFromJourney(removeJourneyButton.dataset.removeJourney);
    }
  });

  // Cac su kien rieng cho loc, sap xep, form va modal.
  filterButton.addEventListener("click", filterTours);
  searchInput.addEventListener("input", filterTours);
  durationFilter.addEventListener("change", filterTours);
  sortFilter.addEventListener("change", sortTours);
  clearJourneyButton.addEventListener("click", () => {
    saveList(journeyKey, []);
    renderJourney();
  });
  openBookingButton.addEventListener("click", openBookingModal);
  bookingCloseButton.addEventListener("click", closeBookingModal);
  bookingForm.addEventListener("change", (event) => {
    if (event.target.name === "bookingInfoMode") {
      updateBookingInfoMode();
    }
  });
  bookingForm.addEventListener("submit", submitBooking);
  phoneInput.addEventListener("input", () => {
    // Chi giu chu so va toi da 10 so, khong tac dong den cau truc HTML.
    phoneInput.value = phoneInput.value.replace(/\D/g, "").slice(0, 10);
    if (phoneInput.value.trim() !== "") {
      validatePhone();
    }
  });
  bookingModal.addEventListener("click", (event) => {
    if (event.target === bookingModal) {
      closeBookingModal();
    }
  });
  document.addEventListener("cantho:openJourney", openJourneyPanel);

  // Neu vao trang bang link #journey thi mo ngay panel Hanh trinh.
  if (window.location.hash === "#journey") {
    openJourneyPanel();
  }

  // Ve trang thai Hanh trinh ban dau khi trang vua tai.
  renderJourney();
})();
