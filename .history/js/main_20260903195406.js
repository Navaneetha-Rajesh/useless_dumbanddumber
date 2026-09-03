document.addEventListener('DOMContentLoaded', () => {

  // Start webcam detection
  const tracker = new DetectionEngine();
  tracker.init();

  // Uncle can randomly walk around,
  // but this should NOT trigger random reactions.
  setInterval(() => {

    if (!bhaskar.isReacting && !bhaskar.isFacingModal) {
      bhaskar.moveRandomly();
    }

  }, 7000);

});