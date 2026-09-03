document.addEventListener("DOMContentLoaded", () => {

  // ======================================
  // LOGO & MODAL
  // ======================================

  const logo = document.getElementById("logo");
  const modal = document.getElementById("info-modal");
  const closeModal = document.getElementById("close-modal");

  console.log("Logo:", logo);
  console.log("Modal:", modal);
  console.log("Close button:", closeModal);
  

  // ======================================
  // GOAT SOUND
  // ======================================

  const goatHotspot = document.getElementById("goat-hotspot");
  const goatSound = new Audio("assets/sounds/goat.mp3");

  if (goatHotspot) {

    goatHotspot.addEventListener("click", () => {

      console.log("🐐 GOAT CLICKED");

      goatSound.currentTime = 0;

      goatSound.play().catch(error => {
        console.error("Goat sound failed:", error);
      });

    });

  }


  // ======================================
  // HOUSE EASTER EGG
  // ======================================

  const houseHotspot = document.getElementById("house-hotspot");

  console.log("House:", houseHotspot);

  if (houseHotspot && modal) {

    houseHotspot.addEventListener("click", () => {

      console.log("🏠 HOUSE CLICKED");

      // Open About modal
      modal.classList.remove("hidden");

      // Bhaskar reacts
      if (typeof bhaskar !== "undefined") {

        bhaskar.lookAtLogoModal();

      }

    });

  }


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
  // OPEN MODAL FROM LOGO
  // ======================================

  if (logo && modal) {

    logo.addEventListener("click", () => {

      console.log("LOGO CLICKED");

      modal.classList.remove("hidden");

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