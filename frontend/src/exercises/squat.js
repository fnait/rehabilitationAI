import { calculateAngle } from "../utils/calculateAngle";
import { handleTwoStageExercise } from "./helpers/exerciseHelpers";

// Вправа: присідання
const squat = {
  id: "squat",
  name: "Присідання",

  analyze: ({ pose, stageRef, setMainAngle, setExerciseStage, setReps }) => {
    const hip = pose[24];
    const knee = pose[26];
    const ankle = pose[28];

    if (!hip || !knee || !ankle) {
      setMainAngle(0);
      return "Недостатньо точок для аналізу присідання";
    }

    // Рахуємо кут у коліні
    const angle = calculateAngle(hip, knee, ankle);

    return handleTwoStageExercise({
      angle,
      stageRef,
      setMainAngle,
      setExerciseStage,
      setReps,
      upThreshold: 160,
      downThreshold: 100,
      upStage: "up",
      downStage: "down",
      upText: "Стоїш рівно, тепер присідай.",
      downText: "Добре! Тепер піднімайся.",
      middleText: "Тримай рівний темп руху.",
      repCompleteText: "Повтор зараховано!",
    });
  },
};

export default squat;