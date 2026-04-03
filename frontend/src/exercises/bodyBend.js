import { calculateAngle } from "../utils/calculateAngle";
import { handleTwoStageExercise } from "./helpers/exerciseHelpers";

// Вправа: нахил корпусу
const bodyBend = {
  id: "body_bend",
  name: "Нахил корпусу",

  analyze: ({ pose, stageRef, setMainAngle, setExerciseStage, setReps }) => {
    const shoulder = pose[12];
    const hip = pose[24];
    const knee = pose[26];

    if (!shoulder || !hip || !knee) {
      setMainAngle(0);
      return "Недостатньо точок для аналізу нахилу корпусу";
    }

    // Рахуємо кут у тазі:
    // плече - таз - коліно
    const angle = calculateAngle(shoulder, hip, knee);

    return handleTwoStageExercise({
      angle,
      stageRef,
      setMainAngle,
      setExerciseStage,
      setReps,
      upThreshold: 160,
      downThreshold: 110,
      upStage: "up",
      downStage: "down",
      upText: "Стоїш рівно, тепер нахиляйся вперед.",
      downText: "Нахил виконано, повертайся назад.",
      middleText: "Контролюй спину та рухайся плавно.",
      repCompleteText: "Повтор зараховано!",
    });
  },
};

export default bodyBend;