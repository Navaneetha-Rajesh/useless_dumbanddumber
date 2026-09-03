class DetectionEngine {

  constructor() {

    this.video =
      document.getElementById("webcam");

    this.statusTag =
      document.getElementById("status-tag");

    this.poseDetector = null;
    this.objectDetector = null;

    this.lastState = "NORMAL";
    this.lastReactionTime = 0;

    this.isDetecting = false;
  }


  // ==========================================
  // INITIALIZE AI
  // ==========================================

  async init() {

    try {

      console.log("Starting webcam...");


      // ========================================
      // TENSORFLOW
      // ========================================

      if (window.tf) {

        await tf.setBackend("webgl");
        await tf.ready();

        console.log(
          "TensorFlow ready:",
          tf.getBackend()
        );
      }


      // ========================================
      // WEBCAM
      // ========================================

      const stream =
        await navigator.mediaDevices
          .getUserMedia({

            video: {
              width: 640,
              height: 480,
              facingMode: "user"
            },

            audio: false
          });


      this.video.srcObject = stream;

      console.log("Webcam started");

      await this.video.play();

      console.log("Video playing");


      // ========================================
      // MOVE NET
      // ========================================

      console.log(
        "Loading pose detector..."
      );

      this.poseDetector =
        await poseDetection.createDetector(

          poseDetection.SupportedModels.MoveNet,

          {
            modelType:
              poseDetection.movenet.modelType
                .SINGLEPOSE_LIGHTNING
          }

        );

      console.log(
        "Pose detector ready"
      );


      // ========================================
      // COCO SSD
      // ========================================

      console.log(
        "Loading object detector..."
      );

      this.objectDetector =
        await cocoSsd.load();

      console.log(
        "Object detector ready"
      );


      // ========================================
      // START DETECTION
      // ========================================

      this.isDetecting = true;

      console.log(
        "Starting detection loop..."
      );

      this.detectLoop();

    }


    catch (error) {

      console.error(
        "Webcam / AI initialization failed:",
        error
      );


      if (
        error.name === "NotAllowedError"
      ) {

        alert(
          "Please allow camera access for Badai Bhaskar 😈"
        );

      }

      else {

        alert(
          "Could not start the webcam. Check the console."
        );

      }
    }
  }


  // ==========================================
  // CAMERA COVER DETECTION
  // ==========================================

  checkCameraCovered() {

    const canvas =
      document.createElement("canvas");

    const ctx =
      canvas.getContext("2d");


    canvas.width = 80;
    canvas.height = 60;


    ctx.drawImage(
      this.video,
      0,
      0,
      canvas.width,
      canvas.height
    );


    const frame =
      ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );


    let totalBrightness = 0;


    for (
      let i = 0;
      i < frame.data.length;
      i += 4
    ) {

      const r =
        frame.data[i];

      const g =
        frame.data[i + 1];

      const b =
        frame.data[i + 2];


      totalBrightness +=
        (r + g + b) / 3;
    }


    const pixelCount =
      frame.data.length / 4;


    const averageBrightness =
      totalBrightness / pixelCount;


    // Very dark frame
    return averageBrightness < 25;
  }


  // ==========================================
  // DETECTION LOOP
  // ==========================================

  async detectLoop() {

    if (!this.isDetecting) {
      return;
    }


    try {

      // ========================================
      // CHECK VIDEO
      // ========================================

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


      // ========================================
      // CAMERA COVERED
      // ========================================

      const isCameraCovered =
        this.checkCameraCovered();


      // ========================================
      // POSE DETECTION
      // ========================================

      let poses = [];


      if (this.poseDetector) {

        poses =
          await this.poseDetector
            .estimatePoses(
              this.video
            );
      }


      // ========================================
      // OBJECT DETECTION
      // ========================================

      let isPhoneDetected = false;

      let isBottleDetected = false;

      let areTwoPeopleDetected = false;


      if (this.objectDetector) {

        const predictions =
          await this.objectDetector.detect(
            this.video
          );


        // ======================================
        // PHONE DETECTION
        // ======================================

        const phone =
          predictions.find(
            prediction =>
              prediction.class ===
                "cell phone" &&
              prediction.score > 0.35
          );


        if (phone) {

          isPhoneDetected = true;
        }


        // ======================================
        // BOTTLE DETECTION
        // ======================================

        const bottle =
          predictions.find(
            prediction =>
              prediction.class ===
                "bottle" &&
              prediction.score > 0.40
          );


        if (bottle) {

          isBottleDetected = true;
        }


        // ======================================
        // TWO PEOPLE DETECTION
        // ======================================

        const people =
          predictions.filter(
            prediction =>
              prediction.class ===
                "person" &&
              prediction.score > 0.50
          );


        areTwoPeopleDetected =
          people.length >= 2;
      }


      // ========================================
      // DETERMINE STATE
      // ========================================

      let state = "NORMAL";


      // ========================================
      // CAMERA COVERED
      // ========================================

      if (isCameraCovered) {

        state = "CAMERA_COVERED";
      }


      // ========================================
      // TWO PEOPLE
      // ========================================

      else if (areTwoPeopleDetected) {

        state = "TWO_PEOPLE";
      }


      // ========================================
      // BOTTLE
      // ========================================

      else if (isBottleDetected) {

        state = "BOTTLE";
      }


      // ========================================
      // PHONE
      // ========================================

      else if (isPhoneDetected) {

        state = "PHONE";
      }


      // ========================================
      // POSTURE
      // ========================================

      else if (poses.length > 0) {

        const keypoints =
          poses[0].keypoints;


        const nose =
          keypoints.find(
            point =>
              point.name === "nose"
          );


        const leftShoulder =
          keypoints.find(
            point =>
              point.name ===
                "left_shoulder"
          );


        const rightShoulder =
          keypoints.find(
            point =>
              point.name ===
                "right_shoulder"
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


          // Sleeping
          if (distance < 40) {

            state = "SLEEPING";
          }


          // Slouching
          else if (distance < 75) {

            state = "SLOUCHING";
          }


          // Good posture
          else if (distance >= 90) {

            state = "NORMAL";
          }
        }
      }


      // ========================================
      // UPDATE STATUS
      // ========================================

      this.updateStatus(state);


      // ========================================
      // REACT ONLY WHEN STATE CHANGES
      // ========================================

      if (
        state !== this.lastState
      ) {

        console.log(
          "Bhaskar detected:",
          state
        );


        this.handleReaction(state);


        this.lastState =
          state;
      }

    }


    catch (error) {

      console.error(
        "Detection error:",
        error
      );
    }


    // ========================================
    // RUN AGAIN
    // ========================================

    setTimeout(
      () => this.detectLoop(),
      1000
    );
  }


  // ==========================================
  // HANDLE REACTION
  // ==========================================

  handleReaction(state) {

    const now =
      Date.now();


    // Prevent reactions too frequently
    if (
      now - this.lastReactionTime < 3000
    ) {

      return;
    }


    this.lastReactionTime =
      now;


    switch (state) {


      // CAMERA COVERED
      case "CAMERA_COVERED":

        bhaskar.reactToCameraCovered();

        break;


      // TWO PEOPLE
      case "TWO_PEOPLE":

        bhaskar.reactToTwoPeople();

        break;


      // BOTTLE
      case "BOTTLE":

        bhaskar.reactToBottle();

        break;


      // PHONE
      case "PHONE":

        bhaskar.reactToPhoneUse();

        break;


      // SLOUCHING
      case "SLOUCHING":

        bhaskar.reactToSlouching();

        break;


      // SLEEPING
      case "SLEEPING":

        bhaskar.reactToSleeping();

        break;


      // NORMAL
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


    // ========================================
    // CAMERA COVERED
    // ========================================

    if (
      state === "CAMERA_COVERED"
    ) {

      this.statusTag.innerText =
        "📷 Camera Covered";

      this.statusTag.classList
        .remove("hidden");
    }


    // ========================================
    // TWO PEOPLE
    // ========================================

    else if (
      state === "TWO_PEOPLE"
    ) {

      this.statusTag.innerText =
        "👀 Two People Detected";

      this.statusTag.classList
        .remove("hidden");
    }


    // ========================================
    // BOTTLE
    // ========================================

    else if (
      state === "BOTTLE"
    ) {

      this.statusTag.innerText =
        "💧 Water Bottle Detected";

      this.statusTag.classList
        .remove("hidden");
    }


    // ========================================
    // PHONE
    // ========================================

    else if (
      state === "PHONE"
    ) {

      this.statusTag.innerText =
        "📱 Phone Detected";

      this.statusTag.classList
        .remove("hidden");
    }


    // ========================================
    // SLOUCHING
    // ========================================

    else if (
      state === "SLOUCHING"
    ) {

      this.statusTag.innerText =
        "🪑 Bad Posture Detected";

      this.statusTag.classList
        .remove("hidden");
    }


    // ========================================
    // SLEEPING
    // ========================================

    else if (
      state === "SLEEPING"
    ) {

      this.statusTag.innerText =
        "😴 Sleeping Detected";

      this.statusTag.classList
        .remove("hidden");
    }


    // ========================================
    // NORMAL
    // ========================================

    else {

      this.statusTag.classList
        .add("hidden");
    }
  }
}