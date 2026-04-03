import { calculateAngle } from "../utils/calculateAngle";
import { handleTwoStageExercise } from "./helpers/exerciseHelpers";

// Вправа: відведення лівої ноги в сторону
const leftLegSideRaise = {
  id: "left_leg_side_raise",
  name: "Відведення лівої ноги в сторону",

  analyze: ({ pose, stageRef, setMainAngle, setExerciseStage, setReps }) => {
    const knee = pose[25];
    const hip = pose[23];
    const shoulder = pose[11];

    if (!knee || !hip || !shoulder) {
      setMainAngle(0);
      return "Недостатньо точок для аналізу відведення лівої ноги";
    }

    const angle = calculateAngle(knee, hip, shoulder);

    return handleTwoStageExercise({
      angle,
      stageRef,
      setMainAngle,
      setExerciseStage,
      setReps,
      upThreshold: 165,
      downThreshold: 135,
      upStage: "down",
      downStage: "up",
      upText: "Нога біля корпусу, відводь у сторону.",
      downText: "Нога відведена, тепер повертай назад.",
      middleText: "Продовжуй рух.",
      repCompleteText: "Повтор зараховано!",
    });
  },
};

export default leftLegSideRaise;