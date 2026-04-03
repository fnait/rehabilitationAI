// Універсальна функція для логіки повторень
// feedback оновлюється тільки тоді, коли повтор завершено
export const handleTwoStageExercise = ({
  angle,
  stageRef,
  setMainAngle,
  setExerciseStage,
  setReps,

  upThreshold,
  downThreshold,

  upStage = "up",
  downStage = "down",

  upText = "Верхня позиція",
  downText = "Нижня позиція",
  middleText = "Продовжуй рух",
  repCompleteText = "Повтор зараховано!",

  successFeedback = "Рух виконано добре",
  neutralFeedback = "Виконуй вправу",
  lowRangeFeedback = "Недостатня амплітуда руху",

  warning = "",
}) => {
  setMainAngle(angle);

  // Верхня фаза
  if (angle > upThreshold) {
    // Якщо до цього була нижня фаза — повтор завершено
    if (stageRef.current === downStage) {
      stageRef.current = upStage;
      setExerciseStage(upStage);
      setReps((prev) => prev + 1);

      return {
        message: `${repCompleteText} ${upText} Кут: ${angle}°`,
        feedback: successFeedback,
        warning,
      };
    }

    stageRef.current = upStage;
    setExerciseStage(upStage);

    return {
      message: `${upText} Кут: ${angle}°`,
      feedback: neutralFeedback,
      warning: "",
    };
  }

  // Нижня фаза
  if (angle < downThreshold) {
    stageRef.current = downStage;
    setExerciseStage(downStage);

    return {
      message: `${downText} Кут: ${angle}°`,
      feedback: neutralFeedback,
      warning: "",
    };
  }

  // Проміжна фаза
  return {
    message: `${middleText} Кут: ${angle}°`,
    feedback: lowRangeFeedback,
    warning,
  };
};