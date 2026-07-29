// Điều khiển modal chi tiết món ăn.
(() => {
  const modal = document.querySelector("#foodModal");
  const modalImage = document.querySelector("#foodModalImage");
  const modalTitle = document.querySelector("#foodModalTitle");
  const modalText = document.querySelector("#foodModalText");
  const closeButton = document.querySelector(".amthuc-modal__close");
  const grid = document.querySelector(".amthuc-grid");
  let activeCard = null;

  if (!modal || !modalImage || !modalTitle || !modalText || !closeButton || !grid) {
    return;
  }

  // Lấy nội dung món ăn từ card đã hardcode trong HTML.
  const getFoodInfo = (card) => {
    const image = card.querySelector(".amthuc-card__image");
    const title = card.querySelector(".amthuc-card__title");
    const text = card.querySelector(".amthuc-card__text");

    return {
      image: image ? image.getAttribute("src") : "",
      title: title ? title.textContent.trim() : "",
      text: text ? text.textContent.trim() : "",
    };
  };

  // Điền nội dung vào modal và hiển thị món ăn được chọn.
  const openFoodModal = (card) => {
    const food = getFoodInfo(card);
    activeCard = card;

    modalImage.src = food.image;
    modalImage.alt = food.title;
    modalTitle.textContent = food.title;
    modalText.textContent = food.text;
    modal.classList.add("is-open");
    document.body.classList.add("modal-open");
    closeButton.focus();
  };

  // Đóng modal và trả focus về card đã mở.
  const closeFoodModal = () => {
    modal.classList.remove("is-open");
    document.body.classList.remove("modal-open");
    if (activeCard) {
      activeCard.focus();
    }
  };

  // Mở modal khi bấm card nhưng bỏ qua nút yêu thích.
  const handleGridClick = (event) => {
    const favoriteButton = event.target.closest("[data-favorite-button]");
    const card = event.target.closest(".amthuc-card[data-food]");

    if (card && !favoriteButton) {
      openFoodModal(card);
    }
  };

  // Hỗ trợ mở card bằng phím Enter hoặc Space.
  const handleGridKeydown = (event) => {
    const card = event.target.closest(".amthuc-card[data-food]");

    if (!card || (event.key !== "Enter" && event.key !== " ")) {
      return;
    }

    event.preventDefault();
    openFoodModal(card);
  };

  // Đóng modal khi bấm vào lớp nền.
  const handleModalClick = (event) => {
    if (event.target === modal) {
      closeFoodModal();
    }
  };

  // Đóng modal bằng Escape và giữ phím Tab trong modal.
  const handleModalKeydown = (event) => {
    if (!modal.classList.contains("is-open")) {
      return;
    }

    if (event.key === "Escape") {
      closeFoodModal();
    } else if (event.key === "Tab") {
      event.preventDefault();
      closeButton.focus();
    }
  };

  grid.addEventListener("click", handleGridClick);
  grid.addEventListener("keydown", handleGridKeydown);
  closeButton.addEventListener("click", closeFoodModal);
  modal.addEventListener("click", handleModalClick);
  document.addEventListener("keydown", handleModalKeydown);
})();
