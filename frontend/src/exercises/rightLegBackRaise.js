import { calculateAngle } from "../utils/calculateAngle";
import { handleTwoStageExercise } from "./helpers/exerciseHelpers";

// Вправа: відведення правої ноги назад
const rightLegBackRaise = {
  id: "right_leg_back_raise",
  name: "Відведення правої ноги назад",

  analyze: ({ pose, stageRef, setMainAngle, setExerciseStage, setReps }) => {
    const shoulder = pose[12];
    const hip = pose[24];
    const knee = pose[26];

    if (!shoulder || !hip || !knee) {
      setMainAngle(0);
      return "Недостатньо точок для аналізу відведення правої ноги назад";
    }

    const angle = calculateAngle(shoulder, hip, knee);

    return handleTwoStageExercise({
      angle,
      stageRef,
      setMainAngle,
      setExerciseStage,
      setReps,
      upThreshold: 175,
      downThreshold: 150,
      upStage: "down",
      downStage: "up",
      upText: "Нога внизу, відводь назад.",
      downText: "Нога відведена назад, повертай назад повільно.",
      middleText: "Продовжуй рух плавно.",
      repCompleteText: "Повтор зараховано!",
    });
  },
};

export default rightLegBackRaise;