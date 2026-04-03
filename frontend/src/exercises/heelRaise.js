import { calculateAngle } from "../utils/calculateAngle";
import { handleTwoStageExercise } from "./helpers/exerciseHelpers";

// Вправа: підйом на носки
const heelRaise = {
  id: "heel_raise",
  name: "Підйом на носки",

  analyze: ({ pose, stageRef, setMainAngle, setExerciseStage, setReps }) => {
    const knee = pose[26];
    const ankle = pose[28];
    const foot = pose[32];

    if (!knee || !ankle || !foot) {
      setMainAngle(0);
      return "Недостатньо точок для аналізу підйому на носки";
    }

    const angle = calculateAngle(knee, ankle, foot);

    return handleTwoStageExercise({
      angle,
      stageRef,
      setMainAngle,
      setExerciseStage,
      setReps,
      upThreshold: 145,
      downThreshold: 110,
      upStage: "down",
      downStage: "up",
      upText: "П’яти внизу, піднімайся на носки.",
      downText: "Ти на носках, повільно опускайся.",
      middleText: "Продовжуй рух.",
      repCompleteText: "Повтор зараховано!",
    });
  },
};

export default heelRaise;