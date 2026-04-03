import { calculateAngle } from "../utils/calculateAngle";
import { handleTwoStageExercise } from "./helpers/exerciseHelpers";

// Вправа: підйом обох рук вгору
const bothArmsUp = {
  id: "both_arms_up",
  name: "Підйом обох рук вгору",

  analyze: ({ pose, stageRef, setMainAngle, setExerciseStage, setReps }) => {
    const leftElbow = pose[13];
    const leftShoulder = pose[11];
    const leftHip = pose[23];

    const rightElbow = pose[14];
    const rightShoulder = pose[12];
    const rightHip = pose[24];

    if (
      !leftElbow ||
      !leftShoulder ||
      !leftHip ||
      !rightElbow ||
      !rightShoulder ||
      !rightHip
    ) {
      setMainAngle(0);
      return "Недостатньо точок для аналізу підйому обох рук";
    }

    // Окремо рахуємо кути для лівої та правої руки
    const leftAngle = calculateAngle(leftElbow, leftShoulder, leftHip);
    const rightAngle = calculateAngle(rightElbow, rightShoulder, rightHip);

    // Беремо середнє значення для простішої логіки
    const averageAngle = Math.round((leftAngle + rightAngle) / 2);

    return handleTwoStageExercise({
      angle: averageAngle,
      stageRef,
      setMainAngle,
      setExerciseStage,
      setReps,
      upThreshold: 120,
      downThreshold: 40,
      upStage: "up",
      downStage: "down",
      upText: "Руки вгорі, тепер опускай.",
      downText: "Руки внизу, піднімай вгору.",
      middleText: "Піднімай та опускай руки плавно.",
      repCompleteText: "Повтор зараховано!",
    });
  },
};

export default bothArmsUp;