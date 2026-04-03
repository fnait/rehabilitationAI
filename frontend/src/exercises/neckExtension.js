import { calculateAngle } from "../utils/calculateAngle";
import { handleTwoStageExercise } from "./helpers/exerciseHelpers";

// Вправа: нахил голови назад
const neckExtension = {
  id: "neck_extension",
  name: "Нахил голови назад",

  analyze: ({ pose, stageRef, setMainAngle, setExerciseStage, setReps }) => {
    const nose = pose[0];
    const shoulder = pose[11];
    const hip = pose[23];

    if (!nose || !shoulder || !hip) {
      setMainAngle(0);
      return "Недостатньо точок для аналізу нахилу голови назад";
    }

    const angle = calculateAngle(nose, shoulder, hip);

    return handleTwoStageExercise({
      angle,
      stageRef,
      setMainAngle,
      setExerciseStage,
      setReps,
      upThreshold: 150,
      downThreshold: 120,
      upStage: "down",
      downStage: "up",
      upText: "Голова прямо, відхиляй назад.",
      downText: "Голова назад, поверни вперед.",
      middleText: "Продовжуй рух.",
      repCompleteText: "Повтор зараховано!",
    });
  },
};

export default neckExtension;