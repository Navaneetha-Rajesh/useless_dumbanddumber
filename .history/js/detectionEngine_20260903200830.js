class DetectionEngine {
  constructor() {
    this.video = document.getElementById("webcam");
    this.statusTag = document.getElementById("status-tag");

    this.poseDetector = null;
    this.objectDetector = null;

    this.lastState = "NORMAL";
    this.lastReactionTime = 0;

    this.isDetecting = false;
  }

  async init() {
  try {
    console.log("Starting webcam...");

    // ==========================================
    // TensorFlow
    // ==========================================

    if (window.tf) {
      await tf.setBackend("webgl");
      await tf.ready();

      console.log(
        "TensorFlow ready:",
        tf.getBackend()
      );
    }

    // ==========================================
    // WEBCAM
    // ==========================================

    const stream =
      await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: "user"
        },
        audio: false
      });

    this.video.srcObject = stream;

    console.log("Webcam started");

    // IMPORTANT
    await this.video.play();

    console.log("Video playing");

    // ==========================================
    // POSE DETECTOR
    // ==========================================

    console.log("Loading pose detector...");

    this.poseDetector =
      await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        {
          modelType:
            poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
        }
      );

    console.log("Pose detector ready");

    // ==========================================
    // OBJECT DETECTOR
    // ==========================================

    console.log("Loading object detector...");

    this.objectDetector =
      await cocoSsd.load();

    console.log("Object detector ready");

    // ==========================================
    // START DETECTION
    // ==========================================

    this.isDetecting = true;

    console.log("Starting detection loop...");

    this.detectLoop();

  } catch (error) {

    console.error(
      "Webcam / AI initialization failed:",
      error
    );

    if (error.name === "NotAllowedError") {

      alert(
        "Please allow camera access for Badai Bhaskar 😈"
      );

    } else {

      alert(
        "Could not start the webcam. Check the console."
      );

    }
  }
}

  // ==========================================
  // DETECTION LOOP
  // ==========================================

  async detectLoop() {

    if (!this.isDetecting) {
      return;
    }

    try {

      if (
        this.video.readyState <
        HTMLMediaElement.HAVE_ENOUGH_DATA
      ) {

        setTimeout(
          () => this.detectLoop(),
          500
        );

        return;
      }

      // ======================================
      // POSE DETECTION
      // ======================================

      let poses = [];

      if (this.poseDetector) {

        poses =
          await this.poseDetector.estimatePoses(
            this.video
          );
      }

      // ======================================
      // PHONE DETECTION
      // ======================================

      let isPhoneDetected = false;

      if (this.objectDetector) {

        const predictions =
          await this.objectDetector.detect(
            this.video
          );

        const phone =
          predictions.find(
            prediction =>
              prediction.class === "cell phone" &&
              prediction.score > 0.35
          );

        if (phone) {
          isPhoneDetected = true;
        }
      }

      // ======================================
      // DETERMINE USER STATE
      // ======================================

      let state = "NORMAL";

      // --------------------------------------
      // PHONE
      // --------------------------------------

      if (isPhoneDetected) {

        state = "PHONE";

      }

      // --------------------------------------
      // POSTURE
      // --------------------------------------

      else if (poses.length > 0) {

        const keypoints =
          poses[0].keypoints;

        const nose =
          keypoints.find(
            point => point.name === "nose"
          );

        const leftShoulder =
          keypoints.find(
            point =>
              point.name === "left_shoulder"
          );

        const rightShoulder =
          keypoints.find(
            point =>
              point.name === "right_shoulder"
          );

        if (
          nose &&
          leftShoulder &&
          rightShoulder
        ) {

          const shoulderY =
            (
              leftShoulder.y +
              rightShoulder.y
            ) / 2;

          const distance =
            shoulderY - nose.y;

          // Head very close to shoulders
          if (distance < 40) {

            state = "SLEEPING";

          }

          // Slightly bent
          else if (distance < 75) {

            state = "SLOUCHING";

          }

          // Good posture
          else if (distance >= 90) {

            state = "NORMAL";

          }
        }
      }

      // ======================================
      // UPDATE UI
      // ======================================

      this.updateStatus(state);

      // ======================================
      // REACT ONLY WHEN STATE CHANGES
      // ======================================

      if (state !== this.lastState) {

        console.log(
          "Bhaskar detected:",
          state
        );

        this.handleReaction(state);

        this.lastState = state;
      }

    } catch (error) {

      console.error(
        "Detection error:",
        error
      );
    }

    // Run again after 1 second
    setTimeout(
      () => this.detectLoop(),
      1000
    );
  }

  // ==========================================
  // HANDLE REACTION
  // ==========================================

  handleReaction(state) {

    // Don't spam Bhaskar
    const now = Date.now();

    if (now - this.lastReactionTime < 3000) {
      return;
    }

    this.lastReactionTime = now;

    switch (state) {

      case "PHONE":

        bhaskar.reactToPhoneUse();

        break;

      case "SLOUCHING":

        bhaskar.reactToSlouching();

        break;

      case "SLEEPING":

        bhaskar.reactToSleeping();

        break;

      case "NORMAL":

        bhaskar.reactToGoodPosture();

        break;

    }
  }

  // ==========================================
  // STATUS BADGE
  // ==========================================

  updateStatus(state) {

    if (!this.statusTag) {
      return;
    }

    if (state === "PHONE") {

      this.statusTag.innerText =
        "📱 Phone Detected";

      this.statusTag.classList.remove(
        "hidden"
      );

    }

    else if (state === "SLOUCHING") {

      this.statusTag.innerText =
        "🪑 Bad Posture Detected";

      this.statusTag.classList.remove(
        "hidden"
      );

    }

    else if (state === "SLEEPING") {

      this.statusTag.innerText =
        "😴 Sleeping Detected";

      this.statusTag.classList.remove(
        "hidden"
      );

    }

    else {

      this.statusTag.classList.add(
        "hidden"
      );
    }
  }
}