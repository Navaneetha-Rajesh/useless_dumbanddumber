document.addEventListener("DOMContentLoaded", () => {

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

  // Preload all background images
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
  // YOUR EXISTING CODE
  // ======================================

  const logo =
    document.getElementById("logo");

  // ...rest of your existing code
});
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