import { calculateAngle } from "../utils/calculateAngle";
import { handleTwoStageExercise } from "./helpers/exerciseHelpers";

// Вправа: відведення правої ноги в сторону
const rightLegSideRaise = {
  id: "right_leg_side_raise",
  name: "Відведення правої ноги в сторону",

  analyze: ({ pose, stageRef, setMainAngle, setExerciseStage, setReps }) => {
    const knee = pose[26];
    const hip = pose[24];
    const shoulder = pose[12];

    if (!knee || !hip || !shoulder) {
      setMainAngle(0);
      return "Недостатньо точок для аналізу відведення правої ноги";
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

export default rightLegSideRaise;