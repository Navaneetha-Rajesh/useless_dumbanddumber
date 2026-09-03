document.addEventListener("DOMContentLoaded", () => {

    const logo = document.getElementById("logo");
    const modal = document.getElementById("info-modal");
    const closeModal = document.getElementById("close-modal");

    // =========================
    // LOGO → ABOUT
    // =========================

    logo.addEventListener("click", () => {
        modal.classList.remove("hidden");
        bhaskar.lookAtLogoModal();
    });


    // =========================
    // CLOSE MODAL
    // =========================

    closeModal.addEventListener("click", () => {
        modal.classList.add("hidden");
        bhaskar.resetFromModal();
    });


    // =========================
    // HOUSE → ABOUT
    // =========================

    const houseHotspot = document.getElementById("house-hotspot");

    houseHotspot.addEventListener("click", () => {

        console.log("🏠 HOUSE CLICKED!");

        modal.classList.remove("hidden");
        bhaskar.lookAtLogoModal();

    });


    // =========================
    // GOAT
    // =========================

    const goatHotspot = document.getElementById("goat-hotspot");
    const goatSound = document.getElementById("goat-sound");

    goatHotspot.addEventListener("click", () => {

        console.log("🐐 GOAT CLICKED!");

        goatSound.currentTime = 0;

        goatSound.play().catch(error => {
            console.error("Goat sound failed:", error);
        });

    });


    // =========================
    // DETECTION
    // =========================

    const tracker = new DetectionEngine();
    tracker.init();


    // =========================
    // RANDOM BHASKAR ACTIONS
    // =========================

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