(() => {
  // Lay cac thanh phan tim kiem tren trang Kham pha.
  const searchInput = document.querySelector("#destinationSearch");
  const searchButton = document.querySelector(".khampha-search__button");
  const cards = document.querySelectorAll(".khampha-card");
  const noResultText = document.querySelector("#noResultText");

  if (!searchInput || !searchButton || !noResultText || !cards.length) {
    return;
  }

  // Loc card dua tren data-name da gan san trong HTML.
  const filterDestinations = () => {
    const keyword = searchInput.value.trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach((card) => {
      const name = card.getAttribute("data-name") || "";
      const matches = name.includes(keyword);
      card.classList.toggle("khampha-card--hidden", !matches);
      if (matches) visibleCount++;
    });

    noResultText.style.display = visibleCount === 0 ? "block" : "none";
  };

  searchInput.addEventListener("input", filterDestinations);
  searchButton.addEventListener("click", filterDestinations);
})();
