(() => {
  // Lay cac thanh phan cua modal am thuc.
  const modal = document.querySelector("#foodModal");
  const modalImage = document.querySelector("#foodModalImage");
  const modalTitle = document.querySelector("#foodModalTitle");
  const modalText = document.querySelector("#foodModalText");
  const closeButton = document.querySelector(".amthuc-modal__close");
  const grid = document.querySelector(".amthuc-grid");

  if (!modal || !modalImage || !modalTitle || !modalText || !closeButton || !grid) {
    return;
  }

  // Lay thong tin mon an truc tiep tu card HTML de tranh lap du lieu trong JS.
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

  // Do du lieu card vao modal va hien modal.
  const openFoodModal = (card) => {
    const food = getFoodInfo(card);

    modalImage.src = food.image;
    modalImage.alt = food.title;
    modalTitle.textContent = food.title;
    modalText.textContent = food.text;
    modal.classList.add("is-open");
    closeButton.focus();
  };

  // An modal khi nguoi dung dong.
  const closeFoodModal = () => {
    modal.classList.remove("is-open");
  };

  // Dung event delegation: chi can lang nghe click tren grid thay vi tung card.
  grid.addEventListener("click", (event) => {
    const favoriteButton = event.target.closest("[data-favorite-button]");
    const card = event.target.closest(".amthuc-card[data-food]");

    if (!card || favoriteButton) {
      return;
    }

    openFoodModal(card);
  });

  // Ho tro mo modal bang ban phim cho card co tabindex.
  grid.addEventListener("keydown", (event) => {
    const card = event.target.closest(".amthuc-card[data-food]");

    if (!card || (event.key !== "Enter" && event.key !== " ")) {
      return;
    }

    event.preventDefault();
    openFoodModal(card);
  });

  closeButton.addEventListener("click", closeFoodModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeFoodModal();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeFoodModal();
    }
  });
})();
