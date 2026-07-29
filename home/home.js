// Điều khiển slideshow tự động ở trang chủ.
(() => {
  const slides = document.querySelectorAll(".home-slide");

  if (!slides.length) {
    return;
  }

  let currentSlideIndex = 0;
  let slideTimer = null;
  const slideIntervalTime = 3000;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Ẩn slide hiện tại và hiển thị slide tiếp theo.
  const showNextSlide = () => {
    slides[currentSlideIndex].classList.remove("active");
    currentSlideIndex = (currentSlideIndex + 1) % slides.length;
    slides[currentSlideIndex].classList.add("active");
  };

  // Dừng bộ đếm slideshow khi không cần thiết.
  const stopSlideshow = () => {
    if (slideTimer) {
      window.clearInterval(slideTimer);
      slideTimer = null;
    }
  };

  // Bắt đầu slideshow nếu người dùng không yêu cầu giảm chuyển động.
  const startSlideshow = () => {
    stopSlideshow();
    if (!reduceMotion.matches && !document.hidden) {
      slideTimer = window.setInterval(showNextSlide, slideIntervalTime);
    }
  };

  // Tạm dừng slideshow khi tab bị ẩn và chạy lại khi tab hiển thị.
  const handleVisibilityChange = () => {
    if (document.hidden) {
      stopSlideshow();
    } else {
      startSlideshow();
    }
  };

  // Cập nhật slideshow khi cài đặt giảm chuyển động thay đổi.
  const handleMotionChange = () => {
    startSlideshow();
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  reduceMotion.addEventListener("change", handleMotionChange);
  startSlideshow();
})();
