import {
  FilesetResolver,
  PoseLandmarker,
} from "@mediapipe/tasks-vision";

// Змінна для кешування одного екземпляра,
// щоб не створювати landmarker багато разів
let poseLandmarkerInstance = null;

export const createPoseLandmarker = async () => {
  // Якщо вже створений — повертаємо готовий
  if (poseLandmarkerInstance) {
    return poseLandmarkerInstance;
  }

  // Підключаємо wasm-файли MediaPipe
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  // Створюємо landmarker для роботи з відео
  poseLandmarkerInstance = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task",
    },
    runningMode: "VIDEO",
    numPoses: 1,
    minPoseDetectionConfidence: 0.5,
    minPosePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  return poseLandmarkerInstance;
};