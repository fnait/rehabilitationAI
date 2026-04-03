import { calculateAngle } from "../utils/calculateAngle";
import { handleTwoStageExercise } from "./helpers/exerciseHelpers";

// Вправа: підйом правого коліна
const rightKneeRaise = {
  id: "right_knee_raise",
  name: "Підйом правого коліна",

  analyze: ({ pose, stageRef, setMainAngle, setExerciseStage, setReps }) => {
    // Праві точки (MediaPipe)
    const hip = pose[24];
    const knee = pose[26];
    const ankle = pose[28];

    if (!hip || !knee || !ankle) {
      setMainAngle(0);
      return "Недостатньо точок для аналізу правого коліна";
    }

    // Кут у коліні
    const angle = calculateAngle(hip, knee, ankle);

    // Логіка:
    // нога внизу → кут великий (~170)
    // коліно підняте → кут менший (~90-100)
    return handleTwoStageExercise({
      angle,
      stageRef,
      setMainAngle,
      setExerciseStage,
      setReps,

      upThreshold: 160,
      downThreshold: 100,

      // інверсія станів (важливо!)
      upStage: "down",
      downStage: "up",

      upText: "Нога внизу, піднімай коліно.",
      downText: "Коліно підняте, тепер опускай.",
      middleText: "Продовжуй рух.",
      repCompleteText: "Повтор зараховано!",
    });
  },
};

export default rightKneeRaise;