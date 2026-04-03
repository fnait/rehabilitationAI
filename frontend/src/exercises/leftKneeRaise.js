import { calculateAngle } from "../utils/calculateAngle";
import { handleTwoStageExercise } from "./helpers/exerciseHelpers";

// Вправа: підйом лівого коліна
const leftKneeRaise = {
  id: "left_knee_raise",
  name: "Підйом лівого коліна",

  analyze: ({ pose, stageRef, setMainAngle, setExerciseStage, setReps }) => {
    const hip = pose[23];
    const knee = pose[25];
    const ankle = pose[27];

    if (!hip || !knee || !ankle) {
      setMainAngle(0);
      return "Недостатньо точок для аналізу підйому лівого коліна";
    }

    // Рахуємо кут у коліні
    const angle = calculateAngle(hip, knee, ankle);

    // Тут логіка перевернута:
    // коли нога внизу - кут великий
    // коли коліно підняте - кут менший
    return handleTwoStageExercise({
      angle,
      stageRef,
      setMainAngle,
      setExerciseStage,
      setReps,
      upThreshold: 160,
      downThreshold: 100,
      upStage: "down",
      downStage: "up",
      upText: "Нога внизу, піднімай коліно.",
      downText: "Коліно підняте, тепер опускай.",
      middleText: "Продовжуй рух.",
      repCompleteText: "Повтор зараховано!",
    });
  },
};

export default leftKneeRaise;