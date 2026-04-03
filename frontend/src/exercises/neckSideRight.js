import { calculateAngle } from "../utils/calculateAngle";
import { handleTwoStageExercise } from "./helpers/exerciseHelpers";

// Вправа: нахил голови вправо
const neckSideRight = {
  id: "neck_side_right",
  name: "Нахил голови вправо",

  analyze: ({ pose, stageRef, setMainAngle, setExerciseStage, setReps }) => {
    const nose = pose[0];
    const rightShoulder = pose[12];
    const leftShoulder = pose[11];

    if (!nose || !rightShoulder || !leftShoulder) {
      setMainAngle(0);
      return "Недостатньо точок для аналізу нахилу голови вправо";
    }

    const angle = calculateAngle(nose, rightShoulder, leftShoulder);

    return handleTwoStageExercise({
      angle,
      stageRef,
      setMainAngle,
      setExerciseStage,
      setReps,
      upThreshold: 95,
      downThreshold: 75,
      upText: "Голова рівно, нахиляй вправо.",
      downText: "Голова нахилена, поверни назад.",
      middleText: "Продовжуй рух.",
      repCompleteText: "Повтор зараховано!",
    });
  },
};

export default neckSideRight;