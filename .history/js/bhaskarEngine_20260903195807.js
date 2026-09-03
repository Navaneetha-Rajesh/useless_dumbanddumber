class BhaskarEngine {
  constructor() {
    this.container = document.getElementById('bhaskar-container');
    this.avatar = document.getElementById('bhaskar-avatar');
    this.bubble = document.getElementById('speech-bubble');

    // ==========================================
    // AVATAR ASSETS
    // ==========================================

    this.assets = {
      angry2: 'assets/avatar/uncle-angry-2.png',
      angry: 'assets/avatar/uncle-angry.png',
      approve: 'assets/avatar/uncle-approve.png',
      celebrate: 'assets/avatar/uncle-celebrate.png',
      confused: 'assets/avatar/uncle-confused.png',

      idleAfterSip2: 'assets/avatar/uncle-idle-after-sip-2.png',
      idleAfterSip: 'assets/avatar/uncle-idle-after-sip.png',
      idleBlink: 'assets/avatar/uncle-idle-blink.png',
      idleSip: 'assets/avatar/uncle-idle-sip.png',
      idle: 'assets/avatar/uncle-idle.png',

      judge2: 'assets/avatar/uncle-judge-2.png',
      judgeSit: 'assets/avatar/uncle-judge-sit.png',
      judge: 'assets/avatar/uncle-judge.png',

      laugh: 'assets/avatar/uncle-laugh.png',
      point: 'assets/avatar/uncle-point.png',
      surprised: 'assets/avatar/uncle-surprised.png',
      thinking: 'assets/avatar/uncle-thinking.png',

      walk1: 'assets/avatar/uncle-walk-1.png',
      walk2: 'assets/avatar/uncle-walk-2.png',
      walk3: 'assets/avatar/uncle-walk-3.png',
      walk4: 'assets/avatar/uncle-walk-4.png'
    };

    // ==========================================
    // UNCLE STORIES
    // ==========================================

    this.badaiStories = [
      "ഞങ്ങളുടെ കാലത്ത് ഇതൊന്നും ഇല്ലായിരുന്നു!",
      "ഞങ്ങളുടെ കാലത്ത് ഫോൺ പോലും ഇല്ലായിരുന്നു!",
      "ഞാൻ നിന്റെ പ്രായത്തിൽ ആയിരുന്നപ്പോൾ...",
      "ഇപ്പോഴത്തെ പിള്ളേർക്ക് എല്ലാം എളുപ്പമാണ്.",
      "ഞങ്ങളുടെ കാലത്ത് ഞങ്ങൾ കഷ്ടപ്പെട്ടാണ് വളർന്നത്.",
      "ഞങ്ങളുടെ കാലത്ത് സമയം വെറുതെ കളയാറില്ലായിരുന്നു.",
      "കാലം പോയി മോനേ...",
      "ഞാൻ പറയുന്നത് അനുഭവത്തിൽ നിന്നാണ്.",
      "ഇതൊക്കെ ഇപ്പോൾ മനസ്സിലാകില്ല.",
      "പിന്നെ എന്നോട് വന്ന് പറയരുത്."
    ];

    // ==========================================
    // PHONE JUDGEMENTS
    // ==========================================

    this.phoneDialogues = [
      "എപ്പോ നോക്കിയാലും ഫോൺ തന്നെ!",
      "ഫോൺ ഒന്ന് താഴെ വെച്ചൂടെ?",
      "ഇത്ര നേരം ഫോണിൽ എന്താ?",
      "ഫോൺ തന്നെ ജീവിതമായോ?",
      "വേറെ പണിയൊന്നുമില്ലേ?",
      "ഫോണിൽ നോക്കിയിരുന്നാൽ കാര്യം നടക്കുമോ?",
      "ഞങ്ങളുടെ കാലത്ത് ഫോൺ പോലും ഇല്ലായിരുന്നു!",
      "ഫോൺ ഇല്ലാതെ അഞ്ച് മിനിറ്റ് ഇരുന്ന് നോക്ക്.",
      "ഇതാണോ ഇപ്പോ പ്രധാന ജോലി?",
      "ഹമ്മ്... ഫോൺ തന്നെ."
    ];

    // ==========================================
    // POSITION / STATE
    // ==========================================

    this.posX = 100;

    this.isFacingModal = false;
    this.isReacting = false;

    this.walkInterval = null;
    this.reactionTimeout = null;
    this.speechTimeout = null;
    this.sipTimeout = null;

    // Start idle animation
    this.startIdleBlinkLoop();

    // Initial position
    this.container.style.left = `${this.posX}px`;
  }

  // ==========================================
  // CHANGE AVATAR IMAGE
  // ==========================================

  setImage(key) {
    if (!this.assets[key]) {
      console.warn(`Avatar asset "${key}" not found.`);
      return;
    }

    this.avatar.src = this.assets[key];
  }

  // ==========================================
  // SPEECH BUBBLE
  // ==========================================

  speak(text, duration = 4500) {

    if (!this.bubble) return;

    this.bubble.innerText = text;

    this.bubble.classList.remove('hidden');

    clearTimeout(this.speechTimeout);

    this.speechTimeout = setTimeout(() => {
      this.bubble.classList.add('hidden');
    }, duration);
  }

  // ==========================================
  // HIDE SPEECH
  // ==========================================

  hideSpeech() {

    clearTimeout(this.speechTimeout);

    if (this.bubble) {
      this.bubble.classList.add('hidden');
    }
  }

  // ==========================================
  // IDLE ANIMATION
  // ==========================================

  startIdleBlinkLoop() {

    setInterval(() => {

      // Don't interrupt reactions
      if (this.isReacting) return;

      // Don't interrupt walking
      if (this.walkInterval) return;

      // Don't interrupt modal interaction
      if (this.isFacingModal) return;

      const rand = Math.random();

      // Blink
      if (rand < 0.45) {

        this.setImage('idleBlink');

        setTimeout(() => {

          if (!this.isReacting && !this.walkInterval) {
            this.setImage('idle');
          }

        }, 300);

      }

      // Tea sipping
      else if (rand > 0.80) {

        this.sipTeaSequence();

      }

    }, 5000);
  }

  // ==========================================
  // TEA SIPPING
  // ==========================================

  sipTeaSequence() {

    if (this.isReacting || this.walkInterval) return;

    this.setImage('idleSip');

    this.sipTimeout = setTimeout(() => {

      if (this.isReacting || this.walkInterval) return;

      this.setImage('idleAfterSip');

      this.speak(
        "Ah... strong tea, like my opinions.",
        2500
      );

      this.sipTimeout = setTimeout(() => {

        if (this.isReacting || this.walkInterval) return;

        this.setImage('idleAfterSip2');

        setTimeout(() => {

          if (!this.isReacting && !this.walkInterval) {
            this.setImage('idle');
          }

        }, 1500);

      }, 1500);

    }, 1200);
  }

  // ==========================================
  // COMMON REACTION FUNCTION
  // ==========================================

  react(image, text, duration = 3500) {

    // Stop uncle if he is currently walking
    if (this.walkInterval) {

      clearInterval(this.walkInterval);

      this.walkInterval = null;
    }

    // Stop tea animation
    clearTimeout(this.sipTimeout);

    // Mark as reacting
    this.isReacting = true;

    // Change avatar
    this.setImage(image);

    // Show dialogue
    this.speak(text, duration);

    // Clear previous reaction timer
    clearTimeout(this.reactionTimeout);

    // Return to normal
    this.reactionTimeout = setTimeout(() => {

      this.isReacting = false;

      this.hideSpeech();

      this.setImage('idle');

    }, duration);
  }

  // ==========================================
  // WALKING
  // ==========================================

  walkTo(targetX, onComplete) {

    // Don't walk during reaction
    if (this.isReacting) return;

    // Stop previous walking
    if (this.walkInterval) {
      clearInterval(this.walkInterval);
      this.walkInterval = null;
    }

    const frames = [
      'walk1',
      'walk2',
      'walk3',
      'walk4'
    ];

    let frameIdx = 0;

    const direction =
      targetX > this.posX ? 1 : -1;

    const stepSize = 5;

    // Face direction
    if (direction === -1) {
      this.avatar.style.transform = 'scaleX(-1)';
    } else {
      this.avatar.style.transform = 'scaleX(1)';
    }

    this.walkInterval = setInterval(() => {

      // If reaction started, stop walking
      if (this.isReacting) {

        clearInterval(this.walkInterval);

        this.walkInterval = null;

        return;
      }

      this.posX += direction * stepSize;

      // Keep uncle inside screen
      const maxX =
        window.innerWidth - this.container.offsetWidth - 20;

      this.posX = Math.max(
        20,
        Math.min(this.posX, maxX)
      );

      this.container.style.left =
        `${this.posX}px`;

      // Walking animation
      this.setImage(frames[frameIdx]);

      frameIdx =
        (frameIdx + 1) % frames.length;

      // Destination reached
      if (
        (direction === 1 && this.posX >= targetX) ||
        (direction === -1 && this.posX <= targetX)
      ) {

        clearInterval(this.walkInterval);

        this.walkInterval = null;

        this.setImage('idle');

        this.avatar.style.transform =
          'scaleX(1)';

        if (onComplete) {
          onComplete();
        }
      }

    }, 120);
  }

  // ==========================================
  // RANDOM WALK
  // ==========================================

  moveRandomly() {

    if (this.isFacingModal) return;

    if (this.isReacting) return;

    if (this.walkInterval) return;

    const screenWidth = window.innerWidth;

    const uncleWidth =
      this.container.offsetWidth || 250;

    const margin = 40;

    const maxBoundary =
      screenWidth - uncleWidth - margin;

    const minBoundary = margin;

    if (maxBoundary <= minBoundary) {
      return;
    }

    const randomX =
      Math.floor(
        Math.random() *
        (maxBoundary - minBoundary)
      ) + minBoundary;

    this.walkTo(randomX);
  }

  // ==========================================
  // PHONE REACTION
  // ==========================================

  reactToPhoneUse() {

    const dialogue =
      this.phoneDialogues[
        Math.floor(
          Math.random() *
          this.phoneDialogues.length
        )
      ];

    this.react(
      'judge',
      dialogue,
      4000
    );
  }

  // ==========================================
  // SLOUCHING REACTION
  // ==========================================

  reactToSlouching() {

    this.react(
      'angry',
      'നിവർന്ന് ഇരിക്ക് മോനേ! 😒',
      3500
    );
  }

  // ==========================================
  // SLEEPING REACTION
  // ==========================================

  reactToSleeping() {

    this.react(
      'angry2',
      'എണീക്ക് മോനേ! ജോലി സമയത്ത് ഉറക്കമോ?!',
      4000
    );
  }

  // ==========================================
  // GOOD POSTURE
  // ==========================================

  reactToGoodPosture() {

    this.react(
      'approve',
      'ഹമ്മ്... കൊള്ളാം. ഇങ്ങനെ തന്നെ ഇരിക്ക്.',
      3000
    );
  }

  // ==========================================
  // RANDOM UNCLE STORY
  // ==========================================

  triggerRandomStory() {

    if (this.isReacting) return;

    if (this.walkInterval) return;

    const story =
      this.badaiStories[
        Math.floor(
          Math.random() *
          this.badaiStories.length
        )
      ];

    this.setImage('thinking');

    this.speak(
      story,
      4500
    );

    setTimeout(() => {

      if (!this.isReacting && !this.walkInterval) {
        this.setImage('idle');
      }

    }, 4500);
  }

  // ==========================================
  // LOGO / MODAL INTERACTION
  // ==========================================

  lookAtLogoModal() {

    // Stop current movement
    if (this.walkInterval) {

      clearInterval(this.walkInterval);

      this.walkInterval = null;
    }

    this.isFacingModal = true;

    const modalTargetX =
      Math.max(
        100,
        window.innerWidth - 350
      );

    this.walkTo(modalTargetX, () => {

      this.setImage('point');

      this.speak(
        "Aha! Trying to inspect my secrets?",
        4500
      );

    });
  }

  // ==========================================
  // RESET FROM MODAL
  // ==========================================

  resetFromModal() {

    this.isFacingModal = false;

    this.setImage('confused');

    this.speak(
      "Back to keeping an eye on you...",
      2500
    );

    setTimeout(() => {

      if (!this.isReacting && !this.isFacingModal) {
        this.setImage('idle');
      }

    }, 2500);
  }
}


// ==========================================
// CREATE BHASKAR
// ==========================================

const bhaskar = new BhaskarEngine();