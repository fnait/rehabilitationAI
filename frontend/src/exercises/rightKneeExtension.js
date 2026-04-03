import { calculateAngle } from "../utils/calculateAngle";
import { handleTwoStageExercise } from "./helpers/exerciseHelpers";

// Вправа: розгинання правого коліна
const rightKneeExtension = {
  id: "right_knee_extension",
  name: "Розгинання правого коліна",

  analyze: ({ pose, stageRef, setMainAngle, setExerciseStage, setReps }) => {
    const hip = pose[24];
    const knee = pose[26];
    const ankle = pose[28];

    if (!hip || !knee || !ankle) {
      setMainAngle(0);
      return "Недостатньо точок для аналізу розгинання правого коліна";
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

export default rightKneeExtension;