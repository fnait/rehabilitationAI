import { calculateAngle } from "../utils/calculateAngle";
import { handleTwoStageExercise } from "./helpers/exerciseHelpers";

// Вправа: нахил голови вліво
const neckSideLeft = {
  id: "neck_side_left",
  name: "Нахил голови вліво",

  analyze: ({ pose, stageRef, setMainAngle, setExerciseStage, setReps }) => {
    const nose = pose[0];
    const leftShoulder = pose[11];
    const rightShoulder = pose[12];

    if (!nose || !leftShoulder || !rightShoulder) {
      setMainAngle(0);
      return "Недостатньо точок для аналізу нахилу голови вліво";
    }

    const angle = calculateAngle(nose, leftShoulder, rightShoulder);

    return handleTwoStageExercise({
      angle,
      stageRef,
      setMainAngle,
      setExerciseStage,
      setReps,
      upThreshold: 95,
      downThreshold: 75,
      upText: "Голова рівно, нахиляй вліво.",
      downText: "Голова нахилена, поверни назад.",
      middleText: "Продовжуй рух.",
      repCompleteText: "Повтор зараховано!",
    });
  },
};

export default neckSideLeft;