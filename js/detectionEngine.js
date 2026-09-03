class DetectionEngine {
  constructor() {
    this.video = document.getElementById('webcam');
    this.statusTag = document.getElementById('status-tag');
    this.poseDetector = null;
    this.objectDetector = null;
    this.lastState = 'NORMAL';
    this.phoneDetectedCount = 0;
  }

  async init() {
    try {
      // Explicitly set WebGL backend
      if (window.tf) {
        await tf.setBackend('webgl');
        await tf.ready();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.video.srcObject = stream;

      // 1. Load Pose Detector (MoveNet)
      this.poseDetector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet
      );

      // 2. Load Object Detector (COCO-SSD)
      this.objectDetector = await cocoSsd.load();

      this.video.onloadeddata = () => {
        this.detectLoop();
      };
    } catch (err) {
      console.warn("Webcam access denied or TFJS init error:", err);
    }
  }

  async detectLoop() {
    if (bhaskar.isFacingModal) {
      setTimeout(() => this.detectLoop(), 2000);
      return;
    }

    let isPhoneDetected = false;
    let poses = [];

    // --- 1. POSE DETECTION (MoveNet) ---
    if (this.poseDetector) {
      poses = await this.poseDetector.estimatePoses(this.video);
    }

    // --- 2. OBJECT DETECTION (COCO-SSD) ---
    if (this.objectDetector) {
      const predictions = await this.objectDetector.detect(this.video);
      
      // Direct object check for phone/remote
      const phoneObj = predictions.find(
        pred => (pred.class === 'cell phone' || pred.class === 'remote') && pred.score > 0.30
      );

      if (phoneObj) {
        isPhoneDetected = true;
      }
    }

    // --- 3. HEURISTIC FALLBACK (Hand/Wrist Raised near Face) ---
    if (!isPhoneDetected && poses.length > 0) {
      const keypoints = poses[0].keypoints;
      const nose = keypoints.find(k => k.name === 'nose');
      const leftWrist = keypoints.find(k => k.name === 'left_wrist');
      const rightWrist = keypoints.find(k => k.name === 'right_wrist');

      // Trigger if either wrist is raised near head level (scrolling position)
      if (nose && nose.score > 0.4) {
        const isWristUp = (wrist) => wrist && wrist.score > 0.3 && Math.abs(wrist.y - nose.y) < 130;
        if (isWristUp(leftWrist) || isWristUp(rightWrist)) {
          isPhoneDetected = true;
        }
      }
    }

    // --- 4. STATE UPDATES & REACTIONS ---
    if (isPhoneDetected) {
      this.phoneDetectedCount++;

      if (this.statusTag) {
        this.statusTag.classList.remove('hidden');
      }

      if (this.phoneDetectedCount >= 1 && this.lastState !== 'PHONE') {
        this.lastState = 'PHONE';
        bhaskar.reactToPhoneUse();
      }
    } else {
      this.phoneDetectedCount = 0;
      if (this.statusTag) {
        this.statusTag.classList.add('hidden');
      }

      // Check for Slouching / Sleeping if not using phone
      if (poses.length > 0) {
        const keypoints = poses[0].keypoints;
        const nose = keypoints.find(k => k.name === 'nose');
        const leftShoulder = keypoints.find(k => k.name === 'left_shoulder');
        const rightShoulder = keypoints.find(k => k.name === 'right_shoulder');

        if (nose && leftShoulder && rightShoulder) {
          const shoulderAvgY = (leftShoulder.y + rightShoulder.y) / 2;
          const noseToShoulderDist = shoulderAvgY - nose.y;

          if (noseToShoulderDist < 40 && this.lastState !== 'SLEEPING') {
            this.lastState = 'SLEEPING';
            bhaskar.reactToSleeping();
          } 
          else if (noseToShoulderDist >= 40 && noseToShoulderDist < 75 && this.lastState !== 'SLOUCHING') {
            this.lastState = 'SLOUCHING';
            bhaskar.reactToSlouching();
          } 
          else if (noseToShoulderDist >= 90 && this.lastState !== 'NORMAL') {
            this.lastState = 'NORMAL';
            bhaskar.reactToGoodPosture();
          }
        }
      }
    }

    setTimeout(() => this.detectLoop(), 1500);
  }
}