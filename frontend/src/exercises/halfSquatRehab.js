import { calculateAngle } from "../utils/calculateAngle";
import { handleTwoStageExercise } from "./helpers/exerciseHelpers";

// Вправа: напівприсідання
const halfSquatRehab = {
  id: "half_squat_rehab",
  name: "Напівприсідання",

  analyze: ({ pose, stageRef, setMainAngle, setExerciseStage, setReps }) => {
    const hip = pose[24];
    const knee = pose[26];
    const ankle = pose[28];

    if (!hip || !knee || !ankle) {
      setMainAngle(0);
      return "Недостатньо точок для аналізу напівприсідання";
    }

    const angle = calculateAngle(hip, knee, ankle);

    return handleTwoStageExercise({
      angle,
      stageRef,
      setMainAngle,
      setExerciseStage,
      setReps,
      upThreshold: 165,
      downThreshold: 120,
      upText: "Тіло випрямлене, починай присідати.",
      downText: "Нижня точка, тепер піднімайся.",
      middleText: "Рухайся плавно.",
      repCompleteText: "Повтор зараховано!",
    });
  },
};

export default halfSquatRehab;