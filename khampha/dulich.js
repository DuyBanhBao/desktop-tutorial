// Tìm kiếm các địa điểm trên trang Khám phá.
(() => {
  const searchInput = document.querySelector("#destinationSearch");
  const searchButton = document.querySelector(".khampha-search__button");
  const cards = document.querySelectorAll(".khampha-card");
  const noResultText = document.querySelector("#noResultText");

  if (!searchInput || !searchButton || !noResultText || !cards.length) {
    return;
  }

  // Chuyển chữ có dấu thành chữ không dấu để tìm kiếm dễ hơn.
  const normalizeText = (value) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .toLowerCase();

  // Ẩn hoặc hiện card theo từ khóa tìm kiếm.
  const filterDestinations = () => {
    const keyword = normalizeText(searchInput.value.trim());
    let visibleCount = 0;

    for (const card of cards) {
      const name = normalizeText(card.getAttribute("data-name") || "");
      const matches = name.includes(keyword);

      card.classList.toggle("khampha-card--hidden", !matches);
      if (matches) {
        visibleCount += 1;
      }
    }

    noResultText.hidden = visibleCount > 0;
  };

  searchInput.addEventListener("input", filterDestinations);
  searchButton.addEventListener("click", filterDestinations);
})();
