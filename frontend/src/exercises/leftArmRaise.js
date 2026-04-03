import { calculateAngle } from "../utils/calculateAngle";
import { handleTwoStageExercise } from "./helpers/exerciseHelpers";

// Вправа: підйом лівої руки в сторону
const leftArmRaise = {
  id: "left_arm_raise",
  name: "Підйом лівої руки в сторону",

  analyze: ({ pose, stageRef, setMainAngle, setExerciseStage, setReps }) => {
    const elbow = pose[13];
    const shoulder = pose[11];
    const hip = pose[23];

    if (!elbow || !shoulder || !hip) {
      setMainAngle(0);
      return "Недостатньо точок для аналізу підйому лівої руки";
    }

    // Рахуємо кут у плечі
    const angle = calculateAngle(elbow, shoulder, hip);

    return handleTwoStageExercise({
      angle,
      stageRef,
      setMainAngle,
      setExerciseStage,
      setReps,
      upThreshold: 70,
      downThreshold: 25,
      upStage: "up",
      downStage: "down",
      upText: "Рука піднята, тепер опускай.",
      downText: "Рука внизу, піднімай в сторону.",
      middleText: "Піднімай або опускай руку плавно.",
      repCompleteText: "Повтор зараховано!",
    });
  },
};

export default leftArmRaise;