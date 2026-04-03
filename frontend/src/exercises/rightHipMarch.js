import { calculateAngle } from "../utils/calculateAngle";
import { handleTwoStageExercise } from "./helpers/exerciseHelpers";

// Вправа: підйом правого коліна перед собою
const rightHipMarch = {
  id: "right_hip_march",
  name: "Підйом правого коліна перед собою",

  analyze: ({ pose, stageRef, setMainAngle, setExerciseStage, setReps }) => {
    const hip = pose[24];
    const knee = pose[26];
    const ankle = pose[28];

    if (!hip || !knee || !ankle) {
      setMainAngle(0);
      return "Недостатньо точок для аналізу підйому правого коліна";
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

export default rightHipMarch;