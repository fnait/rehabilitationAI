import { calculateAngle } from "../utils/calculateAngle";
import { handleTwoStageExercise } from "./helpers/exerciseHelpers";

// Вправа: жим правою рукою вгору
const rightShoulderPress = {
  id: "right_shoulder_press",
  name: "Жим правою рукою вгору",

  analyze: ({ pose, stageRef, setMainAngle, setExerciseStage, setReps }) => {
    const shoulder = pose[12];
    const elbow = pose[14];
    const wrist = pose[16];

    if (!shoulder || !elbow || !wrist) {
      setMainAngle(0);
      return "Недостатньо точок для аналізу жиму правою рукою";
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

export default rightShoulderPress;