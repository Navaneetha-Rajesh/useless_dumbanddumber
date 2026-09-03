document.addEventListener('DOMContentLoaded', () => {
  const logo = document.getElementById('logo');
  const modal = document.getElementById('info-modal');
  const closeModal = document.getElementById('close-modal');

  // 1. Logo Click Event -> Trigger Glassmorphism Modal & Bhaskar Action
  logo.addEventListener('click', () => {
    modal.classList.remove('hidden');
    bhaskar.lookAtLogo();
  });

  closeModal.addEventListener('click', () => {
    modal.classList.add('hidden');
    bhaskar.resetPosition();
  });

  // 2. Setup Detection Callback & Engine
  const tracker = new DetectionEngine((event) => {
    if (event === 'SLOUCHING') {
      bhaskar.setImage('scolding');
      bhaskar.speak("Sit straight! Your spine is bending like a banana!");
    }
  });
  
  tracker.init();

  // 3. Bhaskar Idle Behaviors (Random walking & story telling)
  setInterval(() => {
    const rand = Math.random();
    if (rand < 0.4) {
      bhaskar.moveRandomly();
    } else if (rand < 0.7) {
      bhaskar.triggerRandomStory();
    }
  }, 7000);
});