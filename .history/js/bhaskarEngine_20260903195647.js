class BhaskarEngine {
  constructor() {
    this.container = document.getElementById('bhaskar-container');
    this.avatar = document.getElementById('bhaskar-avatar');
    this.bubble = document.getElementById('speech-bubble');

    // 1. Full 21 Asset Registry
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

    // 2. Story Registry categorized by state
    this.badaiStories = [
      "In 1984, I studied under 3 different streetlights at the same time!",
      "I used to swim across the lake with my school bag on my head...",
      "Is that a smartphone? In my day we used self-discipline!",
      "Look at you... sitting like a sack of potatoes!",
      "Back in my day, we didn't need Wi-Fi, we had willpower!",
      "I bought my first house for ₹45 and a glass of tea."
    ];

    this.posX = 100;
    this.isFacingModal = false;
    this.walkInterval = null;
    this.sipTimeout = null;

    this.isReacting = false;
    this.reactionTimeout = null;

    // Start idle animations
    this.startIdleBlinkLoop();
  }

  // Set explicit frame
  setImage(key) {
    if (this.assets[key]) {
      this.avatar.src = this.assets[key];
    }
  }

  // Speech Bubble Manager
  speak(text, duration = 4500) {
    this.bubble.innerText = text;
    this.bubble.classList.remove('hidden');
    
    clearTimeout(this.speechTimeout);
    this.speechTimeout = setTimeout(() => {
      this.bubble.classList.add('hidden');
    }, duration);
  }

  // Idle Animation: Blinking & Tea Sipping
  startIdleBlinkLoop() {
    setInterval(() => {
      if (this.isFacingModal || this.walkInterval) return;

      const rand = Math.random();
      if (rand < 0.4) {
        // Quick blink
        this.setImage('idleBlink');
        setTimeout(() => this.setImage('idle'), 300);
      } else if (rand > 0.75) {
        // Full Tea Sipping Sequence
        this.sipTeaSequence();
      }
    }, 5000);
  }

  sipTeaSequence() {
    this.setImage('idleSip');
    setTimeout(() => {
      this.setImage('idleAfterSip');
      this.speak("Ah... strong tea, like my opinions.", 2500);
      setTimeout(() => {
        this.setImage('idleAfterSip2');
        setTimeout(() => this.setImage('idle'), 1500);
      }, 1500);
    }, 1200);
  }

  // Walking Cycle (Cycles through walk-1 to walk-4)
  walkTo(targetX, onComplete) {
    if (this.walkInterval) clearInterval(this.walkInterval);

    const frames = ['walk1', 'walk2', 'walk3', 'walk4'];
    let frameIdx = 0;
    const direction = targetX > this.posX ? 1 : -1;
    const stepSize = 8;

    // Flip avatar based on direction
    this.avatar.style.transform = direction === -1 ? 'scaleX(-1)' : 'scaleX(1)';

    this.walkInterval = setInterval(() => {
      this.posX += direction * stepSize;
      this.container.style.left = `${this.posX}px`;

      // Cycle animation frames
      this.setImage(frames[frameIdx]);
      frameIdx = (frameIdx + 1) % frames.length;

      // Check if reached destination
      if ((direction === 1 && this.posX >= targetX) || (direction === -1 && this.posX <= targetX)) {
        clearInterval(this.walkInterval);
        this.walkInterval = null;
        this.avatar.style.transform = 'scaleX(1)'; // Reset flip
        this.setImage('idle');
        if (onComplete) onComplete();
      }
    }, 120);
  }

  moveRandomly() {
    if (this.isFacingModal) return;
    const maxBoundary = window.innerWidth - 250;
    const randomX = Math.floor(Math.random() * (maxBoundary - 100)) + 100;
    
    this.walkTo(randomX, () => {
      if (Math.random() > 0.5) {
        this.setImage('thinking');
        this.triggerRandomStory();
      }
    });
  }

  // Reaction Triggers for Camera Detection & Modal Interactions
  lookAtLogoModal() {
    this.isFacingModal = true;
    const modalTargetX = window.innerWidth - 320;

    this.walkTo(modalTargetX, () => {
      this.setImage('point');
      this.speak("Aha! Trying to inspect my secrets? Read carefully!");
    });
  }

  resetFromModal() {
    this.isFacingModal = false;
    this.setImage('confused');
    this.speak("Back to keeping an eye on you...", 2000);
    setTimeout(() => this.setImage('idle'), 2000);
  }

  reactToSlouching() {
    this.setImage('angry');
    this.speak("Sit straight! Your spine is bending like a boiled noodle!");
  }

  reactToSleeping() {
    this.setImage('angry2');
    this.speak("WAKE UP! Sleeping during working hours?! Unbelievable!");
  }

  reactToPhoneUse() {
    this.setImage('judge');
    this.speak("Always on that screen! This is why your generation has no focus!");
  }

  reactToGoodPosture() {
    this.setImage('approve');
    this.speak("Hmm... decent posture. Keep it up.", 2500);
  }

  triggerRandomStory() {
    const story = this.badaiStories[Math.floor(Math.random() * this.badaiStories.length)];
    this.speak(story);
  }
}

const bhaskar = new BhaskarEngine();
react(image, text, duration = 3500) {

  // Stop walking
  if (this.walkInterval) {
    clearInterval(this.walkInterval);
    this.walkInterval = null;
  }

  this.isReacting = true;

  // Show reaction
  this.setImage(image);
  this.speak(text, duration);

  // Return to normal after reaction
  clearTimeout(this.reactionTimeout);

  this.reactionTimeout = setTimeout(() => {
    this.isReacting = false;
    this.setImage('idle');
  }, duration);
}