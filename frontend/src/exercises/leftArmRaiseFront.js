import { calculateAngle } from "../utils/calculateAngle";
import { handleTwoStageExercise } from "./helpers/exerciseHelpers";

// Вправа: підйом лівої руки вперед
const leftArmRaiseFront = {
  id: "left_arm_raise_front",
  name: "Підйом лівої руки вперед",

  analyze: ({ pose, stageRef, setMainAngle, setExerciseStage, setReps }) => {
    const wrist = pose[15];
    const shoulder = pose[11];
    const hip = pose[23];

    if (!wrist || !shoulder || !hip) {
      setMainAngle(0);
      return "Недостатньо точок для аналізу підйому лівої руки вперед";
    }

    const angle = calculateAngle(wrist, shoulder, hip);

    return handleTwoStageExercise({
      angle,
      stageRef,
      setMainAngle,
      setExerciseStage,
      setReps,
      upThreshold: 75,
      downThreshold: 25,
      upText: "Рука піднята вперед, тепер опускай.",
      downText: "Рука внизу, піднімай вперед.",
      middleText: "Продовжуй рух плавно.",
      repCompleteText: "Повтор зараховано!",
    });
  },
};

export default leftArmRaiseFront;