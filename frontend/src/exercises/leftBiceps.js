import { calculateAngle } from "../utils/calculateAngle";
import { handleTwoStageExercise } from "./helpers/exerciseHelpers";

// Вправа: згинання лівої руки
const leftBiceps = {
  id: "left_biceps",
  name: "Згинання лівої руки",

  analyze: ({ pose, stageRef, setMainAngle, setExerciseStage, setReps }) => {
    const shoulder = pose[11];
    const elbow = pose[13];
    const wrist = pose[15];

    if (!shoulder || !elbow || !wrist) {
      setMainAngle(0);
      return "Недостатньо точок для аналізу лівої руки";
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

export default leftBiceps;