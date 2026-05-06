import { useEffect, useRef, useState } from "react";
import {
  FilesetResolver,
  PoseLandmarker,
  DrawingUtils,
} from "@mediapipe/tasks-vision";

const POSE_CONNECTIONS = [
  [11, 12],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
  [11, 23],
  [12, 24],
  [23, 24],
  [23, 25],
  [25, 27],
  [24, 26],
  [26, 28],
];

function usePoseDetection({ analyzePose, cameraErrorText }) {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [status, setStatus] = useState("Натисни кнопку, щоб увімкнути камеру");
  const [tip, setTip] = useState("Поки немає аналізу");
  const [feedback, setFeedback] = useState("Поки немає оцінки");
  const [warning, setWarning] = useState("");
  const [isModelReady, setIsModelReady] = useState(false);
  const [mainAngle, setMainAngle] = useState(0);
  const [reps, setReps] = useState(0);
  const [exerciseStage, setExerciseStage] = useState("start");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const poseLandmarkerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastVideoTimeRef = useRef(-1);
  const streamRef = useRef(null);
  const stageRef = useRef("start");

  // Зберігаємо актуальну версію callback, щоб RAF не використовував старе замикання
  const analyzePoseRef = useRef(analyzePose);

  useEffect(() => {
    analyzePoseRef.current = analyzePose;
  }, [analyzePose]);

  const stopAnimationLoop = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Очищаємо canvas, коли камера вимкнена або сторінка закривається
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const predictWebcam = (timestamp) => {
    if (
      !poseLandmarkerRef.current ||
      !videoRef.current ||
      !canvasRef.current ||
      videoRef.current.readyState < 2
    ) {
      animationFrameRef.current = requestAnimationFrame(predictWebcam);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (
      canvas.width !== video.videoWidth ||
      canvas.height !== video.videoHeight
    ) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    if (lastVideoTimeRef.current !== video.currentTime) {
      lastVideoTimeRef.current = video.currentTime;

      const results = poseLandmarkerRef.current.detectForVideo(
        video,
        timestamp,
      );

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (results.landmarks && results.landmarks.length > 0) {
        const drawingUtils = new DrawingUtils(ctx);

        for (const landmarks of results.landmarks) {
          drawingUtils.drawLandmarks(landmarks, { radius: 4 });
          drawingUtils.drawConnectors(landmarks, POSE_CONNECTIONS, {
            lineWidth: 3,
          });
        }

        const result = analyzePoseRef.current?.({
          landmarks: results.landmarks,
          stageRef,
          setMainAngle,
          setExerciseStage,
          setReps,
        });

        if (result) {
          setTip(result.message || "");
          setFeedback(result.feedback || "");
          setWarning(result.warning || "");
        }
      } else {
        setTip("Стань так, щоб тебе було видно повністю");
        setFeedback("Очікую правильне положення перед камерою");
        setWarning("");
        setMainAngle(0);
        stageRef.current = "start";
        setExerciseStage("start");
      }
    }

    animationFrameRef.current = requestAnimationFrame(predictWebcam);
  };

  const startDetection = () => {
    stopAnimationLoop();
    animationFrameRef.current = requestAnimationFrame(predictWebcam);
  };

  const startCamera = async () => {
    try {
      setCameraError("");
      setStatus("Запит доступу до камери...");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 960,
          height: 540,
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;

      if (!videoRef.current) return;

      videoRef.current.srcObject = stream;

      videoRef.current.onloadedmetadata = async () => {
        try {
          if (!videoRef.current) return;

          await videoRef.current.play();

          if (canvasRef.current) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
          }

          lastVideoTimeRef.current = -1;
          stageRef.current = "start";

          setIsCameraOn(true);
          setExerciseStage("start");
          setStatus("Камера працює");
          startDetection();
        } catch (error) {
          console.error("Помилка запуску відео:", error);
          setStatus("Не вдалося запустити відео");
          setCameraError(cameraErrorText || "Не вдалося запустити камеру");
        }
      };
    } catch (error) {
      console.error("Помилка доступу до камери:", error);
      setStatus("Немає доступу до камери");
      setCameraError(cameraErrorText || "Не вдалося запустити камеру");
    }
  };

  const stopCamera = () => {
    stopAnimationLoop();
    stopCameraStream();
    clearCanvas();
    lastVideoTimeRef.current = -1;
    setIsCameraOn(false);
    setStatus("Камеру вимкнено");
  };

  const resetPoseState = () => {
    stageRef.current = "start";
    setMainAngle(0);
    setReps(0);
    setExerciseStage("start");
    setTip("Обери вправу та почни рух");
    setFeedback("Поки немає оцінки");
    setWarning("");
  };

  useEffect(() => {
    const initPoseLandmarker = async () => {
      try {
        setStatus("Завантаження моделі...");

        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
        );

        const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/latest/pose_landmarker_full.task",
          },
          runningMode: "VIDEO",
          numPoses: 1,
        });

        poseLandmarkerRef.current = poseLandmarker;
        setIsModelReady(true);
        setStatus("Модель готова");
      } catch (error) {
        console.error("Помилка завантаження моделі:", error);
        setStatus("Не вдалося завантажити модель");
        setCameraError("Не вдалося завантажити модель AI");
      }
    };

    initPoseLandmarker();

    return () => {
      stopAnimationLoop();
      stopCameraStream();
    };
  }, []);

  return {
    videoRef,
    canvasRef,
    stageRef,
    isCameraOn,
    cameraError,
    status,
    tip,
    feedback,
    warning,
    isModelReady,
    mainAngle,
    reps,
    exerciseStage,
    setReps,
    setTip,
    setFeedback,
    setWarning,
    startCamera,
    stopCamera,
    resetPoseState,
  };
}

export default usePoseDetection;
