import { calculateAngle } from "../utils/calculateAngle";
import { handleTwoStageExercise } from "./helpers/exerciseHelpers";

// Вправа: жим лівою рукою вгору
const leftShoulderPress = {
  id: "left_shoulder_press",
  name: "Жим лівою рукою вгору",

  analyze: ({ pose, stageRef, setMainAngle, setExerciseStage, setReps }) => {
    const shoulder = pose[11];
    const elbow = pose[13];
    const wrist = pose[15];

    if (!shoulder || !elbow || !wrist) {
      setMainAngle(0);
      return "Недостатньо точок для аналізу жиму лівою рукою";
    }

    const angle = calculateAngle(shoulder, elbow, wrist);

    return handleTwoStageExercise({
      angle,
      stageRef,
      setMainAngle,
      setExerciseStage,
      setReps,
      upThreshold: 155,
      downThreshold: 85,
      upText: "Рука майже пряма, тепер опускай.",
      downText: "Рука зігнута, виштовхуй вгору.",
      middleText: "Продовжуй рух плавно.",
      repCompleteText: "Повтор зараховано!",
    });
  },
};

export default leftShoulderPress;