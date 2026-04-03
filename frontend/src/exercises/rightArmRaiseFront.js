import { calculateAngle } from "../utils/calculateAngle";
import { handleTwoStageExercise } from "./helpers/exerciseHelpers";

// Вправа: підйом правої руки вперед
const rightArmRaiseFront = {
  id: "right_arm_raise_front",
  name: "Підйом правої руки вперед",

  analyze: ({ pose, stageRef, setMainAngle, setExerciseStage, setReps }) => {
    const wrist = pose[16];
    const shoulder = pose[12];
    const hip = pose[24];

    if (!wrist || !shoulder || !hip) {
      setMainAngle(0);
      return "Недостатньо точок для аналізу підйому правої руки вперед";
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

export default rightArmRaiseFront;