class DetectionEngine {
  constructor() {
    this.video = document.getElementById('webcam');
    this.detector = null;
    this.faceDetector = null;
    this.lastState = 'NORMAL';
  }

  async init() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.video.srcObject = stream;

      // Load TensorFlow Pose Detection (MoveNet)
      this.detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet
      );

      this.video.onloadeddata = () => {
        this.detectLoop();
      };
    } catch (err) {
      console.warn("Webcam access denied or unavailable. Running in manual mode:", err);
    }
  }

  async detectLoop() {
    if (this.detector && !bhaskar.isFacingModal) {
      const poses = await this.detector.estimatePoses(this.video);

      if (poses.length > 0) {
        const keypoints = poses[0].keypoints;
        const nose = keypoints.find(k => k.name === 'nose');
        const leftEye = keypoints.find(k => k.name === 'left_eye');
        const rightEye = keypoints.find(k => k.name === 'right_eye');
        const leftShoulder = keypoints.find(k => k.name === 'left_shoulder');
        const rightShoulder = keypoints.find(k => k.name === 'right_shoulder');

        if (nose && leftShoulder && rightShoulder) {
          const shoulderAvgY = (leftShoulder.y + rightShoulder.y) / 2;
          const noseToShoulderDist = shoulderAvgY - nose.y;

          // 1. Sleeping Check (Nose drops significantly low or eyes closed/head tilted down)
          if (noseToShoulderDist < 40 && this.lastState !== 'SLEEPING') {
            this.lastState = 'SLEEPING';
            bhaskar.reactToSleeping();
          } 
          // 2. Slouching Check (Nose drops below normal posture threshold)
          else if (noseToShoulderDist >= 40 && noseToShoulderDist < 75 && this.lastState !== 'SLOUCHING') {
            this.lastState = 'SLOUCHING';
            bhaskar.reactToSlouching();
          } 
          // 3. Normal Posture Recovery
          else if (noseToShoulderDist >= 90 && (this.lastState === 'SLOUCHING' || this.lastState === 'SLEEPING')) {
            this.lastState = 'NORMAL';
            bhaskar.reactToGoodPosture();
          }
        }
      }
    }

    // Run posture check every 2.5 seconds to conserve CPU
    setTimeout(() => this.detectLoop(), 2500);
  }
}