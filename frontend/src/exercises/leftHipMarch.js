import { calculateAngle } from "../utils/calculateAngle";
import { handleTwoStageExercise } from "./helpers/exerciseHelpers";

// Вправа: підйом лівого коліна перед собою
const leftHipMarch = {
  id: "left_hip_march",
  name: "Підйом лівого коліна перед собою",

  analyze: ({ pose, stageRef, setMainAngle, setExerciseStage, setReps }) => {
    const hip = pose[23];
    const knee = pose[25];
    const ankle = pose[27];

    if (!hip || !knee || !ankle) {
      setMainAngle(0);
      return "Недостатньо точок для аналізу підйому лівого коліна";
    }

    const angle = calculateAngle(hip, knee, ankle);

    return handleTwoStageExercise({
      angle,
      stageRef,
      setMainAngle,
      setExerciseStage,
      setReps,
      upThreshold: 160,
      downThreshold: 100,
      upStage: "down",
      downStage: "up",
      upText: "Нога внизу, піднімай коліно.",
      downText: "Коліно підняте, тепер опускай.",
      middleText: "Продовжуй рух.",
      repCompleteText: "Повтор зараховано!",
    });
  },
};

export default leftHipMarch;