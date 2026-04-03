import { calculateAngle } from "../utils/calculateAngle";
import { handleTwoStageExercise } from "./helpers/exerciseHelpers";

// Вправа: розгинання лівого коліна
const leftKneeExtension = {
  id: "left_knee_extension",
  name: "Розгинання лівого коліна",

  analyze: ({ pose, stageRef, setMainAngle, setExerciseStage, setReps }) => {
    const hip = pose[23];
    const knee = pose[25];
    const ankle = pose[27];

    if (!hip || !knee || !ankle) {
      setMainAngle(0);
      return "Недостатньо точок для аналізу розгинання лівого коліна";
    }

    const angle = calculateAngle(hip, knee, ankle);

    return handleTwoStageExercise({
      angle,
      stageRef,
      setMainAngle,
      setExerciseStage,
      setReps,
      upThreshold: 160,
      downThreshold: 105,
      upText: "Нога розігнута, тепер згинай.",
      downText: "Коліно зігнуте, тепер розгинай.",
      middleText: "Продовжуй рух плавно.",
      repCompleteText: "Повтор зараховано!",
    });
  },
};

export default leftKneeExtension;