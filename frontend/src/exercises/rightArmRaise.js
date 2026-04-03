import { calculateAngle } from "../utils/calculateAngle";
import { handleTwoStageExercise } from "./helpers/exerciseHelpers";

// Вправа: підйом правої руки в сторону
const rightArmRaise = {
  id: "right_arm_raise",
  name: "Підйом правої руки в сторону",

  analyze: ({ pose, stageRef, setMainAngle, setExerciseStage, setReps }) => {
    const elbow = pose[14];
    const shoulder = pose[12];
    const hip = pose[24];

    if (!elbow || !shoulder || !hip) {
      setMainAngle(0);
      return {
        message: "Недостатньо точок для аналізу підйому руки",
        feedback: "Очікую правильне положення",
        warning: "",
      };
    }

    const angle = calculateAngle(elbow, shoulder, hip);

    let warning = "";

    // Попередження тільки коли рука вже рухається,
    // але ще не дійшла до нормальної амплітуди
    if (angle >= 25 && angle < 55) {
      warning = "Підніми руку трохи вище";
    }

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

      successFeedback: "Рух виконано добре",
      neutralFeedback: "Виконуй вправу",
      lowRangeFeedback: "Недостатня амплітуда руху",

      warning,
    });
  },
};


export default rightArmRaise;