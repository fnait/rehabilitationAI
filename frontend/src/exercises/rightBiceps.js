import { calculateAngle } from "../utils/calculateAngle";
import { handleTwoStageExercise } from "./helpers/exerciseHelpers";

// Вправа: згинання правої руки
const rightBiceps = {
  id: "right_biceps",
  name: "Згинання правої руки",

  analyze: ({ pose, stageRef, setMainAngle, setExerciseStage, setReps }) => {
    const shoulder = pose[12];
    const elbow = pose[14];
    const wrist = pose[16];

    if (!shoulder || !elbow || !wrist) {
      setMainAngle(0);
      return "Недостатньо точок для аналізу правої руки";
    }

    // Рахуємо кут у лікті
    const angle = calculateAngle(shoulder, elbow, wrist);

    return handleTwoStageExercise({
      angle,
      stageRef,
      setMainAngle,
      setExerciseStage,
      setReps,
      upThreshold: 145,
      downThreshold: 60,
      upStage: "up",
      downStage: "down",
      upText: "Рука розігнута, тепер згинай.",
      downText: "Добре! Тепер розгинай руку.",
      middleText: "Продовжуй рух.",
      repCompleteText: "Повтор зараховано!",
    });
  },
};

export default rightBiceps;