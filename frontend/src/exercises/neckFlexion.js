import { calculateAngle } from "../utils/calculateAngle";
import { handleTwoStageExercise } from "./helpers/exerciseHelpers";

// Вправа: нахил голови вперед
const neckFlexion = {
  id: "neck_flexion",
  name: "Нахил голови вперед",

  analyze: ({ pose, stageRef, setMainAngle, setExerciseStage, setReps }) => {
    const nose = pose[0];
    const shoulder = pose[11];
    const hip = pose[23];

    if (!nose || !shoulder || !hip) {
      setMainAngle(0);
      return "Недостатньо точок для аналізу нахилу голови вперед";
    }

    const angle = calculateAngle(nose, shoulder, hip);

    return handleTwoStageExercise({
      angle,
      stageRef,
      setMainAngle,
      setExerciseStage,
      setReps,
      upThreshold: 165,
      downThreshold: 140,
      upText: "Голова рівно, нахиляй вперед.",
      downText: "Голова нахилена, поверни назад.",
      middleText: "Рухайся плавно.",
      repCompleteText: "Повтор зараховано!",
    });
  },
};

export default neckFlexion;