document.addEventListener("DOMContentLoaded", () => {
  // =========================
    // GOAT SOUND
    // =========================

    const goatHotspot = document.getElementById("goat-hotspot");
    const goatSound = new Audio("assets/sounds/goat.mp3");

    goatHotspot.addEventListener("click", () => {
        goatSound.currentTime = 0;
        goatSound.play();
    });

  // ======================================
  // ANIMATED BACKGROUND
  // ======================================

  const backgroundFrames = [
    "assets/background/1.png",
    "assets/background/2.png",
    "assets/background/3.png",
    "assets/background/4.png"
  ];

  let backgroundIndex = 0;

  // Preload backgrounds
  backgroundFrames.forEach(src => {
    const img = new Image();
    img.src = src;
  });

  // Change background every 1 second
  setInterval(() => {

    backgroundIndex =
      (backgroundIndex + 1) % backgroundFrames.length;

    document.body.style.backgroundImage =
      `url("${backgroundFrames[backgroundIndex]}")`;

  }, 1000);


  // ======================================
  // LOGO & MODAL
  // ======================================

  const logo = document.getElementById("logo");
  const modal = document.getElementById("info-modal");
  const closeModal = document.getElementById("close-modal");


  // Check that elements exist
  console.log("Logo:", logo);
  console.log("Modal:", modal);
  console.log("Close button:", closeModal);


  // ======================================
  // OPEN MODAL
  // ======================================

  if (logo && modal) {

    logo.addEventListener("click", () => {

      console.log("LOGO CLICKED");

      modal.classList.remove("hidden");

      // Bhaskar reaction
      if (typeof bhaskar !== "undefined") {

        bhaskar.lookAtLogoModal();

      }

    });

  }


  // ======================================
  // CLOSE MODAL
  // ======================================

  if (closeModal && modal) {

    closeModal.addEventListener("click", () => {

      modal.classList.add("hidden");

      if (typeof bhaskar !== "undefined") {

        bhaskar.resetFromModal();

      }

    });

  }


  // ======================================
  // CLOSE WHEN CLICKING OUTSIDE CARD
  // ======================================

  if (modal) {

    modal.addEventListener("click", (event) => {

      if (event.target === modal) {

        modal.classList.add("hidden");

        if (typeof bhaskar !== "undefined") {

          bhaskar.resetFromModal();

        }

      }

    });

  }


  // ======================================
  // START WEBCAM AI
  // ======================================

  const tracker = new DetectionEngine();

  tracker.init();


  // ======================================
  // RANDOM WALKING
  // ======================================

  setInterval(() => {

    if (!bhaskar.isReacting) {

      const random = Math.random();

      if (random < 0.6) {

        bhaskar.moveRandomly();

      }

      else if (random < 0.8) {

        bhaskar.triggerRandomStory();

      }

    }

  }, 7000);

});