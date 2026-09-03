document.addEventListener("DOMContentLoaded", () => {

  const logo =
    document.getElementById("logo");

  const modal =
    document.getElementById("info-modal");

  const closeModal =
    document.getElementById("close-modal");


  // ======================================
  // LOGO CLICK
  // ======================================

  logo.addEventListener("click", () => {

    modal.classList.remove("hidden");

    bhaskar.lookAtLogoModal();

  });


  // ======================================
  // CLOSE MODAL
  // ======================================

  closeModal.addEventListener("click", () => {

    modal.classList.add("hidden");

    bhaskar.resetFromModal();

  });


  // ======================================
  // START WEBCAM AI
  // ======================================

  const tracker =
    new DetectionEngine();

  tracker.init();


  // ======================================
  // RANDOM WALKING
  // ======================================

  setInterval(() => {

    if (!bhaskar.isReacting) {

      const random =
        Math.random();

      if (random < 0.6) {

        bhaskar.moveRandomly();

      }

      else if (random < 0.8) {

        bhaskar.triggerRandomStory();

      }

    }

  }, 7000);

});