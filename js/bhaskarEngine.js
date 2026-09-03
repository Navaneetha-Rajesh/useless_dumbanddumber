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
    // AUDIO ASSETS & MAPPING
    // ==========================================

    this.currentAudio = null;

    // Direct mapping from text string to its corresponding audio file
    this.audioMap = {
      // Tea Sip
      "Ah... strong tea, like my opinions.": "assets/audio/strongtea.mp3",

      // Slouching, Sleeping, Good Posture
      "Ahhh!!! Kuninju koodi irikaathe nivarnnu iri angoodu": "assets/audio/slouching.mp3",
      "Hoo eppol nokkiyalum urakkam thanne urakkam!": "assets/audio/urakkam.mp3",
      "Ha! Angane venam irikkan!": "assets/audio/Anganevenam.mp3",

      // Camera Covered
      "Camera moodiyittu entha ppd?": "assets/audio/Camera-1.mp3",
"Kooii!! Evde poi??": "assets/audio/Camera-2.mp3",

      // Modal Interactions
      "Aha! Trying to inspect my secrets?": "assets/audio/modal-inspect.mp3",
      "Back to keeping an eye on you...": "assets/audio/modal-reset.mp3",

      // Phone Dialogues
      "24 manikoorum phone il kayari irunnal kannu adichu pokum makkale!": "assets/audio/kannu.mp3",
      "Enna aa phone nte akathottu kayari iri!": "assets/audio/Akathottu.mp3",
      "Aaroda ee phoni kathi vekkunne??": "assets/audio/Aaroda.mp3",
      "Itha ee pillerde kuzhappam, eppol nokkiyalum phoneila": "assets/audio/Eppazhumphone.mp3",
      "Ee phone thoondi thoondi maduthille??": "assets/audio/Maduthille.mp3",
      "Phone illathe oru anju minute irunnu nokku!": "assets/audio/5min.mp3",

      //Two People Reaction
      "Oo randalum undallo!": "assets/audio/2aalum.mp3",
"Randu perum koode companyadi aano?": "assets/audio/Company.mp3",

// Water Bottle Reaction
"Vellom kudikkan ithra valiya plastic kuppi venaminnilla, pandokke njangal kinatil ninnu koori kudicha jeeviche": "assets/audio/Kinar.mp3",
"Aa kuppi nirachu vechal mathram pora, kudikkayum venam.": "assets/audio/Kupinirachu.mp3"
    };

    // ==========================================
    // PHONE JUDGEMENTS
    // ==========================================

    this.phoneDialogues = [
      "24 manikoorum phone il kayari irunnal kannu adichu pokum makkale!",
      "Enna aa phone nte akathottu kayari iri!",
      "Aaroda ee phoni kathi vekkunne??",
      "Itha ee pillerde kuzhappam, eppol nokkiyalum phoneila",
      "Ee phone thoondi thoondi maduthille??",
      "Phone illathe oru anju minute irunnu nokku!"
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
  // SPEECH BUBBLE & AUDIO PLAYER
  // ==========================================

  speak(text, duration = 4500) {

    if (!this.bubble) return;

    this.bubble.innerText = text;

    this.bubble.classList.remove('hidden');

    // Play corresponding audio clip if mapped
    this.playAudioForText(text);

    clearTimeout(this.speechTimeout);

    this.speechTimeout = setTimeout(() => {
      this.bubble.classList.add('hidden');
    }, duration);
  }

  // ==========================================
  // PLAY AUDIO
  // ==========================================

  playAudioForText(text) {
    // Stop any audio currently playing
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
    }

    const audioSrc = this.audioMap[text];

    if (audioSrc) {
      this.currentAudio = new Audio(audioSrc);

      this.currentAudio.play().catch((err) => {
        // Handles browser autoplay restrictions gracefully
        console.warn('Audio playback blocked or failed:', err);
      });
    }
  }

  // ==========================================
  // HIDE SPEECH
  // ==========================================

  hideSpeech() {

    clearTimeout(this.speechTimeout);

    // Stop audio playback when speech ends
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
    }

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
      "Ahhh!!! Kuninju koodi irikaathe nivarnnu iri angoodu",
      3500
    );
  }

  // ==========================================
  // SLEEPING REACTION
  // ==========================================

  reactToSleeping() {

    this.react(
      'angry2',
      "Hoo eppol nokkiyalum urakkam thanne urakkam!",
      4000
    );
  }

  // ==========================================
  // GOOD POSTURE
  // ==========================================

  reactToGoodPosture() {

    this.react(
      'approve',
      "Ha! Angane venam irikkan!",
      3500
    );
  }
  // ==========================================
// CAMERA COVERED REACTION
// ==========================================

reactToCameraCovered() {

  const dialogue =[
    "Camera moodiyittu entha ppd?",
"Kooii!! Evde poi??"].Math.floor(
    Math.random() *
    2
  );

  this.react(
    'confused',
    dialogue,
    3500
  );
}
// ==========================================
// WATER BOTTLE REACTION
// ==========================================

reactToBottle() {

  const dialogues = [
    "Vellom kudikkan ithra valiya plastic kuppi venaminnilla, pandokke njangal kinatil ninnu koori kudicha jeeviche",
"Aa kuppi nirachu vechal mathram pora, kudikkayum venam."
  ];


  const dialogue =
    dialogues[
      Math.floor(
        Math.random() *
        dialogues.length
      )
    ];


  this.react(
    'approve',
    dialogue,
    3500
  );
}
// ==========================================
// TWO PEOPLE REACTION
// ==========================================

reactToTwoPeople() {

  const dialogues = ["Oo randalum undallo!",
"Randu perum koode companyadi aano?"
  ];


  const dialogue =
    dialogues[
      Math.floor(
        Math.random() *
        dialogues.length
      )
    ];


  this.react(
    "judge",
    dialogue,
    4000
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